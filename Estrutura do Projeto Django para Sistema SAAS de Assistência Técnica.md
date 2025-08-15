# Estrutura do Projeto Django para Sistema SAAS de Assistência Técnica

## Visão Geral

Este documento define a estrutura do projeto Django para o sistema SAAS de assistência técnica, seguindo as melhores práticas de organização de código, separação de responsabilidades e escalabilidade. A estrutura foi projetada para suportar multitenancy, permissões hierárquicas e integração com serviços externos em Docker.

## Estrutura de Diretórios

```
assistencia_tecnica_django/
│
├── assistencia_tecnica/          # Projeto principal Django
│   ├── __init__.py
│   ├── asgi.py
│   ├── celery.py                 # Configuração do Celery
│   ├── settings/                 # Configurações separadas por ambiente
│   │   ├── __init__.py
│   │   ├── base.py               # Configurações base
│   │   ├── development.py        # Configurações de desenvolvimento
│   │   ├── production.py         # Configurações de produção
│   │   └── test.py               # Configurações de teste
│   ├── urls.py                   # URLs principais
│   └── wsgi.py
│
├── apps/                         # Aplicações Django
│   ├── tenant/                   # App para gerenciamento de tenants
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── decorators.py         # Decoradores para controle de acesso
│   │   ├── managers.py           # Managers para multitenancy
│   │   ├── middleware.py         # Middleware para identificação de tenant
│   │   ├── mixins.py             # Mixins para modelos multitenancy
│   │   ├── models.py             # Modelos de tenant e configurações
│   │   ├── services.py           # Serviços relacionados a tenants
│   │   ├── signals.py            # Signals para eventos de tenant
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── usuarios/                 # App para gerenciamento de usuários
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── decorators.py         # Decoradores para permissões
│   │   ├── forms.py              # Formulários de usuário
│   │   ├── models.py             # Modelos de perfil e permissões
│   │   ├── services.py           # Serviços de autenticação
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── clientes/                 # App para gerenciamento de clientes
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── forms.py
│   │   ├── models.py             # Modelos de cliente e aparelho
│   │   ├── services.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── ordens_servico/           # App para ordens de serviço
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── forms.py
│   │   ├── models.py             # Modelos de OS, itens e serviços
│   │   ├── services.py           # Serviços de negócio para OS
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── agendamentos/             # App para agendamentos
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── forms.py
│   │   ├── models.py             # Modelos de agendamento
│   │   ├── services.py           # Serviços de agenda
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── financeiro/               # App para gestão financeira
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── forms.py
│   │   ├── models.py             # Modelos de pagamento e financeiro
│   │   ├── services.py           # Serviços financeiros
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   ├── estoque/                  # App para gestão de estoque
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── forms.py
│   │   ├── models.py             # Modelos de produtos e estoque
│   │   ├── services.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   │
│   └── integracoes/              # App para integrações externas
│       ├── migrations/
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── evolution_api.py      # Cliente para API Evolution
│       ├── n8n_api.py            # Cliente para n8n
│       ├── google_calendar.py    # Cliente para Google Calendar
│       ├── asaas_api.py          # Cliente para Asaas
│       ├── management/
│       │   └── commands/
│       │       └── setup_integrations.py  # Comando para configuração
│       ├── models.py
│       ├── services.py           # Serviços de integração
│       ├── tasks.py              # Tarefas Celery
│       ├── tests.py
│       ├── urls.py
│       └── views.py              # Views para webhooks
│
├── core/                         # Funcionalidades compartilhadas
│   ├── __init__.py
│   ├── constants.py              # Constantes do sistema
│   ├── exceptions.py             # Exceções personalizadas
│   ├── middleware.py             # Middlewares globais
│   ├── permissions.py            # Classes de permissão
│   ├── utils.py                  # Funções utilitárias
│   └── validators.py             # Validadores personalizados
│
├── templates/                    # Templates HTML
│   ├── admin/                    # Templates para admin do super admin
│   ├── base.html                 # Template base
│   ├── tenant/                   # Templates para admin de tenant
│   ├── usuarios/                 # Templates de autenticação
│   ├── clientes/                 # Templates de clientes
│   ├── ordens_servico/           # Templates de OS
│   ├── agendamentos/             # Templates de agendamentos
│   ├── financeiro/               # Templates financeiros
│   └── estoque/                  # Templates de estoque
│
├── static/                       # Arquivos estáticos
│   ├── css/
│   ├── js/
│   ├── img/
│   └── vendor/                   # Bibliotecas de terceiros
│
├── media/                        # Arquivos de mídia (uploads)
│   ├── logos/                    # Logos dos tenants
│   ├── perfis/                   # Fotos de perfil
│   └── anexos/                   # Anexos de OS
│
├── docker/                       # Arquivos Docker
│   ├── django/
│   │   └── Dockerfile            # Dockerfile para Django
│   ├── evolution-api/
│   │   └── Dockerfile            # Dockerfile para Evolution API
│   ├── n8n/
│   │   └── Dockerfile            # Dockerfile para n8n
│   └── nginx/
│       ├── Dockerfile            # Dockerfile para Nginx
│       └── nginx.conf            # Configuração do Nginx
│
├── scripts/                      # Scripts utilitários
│   ├── setup_dev.sh              # Script para configurar ambiente dev
│   ├── setup_prod.sh             # Script para configurar ambiente prod
│   └── backup.sh                 # Script para backup
│
├── docs/                         # Documentação
│   ├── architecture.md           # Documentação da arquitetura
│   ├── api.md                    # Documentação da API
│   ├── deployment.md             # Guia de implantação
│   └── user_guide.md             # Guia do usuário
│
├── requirements/                 # Requisitos Python
│   ├── base.txt                  # Requisitos base
│   ├── development.txt           # Requisitos de desenvolvimento
│   └── production.txt            # Requisitos de produção
│
├── .env.example                  # Exemplo de variáveis de ambiente
├── .gitignore                    # Arquivos ignorados pelo Git
├── docker-compose.yml            # Configuração Docker Compose
├── docker-compose.prod.yml       # Docker Compose para produção
├── manage.py                     # Script de gerenciamento Django
└── README.md                     # Documentação principal
```

