# Modelagem de Dados Multiempresa para Sistema SAAS de Assistência Técnica

## Visão Geral

Este documento apresenta a modelagem de dados para o sistema SAAS de assistência técnica com Django, focando na estrutura multiempresa e no sistema de permissões hierárquicas. A modelagem foi projetada para garantir isolamento de dados entre assistências técnicas, enquanto permite uma gestão centralizada pelo super administrador.

## Modelo de Tenant (Assistência Técnica)

```python
# tenant/models.py
from django.db import models
from django.contrib.auth.models import User

class Tenant(models.Model):
    """Modelo que representa uma assistência técnica no sistema"""
    nome = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, help_text="Usado para subdomínio e identificação")
    cnpj = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=20)
    endereco = models.TextField()
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    ativo = models.BooleanField(default=True)
    
    # Relação com o usuário administrador principal
    admin_principal = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='tenant_admin'
    )
    
    def __str__(self):
        return self.nome
        
    class Meta:
        verbose_name = "Assistência Técnica"
        verbose_name_plural = "Assistências Técnicas"


class TenantConfig(models.Model):
    """Configurações específicas de cada assistência técnica"""
    tenant = models.OneToOneField(
        Tenant, 
        on_delete=models.CASCADE, 
        related_name='configuracoes'
    )
    
    # Configurações de funcionamento
    horario_abertura = models.TimeField(default='09:00')
    horario_fechamento = models.TimeField(default='18:00')
    dias_funcionamento = models.CharField(
        max_length=20, 
        default='1,2,3,4,5',  # Segunda a sexta
        help_text="Dias da semana: 0=Domingo, 1=Segunda, ..., 6=Sábado"
    )
    
    # Mensagens personalizadas
    mensagem_boas_vindas = models.TextField(
        default="Olá! Bem-vindo à nossa assistência técnica. Como podemos ajudar?"
    )
    mensagem_fora_expediente = models.TextField(
        default="Estamos fora do horário de expediente. Retornaremos em breve!"
    )
    mensagem_orcamento = models.TextField(
        default="Olá {{CLIENTE}}, segue orçamento para seu {{APARELHO}}: R$ {{VALOR}}. Podemos prosseguir?"
    )
    
    # Integrações
    evolution_instance_id = models.CharField(max_length=255, null=True, blank=True)
    google_calendar_id = models.CharField(max_length=255, null=True, blank=True)
    asaas_wallet_id = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return f"Configurações de {self.tenant.nome}"


class Assinatura(models.Model):
    """Assinatura SAAS da assistência técnica"""
    tenant = models.OneToOneField(
        Tenant, 
        on_delete=models.CASCADE, 
        related_name='assinatura'
    )
    
    PLANOS = (
        ('basico', 'Básico'),
        ('profissional', 'Profissional'),
        ('empresarial', 'Empresarial'),
    )
    
    plano = models.CharField(max_length=20, choices=PLANOS)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_inicio = models.DateField()
    data_proximo_pagamento = models.DateField()
    asaas_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    
    STATUS = (
        ('ativa', 'Ativa'),
        ('atrasada', 'Atrasada'),
        ('cancelada', 'Cancelada'),
        ('trial', 'Período de Teste'),
    )
    
    status = models.CharField(max_length=20, choices=STATUS, default='trial')
    
    def __str__(self):
        return f"Assinatura {self.plano} - {self.tenant.nome}"
```

## Sistema de Usuários e Permissões

