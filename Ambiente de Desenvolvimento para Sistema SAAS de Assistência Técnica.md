# Ambiente de Desenvolvimento para Sistema SAAS de Assistência Técnica

## Visão Geral

Este documento descreve o ambiente de desenvolvimento para o sistema SAAS de assistência técnica, incluindo instruções para configuração, scripts de inicialização e boas práticas para desenvolvimento. O ambiente foi projetado para facilitar o desenvolvimento e teste do sistema multitenancy com Django e serviços em Docker.

## Requisitos do Sistema

- Python 3.10 ou superior
- Docker e Docker Compose
- Git
- PostgreSQL 13 (via Docker)
- Redis (via Docker)
- Node.js 16+ (opcional, para desenvolvimento frontend)

## Configuração Inicial

### 1. Clone do Repositório

```bash
# Clone o repositório
git clone https://github.com/sua-empresa/assistencia-tecnica-django.git
cd assistencia-tecnica-django

# Crie um branch para desenvolvimento
git checkout -b develop
```

### 2. Configuração do Ambiente Virtual Python

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual (Linux/Mac)
source venv/bin/activate

# Ativar ambiente virtual (Windows)
venv\Scripts\activate

# Instalar dependências de desenvolvimento
pip install -r requirements/development.txt
```

### 3. Configuração das Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis conforme necessário
nano .env
```

### 4. Inicialização dos Containers Docker

```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status dos containers
docker-compose ps
```

### 5. Configuração do Banco de Dados

```bash
# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser
```

### 6. Configuração Inicial do Sistema

```bash
# Criar tenant de exemplo
python manage.py create_demo_tenant

# Configurar integrações
python manage.py setup_integrations --base-url=http://localhost:8000
```

## Scripts de Desenvolvimento

### Script de Setup Inicial (scripts/setup_dev.sh)

```bash
#!/bin/bash

# Script para configuração inicial do ambiente de desenvolvimento

echo "Configurando ambiente de desenvolvimento..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Por favor, instale o Docker antes de continuar."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose não encontrado. Por favor, instale o Docker Compose antes de continuar."
    exit 1
fi

# Criar ambiente virtual Python
echo "Criando ambiente virtual Python..."
python -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
echo "Instalando dependências..."
pip install -r requirements/development.txt

# Copiar arquivo .env de exemplo
if [ ! -f .env ]; then
    echo "Copiando arquivo .env de exemplo..."
    cp .env.example .env
    echo "Por favor, edite o arquivo .env com suas configurações."
fi

# Iniciar containers Docker
echo "Iniciando containers Docker..."
docker-compose up -d

# Aguardar banco de dados
echo "Aguardando banco de dados inicializar..."
sleep 10

# Aplicar migrações
echo "Aplicando migrações..."
python manage.py migrate

# Criar diretórios necessários
echo "Criando diretórios..."
mkdir -p media/logos
mkdir -p media/perfis
mkdir -p media/anexos
mkdir -p logs

# Criar superusuário
echo "Criando superusuário..."
python manage.py createsuperuser

# Criar tenant de exemplo
echo "Criando tenant de exemplo..."
python manage.py create_demo_tenant

# Configurar integrações
echo "Configurando integrações..."
python manage.py setup_integrations --base-url=http://localhost:8000

echo "Configuração concluída com sucesso!"
echo "Para iniciar o servidor de desenvolvimento, execute: python manage.py runserver"
```

### Script para Reiniciar Serviços (scripts/restart_services.sh)

```bash
#!/bin/bash

# Script para reiniciar serviços Docker

echo "Reiniciando serviços Docker..."

# Parar containers
docker-compose down

# Iniciar containers
docker-compose up -d

echo "Serviços reiniciados com sucesso!"
```

### Script para Backup do Banco de Dados (scripts/backup_db.sh)

```bash
#!/bin/bash

# Script para backup do banco de dados

# Definir variáveis
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# Criar diretório de backup se não existir
mkdir -p ${BACKUP_DIR}

# Executar backup
echo "Realizando backup do banco de dados..."
docker-compose exec -T db pg_dump -U postgres assistencia_tecnica > ${BACKUP_FILE}

# Comprimir arquivo
gzip ${BACKUP_FILE}

echo "Backup concluído: ${BACKUP_FILE}.gz"
```