## Configuração Inicial do Projeto

### 1. Arquivo de Configuração Base (settings/base.py)

```python
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'insecure-development-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = []

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'django_celery_beat',
    'django_celery_results',
    'corsheaders',
]

LOCAL_APPS = [
    'apps.tenant',
    'apps.usuarios',
    'apps.clientes',
    'apps.ordens_servico',
    'apps.agendamentos',
    'apps.financeiro',
    'apps.estoque',
    'apps.integracoes',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.tenant.middleware.TenantMiddleware',  # Middleware para multitenancy
]

ROOT_URLCONF = 'assistencia_tecnica.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'apps.tenant.context_processors.tenant_context',  # Contexto de tenant
            ],
        },
    },
]

WSGI_APPLICATION = 'assistencia_tecnica.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'assistencia_tecnica'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configurações de login
LOGIN_URL = '/usuarios/login/'
LOGIN_REDIRECT_URL = '/dashboard/'
LOGOUT_REDIRECT_URL = '/usuarios/login/'

# Configurações de e-mail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@assistenciatecnica.com.br')

# Configurações do REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# Configurações do Celery
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Configurações de CORS
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8000',
    'http://localhost:3000',
]

# Configurações de multitenancy
TENANT_USE_POSTGRESQL_SCHEMAS = False  # Se True, usa schemas PostgreSQL para isolamento
TENANT_DOMAIN = os.environ.get('TENANT_DOMAIN', 'localhost')

# Configurações para serviços Docker
DOCKER_SERVICES = {
    'EVOLUTION_API_URL': os.environ.get('EVOLUTION_API_URL', 'http://evolution-api:8080'),
    'EVOLUTION_API_KEY': os.environ.get('EVOLUTION_API_KEY', 'sua_chave_api_aqui'),
    
    'N8N_API_URL': os.environ.get('N8N_API_URL', 'http://n8n:5678'),
    'N8N_API_KEY': os.environ.get('N8N_API_KEY', 'sua_chave_api_aqui'),
}

# URL base para webhooks
BASE_URL = os.environ.get('BASE_URL', 'http://localhost:8000')

# Configurações para integração com Google Calendar
GOOGLE_OAUTH2_CLIENT_ID = os.environ.get('GOOGLE_OAUTH2_CLIENT_ID', '')
GOOGLE_OAUTH2_CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH2_CLIENT_SECRET', '')

# Configurações para integração com Asaas
ASAAS_API_URL = os.environ.get('ASAAS_API_URL', 'https://sandbox.asaas.com/api/v3')
ASAAS_API_KEY = os.environ.get('ASAAS_API_KEY', '')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/django.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# Garantir que o diretório de logs existe
os.makedirs(os.path.join(BASE_DIR, 'logs'), exist_ok=True)
```

### 2. Configuração de Desenvolvimento (settings/development.py)