```python
# usuarios/models.py
from django.db import models
from django.contrib.auth.models import User
from tenant.models import Tenant

class Perfil(models.Model):
    """Perfil estendido de usuário com informações adicionais"""
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,  # Nulo apenas para super admin
        related_name='usuarios'
    )
    
    TIPOS = (
        ('super_admin', 'Super Administrador'),
        ('admin', 'Administrador'),
        ('tecnico', 'Técnico'),
        ('atendente', 'Atendente'),
        ('cliente', 'Cliente'),
    )
    
    tipo = models.CharField(max_length=20, choices=TIPOS)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    foto = models.ImageField(upload_to='perfis/', null=True, blank=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    ultimo_acesso = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.usuario.get_full_name()} - {self.get_tipo_display()}"
    
    def is_super_admin(self):
        return self.tipo == 'super_admin'
    
    def is_admin(self):
        return self.tipo == 'admin'
    
    def is_tecnico(self):
        return self.tipo == 'tecnico'
    
    def is_atendente(self):
        return self.tipo == 'atendente'
    
    def is_cliente(self):
        return self.tipo == 'cliente'


class PermissaoPersonalizada(models.Model):
    """Permissões personalizadas para usuários específicos"""
    perfil = models.ForeignKey(
        Perfil, 
        on_delete=models.CASCADE, 
        related_name='permissoes_personalizadas'
    )
    
    # Permissões específicas
    gerenciar_usuarios = models.BooleanField(default=False)
    gerenciar_financeiro = models.BooleanField(default=False)
    gerenciar_estoque = models.BooleanField(default=False)
    gerenciar_configuracoes = models.BooleanField(default=False)
    
    # Permissões de ordens de serviço
    criar_os = models.BooleanField(default=False)
    editar_os = models.BooleanField(default=False)
    aprovar_orcamento = models.BooleanField(default=False)
    finalizar_os = models.BooleanField(default=False)
    
    # Permissões de agenda
    visualizar_agenda = models.BooleanField(default=False)
    criar_agendamento = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Permissões de {self.perfil.usuario.get_full_name()}"


class TokenIntegracao(models.Model):
    """Tokens de integração para serviços externos"""
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        related_name='tokens_integracao'
    )
    
    SERVICOS = (
        ('evolution', 'API Evolution'),
        ('google', 'Google Calendar'),
        ('asaas', 'Asaas'),
        ('n8n', 'n8n'),
    )
    
    servico = models.CharField(max_length=20, choices=SERVICOS)
    token = models.TextField()
    refresh_token = models.TextField(null=True, blank=True)
    data_expiracao = models.DateTimeField(null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('tenant', 'servico')
    
    def __str__(self):
        return f"Token {self.get_servico_display()} - {self.tenant.nome}"
```

## Modelos de Negócio

