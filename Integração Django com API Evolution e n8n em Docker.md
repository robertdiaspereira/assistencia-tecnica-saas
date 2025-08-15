# Integração Django com API Evolution e n8n em Docker

## Visão Geral

Este documento detalha a arquitetura e implementação da integração entre o sistema Django multitenancy e os serviços em Docker (API Evolution e n8n). A abordagem híbrida permite aproveitar a flexibilidade do Django para o backend principal, enquanto utiliza containers Docker para os serviços especializados.

## Arquitetura da Integração

```
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|  Django Backend   |<----->|   API Evolution   |<----->|      WhatsApp     |
|  (Multitenancy)   |       |     (Docker)      |       |                   |
|                   |       |                   |       |                   |
+-------------------+       +-------------------+       +-------------------+
         ^                           ^
         |                           |
         v                           v
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|   PostgreSQL DB   |<----->|       n8n         |<----->|  Serviços Externos|
|                   |       |     (Docker)      |       |  (Google, Asaas)  |
|                   |       |                   |       |                   |
+-------------------+       +-------------------+       +-------------------+
```

## Configuração do Docker Compose

```yaml
# docker-compose.yml
version: '3'

services:
  # API Evolution para WhatsApp
  evolution-api:
    image: evolutionapi/evolution:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://evolution-api:8080
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY}
      - LOG_LEVEL=info
    volumes:
      - ./evolution-data:/app/instances
    networks:
      - assistencia-network

  # n8n para automação de fluxos
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=n8n
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_db
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - WEBHOOK_URL=${N8N_WEBHOOK_URL}
    volumes:
      - ./n8n-data:/home/node/.n8n
    depends_on:
      - db
    networks:
      - assistencia-network

  # Banco de dados PostgreSQL (compartilhado com Django)
  db:
    image: postgres:13
    container_name: postgres-db
    restart: always
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    networks:
      - assistencia-network

  # Redis para cache e filas
  redis:
    image: redis:alpine
    container_name: redis
    restart: always
    ports:
      - "6379:6379"
    networks:
      - assistencia-network

networks:
  assistencia-network:
    driver: bridge
```

## Integração com API Evolution

### 1. Cliente API em Django

```python
# integracoes/evolution_api.py
import requests
import json
import logging
from django.conf import settings
from tenant.models import Tenant, TokenIntegracao

logger = logging.getLogger(__name__)

class EvolutionAPIClient:
    """Cliente para comunicação com a API Evolution"""
    
    def __init__(self, tenant=None):
        """
        Inicializa o cliente com o tenant específico
        
        Args:
            tenant: Objeto Tenant ou None para usar configurações globais
        """
        self.tenant = tenant
        self.base_url = settings.EVOLUTION_API_URL
        
        # Obter chave de API
        if tenant:
            try:
                token = TokenIntegracao.objects.get(tenant=tenant, servico='evolution')
                self.api_key = token.token
            except TokenIntegracao.DoesNotExist:
                logger.error(f"Token de API Evolution não encontrado para tenant {tenant.nome}")
                self.api_key = settings.EVOLUTION_API_KEY
        else:
            self.api_key = settings.EVOLUTION_API_KEY
    
    def _get_headers(self):
        """Retorna os headers para requisições"""
        return {
            'Content-Type': 'application/json',
            'apikey': self.api_key
        }
    
    def _get_instance_name(self):
        """Retorna o nome da instância para o tenant atual"""
        if self.tenant:
            return f"empresa_{self.tenant.id}"
        return "default"
    
    def create_instance(self):
        """Cria uma nova instância para o tenant"""
        instance_name = self._get_instance_name()
        
        url = f"{self.base_url}/instance/create"
        payload = {
            "instanceName": instance_name,
            "token": f"token_{instance_name}",
            "qrcode": True
        }
        
        try:
            response = requests.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            
            # Salvar ID da instância nas configurações do tenant
            if self.tenant:
                config = self.tenant.configuracoes
                config.evolution_instance_id = instance_name
                config.save()
            
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao criar instância Evolution: {str(e)}")
            return {"error": str(e)}
    
    def get_qrcode(self):
        """Obtém o QR code para conexão do WhatsApp"""
        instance_name = self._get_instance_name()
        url = f"{self.base_url}/instance/qrcode/{instance_name}"
        
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao obter QR code: {str(e)}")
            return {"error": str(e)}
    
    def check_connection_status(self):
        """Verifica o status da conexão com WhatsApp"""
        instance_name = self._get_instance_name()
        url = f"{self.base_url}/instance/connectionState/{instance_name}"
        
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao verificar status da conexão: {str(e)}")
            return {"error": str(e)}
    
    def send_text_message(self, phone, message):
        """
        Envia mensagem de texto via WhatsApp
        
        Args:
            phone: Número de telefone no formato internacional (ex: 5511999999999)
            message: Texto da mensagem
        """
        instance_name = self._get_instance_name()
        url = f"{self.base_url}/message/text/{instance_name}"
        
        payload = {
            "number": phone,
            "options": {
                "delay": 1200
            },
            "textMessage": {
                "text": message
            }
        }
        
        try:
            response = requests.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao enviar mensagem: {str(e)}")
            return {"error": str(e)}
    
    def send_template_message(self, phone, template_data):
        """
        Envia mensagem baseada em template
        
        Args:
            phone: Número de telefone no formato internacional
            template_data: Dicionário com dados do template
        """
        instance_name = self._get_instance_name()
        url = f"{self.base_url}/message/template/{instance_name}"
        
        payload = {
            "number": phone,
            "options": {
                "delay": 1200
            },
            "templateMessage": template_data
        }
        
        try:
            response = requests.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao enviar mensagem de template: {str(e)}")
            return {"error": str(e)}
    
    def configure_webhook(self, webhook_url):
        """
        Configura webhook para receber eventos
        
        Args:
            webhook_url: URL para receber eventos
        """
        instance_name = self._get_instance_name()
        url = f"{self.base_url}/webhook/set/{instance_name}"
        
        payload = {
            "webhookUrl": webhook_url,
            "events": [
                "messages.upsert",
                "messages.update",
                "qr",
                "connection.update"
            ]
        }
        
        try:
            response = requests.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao configurar webhook: {str(e)}")
            return {"error": str(e)}
```