### Script para Restaurar Banco de Dados (scripts/restore_db.sh)

```bash
#!/bin/bash

# Script para restaurar backup do banco de dados

# Verificar se arquivo foi informado
if [ -z "$1" ]; then
    echo "Uso: $0 <arquivo_backup>"
    exit 1
fi

BACKUP_FILE=$1

# Verificar se arquivo existe
if [ ! -f ${BACKUP_FILE} ]; then
    echo "Arquivo de backup não encontrado: ${BACKUP_FILE}"
    exit 1
fi

# Descomprimir se necessário
if [[ ${BACKUP_FILE} == *.gz ]]; then
    echo "Descomprimindo arquivo..."
    gunzip -c ${BACKUP_FILE} > ${BACKUP_FILE%.gz}
    BACKUP_FILE=${BACKUP_FILE%.gz}
fi

# Restaurar backup
echo "Restaurando backup do banco de dados..."
docker-compose exec -T db psql -U postgres -d assistencia_tecnica < ${BACKUP_FILE}

echo "Restauração concluída!"
```

## Comando de Gerenciamento para Criar Tenant de Demonstração

```python
# apps/tenant/management/commands/create_demo_tenant.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from apps.tenant.models import Tenant, TenantConfig, Assinatura
from apps.usuarios.models import Perfil, PermissaoPersonalizada
import datetime

class Command(BaseCommand):
    help = 'Cria um tenant de demonstração para desenvolvimento'
    
    def handle(self, *args, **options):
        # Criar tenant
        self.stdout.write('Criando tenant de demonstração...')
        
        tenant, created = Tenant.objects.get_or_create(
            slug='demo',
            defaults={
                'nome': 'Assistência Técnica Demo',
                'cnpj': '12.345.678/0001-99',
                'email': 'demo@assistenciatecnica.com.br',
                'telefone': '(11) 99999-9999',
                'endereco': 'Rua de Exemplo, 123 - São Paulo/SP',
                'ativo': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Tenant criado: {tenant.nome}'))
        else:
            self.stdout.write(f'Tenant já existe: {tenant.nome}')
        
        # Criar configurações
        TenantConfig.objects.get_or_create(
            tenant=tenant,
            defaults={
                'horario_abertura': '09:00',
                'horario_fechamento': '18:00',
                'dias_funcionamento': '1,2,3,4,5'
            }
        )
        
        # Criar assinatura
        Assinatura.objects.get_or_create(
            tenant=tenant,
            defaults={
                'plano': 'profissional',
                'valor': 99.90,
                'data_inicio': timezone.now().date(),
                'data_proximo_pagamento': (timezone.now() + datetime.timedelta(days=30)).date(),
                'status': 'trial'
            }
        )
        
        # Criar usuário admin
        admin_user, created = User.objects.get_or_create(
            username='admin_demo',
            defaults={
                'email': 'admin@demo.com',
                'first_name': 'Admin',
                'last_name': 'Demo',
                'is_staff': False,
                'is_superuser': False
            }
        )
        
        if created:
            admin_user.set_password('senha123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'Usuário admin criado: {admin_user.username}'))
        else:
            self.stdout.write(f'Usuário admin já existe: {admin_user.username}')
        
        # Configurar perfil
        perfil, created = Perfil.objects.get_or_create(
            usuario=admin_user,
            defaults={
                'tenant': tenant,
                'tipo': 'admin',
                'telefone': '(11) 99999-9999'
            }
        )
        
        if not created:
            perfil.tenant = tenant
            perfil.tipo = 'admin'
            perfil.save()
        
        # Configurar permissões
        permissoes, created = PermissaoPersonalizada.objects.get_or_create(
            perfil=perfil,
            defaults={
                'gerenciar_usuarios': True,
                'gerenciar_financeiro': True,
                'gerenciar_estoque': True,
                'gerenciar_configuracoes': True,
                'criar_os': True,
                'editar_os': True,
                'aprovar_orcamento': True,
                'finalizar_os': True,
                'visualizar_agenda': True,
                'criar_agendamento': True
            }
        )
        
        # Definir como admin principal do tenant
        tenant.admin_principal = admin_user
        tenant.save()
        
        self.stdout.write(self.style.SUCCESS('Tenant de demonstração configurado com sucesso!'))
        self.stdout.write(f'URL: http://demo.localhost:8000')
        self.stdout.write(f'Usuário: admin_demo')
        self.stdout.write(f'Senha: senha123')
```