```python
# clientes/models.py
from django.db import models
from tenant.models import Tenant
from usuarios.models import Perfil

class Cliente(models.Model):
    """Cliente da assistência técnica"""
    tenant = models.ForeignKey(
        Tenant, 
        on_delete=models.CASCADE, 
        related_name='clientes'
    )
    perfil = models.OneToOneField(
        Perfil, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='cliente'
    )
    nome = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    telefone = models.CharField(max_length=20)
    endereco = models.TextField(null=True, blank=True)
    cpf_cnpj = models.CharField(max_length=20, null=True, blank=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    observacoes = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.nome} - {self.telefone}"
    
    class Meta:
        unique_together = ('tenant', 'telefone')


class Aparelho(models.Model):
    """Aparelho de um cliente"""
    cliente = models.ForeignKey(
        Cliente, 
        on_delete=models.CASCADE, 
        related_name='aparelhos'
    )
    
    TIPOS = (
        ('celular', 'Celular'),
        ('tablet', 'Tablet'),
        ('notebook', 'Notebook'),
        ('desktop', 'Desktop'),
        ('impressora', 'Impressora'),
        ('outro', 'Outro'),
    )
    
    tipo = models.CharField(max_length=20, choices=TIPOS)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    numero_serie = models.CharField(max_length=100, null=True, blank=True)
    imei = models.CharField(max_length=20, null=True, blank=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    observacoes = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_tipo_display()} {self.marca} {self.modelo} - {self.cliente.nome}"


# ordens_servico/models.py
class OrdemServico(models.Model):
    """Ordem de serviço para reparo de aparelho"""
    tenant = models.ForeignKey(
        'tenant.Tenant', 
        on_delete=models.CASCADE, 
        related_name='ordens_servico'
    )
    cliente = models.ForeignKey(
        'clientes.Cliente', 
        on_delete=models.CASCADE, 
        related_name='ordens_servico'
    )
    aparelho = models.ForeignKey(
        'clientes.Aparelho', 
        on_delete=models.CASCADE, 
        related_name='ordens_servico'
    )
    tecnico = models.ForeignKey(
        'usuarios.Perfil', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='ordens_servico_atribuidas'
    )
    
    # Informações do problema
    problema_relatado = models.TextField()
    diagnostico = models.TextField(null=True, blank=True)
    solucao = models.TextField(null=True, blank=True)
    
    # Status e datas
    STATUS = (
        ('recebido', 'Recebido'),
        ('analise', 'Em Análise'),
        ('orcamento', 'Orçamento Enviado'),
        ('aprovado', 'Aprovado'),
        ('reparo', 'Em Reparo'),
        ('testando', 'Em Teste'),
        ('concluido', 'Concluído'),
        ('entregue', 'Entregue'),
        ('cancelado', 'Cancelado'),
    )
    
    status = models.CharField(max_length=20, choices=STATUS, default='recebido')
    data_entrada = models.DateTimeField(auto_now_add=True)
    data_orcamento = models.DateTimeField(null=True, blank=True)
    data_aprovacao = models.DateTimeField(null=True, blank=True)
    data_conclusao = models.DateTimeField(null=True, blank=True)
    data_entrega = models.DateTimeField(null=True, blank=True)
    
    # Valores
    valor_orcamento = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valor_final = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Controle
    numero = models.CharField(max_length=20, unique=True)  # Número de OS para referência
    senha = models.CharField(max_length=20, null=True, blank=True)  # Senha para consulta pelo cliente
    prioridade = models.IntegerField(default=2)  # 1=Baixa, 2=Normal, 3=Alta, 4=Urgente
    
    def __str__(self):
        return f"OS #{self.numero} - {self.cliente.nome} - {self.aparelho.modelo}"
    
    def save(self, *args, **kwargs):
        # Gerar número de OS automaticamente se não existir
        if not self.numero:
            ultimo_numero = OrdemServico.objects.filter(tenant=self.tenant).order_by('-id').first()
            if ultimo_numero:
                num = int(ultimo_numero.numero) + 1
            else:
                num = 1
            self.numero = f"{num:06d}"
        super().save(*args, **kwargs)


class ItemServico(models.Model):
    """Item de serviço realizado em uma OS"""
    ordem_servico = models.ForeignKey(
        OrdemServico, 
        on_delete=models.CASCADE, 
        related_name='itens_servico'
    )
    descricao = models.CharField(max_length=255)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.descricao} - R$ {self.valor}"


class ItemPeca(models.Model):
    """Peça utilizada em uma OS"""
    ordem_servico = models.ForeignKey(
        OrdemServico, 
        on_delete=models.CASCADE, 
        related_name='itens_peca'
    )
    descricao = models.CharField(max_length=255)
    quantidade = models.IntegerField(default=1)
    valor_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    
    @property
    def valor_total(self):
        return self.quantidade * self.valor_unitario
    
    def __str__(self):
        return f"{self.descricao} (x{self.quantidade}) - R$ {self.valor_total}"


# agendamentos/models.py
class Agendamento(models.Model):
    """Agendamento de atendimento ou serviço"""
    tenant = models.ForeignKey(
        'tenant.Tenant', 
        on_delete=models.CASCADE, 
        related_name='agendamentos'
    )
    cliente = models.ForeignKey(
        'clientes.Cliente', 
        on_delete=models.CASCADE, 
        related_name='agendamentos'
    )
    ordem_servico = models.ForeignKey(
        'ordens_servico.OrdemServico', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='agendamentos'
    )
    tecnico = models.ForeignKey(
        'usuarios.Perfil', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='agendamentos'
    )
    
    TIPOS = (
        ('entrega', 'Entrega de Aparelho'),
        ('retirada', 'Retirada de Aparelho'),
        ('atendimento', 'Atendimento Presencial'),
        ('visita', 'Visita Técnica'),
    )
    
    tipo = models.CharField(max_length=20, choices=TIPOS)
    data_hora = models.DateTimeField()
    duracao_minutos = models.IntegerField(default=30)
    observacoes = models.TextField(null=True, blank=True)
    
    # Integração com Google Calendar
    google_event_id = models.CharField(max_length=255, null=True, blank=True)
    
    STATUS = (
        ('agendado', 'Agendado'),
        ('confirmado', 'Confirmado'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
        ('reagendado', 'Reagendado'),
    )
    
    status = models.CharField(max_length=20, choices=STATUS, default='agendado')
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.cliente.nome} - {self.data_hora.strftime('%d/%m/%Y %H:%M')}"


# financeiro/models.py
class Pagamento(models.Model):
    """Pagamento de uma ordem de serviço"""
    tenant = models.ForeignKey(
        'tenant.Tenant', 
        on_delete=models.CASCADE, 
        related_name='pagamentos'
    )
    ordem_servico = models.ForeignKey(
        'ordens_servico.OrdemServico', 
        on_delete=models.CASCADE, 
        related_name='pagamentos'
    )
    
    FORMAS_PAGAMENTO = (
        ('dinheiro', 'Dinheiro'),
        ('cartao_credito', 'Cartão de Crédito'),
        ('cartao_debito', 'Cartão de Débito'),
        ('pix', 'PIX'),
        ('boleto', 'Boleto'),
        ('transferencia', 'Transferência Bancária'),
        ('link', 'Link de Pagamento'),
    )
    
    forma_pagamento = models.CharField(max_length=20, choices=FORMAS_PAGAMENTO)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_pagamento = models.DateTimeField(auto_now_add=True)
    
    # Integração com Asaas
    asaas_payment_id = models.CharField(max_length=255, null=True, blank=True)
    link_pagamento = models.URLField(null=True, blank=True)
    
    STATUS = (
        ('pendente', 'Pendente'),
        ('confirmado', 'Confirmado'),
        ('cancelado', 'Cancelado'),
    )
    
    status = models.CharField(max_length=20, choices=STATUS, default='pendente')
    
    def __str__(self):
        return f"Pagamento {self.get_forma_pagamento_display()} - R$ {self.valor} - OS #{self.ordem_servico.numero}"


# estoque/models.py
class Produto(models.Model):
    """Produto do estoque da assistência técnica"""
    tenant = models.ForeignKey(
        'tenant.Tenant', 
        on_delete=models.CASCADE, 
        related_name='produtos'
    )
    nome = models.CharField(max_length=255)
    descricao = models.TextField(null=True, blank=True)
    codigo = models.CharField(max_length=50, null=True, blank=True)
    preco_custo = models.DecimalField(max_digits=10, decimal_places=2)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade = models.IntegerField(default=0)
    quantidade_minima = models.IntegerField(default=1)
    
    CATEGORIAS = (
        ('peca', 'Peça'),
        ('acessorio', 'Acessório'),
        ('ferramenta', 'Ferramenta'),
        ('outro', 'Outro'),
    )
    
    categoria = models.CharField(max_length=20, choices=CATEGORIAS)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.nome} - {self.quantidade} unidades"
    
    @property
    def disponivel(self):
        return self.quantidade > 0
    
    @property
    def estoque_baixo(self):
        return self.quantidade <= self.quantidade_minima
```