### 2. Views para Webhooks da API Evolution

```python
# integracoes/views.py
import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from tenant.middleware import get_current_tenant, set_current_tenant
from tenant.models import Tenant
from .tasks import process_whatsapp_message

logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def evolution_webhook(request, tenant_slug):
    """
    Webhook para receber eventos da API Evolution
    
    Args:
        request: Objeto HttpRequest
        tenant_slug: Slug do tenant para identificação
    """
    try:
        # Identificar o tenant
        try:
            tenant = Tenant.objects.get(slug=tenant_slug, ativo=True)
            set_current_tenant(tenant)
        except Tenant.DoesNotExist:
            logger.error(f"Tenant não encontrado: {tenant_slug}")
            return JsonResponse({"error": "Tenant não encontrado"}, status=404)
        
        # Processar o payload
        payload = json.loads(request.body)
        event_type = payload.get('event')
        
        # Processar diferentes tipos de eventos
        if event_type == 'messages.upsert':
            # Processar mensagem recebida de forma assíncrona
            process_whatsapp_message.delay(tenant.id, payload)
            return JsonResponse({"status": "success", "message": "Mensagem recebida e enfileirada"})
        
        elif event_type == 'connection.update':
            # Atualizar status da conexão
            status = payload.get('status')
            logger.info(f"Status da conexão atualizado para {status} - Tenant: {tenant.nome}")
            return JsonResponse({"status": "success", "message": "Status atualizado"})
        
        elif event_type == 'qr':
            # QR code atualizado
            logger.info(f"Novo QR code gerado - Tenant: {tenant.nome}")
            return JsonResponse({"status": "success", "message": "QR code recebido"})
        
        else:
            # Outros eventos
            logger.info(f"Evento recebido: {event_type} - Tenant: {tenant.nome}")
            return JsonResponse({"status": "success", "message": "Evento recebido"})
    
    except Exception as e:
        logger.error(f"Erro ao processar webhook: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
```

### 3. Tarefas Celery para Processamento Assíncrono