```python
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

# Configuração de banco de dados para desenvolvimento
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'assistencia_tecnica'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# Email backend para desenvolvimento
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Configurações para serviços Docker em desenvolvimento
DOCKER_SERVICES = {
    'EVOLUTION_API_URL': 'http://localhost:8080',
    'EVOLUTION_API_KEY': 'sua_chave_api_aqui',
    
    'N8N_API_URL': 'http://localhost:5678',
    'N8N_API_KEY': 'sua_chave_api_aqui',
}

# CORS para desenvolvimento
CORS_ALLOW_ALL_ORIGINS = True

# Debug toolbar
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
INTERNAL_IPS = ['127.0.0.1']
```

### 3. Configuração de Produção (settings/production.py)

```python
from .base import *

DEBUG = False

ALLOWED_HOSTS = [
    os.environ.get('DJANGO_DOMAIN', 'assistenciatecnica.com.br'),
    f'*.{os.environ.get("TENANT_DOMAIN", "assistenciatecnica.com.br")}',
]

# Configurações de segurança para produção
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 ano
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Configurações para serviços Docker em produção
DOCKER_SERVICES = {
    'EVOLUTION_API_URL': f"https://{os.environ.get('EVOLUTION_API_DOMAIN')}",
    'EVOLUTION_API_KEY': os.environ.get('EVOLUTION_API_KEY'),
    
    'N8N_API_URL': f"https://{os.environ.get('N8N_API_DOMAIN')}",
    'N8N_API_KEY': os.environ.get('N8N_API_KEY'),
}

# URL base para webhooks em produção
BASE_URL = f"https://{os.environ.get('DJANGO_DOMAIN')}"

# CORS para produção
CORS_ALLOWED_ORIGINS = [
    f"https://{os.environ.get('DJANGO_DOMAIN')}",
    f"https://*.{os.environ.get('TENANT_DOMAIN')}",
]
```

### 4. Arquivo de Configuração do Celery (celery.py)

```python
import os
from celery import Celery

# Definir variável de ambiente para configurações do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'assistencia_tecnica.settings.development')

# Criar instância do Celery
app = Celery('assistencia_tecnica')

# Carregar configurações do Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Descobrir tarefas automaticamente
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
```

### 5. Arquivo de URLs Principal (urls.py)

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # URLs das aplicações
    path('usuarios/', include('apps.usuarios.urls')),
    path('clientes/', include('apps.clientes.urls')),
    path('ordens-servico/', include('apps.ordens_servico.urls')),
    path('agendamentos/', include('apps.agendamentos.urls')),
    path('financeiro/', include('apps.financeiro.urls')),
    path('estoque/', include('apps.estoque.urls')),
    
    # API e webhooks
    path('api/', include([
        path('webhooks/', include('apps.integracoes.urls')),
        path('v1/', include([
            path('usuarios/', include('apps.usuarios.api.urls')),
            path('clientes/', include('apps.clientes.api.urls')),
            path('ordens-servico/', include('apps.ordens_servico.api.urls')),
            path('agendamentos/', include('apps.agendamentos.api.urls')),
            path('financeiro/', include('apps.financeiro.api.urls')),
            path('estoque/', include('apps.estoque.api.urls')),
        ])),
    ])),
    
    # Autenticação da API
    path('api-auth/', include('rest_framework.urls')),
]

# Servir arquivos estáticos e de mídia em desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns += [path('__debug__/', include(debug_toolbar.urls))]
```

### 6. Arquivo Docker Compose (docker-compose.yml)

```yaml
version: '3'

services:
  # Aplicação Django
  django:
    build:
      context: .
      dockerfile: docker/django/Dockerfile
    container_name: assistencia-django
    restart: always
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    environment:
      - DJANGO_SETTINGS_MODULE=assistencia_tecnica.settings.development
      - POSTGRES_DB=assistencia_tecnica
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_HOST=db
      - POSTGRES_PORT=5432
      - EVOLUTION_API_URL=http://evolution-api:8080
      - EVOLUTION_API_KEY=sua_chave_api_aqui
      - N8N_API_URL=http://n8n:5678
      - N8N_API_KEY=sua_chave_api_aqui
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - db
      - redis
    networks:
      - assistencia-network

  # Celery Worker
  celery:
    build:
      context: .
      dockerfile: docker/django/Dockerfile
    container_name: assistencia-celery
    command: celery -A assistencia_tecnica worker -l info
    volumes:
      - .:/app
    environment:
      - DJANGO_SETTINGS_MODULE=assistencia_tecnica.settings.development
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      - django
      - redis
    networks:
      - assistencia-network

  # Celery Beat para tarefas agendadas
  celery-beat:
    build:
      context: .
      dockerfile: docker/django/Dockerfile
    container_name: assistencia-celery-beat
    command: celery -A assistencia_tecnica beat -l info
    volumes:
      - .:/app
    environment:
      - DJANGO_SETTINGS_MODULE=assistencia_tecnica.settings.development
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
    depends_on:
      - django
      - redis
    networks:
      - assistencia-network

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
      - AUTHENTICATION_API_KEY=sua_chave_api_aqui
      - LOG_LEVEL=info
    volumes:
      - evolution-data:/app/instances
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
      - N8N_ENCRYPTION_KEY=sua_chave_encriptacao_aqui
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_db
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=postgres
      - WEBHOOK_URL=http://n8n:5678
    volumes:
      - n8n-data:/home/node/.n8n
    depends_on:
      - db
    networks:
      - assistencia-network

  # Banco de dados PostgreSQL
  db:
    image: postgres:13
    container_name: postgres-db
    restart: always
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=assistencia_tecnica
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - assistencia-network

  # Redis para cache e filas
  redis:
    image: redis:alpine
    container_name: redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - assistencia-network

  # Nginx para servir a aplicação
  nginx:
    build:
      context: .
      dockerfile: docker/nginx/Dockerfile
    container_name: nginx
    restart: always
    ports:
      - "80:80"
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - django
    networks:
      - assistencia-network