## Middleware para Multitenancy

```python
# tenant/middleware.py
from django.conf import settings
from django.db import connection
from .models import Tenant
import threading

# Thread local para armazenar o tenant atual
_thread_local = threading.local()

def get_current_tenant():
    """Retorna o tenant atual para a thread"""
    return getattr(_thread_local, 'tenant', None)

def set_current_tenant(tenant):
    """Define o tenant atual para a thread"""
    _thread_local.tenant = tenant

class TenantMiddleware:
    """Middleware para identificar o tenant com base no subdomínio"""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Limpar tenant anterior
        set_current_tenant(None)
        
        # Obter o host da requisição
        host = request.get_host().split(':')[0]
        
        # Verificar se é um subdomínio
        domain_parts = host.split('.')
        if len(domain_parts) > 2 and domain_parts[0] != 'www':
            # É um subdomínio, tentar encontrar o tenant
            subdomain = domain_parts[0]
            try:
                tenant = Tenant.objects.get(slug=subdomain, ativo=True)
                set_current_tenant(tenant)
                
                # Opcional: definir schema do PostgreSQL para isolamento completo
                if settings.TENANT_USE_POSTGRESQL_SCHEMAS:
                    connection.set_schema(f"tenant_{tenant.id}")
                
            except Tenant.DoesNotExist:
                # Tenant não encontrado, continuar sem definir
                pass
        
        # Continuar com a requisição
        response = self.get_response(request)
        
        # Limpar schema se necessário
        if settings.TENANT_USE_POSTGRESQL_SCHEMAS and get_current_tenant():
            connection.set_schema_to_public()
        
        return response
```

## Gerenciadores de Modelos para Multitenancy