```python
# integracoes/tasks.py
import json
import logging
from celery import shared_task
from django.db import transaction
from tenant.models import Tenant
from tenant.middleware import set_current_tenant
from clientes.models import Cliente
from ordens_servico.models import OrdemServico
from .n8n_api import N8nAPIClient

logger = logging.getLogger(__name__)

@shared_task
def process_whatsapp_message(tenant_id, payload):
    """
    Processa mensagem recebida do WhatsApp de forma assíncrona
    
    Args:
        tenant_id: ID do tenant
        payload: Dados da mensagem
    """
    try:
        # Configurar o tenant
        tenant = Tenant.objects.get(id=tenant_id)
        set_current_tenant(tenant)
        
        # Extrair informações da mensagem
        messages = payload.get('messages', [])
        if not messages:
            logger.warning(f"Nenhuma mensagem encontrada no payload - Tenant: {tenant.nome}")
            return
        
        message = messages[0]
        phone = message.get('key', {}).get('remoteJid', '').split('@')[0]
        text = message.get('message', {}).get('conversation', '')
        
        if not phone or not text:
            logger.warning(f"Dados incompletos na mensagem - Tenant: {tenant.nome}")
            return
        
        # Verificar se o cliente existe
        cliente = None
        try:
            cliente = Cliente.objects.get(telefone=phone, tenant=tenant)
        except Cliente.DoesNotExist:
            # Cliente não encontrado, criar um registro temporário
            with transaction.atomic():
                cliente = Cliente.objects.create(
                    tenant=tenant,
                    nome=f"Cliente {phone}",
                    telefone=phone
                )
                logger.info(f"Cliente temporário criado: {cliente.id} - Tenant: {tenant.nome}")
        
        # Encaminhar para o n8n para processamento
        n8n_client = N8nAPIClient(tenant)
        webhook_data = {
            "tenant_id": tenant.id,
            "cliente_id": cliente.id,
            "telefone": phone,
            "mensagem": text,
            "timestamp": message.get('messageTimestamp')
        }
        
        # Enviar para o webhook do n8n
        response = n8n_client.trigger_webhook("whatsapp_message", webhook_data)
        
        if response.get("error"):
            logger.error(f"Erro ao enviar para n8n: {response.get('error')} - Tenant: {tenant.nome}")
        else:
            logger.info(f"Mensagem enviada para n8n com sucesso - Tenant: {tenant.nome}")
        
    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {str(e)}")
```

## Integração com n8n

### 1. Cliente API para n8n

```python
# integracoes/n8n_api.py
import requests
import json
import logging
from django.conf import settings
from tenant.models import Tenant, TokenIntegracao

logger = logging.getLogger(__name__)

class N8nAPIClient:
    """Cliente para comunicação com o n8n"""
    
    def __init__(self, tenant=None):
        """
        Inicializa o cliente com o tenant específico
        
        Args:
            tenant: Objeto Tenant ou None para usar configurações globais
        """
        self.tenant = tenant
        self.base_url = settings.N8N_API_URL
        
        # Obter token de API
        if tenant:
            try:
                token = TokenIntegracao.objects.get(tenant=tenant, servico='n8n')
                self.api_key = token.token
            except TokenIntegracao.DoesNotExist:
                logger.error(f"Token de API n8n não encontrado para tenant {tenant.nome}")
                self.api_key = settings.N8N_API_KEY
        else:
            self.api_key = settings.N8N_API_KEY
    
    def _get_headers(self):
        """Retorna os headers para requisições"""
        return {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': self.api_key
        }
    
    def trigger_webhook(self, webhook_name, data):
        """
        Aciona um webhook no n8n
        
        Args:
            webhook_name: Nome do webhook
            data: Dados a serem enviados
        """
        # Adicionar tenant_id aos dados se não estiver presente
        if self.tenant and 'tenant_id' not in data:
            data['tenant_id'] = self.tenant.id
        
        # Construir URL do webhook
        webhook_url = f"{self.base_url}/webhook/{webhook_name}"
        
        try:
            response = requests.post(webhook_url, headers=self._get_headers(), json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao acionar webhook n8n: {str(e)}")
            return {"error": str(e)}
    
    def get_workflows(self):
        """Obtém lista de workflows disponíveis"""
        url = f"{self.base_url}/workflows"
        
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao obter workflows: {str(e)}")
            return {"error": str(e)}
    
    def execute_workflow(self, workflow_id, data):
        """
        Executa um workflow específico
        
        Args:
            workflow_id: ID do workflow
            data: Dados para execução
        """
        url = f"{self.base_url}/workflows/{workflow_id}/execute"
        
        # Adicionar tenant_id aos dados se não estiver presente
        if self.tenant and 'tenant_id' not in data:
            data['tenant_id'] = self.tenant.id
        
        try:
            response = requests.post(url, headers=self._get_headers(), json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao executar workflow: {str(e)}")
            return {"error": str(e)}
```

### 2. Views para Webhooks do n8n