## Configuração do Docker Compose para Desenvolvimento

```yaml
# docker-compose.override.yml
version: '3'

services:
  # Sobrescrever configurações para desenvolvimento
  django:
    build:
      context: .
      dockerfile: docker/django/Dockerfile.dev
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DJANGO_SETTINGS_MODULE=assistencia_tecnica.settings.development
      - DEBUG=True
    depends_on:
      - db
      - redis

  # Configuração para desenvolvimento do n8n
  n8n:
    ports:
      - "5678:5678"
    environment:
      - N8N_EDITOR_BASE_URL=http://localhost:5678
      - WEBHOOK_TUNNEL_URL=http://localhost:5678

  # Configuração para desenvolvimento da API Evolution
  evolution-api:
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://localhost:8080
```

## Dockerfile para Desenvolvimento (docker/django/Dockerfile.dev)

```dockerfile
FROM python:3.10-slim

# Definir variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instalar dependências do sistema
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        gettext \
        git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Criar diretório da aplicação
WORKDIR /app

# Instalar dependências Python
COPY requirements/development.txt /app/requirements/development.txt
COPY requirements/base.txt /app/requirements/base.txt
RUN pip install --upgrade pip \
    && pip install -r /app/requirements/development.txt

# Criar diretório para logs
RUN mkdir -p /app/logs

# Expor porta
EXPOSE 8000

# Comando para iniciar o servidor de desenvolvimento
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## Configuração do hosts para Desenvolvimento Local

Para testar o sistema multitenancy localmente, é necessário configurar o arquivo hosts do sistema operacional para mapear subdomínios para localhost.

### Linux/Mac (arquivo /etc/hosts)

```
127.0.0.1   localhost
127.0.0.1   demo.localhost
127.0.0.1   tenant1.localhost
127.0.0.1   tenant2.localhost
```

### Windows (arquivo C:\Windows\System32\drivers\etc\hosts)

```
127.0.0.1   localhost
127.0.0.1   demo.localhost
127.0.0.1   tenant1.localhost
127.0.0.1   tenant2.localhost
```

## Configuração do VS Code (arquivo .vscode/settings.json)

```json
{
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "black",
    "python.formatting.blackArgs": [
        "--line-length",
        "100"
    ],
    "editor.formatOnSave": true,
    "python.linting.flake8Args": [
        "--max-line-length=100",
        "--ignore=E203,E501,W503"
    ],
    "python.testing.pytestEnabled": true,
    "python.testing.unittestEnabled": false,
    "python.testing.nosetestsEnabled": false,
    "python.testing.pytestArgs": [
        "tests"
    ],
    "[python]": {
        "editor.codeActionsOnSave": {
            "source.organizeImports": true
        }
    },
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true,
        "**/.DS_Store": true
    }
}
```

## Configuração do Git (arquivo .gitignore)

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Django
*.log
*.pot
*.pyc
__pycache__/
local_settings.py
db.sqlite3
media/
staticfiles/

# Ambiente virtual
venv/
ENV/

# Arquivos de ambiente
.env
.env.*
!.env.example

# Docker
.docker/

# Logs
logs/

# Backups
backups/

# VS Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# PyCharm
.idea/

# Outros
.DS_Store
node_modules/
```

## Configuração do pre-commit (arquivo .pre-commit-config.yaml)