```python
# tenant/managers.py
from django.db import models
from django.db.models.query import QuerySet
from .middleware import get_current_tenant

class TenantQuerySet(QuerySet):
    """QuerySet que filtra automaticamente por tenant"""
    def _filter_by_tenant(self):
        tenant = get_current_tenant()
        if tenant:
            return self.filter(tenant=tenant)
        return self
    
    def all(self):
        return self._filter_by_tenant()
    
    def filter(self, *args, **kwargs):
        return super().filter(*args, **kwargs)._filter_by_tenant()


class TenantManager(models.Manager):
    """Manager que usa TenantQuerySet para filtrar por tenant"""
    def get_queryset(self):
        return TenantQuerySet(self.model, using=self._db)
    
    def all_tenants(self):
        """Retorna todos os objetos sem filtrar por tenant (apenas para super admin)"""
        return super().get_queryset()
```

## Mixins para Modelos Multiempresa

```python
# tenant/mixins.py
from django.db import models
from .managers import TenantManager
from .middleware import get_current_tenant

class TenantMixin(models.Model):
    """Mixin para modelos que pertencem a um tenant"""
    tenant = models.ForeignKey(
        'tenant.Tenant',
        on_delete=models.CASCADE,
        related_name='%(class)ss',
    )
    
    # Usar o manager personalizado
    objects = TenantManager()
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        # Se não foi definido um tenant e existe um tenant atual, usar ele
        if not self.tenant_id and get_current_tenant():
            self.tenant = get_current_tenant()
        super().save(*args, **kwargs)
```

## Decoradores para Controle de Acesso

```python
# usuarios/decorators.py
from django.http import HttpResponseForbidden
from django.shortcuts import redirect
from functools import wraps
from .models import Perfil

def super_admin_required(view_func):
    """Decorator que restringe acesso apenas para super admin"""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        
        try:
            perfil = request.user.perfil
            if not perfil.is_super_admin():
                return HttpResponseForbidden("Acesso negado. Apenas super administradores podem acessar esta página.")
        except Perfil.DoesNotExist:
            return HttpResponseForbidden("Acesso negado. Perfil de usuário não encontrado.")
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view


def admin_required(view_func):
    """Decorator que restringe acesso para admin ou super admin"""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        
        try:
            perfil = request.user.perfil
            if not (perfil.is_admin() or perfil.is_super_admin()):
                return HttpResponseForbidden("Acesso negado. Apenas administradores podem acessar esta página.")
        except Perfil.DoesNotExist:
            return HttpResponseForbidden("Acesso negado. Perfil de usuário não encontrado.")
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view


def tecnico_required(view_func):
    """Decorator que restringe acesso para técnicos, admin ou super admin"""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        
        try:
            perfil = request.user.perfil
            if not (perfil.is_tecnico() or perfil.is_admin() or perfil.is_super_admin()):
                return HttpResponseForbidden("Acesso negado. Apenas técnicos e administradores podem acessar esta página.")
        except Perfil.DoesNotExist:
            return HttpResponseForbidden("Acesso negado. Perfil de usuário não encontrado.")
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view


def permission_required(permission_name):
    """Decorator que verifica permissão específica"""
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login')
            
            try:
                perfil = request.user.perfil
                
                # Super admin sempre tem todas as permissões
                if perfil.is_super_admin():
                    return view_func(request, *args, **kwargs)
                
                # Verificar permissão específica
                try:
                    permissoes = perfil.permissoes_personalizadas
                    if hasattr(permissoes, permission_name) and getattr(permissoes, permission_name):
                        return view_func(request, *args, **kwargs)
                except:
                    pass
                
                return HttpResponseForbidden(f"Acesso negado. Você não tem a permissão necessária: {permission_name}")
                
            except Perfil.DoesNotExist:
                return HttpResponseForbidden("Acesso negado. Perfil de usuário não encontrado.")
            
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator
```

## Diagrama de Relacionamentos