```python
# integracoes/views.py
import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from tenant.middleware import get_current_tenant, set_current_tenant
from tenant.models import Tenant
from clientes.models import Cliente
from ordens_servico.models import OrdemServico
from agendamentos.models import Agendamento
from .evolution_api import EvolutionAPIClient

logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def n8n_webhook(request, tenant_slug, action):
    """
    Webhook para receber ações do n8n
    
    Args:
        request: Objeto HttpRequest
        tenant_slug: Slug do tenant para identificação
        action: Ação a ser executada
    """
    try:
        # Identificar o tenant
        try:
            tenant = Tenant.objects.get(slug=tenant_slug, ativo=True)
            set_current_tenant(tenant)
        except Tenant.DoesNotExist:
            logger.error(f"Tenant não encontrado: {tenant_slug}")
            return JsonResponse({"error": "Tenant não encontrado"}, status=404)
        
        # Processar o payload
        payload = json.loads(request.body)
        
        # Executar ação específica
        if action == 'send_message':
            return handle_send_message(tenant, payload)
        
        elif action == 'update_os_status':
            return handle_update_os_status(tenant, payload)
        
        elif action == 'create_appointment':
            return handle_create_appointment(tenant, payload)
        
        else:
            logger.error(f"Ação desconhecida: {action} - Tenant: {tenant.nome}")
            return JsonResponse({"error": f"Ação desconhecida: {action}"}, status=400)
    
    except Exception as e:
        logger.error(f"Erro ao processar webhook n8n: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

def handle_send_message(tenant, payload):
    """Processa solicitação para enviar mensagem"""
    try:
        cliente_id = payload.get('cliente_id')
        message = payload.get('message')
        
        if not cliente_id or not message:
            return JsonResponse({"error": "Dados incompletos"}, status=400)
        
        # Obter cliente
        try:
            cliente = Cliente.objects.get(id=cliente_id, tenant=tenant)
        except Cliente.DoesNotExist:
            return JsonResponse({"error": "Cliente não encontrado"}, status=404)
        
        # Enviar mensagem
        evolution_client = EvolutionAPIClient(tenant)
        result = evolution_client.send_text_message(cliente.telefone, message)
        
        if result.get("error"):
            return JsonResponse({"error": result.get("error")}, status=500)
        
        return JsonResponse({"status": "success", "message": "Mensagem enviada"})
    
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

def handle_update_os_status(tenant, payload):
    """Processa solicitação para atualizar status de OS"""
    try:
        os_id = payload.get('os_id')
        status = payload.get('status')
        
        if not os_id or not status:
            return JsonResponse({"error": "Dados incompletos"}, status=400)
        
        # Obter OS
        try:
            ordem_servico = OrdemServico.objects.get(id=os_id, tenant=tenant)
        except OrdemServico.DoesNotExist:
            return JsonResponse({"error": "Ordem de serviço não encontrada"}, status=404)
        
        # Atualizar status
        ordem_servico.status = status
        ordem_servico.save()
        
        return JsonResponse({
            "status": "success", 
            "message": "Status atualizado",
            "os": {
                "id": ordem_servico.id,
                "numero": ordem_servico.numero,
                "status": ordem_servico.status
            }
        })
    
    except Exception as e:
        logger.error(f"Erro ao atualizar status de OS: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

def handle_create_appointment(tenant, payload):
    """Processa solicitação para criar agendamento"""
    try:
        cliente_id = payload.get('cliente_id')
        data_hora = payload.get('data_hora')
        tipo = payload.get('tipo')
        
        if not cliente_id or not data_hora or not tipo:
            return JsonResponse({"error": "Dados incompletos"}, status=400)
        
        # Obter cliente
        try:
            cliente = Cliente.objects.get(id=cliente_id, tenant=tenant)
        except Cliente.DoesNotExist:
            return JsonResponse({"error": "Cliente não encontrado"}, status=404)
        
        # Criar agendamento
        agendamento = Agendamento.objects.create(
            tenant=tenant,
            cliente=cliente,
            data_hora=data_hora,
            tipo=tipo,
            observacoes=payload.get('observacoes', '')
        )
        
        return JsonResponse({
            "status": "success", 
            "message": "Agendamento criado",
            "agendamento": {
                "id": agendamento.id,
                "data_hora": agendamento.data_hora.isoformat(),
                "tipo": agendamento.tipo
            }
        })
    
    except Exception as e:
        logger.error(f"Erro ao criar agendamento: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
```

## Configuração de URLs para Webhooks

```python
# integracoes/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Webhooks da API Evolution
    path('webhooks/evolution/<str:tenant_slug>/', views.evolution_webhook, name='evolution_webhook'),
    
    # Webhooks do n8n
    path('webhooks/n8n/<str:tenant_slug>/<str:action>/', views.n8n_webhook, name='n8n_webhook'),
]
```

## Configuração do Django para Integração

### 1. Configurações no settings.py