```yaml
repos:
-   repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
    -   id: trailing-whitespace
    -   id: end-of-file-fixer
    -   id: check-yaml
    -   id: check-added-large-files

-   repo: https://github.com/pycqa/flake8
    rev: 6.1.0
    hooks:
    -   id: flake8
        args: [--max-line-length=100, --ignore=E203,E501,W503]

-   repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
    -   id: isort
        args: [--profile=black, --line-length=100]

-   repo: https://github.com/psf/black
    rev: 23.7.0
    hooks:
    -   id: black
        args: [--line-length=100]
```

## Configuração do pytest (arquivo pytest.ini)

```ini
[pytest]
DJANGO_SETTINGS_MODULE = assistencia_tecnica.settings.test
python_files = test_*.py
testpaths = tests
```

## Estrutura de Testes

```
tests/
├── conftest.py                  # Configurações e fixtures para testes
├── factories/                   # Factories para criação de objetos de teste
│   ├── __init__.py
│   ├── tenant_factories.py
│   ├── user_factories.py
│   └── ...
├── integration/                 # Testes de integração
│   ├── __init__.py
│   ├── test_evolution_api.py
│   ├── test_n8n_api.py
│   └── ...
└── unit/                        # Testes unitários
    ├── __init__.py
    ├── tenant/
    │   ├── __init__.py
    │   ├── test_models.py
    │   ├── test_middleware.py
    │   └── ...
    ├── usuarios/
    │   ├── __init__.py
    │   ├── test_models.py
    │   ├── test_decorators.py
    │   └── ...
    └── ...
```

## Arquivo de Configuração para Testes (settings/test.py)

```python
from .base import *

# Configurações para ambiente de teste
DEBUG = False
TESTING = True

# Usar banco de dados em memória para testes
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Desativar cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Usar backend de email em memória
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Desativar CSRF para testes
MIDDLEWARE = [m for m in MIDDLEWARE if 'CsrfViewMiddleware' not in m]

# Configurações para serviços externos em testes
DOCKER_SERVICES = {
    'EVOLUTION_API_URL': 'http://localhost:8080',
    'EVOLUTION_API_KEY': 'test_key',
    
    'N8N_API_URL': 'http://localhost:5678',
    'N8N_API_KEY': 'test_key',
}

# Desativar Celery em testes
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
```

## Fixtures para Testes (tests/conftest.py)

```python
import pytest
from django.contrib.auth.models import User
from apps.tenant.models import Tenant, TenantConfig, Assinatura
from apps.usuarios.models import Perfil, PermissaoPersonalizada
from apps.tenant.middleware import set_current_tenant
from django.utils import timezone
import datetime

@pytest.fixture
def tenant():
    """Fixture que cria um tenant para testes"""
    tenant = Tenant.objects.create(
        nome='Tenant Teste',
        slug='teste',
        cnpj='12.345.678/0001-99',
        email='teste@example.com',
        telefone='(11) 99999-9999',
        endereco='Rua de Teste, 123',
        ativo=True
    )
    
    # Criar configurações
    TenantConfig.objects.create(
        tenant=tenant,
        horario_abertura='09:00',
        horario_fechamento='18:00',
        dias_funcionamento='1,2,3,4,5'
    )
    
    # Criar assinatura
    Assinatura.objects.create(
        tenant=tenant,
        plano='profissional',
        valor=99.90,
        data_inicio=timezone.now().date(),
        data_proximo_pagamento=(timezone.now() + datetime.timedelta(days=30)).date(),
        status='ativa'
    )
    
    return tenant

@pytest.fixture
def admin_user(tenant):
    """Fixture que cria um usuário admin para testes"""
    user = User.objects.create_user(
        username='admin_teste',
        email='admin@teste.com',
        password='senha123',
        first_name='Admin',
        last_name='Teste'
    )
    
    # Criar perfil
    perfil = Perfil.objects.create(
        usuario=user,
        tenant=tenant,
        tipo='admin',
        telefone='(11) 99999-9999'
    )
    
    # Criar permissões
    PermissaoPersonalizada.objects.create(
        perfil=perfil,
        gerenciar_usuarios=True,
        gerenciar_financeiro=True,
        gerenciar_estoque=True,
        gerenciar_configuracoes=True,
        criar_os=True,
        editar_os=True,
        aprovar_orcamento=True,
        finalizar_os=True,
        visualizar_agenda=True,
        criar_agendamento=True
    )
    
    # Definir como admin principal do tenant
    tenant.admin_principal = user
    tenant.save()
    
    return user

@pytest.fixture
def super_admin_user():
    """Fixture que cria um super admin para testes"""
    user = User.objects.create_user(
        username='super_admin',
        email='super@admin.com',
        password='senha123',
        first_name='Super',
        last_name='Admin'
    )
    
    # Criar perfil
    Perfil.objects.create(
        usuario=user,
        tenant=None,
        tipo='super_admin'
    )
    
    return user

@pytest.fixture
def tecnico_user(tenant):
    """Fixture que cria um usuário técnico para testes"""
    user = User.objects.create_user(
        username='tecnico_teste',
        email='tecnico@teste.com',
        password='senha123',
        first_name='Técnico',
        last_name='Teste'
    )
    
    # Criar perfil
    perfil = Perfil.objects.create(
        usuario=user,
        tenant=tenant,
        tipo='tecnico',
        telefone='(11) 88888-8888'
    )
    
    # Criar permissões
    PermissaoPersonalizada.objects.create(
        perfil=perfil,
        gerenciar_usuarios=False,
        gerenciar_financeiro=False,
        gerenciar_estoque=True,
        gerenciar_configuracoes=False,
        criar_os=True,
        editar_os=True,
        aprovar_orcamento=False,
        finalizar_os=True,
        visualizar_agenda=True,
        criar_agendamento=True
    )
    
    return user

@pytest.fixture
def set_tenant(tenant):
    """Fixture que define o tenant atual para testes"""
    set_current_tenant(tenant)
    yield
    set_current_tenant(None)
```