volumes:
  postgres-data:
  redis-data:
  static_volume:
  media_volume:
  evolution-data:
  n8n-data:

networks:
  assistencia-network:
    driver: bridge
```

### 7. Dockerfile para Django (docker/django/Dockerfile)

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
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Criar diretório da aplicação
WORKDIR /app

# Instalar dependências Python
COPY requirements/base.txt /app/requirements/base.txt
COPY requirements/development.txt /app/requirements/development.txt
RUN pip install --upgrade pip \
    && pip install -r /app/requirements/development.txt

# Copiar o projeto
COPY . /app/

# Criar diretório para logs
RUN mkdir -p /app/logs

# Expor porta
EXPOSE 8000

# Comando para iniciar o servidor
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "assistencia_tecnica.wsgi:application"]
```

### 8. Configuração do Nginx (docker/nginx/nginx.conf)

```nginx
upstream django {
    server django:8000;
}

server {
    listen 80;
    server_name localhost;

    location /static/ {
        alias /app/staticfiles/;
    }

    location /media/ {
        alias /app/media/;
    }

    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 9. Arquivo de Requisitos Base (requirements/base.txt)

```
Django==4.2.7
djangorestframework==3.14.0
psycopg2-binary==2.9.6
celery==5.3.1
redis==4.6.0
django-celery-beat==2.5.0
django-celery-results==2.5.1
django-cors-headers==4.2.0
gunicorn==21.2.0
requests==2.31.0
python-dotenv==1.0.0
Pillow==10.0.0
google-auth==2.22.0
google-auth-oauthlib==1.0.0
google-auth-httplib2==0.1.0
google-api-python-client==2.95.0
```

### 10. Arquivo de Requisitos de Desenvolvimento (requirements/development.txt)

```
-r base.txt
django-debug-toolbar==4.2.0
pytest==7.4.0
pytest-django==4.5.2
coverage==7.3.0
black==23.7.0
flake8==6.1.0
```

### 11. Arquivo de Requisitos de Produção (requirements/production.txt)

```
-r base.txt
sentry-sdk==1.29.2
django-storages==1.13.2
boto3==1.28.17
```

### 12. Arquivo .env.example

```
# Django
DJANGO_SETTINGS_MODULE=assistencia_tecnica.settings.development
DJANGO_SECRET_KEY=sua_chave_secreta_aqui
DJANGO_DOMAIN=assistenciatecnica.com.br
TENANT_DOMAIN=assistenciatecnica.com.br

# Banco de dados
POSTGRES_DB=assistencia_tecnica
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_aqui
DEFAULT_FROM_EMAIL=noreply@assistenciatecnica.com.br

# API Evolution
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=sua_chave_api_aqui
EVOLUTION_API_DOMAIN=evolution.assistenciatecnica.com.br

# n8n
N8N_API_URL=http://n8n:5678
N8N_API_KEY=sua_chave_api_aqui
N8N_ENCRYPTION_KEY=sua_chave_encriptacao_aqui
N8N_API_DOMAIN=n8n.assistenciatecnica.com.br

# Google Calendar
GOOGLE_OAUTH2_CLIENT_ID=seu_client_id_aqui
GOOGLE_OAUTH2_CLIENT_SECRET=seu_client_secret_aqui

# Asaas
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_API_KEY=sua_chave_api_aqui