```python
# settings.py

# Configurações para Docker
DOCKER_SERVICES = {
    'EVOLUTION_API_URL': 'http://evolution-api:8080',
    'EVOLUTION_API_KEY': os.environ.get('EVOLUTION_API_KEY', 'sua_chave_api_aqui'),
    
    'N8N_API_URL': 'http://n8n:5678',
    'N8N_API_KEY': os.environ.get('N8N_API_KEY', 'sua_chave_api_aqui'),
    
    'REDIS_HOST': 'redis',
    'REDIS_PORT': 6379,
}

# Configurações para ambiente de desenvolvimento local
if DEBUG:
    DOCKER_SERVICES['EVOLUTION_API_URL'] = 'http://localhost:8080'
    DOCKER_SERVICES['N8N_API_URL'] = 'http://localhost:5678'
    DOCKER_SERVICES['REDIS_HOST'] = 'localhost'

# Exportar configurações para uso direto
EVOLUTION_API_URL = DOCKER_SERVICES['EVOLUTION_API_URL']
EVOLUTION_API_KEY = DOCKER_SERVICES['EVOLUTION_API_KEY']
N8N_API_URL = DOCKER_SERVICES['N8N_API_URL']
N8N_API_KEY = DOCKER_SERVICES['N8N_API_KEY']

# Configuração do Celery
CELERY_BROKER_URL = f"redis://{DOCKER_SERVICES['REDIS_HOST']}:{DOCKER_SERVICES['REDIS_PORT']}/0"
CELERY_RESULT_BACKEND = f"redis://{DOCKER_SERVICES['REDIS_HOST']}:{DOCKER_SERVICES['REDIS_PORT']}/0"
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Sao_Paulo'
```

### 2. Configuração do Celery

```python
# celery.py
import os
from celery import Celery

# Definir variável de ambiente para configurações do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'assistencia_tecnica.settings')

# Criar instância do Celery
app = Celery('assistencia_tecnica')

# Carregar configurações do Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Descobrir tarefas automaticamente
app.autodiscover_tasks()
```

## Fluxos de Trabalho no n8n

### 1. Fluxo para Processamento de Mensagens do WhatsApp