## Boas Práticas de Desenvolvimento

1. **Multitenancy**:
   - Sempre use o TenantMixin para modelos que pertencem a um tenant
   - Utilize os decoradores de permissão para controlar acesso
   - Teste o isolamento de dados entre tenants

2. **Segurança**:
   - Nunca armazene senhas ou chaves de API no código
   - Use variáveis de ambiente para configurações sensíveis
   - Implemente validação de entrada em todos os formulários
   - Utilize HTTPS em produção

3. **Performance**:
   - Otimize consultas ao banco de dados (select_related, prefetch_related)
   - Utilize cache para dados frequentemente acessados
   - Monitore o desempenho com ferramentas como Django Debug Toolbar

4. **Testes**:
   - Escreva testes unitários para modelos e lógica de negócio
   - Implemente testes de integração para fluxos completos
   - Use factories para criar objetos de teste
   - Execute testes antes de cada commit

5. **Código Limpo**:
   - Siga as convenções de estilo do PEP 8
   - Use Black e isort para formatação automática
   - Documente funções e classes complexas
   - Mantenha métodos pequenos e focados

6. **Versionamento**:
   - Use Git Flow para gerenciamento de branches
   - Faça commits pequenos e frequentes
   - Escreva mensagens de commit descritivas
   - Utilize pull requests para revisão de código

## Próximos Passos

1. **Implementação dos Modelos**:
   - Implementar os modelos restantes conforme a modelagem de dados
   - Aplicar migrações e testar o banco de dados

2. **Desenvolvimento das Views**:
   - Criar views para autenticação e gerenciamento de usuários
   - Implementar views para o painel administrativo
   - Desenvolver views para o painel de controle de cada assistência técnica

3. **Integrações**:
   - Implementar os clientes de API para serviços externos
   - Configurar webhooks para comunicação entre os serviços
   - Testar integrações em ambiente de desenvolvimento

4. **Interface de Usuário**:
   - Desenvolver templates HTML com design responsivo
   - Implementar JavaScript para interatividade
   - Testar em diferentes dispositivos e navegadores

5. **Testes e Documentação**:
   - Escrever testes para todas as funcionalidades
   - Documentar a API para integrações externas
   - Criar guias de usuário para diferentes perfis
