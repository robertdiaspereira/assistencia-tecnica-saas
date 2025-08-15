#!/bin/bash

# Script para configuração inicial do ambiente de desenvolvimento
# Assistência Técnica SAAS - Sistema Multiempresa

echo "Configurando ambiente de desenvolvimento para Assistência Técnica SAAS..."

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

# Criar ambiente virtual Python se não existir
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual Python..."
    python -m venv venv
fi

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
echo "Instalando dependências..."
pip install django djangorestframework psycopg2-binary celery redis django-celery-beat django-celery-results django-cors-headers pillow requests python-dotenv gunicorn

# Copiar arquivo .env de exemplo
if [ ! -f .env ]; then
    echo "Criando arquivo .env de exemplo..."
    cat > .env << EOL
# Django
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,*.localhost
TENANT_DOMAIN=localhost

# Banco de dados
DB_ENGINE=django.db.backends.postgresql
DB_NAME=assistencia_tecnica
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_aqui
DEFAULT_FROM_EMAIL=noreply@assistenciatecnica.com.br

# API Evolution
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_chave_api_aqui

# n8n
N8N_API_URL=http://localhost:5678
N8N_API_KEY=sua_chave_api_aqui

# Google Calendar
GOOGLE_OAUTH2_CLIENT_ID=seu_client_id_aqui
GOOGLE_OAUTH2_CLIENT_SECRET=seu_client_secret_aqui

# Asaas
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_API_KEY=sua_chave_api_aqui
EOL
    echo "Arquivo .env criado. Por favor, edite-o com suas configurações."
fi

# Criar diretório para logs se não existir
mkdir -p logs

# Criar diretórios para arquivos de mídia
mkdir -p media/logos
mkdir -p media/perfis
mkdir -p media/anexos

# Criar docker-compose.yml se não existir
if [ ! -f docker-compose.yml ]; then
    echo "Criando arquivo docker-compose.yml..."
    cat > docker-compose.yml << EOL
version: '3'

services:
  # Banco de dados PostgreSQL
  db:
    image: postgres:13
    container_name: assistencia-db
    restart: always
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=assistencia_tecnica
    volumes:
      - postgres-data:/var/lib/postgresql/data

  # Redis para cache e filas
  redis:
    image: redis:alpine
    container_name: assistencia-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

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

volumes:
  postgres-data:
  redis-data:
  evolution-data:
  n8n-data:
EOL
    echo "Arquivo docker-compose.yml criado."
fi

# Iniciar containers Docker
echo "Iniciando containers Docker..."
docker-compose up -d

# Aguardar banco de dados inicializar
echo "Aguardando banco de dados inicializar..."
sleep 10

# Aplicar migrações
echo "Aplicando migrações..."
python manage.py makemigrations
python manage.py migrate

# Criar superusuário se não existir
echo "Verificando superusuário..."
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'assistencia_tecnica.settings')
import django
django.setup()
from django.contrib.auth.models import User
from apps.usuarios.models import Perfil
if not User.objects.filter(username='admin').exists():
    print('Criando superusuário...')
    user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    perfil = Perfil.objects.get(usuario=user)
    perfil.tipo = 'super_admin'
    perfil.save()
    print('Superusuário criado com sucesso!')
else:
    print('Superusuário já existe.')
"

# Criar tenant de demonstração
echo "Criando tenant de demonstração..."
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'assistencia_tecnica.settings')
import django
django.setup()
from django.contrib.auth.models import User
from django.utils import timezone
from apps.tenant.models import Tenant, TenantConfig, Assinatura
from apps.usuarios.models import Perfil, PermissaoPersonalizada
import datetime

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
    print(f'Tenant criado: {tenant.nome}')
else:
    print(f'Tenant já existe: {tenant.nome}')

TenantConfig.objects.get_or_create(
    tenant=tenant,
    defaults={
        'horario_abertura': '09:00',
        'horario_fechamento': '18:00',
        'dias_funcionamento': '1,2,3,4,5'
    }
)

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
    print(f'Usuário admin criado: {admin_user.username}')
else:
    print(f'Usuário admin já existe: {admin_user.username}')

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

tenant.admin_principal = admin_user
tenant.save()

print('Tenant de demonstração configurado com sucesso!')
print(f'URL: http://demo.localhost:8000')
print(f'Usuário: admin_demo')
print(f'Senha: senha123')
"

echo "Configuração concluída com sucesso!"
echo "Para iniciar o servidor de desenvolvimento, execute: python manage.py runserver"
echo "Acesso ao painel de administração: http://localhost:8000/admin"
echo "Usuário: admin"
echo "Senha: admin123"
echo "Acesso ao tenant de demonstração: http://demo.localhost:8000"
echo "Usuário: admin_demo"
echo "Senha: senha123"