```json
{
  "name": "Processamento de Mensagens WhatsApp",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp_message",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "// Extrair dados da requisição\nconst tenant_id = $input.item.json.tenant_id;\nconst cliente_id = $input.item.json.cliente_id;\nconst telefone = $input.item.json.telefone;\nconst mensagem = $input.item.json.mensagem.toLowerCase();\n\n// Verificar o tipo de mensagem\nlet tipoMensagem = 'desconhecido';\n\nif (mensagem.includes('orçamento') || mensagem.includes('orcamento') || mensagem.includes('valor') || mensagem.includes('preço') || mensagem.includes('preco')) {\n  tipoMensagem = 'orcamento';\n} else if (mensagem.includes('status') || mensagem.includes('andamento') || mensagem.includes('situação') || mensagem.includes('situacao')) {\n  tipoMensagem = 'status';\n} else if (mensagem.includes('agendar') || mensagem.includes('horário') || mensagem.includes('horario') || mensagem.includes('marcar')) {\n  tipoMensagem = 'agendamento';\n} else if (mensagem.includes('olá') || mensagem.includes('ola') || mensagem.includes('oi') || mensagem.includes('bom dia') || mensagem.includes('boa tarde') || mensagem.includes('boa noite')) {\n  tipoMensagem = 'saudacao';\n}\n\nreturn {\n  json: {\n    tenant_id,\n    cliente_id,\n    telefone,\n    mensagem,\n    tipoMensagem\n  }\n};"
      },
      "name": "Analisar Mensagem",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$node[\"Analisar Mensagem\"].json[\"tipoMensagem\"]}}",
              "operation": "equal",
              "value2": "orcamento"
            }
          ]
        }
      },
      "name": "Tipo de Mensagem",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "url": "={{$node[\"Configuração\"].json[\"apiUrl\"]}}/webhooks/n8n/{{$node[\"Configuração\"].json[\"tenantSlug\"]}}/send_message",
        "options": {},
        "method": "POST",
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "cliente_id",
              "value": "={{$node[\"Analisar Mensagem\"].json[\"cliente_id\"]}}"
            },
            {
              "name": "message",
              "value": "Olá! Entendi que você deseja um orçamento. Por favor, informe qual o modelo do seu aparelho e o problema que está enfrentando."
            }
          ]
        }
      },
      "name": "Responder Orçamento",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [850, 200]
    },
    {
      "parameters": {
        "url": "={{$node[\"Configuração\"].json[\"apiUrl\"]}}/webhooks/n8n/{{$node[\"Configuração\"].json[\"tenantSlug\"]}}/send_message",
        "options": {},
        "method": "POST",
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "cliente_id",
              "value": "={{$node[\"Analisar Mensagem\"].json[\"cliente_id\"]}}"
            },
            {
              "name": "message",
              "value": "Olá! Para verificar o status do seu serviço, por favor informe o número da sua ordem de serviço."
            }
          ]
        }
      },
      "name": "Responder Status",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [850, 300]
    },
    {
      "parameters": {
        "url": "={{$node[\"Configuração\"].json[\"apiUrl\"]}}/webhooks/n8n/{{$node[\"Configuração\"].json[\"tenantSlug\"]}}/send_message",
        "options": {},
        "method": "POST",
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "cliente_id",
              "value": "={{$node[\"Analisar Mensagem\"].json[\"cliente_id\"]}}"
            },
            {
              "name": "message",
              "value": "Olá! Para agendar um horário, por favor informe qual dia e período (manhã ou tarde) você prefere."
            }
          ]
        }
      },
      "name": "Responder Agendamento",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [850, 400]
    },
    {
      "parameters": {
        "url": "={{$node[\"Configuração\"].json[\"apiUrl\"]}}/webhooks/n8n/{{$node[\"Configuração\"].json[\"tenantSlug\"]}}/send_message",
        "options": {},
        "method": "POST",
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "cliente_id",
              "value": "={{$node[\"Analisar Mensagem\"].json[\"cliente_id\"]}}"
            },
            {
              "name": "message",
              "value": "Olá! Bem-vindo à nossa assistência técnica. Como podemos ajudar você hoje?"
            }
          ]
        }
      },
      "name": "Responder Saudação",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [850, 500]
    },
    {
      "parameters": {
        "url": "={{$node[\"Configuração\"].json[\"apiUrl\"]}}/webhooks/n8n/{{$node[\"Configuração\"].json[\"tenantSlug\"]}}/send_message",
        "options": {},
        "method": "POST",
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "cliente_id",
              "value": "={{$node[\"Analisar Mensagem\"].json[\"cliente_id\"]}}"
            },
            {
              "name": "message",
              "value": "Desculpe, não entendi sua mensagem. Por favor, informe se deseja um orçamento, verificar o status de um serviço ou agendar um atendimento."
            }
          ]
        }
      },
      "name": "Resposta Padrão",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [850, 600]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "apiUrl",
              "value": "http://django-app:8000/api"
            },
            {
              "name": "tenantSlug",
              "value": "={{$json[\"tenant_id\"]}}"
            }
          ]
        }
      },
      "name": "Configuração",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [450, 100]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Analisar Mensagem",
            "type": "main",
            "index": 0
          },
          {
            "node": "Configuração",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Analisar Mensagem": {
      "main": [
        [
          {
            "node": "Tipo de Mensagem",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Tipo de Mensagem": {
      "main": [
        [
          {
            "node": "Responder Orçamento",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Responder Status",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Responder Agendamento",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Responder Saudação",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Resposta Padrão",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### 2. Fluxo para Notificação de Mudança de Status de OS

```json
{
  "name": "Notificação de Status de OS",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "os_status_update",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "// Extrair dados da requisição\nconst tenant_id = $input.item.json.tenant_id;\nconst os_id = $input.item.json.os_id;\nconst cliente_id = $input.item.json.cliente_id;\nconst status = $input.item.json.status;\nconst numero_os = $input.item.json.numero_os;\n\n// Definir mensagem com base no status\nlet mensagem = '';\n\nswitch(status) {\n  case 'recebido':\n    mensagem = `Olá! Sua ordem de serviço #${numero_os} foi recebida com sucesso. Em breve iniciaremos a análise.`;\n    break;\n  case 'analise':\n    mensagem = `Olá! Sua ordem de serviço #${numero_os} está em análise. Em breve enviaremos um orçamento.`;\n    break;\n  case 'orcamento':\n    mensagem = `Olá! O orçamento para sua ordem de serviço #${numero_os} está pronto. Por favor, entre em contato para aprovação.`;\n    break;\n  case 'aprovado':\n    mensagem = `Olá! Seu orçamento para a ordem de serviço #${numero_os} foi aprovado. Iniciaremos o reparo em breve.`;\n    break;\n  case 'reparo':\n    mensagem = `Olá! Sua ordem de serviço #${numero_os} está em reparo.`;\n    break;\n  case 'testando':\n    mensagem = `Olá! Sua ordem de serviço #${numero_os} está em fase de testes finais.`;\n    break;\n  case 'concluido':\n    mensagem = `Olá! Sua ordem de serviço #${numero_os} foi concluída. Seu aparelho está pronto para retirada.`;\n    break;\n  case 'entregue':\n    mensagem = `Olá! Agradecemos por confiar em nossos serviços. Sua ordem de serviço #${numero_os} foi finalizada com a entrega do aparelho.`;\n    break;\n  default:\n    mensagem = `Olá! Houve uma atualização em sua ordem de serviço #${numero_os}. Entre em contato para mais informações.`;\n}\n\nreturn {\n  json: {\n    tenant_id,\n    os_id,\n    cliente_id,\n    status,\n    numero_os,\n    mensagem\n  }\n};"
      },
      "name": "Preparar Mensagem",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "apiUrl",
              "value": "http://django-app:8000/api"
            },
            {
              "name": "tenantSlug",
              "value": "={{$json[\"tenant_id\"]}}"
            }
          ]
        }
      },
      "name": "Configuração",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1,
      "position": [450, 100]
    },
    {
      "parameters": {
        "url": "={{$node[\"Configuração\"].json[\"apiUrl\"]}}/webhooks/n8n/{{$node[\"Configuração\"].json[\"tenantSlug\"]}}/send_message",
        "options": {},
        "method": "POST",
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "cliente_id",
              "value": "={{$node[\"Preparar Mensagem\"].json[\"cliente_id\"]}}"
            },
            {
              "name": "message",
              "value": "={{$node[\"Preparar Mensagem\"].json[\"mensagem\"]}}"
            }
          ]
        }
      },
      "name": "Enviar Notificação",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Preparar Mensagem",
            "type": "main",
            "index": 0
          },
          {
            "node": "Configuração",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Preparar Mensagem": {
      "main": [
        [
          {
            "node": "Enviar Notificação",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Serviço para Gerenciamento de Instâncias da API Evolution

```python
# integracoes/services.py
import logging
from tenant.models import Tenant
from .evolution_api import EvolutionAPIClient

logger = logging.getLogger(__name__)

class EvolutionInstanceManager:
    """Serviço para gerenciamento de instâncias da API Evolution"""
    
    @staticmethod
    def create_instance_for_tenant(tenant):
        """
        Cria uma instância da API Evolution para um tenant
        
        Args:
            tenant: Objeto Tenant
        
        Returns:
            dict: Resultado da criação da instância
        """
        try:
            client = EvolutionAPIClient(tenant)
            result = client.create_instance()
            
            if result.get("error"):
                logger.error(f"Erro ao criar instância para tenant {tenant.nome}: {result.get('error')}")
                return {"success": False, "error": result.get("error")}
            
            logger.info(f"Instância criada com sucesso para tenant {tenant.nome}")
            return {"success": True, "instance_id": tenant.configuracoes.evolution_instance_id}
        
        except Exception as e:
            logger.error(f"Erro ao criar instância para tenant {tenant.nome}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def configure_webhook_for_tenant(tenant, base_url=None):
        """
        Configura webhook da API Evolution para um tenant
        
        Args:
            tenant: Objeto Tenant
            base_url: URL base para webhooks (opcional)
        
        Returns:
            dict: Resultado da configuração do webhook
        """
        try:
            client = EvolutionAPIClient(tenant)
            
            # Construir URL do webhook
            if not base_url:
                from django.conf import settings
                base_url = settings.BASE_URL
            
            webhook_url = f"{base_url}/api/webhooks/evolution/{tenant.slug}/"
            
            result = client.configure_webhook(webhook_url)
            
            if result.get("error"):
                logger.error(f"Erro ao configurar webhook para tenant {tenant.nome}: {result.get('error')}")
                return {"success": False, "error": result.get("error")}
            
            logger.info(f"Webhook configurado com sucesso para tenant {tenant.nome}")
            return {"success": True, "webhook_url": webhook_url}
        
        except Exception as e:
            logger.error(f"Erro ao configurar webhook para tenant {tenant.nome}: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def setup_all_tenants(base_url=None):
        """
        Configura instâncias e webhooks para todos os tenants ativos
        
        Args:
            base_url: URL base para webhooks (opcional)
        
        Returns:
            dict: Resultado da configuração
        """
        results = {
            "success": [],
            "failed": []
        }
        
        for tenant in Tenant.objects.filter(ativo=True):
            # Criar instância se não existir
            if not tenant.configuracoes.evolution_instance_id:
                instance_result = EvolutionInstanceManager.create_instance_for_tenant(tenant)
                
                if not instance_result.get("success"):
                    results["failed"].append({
                        "tenant": tenant.nome,
                        "operation": "create_instance",
                        "error": instance_result.get("error")
                    })
                    continue
            
            # Configurar webhook
            webhook_result = EvolutionInstanceManager.configure_webhook_for_tenant(tenant, base_url)
            
            if webhook_result.get("success"):
                results["success"].append({
                    "tenant": tenant.nome,
                    "instance_id": tenant.configuracoes.evolution_instance_id,
                    "webhook_url": webhook_result.get("webhook_url")
                })
            else:
                results["failed"].append({
                    "tenant": tenant.nome,
                    "operation": "configure_webhook",
                    "error": webhook_result.get("error")
                })
        
        return results
```

## Comando de Gerenciamento para Configuração Inicial

```python
# integracoes/management/commands/setup_integrations.py
from django.core.management.base import BaseCommand
from django.conf import settings
from tenant.models import Tenant
from integracoes.services import EvolutionInstanceManager

class Command(BaseCommand):
    help = 'Configura integrações para todos os tenants ativos'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--base-url',
            help='URL base para webhooks (ex: https://seu-dominio.com)',
        )
    
    def handle(self, *args, **options):
        base_url = options.get('base_url') or settings.BASE_URL
        
        self.stdout.write(self.style.SUCCESS(f'Configurando integrações com URL base: {base_url}'))
        
        # Configurar instâncias e webhooks da API Evolution
        self.stdout.write('Configurando API Evolution...')
        results = EvolutionInstanceManager.setup_all_tenants(base_url)
        
        # Exibir resultados
        self.stdout.write(self.style.SUCCESS(f'Configuração concluída!'))
        self.stdout.write(f'Tenants configurados com sucesso: {len(results["success"])}')
        self.stdout.write(f'Tenants com falha: {len(results["failed"])}')
        
        if results["failed"]:
            self.stdout.write(self.style.WARNING('Detalhes das falhas:'))
            for failure in results["failed"]:
                self.stdout.write(f'  - Tenant: {failure["tenant"]}')
                self.stdout.write(f'    Operação: {failure["operation"]}')
                self.stdout.write(f'    Erro: {failure["error"]}')
```

## Considerações de Segurança

### 1. Autenticação entre Serviços

Para garantir a segurança na comunicação entre o Django e os serviços em Docker, implementamos:

1. **Tokens de API**: Cada tenant possui tokens específicos para cada serviço.
2. **HTTPS**: Todas as comunicações externas devem usar HTTPS em produção.
3. **Validação de Tenant**: Verificação do tenant em todas as requisições de webhook.
4. **Secrets Management**: Uso de variáveis de ambiente para armazenar chaves sensíveis.

### 2. Exemplo de Configuração de Segurança para Produção

```python
# settings_production.py

# Configurações de segurança para produção
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 ano
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Configurações para Docker em produção
DOCKER_SERVICES = {
    'EVOLUTION_API_URL': f"https://{os.environ.get('EVOLUTION_API_DOMAIN')}",
    'EVOLUTION_API_KEY': os.environ.get('EVOLUTION_API_KEY'),
    
    'N8N_API_URL': f"https://{os.environ.get('N8N_API_DOMAIN')}",
    'N8N_API_KEY': os.environ.get('N8N_API_KEY'),
    
    'REDIS_HOST': os.environ.get('REDIS_HOST', 'redis'),
    'REDIS_PORT': int(os.environ.get('REDIS_PORT', 6379)),
}

# URL base para webhooks
BASE_URL = f"https://{os.environ.get('DJANGO_DOMAIN')}"
```

## Escalabilidade e Considerações para Produção

### 1. Balanceamento de Carga

Para garantir a escalabilidade do sistema, recomendamos:

1. **Múltiplas Instâncias Django**: Usar um balanceador de carga para distribuir requisições entre múltiplas instâncias Django.
2. **Réplicas de Containers**: Configurar réplicas dos containers Docker para alta disponibilidade.
3. **Sessões Distribuídas**: Armazenar sessões no Redis para permitir escalabilidade horizontal.

### 2. Monitoramento

Implementar monitoramento para todos os componentes:

1. **Prometheus**: Para métricas de desempenho.
2. **Grafana**: Para visualização de métricas.
3. **Logging Centralizado**: Usar ELK Stack ou similar para logs centralizados.
4. **Alertas**: Configurar alertas para problemas críticos.

### 3. Backup e Recuperação

Estratégias de backup para todos os componentes:

1. **Banco de Dados**: Backups regulares do PostgreSQL.
2. **Volumes Docker**: Backup dos volumes de dados dos containers.
3. **Configurações**: Versionamento das configurações em repositório Git.

## Próximos Passos

1. **Implementação da Estrutura Django**: Criar os modelos, views e templates conforme a modelagem de dados.
2. **Configuração do Docker Compose**: Configurar o ambiente Docker para desenvolvimento e produção.
3. **Implementação das Integrações**: Desenvolver os clientes de API e webhooks.
4. **Testes**: Criar testes unitários e de integração para validar o funcionamento do sistema.
5. **Documentação**: Documentar a API e os fluxos de trabalho para referência futura.