# AWS (para produção)
AWS_ACCESS_KEY_ID=sua_access_key_aqui
AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
AWS_STORAGE_BUCKET_NAME=seu_bucket_aqui
```

## Implementação dos Modelos Principais

### 1. Modelo de Tenant (apps/tenant/models.py)

```python
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

### 2. Middleware para Multitenancy (apps/tenant/middleware.py)

```python
from django.conf import settings
from django.db import connection
import threading
from .models import Tenant

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
        tenant_domain = settings.TENANT_DOMAIN
        
        if len(domain_parts) > 2 and domain_parts[0] != 'www':
            # É um subdomínio, tentar encontrar o tenant
            subdomain = domain_parts[0]
            try:
                tenant = Tenant.objects.get(slug=subdomain, ativo=True)
                set_current_tenant(tenant)
                
                # Opcional: definir schema do PostgreSQL para isolamento completo
                if settings.TENANT_USE_POSTGRESQL_SCHEMAS:
                    connection.set_schema(f"tenant_{tenant.id}")
                
                # Adicionar tenant ao request para fácil acesso nas views
                request.tenant = tenant
                
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

### 3. Manager para Modelos Multitenancy (apps/tenant/managers.py)

```python
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

### 4. Mixin para Modelos Multitenancy (apps/tenant/mixins.py)

```python
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

### 5. Modelo de Perfil de Usuário (apps/usuarios/models.py)

```python
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.tenant.models import Tenant

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


@receiver(post_save, sender=User)
def criar_perfil(sender, instance, created, **kwargs):
    """Cria um perfil para cada novo usuário"""
    if created:
        Perfil.objects.create(usuario=instance, tipo='cliente')
```

### 6. Decoradores para Controle de Acesso (apps/usuarios/decorators.py)

```python
from django.http import HttpResponseForbidden
from django.shortcuts import redirect
from functools import wraps
from .models import Perfil
from apps.tenant.middleware import get_current_tenant

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


def tenant_required(view_func):
    """Decorator que verifica se existe um tenant atual"""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        tenant = get_current_tenant()
        if not tenant:
            return HttpResponseForbidden("Acesso negado. Esta página só pode ser acessada através de um subdomínio de assistência técnica.")
        
        return view_func(request, *args, **kwargs)
    return _wrapped_view


def tenant_admin_required(view_func):
    """Decorator que restringe acesso para admin do tenant atual"""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('login')
        
        tenant = get_current_tenant()
        if not tenant:
            return HttpResponseForbidden("Acesso negado. Esta página só pode ser acessada através de um subdomínio de assistência técnica.")
        
        try:
            perfil = request.user.perfil
            if not perfil.is_admin() or perfil.tenant != tenant:
                return HttpResponseForbidden("Acesso negado. Apenas administradores desta assistência técnica podem acessar esta página.")
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
                
                # Verificar tenant
                tenant = get_current_tenant()
                if tenant and perfil.tenant != tenant:
                    return HttpResponseForbidden("Acesso negado. Você não pertence a esta assistência técnica.")
                
                # Verificar permissão específica
                try:
                    permissoes = perfil.permissoes_personalizadas.first()
                    if permissoes and hasattr(permissoes, permission_name) and getattr(permissoes, permission_name):
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

## Próximos Passos para Implementação

1. **Criar os Modelos Restantes**:
   - Implementar os modelos de Cliente, Aparelho, OrdemServico, Agendamento, etc.
   - Aplicar o TenantMixin a todos os modelos que pertencem a um tenant

2. **Implementar as Views**:
   - Criar views para autenticação e gerenciamento de usuários
   - Implementar views para o painel administrativo do super admin
   - Desenvolver views para o painel de controle de cada assistência técnica

3. **Configurar as Integrações**:
   - Implementar os clientes de API para Evolution, n8n, Google Calendar e Asaas
   - Configurar os webhooks para comunicação entre os serviços

4. **Desenvolver a Interface de Usuário**:
   - Criar templates HTML com design responsivo
   - Implementar JavaScript para interatividade
   - Desenvolver componentes reutilizáveis

5. **Configurar o Ambiente de Desenvolvimento**:
   - Configurar o Docker Compose para desenvolvimento local
   - Criar scripts para facilitar o setup inicial

6. **Preparar para Produção**:
   - Configurar o ambiente de produção com Docker Compose
   - Implementar estratégias de backup e monitoramento
   - Configurar HTTPS e segurança

7. **Testes**:
   - Desenvolver testes unitários para modelos e lógica de negócio
   - Implementar testes de integração para fluxos completos
   - Realizar testes de segurança para isolamento de dados

8. **Documentação**:
   - Documentar a API para integrações externas
   - Criar guias de usuário para diferentes perfis
   - Documentar o processo de implantação e manutenção