```
+----------------+       +-------------------+       +----------------+
|     Tenant     |<------| TenantConfig      |       |   Assinatura   |
+----------------+       +-------------------+       +----------------+
| id             |       | id                |       | id             |
| nome           |       | tenant (FK)       |       | tenant (FK)    |
| slug           |       | horario_abertura  |       | plano          |
| cnpj           |       | horario_fechamento|       | valor          |
| email          |       | dias_funcionamento|       | data_inicio    |
| telefone       |       | mensagem_boas_vindas |    | data_proximo_pag |
| endereco       |       | mensagem_fora_exp |       | status         |
| logo           |       | evolution_instance_id |    +----------------+
| data_cadastro  |       | google_calendar_id|
| ativo          |       | asaas_wallet_id   |
| admin_principal|       +-------------------+
+----------------+
       ^
       |
       |                  +----------------+
       +------------------| TokenIntegracao|
       |                  +----------------+
       |                  | id             |
       |                  | tenant (FK)    |
       |                  | servico        |
       |                  | token          |
       |                  | refresh_token  |
       |                  | data_expiracao |
       |                  +----------------+
       |
       |
+----------------+       +-------------------+       +----------------+
|    Usuario     |<------| Perfil            |<------| PermissaoPersonalizada |
+----------------+       +-------------------+       +----------------+
| id (Django)    |       | id                |       | id             |
| username       |       | usuario (FK)      |       | perfil (FK)    |
| password       |       | tenant (FK)       |       | gerenciar_usuarios |
| email          |       | tipo              |       | gerenciar_financeiro |
| first_name     |       | telefone          |       | gerenciar_estoque |
| last_name      |       | foto              |       | criar_os       |
+----------------+       | data_cadastro     |       | editar_os      |
                         | ultimo_acesso     |       | aprovar_orcamento |
                         +-------------------+       +----------------+
                                  ^
                                  |
                         +-------------------+
                         | Cliente           |
                         +-------------------+
                         | id                |
                         | tenant (FK)       |
                         | perfil (FK)       |
                         | nome              |
                         | email             |
                         | telefone          |
                         | endereco          |
                         | cpf_cnpj          |
                         +-------------------+
                                  ^
                                  |
                         +-------------------+       +----------------+
                         | Aparelho          |<------| OrdemServico   |
                         +-------------------+       +----------------+
                         | id                |       | id             |
                         | cliente (FK)      |       | tenant (FK)    |
                         | tipo              |       | cliente (FK)   |
                         | marca             |       | aparelho (FK)  |
                         | modelo            |       | tecnico (FK)   |
                         | numero_serie      |       | problema_relatado |
                         | imei              |       | diagnostico    |
                         +-------------------+       | status         |
                                                    | data_entrada   |
                                                    | valor_orcamento|
                                                    | valor_final    |
                                                    +----------------+
                                                            ^
                                                           / \
                                                          /   \
                                  +-------------------+  /     \  +----------------+
                                  | ItemServico       |<-       ->| ItemPeca       |
                                  +-------------------+           +----------------+
                                  | id                |           | id             |
                                  | ordem_servico (FK)|           | ordem_servico (FK) |
                                  | descricao         |           | descricao      |
                                  | valor             |           | quantidade     |
                                  +-------------------+           | valor_unitario |
                                                                 +----------------+
```

## Considerações sobre Segurança e Isolamento

1. **Isolamento de Dados**:
   - Todos os modelos relacionados a negócio têm uma chave estrangeira para o tenant
   - O middleware identifica o tenant atual com base no subdomínio
   - Os managers de modelo filtram automaticamente por tenant
   - Opção de usar schemas PostgreSQL para isolamento completo

2. **Controle de Acesso**:
   - Sistema de permissões hierárquico (Super Admin > Admin > Técnico > Atendente > Cliente)
   - Decoradores para verificar permissões em views
   - Permissões personalizadas por usuário
   - Verificação de tenant em todas as operações

3. **Segurança de Integrações**:
   - Tokens armazenados de forma segura
   - Cada tenant tem suas próprias credenciais de integração
   - Refresh tokens para renovação automática

4. **Auditoria**:
   - Registro de data e hora para todas as operações importantes
   - Rastreamento de usuário que realizou cada ação
   - Histórico de status de ordens de serviço

## Próximos Passos

1. **Implementação de Views e Templates**:
   - Painel administrativo para super admin
   - Painel de controle para cada assistência técnica
   - Interfaces para técnicos e atendentes
   - Portal para clientes

2. **Integração com Serviços Externos**:
   - Configuração de comunicação com API Evolution em Docker
   - Configuração de fluxos no n8n
   - Integração com Google Calendar
   - Integração com Asaas

3. **Testes**:
   - Testes unitários para modelos e lógica de negócio
   - Testes de integração para fluxos completos
   - Testes de segurança para isolamento de dados
