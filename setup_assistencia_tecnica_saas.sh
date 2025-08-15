#!/bin/bash

# Script para criar a estrutura de pastas e arquivos para o projeto SAAS de Assistência Técnica
# Autor: Manus
# Data: 04/08/2025

# Cores para melhor visualização
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}   Criando estrutura para SAAS de Assistência Técnica      ${NC}"
echo -e "${BLUE}===========================================================${NC}"

# Diretório base do projeto
BASE_DIR="assistencia_tecnica_saas"

# Criar diretório base
echo -e "${YELLOW}Criando diretório base do projeto...${NC}"
mkdir -p $BASE_DIR
cd $BASE_DIR

# Criar estrutura de diretórios
echo -e "${YELLOW}Criando estrutura de diretórios...${NC}"

# Diretórios para Docker
mkdir -p evolution-data
mkdir -p n8n-data
mkdir -p postgres-data
mkdir -p frontend
mkdir -p nginx/conf.d
mkdir -p certbot/conf
mkdir -p certbot/www

# Criar arquivo docker-compose.yml
echo -e "${YELLOW}Criando arquivo docker-compose.yml...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3'

services:
  # Container da API Evolution
  evolution-api:
    image: evolutionapi/evolution:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://localhost:8080
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=sua_chave_api_aqui
      - LOG_LEVEL=info
    volumes:
      - ./evolution-data:/app/instances
    networks:
      - assistencia-network

  # Container do Sistema ERP Multiempresa
  sistema-erp:
    image: seu-sistema-erp:latest  # Substitua pela imagem do seu ERP
    container_name: sistema-erp
    restart: always
    ports:
      - "3000:3000"  # Ajuste conforme necessário
    environment:
      - DATABASE_URL=postgres://usuario:senha@db:5432/erp_db
      - JWT_SECRET=seu_segredo_jwt
      - ASAAS_API_KEY=sua_chave_asaas
      - ASAAS_API_URL=https://sandbox.asaas.com/api/v3  # Ou produção
    depends_on:
      - db
    networks:
      - assistencia-network

  # Container do n8n
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_ENCRYPTION_KEY=sua_chave_de_criptografia
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_db
      - DB_POSTGRESDB_USER=usuario
      - DB_POSTGRESDB_PASSWORD=senha
      - WEBHOOK_URL=https://seu-dominio.com/webhook  # URL pública para webhooks
    volumes:
      - ./n8n-data:/home/node/.n8n
    depends_on:
      - db
    networks:
      - assistencia-network

  # Frontend SAAS
  frontend:
    image: nginx:alpine
    container_name: frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - sistema-erp
    networks:
      - assistencia-network

  # Banco de dados PostgreSQL compartilhado
  db:
    image: postgres:13
    container_name: postgres-db
    restart: always
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=usuario
      - POSTGRES_PASSWORD=senha
      - POSTGRES_MULTIPLE_DATABASES=n8n_db,erp_db
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
      - ./init-multiple-dbs.sh:/docker-entrypoint-initdb.d/init-multiple-dbs.sh
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
EOF

# Criar script para inicialização de múltiplos bancos de dados
echo -e "${YELLOW}Criando script init-multiple-dbs.sh...${NC}"
cat > init-multiple-dbs.sh << 'EOF'
#!/bin/bash

set -e
set -u

function create_user_and_database() {
    local database=$1
    echo "  Creating user and database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_user_and_database $db
    done
    echo "Multiple databases created"
fi
EOF

# Dar permissão de execução ao script
chmod +x init-multiple-dbs.sh

# Criar arquivo de configuração do Nginx
echo -e "${YELLOW}Criando arquivo de configuração do Nginx...${NC}"
mkdir -p nginx/conf.d
cat > nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://sistema-erp:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /n8n/ {
        proxy_pass http://n8n:5678/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

server {
    listen 443 ssl;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://sistema-erp:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /n8n/ {
        proxy_pass http://n8n:5678/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Criar página HTML básica para o frontend
echo -e "${YELLOW}Criando página HTML básica para o frontend...${NC}"
mkdir -p frontend
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema SAAS para Assistência Técnica</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #333;
        }
        header {
            background-color: #2c3e50;
            color: white;
            padding: 1rem;
            text-align: center;
        }
        main {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 1rem;
        }
        .card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            padding: 2rem;
            margin-bottom: 2rem;
        }
        h1 {
            margin: 0;
        }
        .login-form {
            max-width: 400px;
            margin: 0 auto;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
        }
        input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }
        button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            width: 100%;
        }
        button:hover {
            background-color: #2980b9;
        }
        .register-link {
            text-align: center;
            margin-top: 1rem;
        }
        .register-link a {
            color: #3498db;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <header>
        <h1>Sistema SAAS para Assistência Técnica</h1>
    </header>
    <main>
        <div class="card">
            <div class="login-form">
                <h2>Login</h2>
                <form>
                    <div class="form-group">
                        <label for="email">E-mail</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit">Entrar</button>
                </form>
                <div class="register-link">
                    <p>Não tem uma conta? <a href="#">Cadastre-se</a></p>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
EOF

# Criar arquivo .env para variáveis de ambiente
echo -e "${YELLOW}Criando arquivo .env para variáveis de ambiente...${NC}"
cat > .env << 'EOF'
# Configurações gerais
DOMAIN=seu-dominio.com

# Configurações do PostgreSQL
POSTGRES_USER=usuario
POSTGRES_PASSWORD=senha
POSTGRES_MULTIPLE_DATABASES=n8n_db,erp_db

# Configurações do n8n
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_ENCRYPTION_KEY=sua_chave_de_criptografia_aqui
WEBHOOK_URL=https://seu-dominio.com/webhook

# Configurações da API Evolution
EVOLUTION_API_KEY=sua_chave_api_aqui

# Configurações do Asaas
ASAAS_API_KEY=sua_chave_asaas_aqui
ASAAS_API_URL=https://sandbox.asaas.com/api/v3

# Configurações do JWT
JWT_SECRET=seu_segredo_jwt_aqui
EOF

# Criar arquivo README.md com instruções
echo -e "${YELLOW}Criando arquivo README.md com instruções...${NC}"
cat > README.md << 'EOF'
# Sistema SAAS para Assistência Técnica

Este repositório contém a estrutura completa para um sistema SAAS (Software as a Service) para assistências técnicas, integrando API Evolution para WhatsApp, n8n para automação, Google Calendar para agendamentos e Asaas para pagamentos.

## Estrutura de Diretórios

```
assistencia_tecnica_saas/
├── docker-compose.yml        # Configuração dos containers Docker
├── .env                      # Variáveis de ambiente
├── init-multiple-dbs.sh      # Script para inicialização de múltiplos bancos de dados
├── evolution-data/           # Dados da API Evolution
├── n8n-data/                 # Dados do n8n
├── postgres-data/            # Dados do PostgreSQL
├── frontend/                 # Arquivos do frontend
├── nginx/                    # Configurações do Nginx
│   └── conf.d/               # Arquivos de configuração do Nginx
└── certbot/                  # Certificados SSL
    ├── conf/                 # Configurações do Certbot
    └── www/                  # Arquivos para verificação do Certbot
```

## Pré-requisitos

- Docker e Docker Compose instalados
- Domínio configurado para apontar para o servidor
- Conta no Asaas para pagamentos
- Conta no Google Cloud Platform para API do Google Calendar

## Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/assistencia_tecnica_saas.git
   cd assistencia_tecnica_saas
   ```

2. Configure as variáveis de ambiente no arquivo `.env`:
   - Substitua `seu-dominio.com` pelo seu domínio
   - Configure senhas seguras para o banco de dados
   - Adicione suas chaves de API (Evolution, Asaas, etc.)

3. Inicie os containers:
   ```bash
   docker-compose up -d
   ```

4. Configure o SSL com Certbot:
   ```bash
   docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d seu-dominio.com
   ```

5. Instale o nó da API Evolution no n8n:
   ```bash
   docker exec -it n8n /bin/bash
   cd /home/node/.n8n
   npm install n8n-nodes-evolution-api
   exit
   docker restart n8n
   ```

## Configuração Inicial

1. Acesse o painel do n8n em `https://seu-dominio.com/n8n`
2. Configure as credenciais para:
   - API Evolution
   - Google Calendar
   - Asaas
   - Sistema ERP

3. Importe os fluxos de trabalho do n8n (disponíveis na pasta `workflows`)

4. Acesse o painel administrativo em `https://seu-dominio.com`

## Uso

- **Painel Administrativo**: Gerenciamento de empresas, usuários e configurações
- **n8n**: Configuração e monitoramento dos fluxos de automação
- **API Evolution**: Gerenciamento das instâncias do WhatsApp

## Suporte

Para suporte, entre em contato através do e-mail: suporte@seu-dominio.com

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
EOF

# Criar diretório para workflows do n8n
echo -e "${YELLOW}Criando diretório para workflows do n8n...${NC}"
mkdir -p workflows

# Criar exemplo de workflow para orçamento
cat > workflows/fluxo_orcamento.json << 'EOF'
{
  "name": "Fluxo de Orçamento",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "orcamento",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        250,
        300
      ]
    },
    {
      "parameters": {
        "functionCode": "// Identificar a empresa com base no parâmetro\nconst empresaId = $input.item.json.empresaId;\n\n// Simular busca da empresa no banco de dados\nreturn {\n  json: {\n    empresaId,\n    nome: `Empresa ${empresaId}`,\n    configuracoes: {\n      mensagemOrcamento: \"Olá {{CLIENTE}}, segue orçamento para seu {{APARELHO}}: R$ {{VALOR}}. Podemos prosseguir?\",\n      descontoClientesAntigos: true\n    }\n  }\n};"
      },
      "name": "Identificar Empresa",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        450,
        300
      ]
    },
    {
      "parameters": {
        "functionCode": "// Simular dados do cliente\nreturn {\n  json: {\n    id: 123,\n    nome: $input.item.json.cliente.nome || \"Cliente Teste\",\n    telefone: $input.item.json.cliente.telefone || \"5511999999999\",\n    dataRegistro: new Date(Date.now() - 200*24*60*60*1000) // Cliente registrado há 200 dias\n  }\n};"
      },
      "name": "Dados Cliente",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        650,
        200
      ]
    },
    {
      "parameters": {
        "functionCode": "// Simular dados do aparelho\nreturn {\n  json: {\n    tipo: $input.item.json.aparelho.tipo || \"celular\",\n    marca: $input.item.json.aparelho.marca || \"Samsung\",\n    modelo: $input.item.json.aparelho.modelo || \"Galaxy S21\",\n    problema: $input.item.json.aparelho.problema || \"Tela quebrada\"\n  }\n};"
      },
      "name": "Dados Aparelho",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        650,
        400
      ]
    },
    {
      "parameters": {
        "functionCode": "// Processar orçamento\nfunction processarOrcamento(empresa, cliente, aparelho) {\n  // Simular tabela de preços da empresa\n  const precos = {\n    celular: {\n      Samsung: 250,\n      Apple: 350,\n      Xiaomi: 200,\n      padrao: 180\n    },\n    tablet: {\n      Samsung: 300,\n      Apple: 400,\n      padrao: 250\n    },\n    computador: {\n      padrao: 350\n    }\n  };\n  \n  // Calcular orçamento com base nas regras da empresa\n  let valorOrcamento = 0;\n  if (aparelho.tipo === 'celular') {\n    valorOrcamento = precos.celular[aparelho.marca] || precos.celular.padrao;\n  } else if (aparelho.tipo === 'tablet') {\n    valorOrcamento = precos.tablet[aparelho.marca] || precos.tablet.padrao;\n  } else if (aparelho.tipo === 'computador') {\n    valorOrcamento = precos.computador[aparelho.marca] || precos.computador.padrao;\n  }\n  \n  // Aplicar regras específicas da empresa\n  if (empresa.configuracoes.descontoClientesAntigos && cliente.dataRegistro < new Date(Date.now() - 180*24*60*60*1000)) {\n    valorOrcamento *= 0.9; // 10% de desconto para clientes há mais de 6 meses\n  }\n  \n  return {\n    valorOrcamento,\n    mensagemOrcamento: empresa.configuracoes.mensagemOrcamento\n      .replace('{{VALOR}}', valorOrcamento.toFixed(2))\n      .replace('{{CLIENTE}}', cliente.nome)\n      .replace('{{APARELHO}}', `${aparelho.marca} ${aparelho.modelo}`)\n  };\n}\n\nreturn {json: processarOrcamento($node[\"Identificar Empresa\"].json, $node[\"Dados Cliente\"].json, $node[\"Dados Aparelho\"].json)};"
      },
      "name": "Processar Orçamento",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        850,
        300
      ]
    },
    {
      "parameters": {
        "functionCode": "// Simular envio de mensagem via API Evolution\nconst mensagem = $input.item.json.mensagemOrcamento;\nconst telefone = $node[\"Dados Cliente\"].json.telefone;\nconst empresaId = $node[\"Identificar Empresa\"].json.empresaId;\n\nconsole.log(`[Empresa ${empresaId}] Enviando mensagem para ${telefone}: ${mensagem}`);\n\nreturn {\n  json: {\n    success: true,\n    messageId: `msg_${Date.now()}`,\n    timestamp: new Date().toISOString()\n  }\n};"
      },
      "name": "Enviar Mensagem",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        1050,
        300
      ]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $node[\"Processar Orçamento\"].json }}",
        "options": {}
      },
      "name": "Responder Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        1250,
        300
      ]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Identificar Empresa",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Identificar Empresa": {
      "main": [
        [
          {
            "node": "Dados Cliente",
            "type": "main",
            "index": 0
          },
          {
            "node": "Dados Aparelho",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Dados Cliente": {
      "main": [
        [
          {
            "node": "Processar Orçamento",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Dados Aparelho": {
      "main": [
        [
          {
            "node": "Processar Orçamento",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Processar Orçamento": {
      "main": [
        [
          {
            "node": "Enviar Mensagem",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enviar Mensagem": {
      "main": [
        [
          {
            "node": "Responder Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
EOF

# Criar exemplo de workflow para agendamento
cat > workflows/fluxo_agendamento.json << 'EOF'
{
  "name": "Fluxo de Agendamento",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "agendamento",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        250,
        300
      ]
    },
    {
      "parameters": {
        "functionCode": "// Identificar a empresa com base no parâmetro\nconst empresaId = $input.item.json.empresaId;\n\n// Simular busca da empresa no banco de dados\nreturn {\n  json: {\n    empresaId,\n    nome: `Empresa ${empresaId}`,\n    google_calendar_id: `empresa${empresaId}@gmail.com`,\n    google_oauth_tokens: {\n      access_token: \"simulado_access_token\",\n      refresh_token: \"simulado_refresh_token\",\n      expiry_date: new Date(Date.now() + 3600000).toISOString()\n    },\n    configuracoes: {\n      mensagemAgendamento: \"Olá {{CLIENTE}}, seu agendamento para {{SERVICO}} foi confirmado para {{DATA}} às {{HORA}}. Aguardamos você!\",\n      horarioFuncionamentoInicio: \"09:00\",\n      horarioFuncionamentoFim: \"18:00\",\n      diasFuncionamento: \"1,2,3,4,5\" // Segunda a sexta\n    }\n  }\n};"
      },
      "name": "Identificar Empresa",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        450,
        300
      ]
    },
    {
      "parameters": {
        "functionCode": "// Simular verificação de disponibilidade no Google Calendar\nconst dataDesejada = $input.item.json.dataDesejada || new Date().toISOString().split('T')[0];\nconst empresa = $node[\"Identificar Empresa\"].json;\n\n// Simular horários disponíveis\nconst horariosDisponiveis = [\n  `${dataDesejada}T09:00:00`,\n  `${dataDesejada}T10:30:00`,\n  `${dataDesejada}T14:00:00`,\n  `${dataDesejada}T16:30:00`\n];\n\nconsole.log(`Verificando disponibilidade para empresa ${empresa.empresaId} na data ${dataDesejada}`);\n\nreturn {\n  json: {\n    dataConsulta: dataDesejada,\n    horariosDisponiveis\n  }\n};"
      },
      "name": "Verificar Disponibilidade",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        650,
        300
      ]
    },
    {
      "parameters": {
        "functionCode": "// Simular criação de evento no Google Calendar\nconst empresa = $node[\"Identificar Empresa\"].json;\nconst disponibilidade = $node[\"Verificar Disponibilidade\"].json;\n\n// Usar o primeiro horário disponível ou o horário especificado\nconst horarioEscolhido = $input.item.json.horarioEscolhido || disponibilidade.horariosDisponiveis[0];\nconst cliente = $input.item.json.cliente || { nome: \"Cliente Teste\", telefone: \"5511999999999\" };\nconst servico = $input.item.json.servico || \"Reparo de celular\";\n\nconsole.log(`Criando agendamento para empresa ${empresa.empresaId}: ${cliente.nome} - ${servico} - ${horarioEscolhido}`);\n\n// Simular criação do evento\nconst eventoId = `evento_${Date.now()}`;\nconst dataHora = new Date(horarioEscolhido);\nconst dataFormatada = dataHora.toLocaleDateString('pt-BR');\nconst horaFormatada = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });\n\n// Montar mensagem de confirmação\nconst mensagemConfirmacao = empresa.configuracoes.mensagemAgendamento\n  .replace('{{CLIENTE}}', cliente.nome)\n  .replace('{{SERVICO}}', servico)\n  .replace('{{DATA}}', dataFormatada)\n  .replace('{{HORA}}', horaFormatada);\n\nreturn {\n  json: {\n    eventoId,\n    dataHora: horarioEscolhido,\n    dataFormatada,\n    horaFormatada,\n    cliente,\n    servico,\n    mensagemConfirmacao\n  }\n};"
      },
      "name": "Criar Agendamento",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        850,
        300
      ]
    },
    {
      "parameters": {
        "functionCode": "// Simular envio de mensagem via API Evolution\nconst mensagem = $input.item.json.mensagemConfirmacao;\nconst telefone = $input.item.json.cliente.telefone;\nconst empresaId = $node[\"Identificar Empresa\"].json.empresaId;\n\nconsole.log(`[Empresa ${empresaId}] Enviando confirmação para ${telefone}: ${mensagem}`);\n\nreturn {\n  json: {\n    success: true,\n    messageId: `msg_${Date.now()}`,\n    timestamp: new Date().toISOString()\n  }\n};"
      },
      "name": "Enviar Confirmação",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        1050,
        300
      ]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $node[\"Criar Agendamento\"].json }}",
        "options": {}
      },
      "name": "Responder Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        1250,
        300
      ]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Identificar Empresa",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Identificar Empresa": {
      "main": [
        [
          {
            "node": "Verificar Disponibilidade",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Verificar Disponibilidade": {
      "main": [
        [
          {
            "node": "Criar Agendamento",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Criar Agendamento": {
      "main": [
        [
          {
            "node": "Enviar Confirmação",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enviar Confirmação": {
      "main": [
        [
          {
            "node": "Responder Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
EOF

# Criar script para instalação do nó da API Evolution no n8n
echo -e "${YELLOW}Criando script para instalação do nó da API Evolution no n8n...${NC}"
cat > install_evolution_node.sh << 'EOF'
#!/bin/bash

# Script para instalar o nó da API Evolution no n8n
echo "Instalando o nó da API Evolution no n8n..."
docker exec -it n8n /bin/bash -c "cd /home/node/.n8n && npm install n8n-nodes-evolution-api"
docker restart n8n
echo "Nó da API Evolution instalado com sucesso!"
EOF

chmod +x install_evolution_node.sh

# Criar script para iniciar todos os serviços
echo -e "${YELLOW}Criando script para iniciar todos os serviços...${NC}"
cat > start.sh << 'EOF'
#!/bin/bash

# Script para iniciar todos os serviços
echo "Iniciando todos os serviços..."
docker-compose up -d
echo "Todos os serviços iniciados!"
EOF

chmod +x start.sh

# Criar script para parar todos os serviços
echo -e "${YELLOW}Criando script para parar todos os serviços...${NC}"
cat > stop.sh << 'EOF'
#!/bin/bash

# Script para parar todos os serviços
echo "Parando todos os serviços..."
docker-compose down
echo "Todos os serviços parados!"
EOF

chmod +x stop.sh

# Criar script para backup
echo -e "${YELLOW}Criando script para backup...${NC}"
cat > backup.sh << 'EOF'
#!/bin/bash

# Script para fazer backup dos dados
BACKUP_DIR="./backups"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).tar.gz"

echo "Iniciando backup..."
mkdir -p $BACKUP_DIR

# Parar os serviços para garantir consistência
docker-compose down

# Criar backup
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    evolution-data \
    n8n-data \
    postgres-data \
    frontend \
    nginx \
    certbot \
    docker-compose.yml \
    .env \
    init-multiple-dbs.sh

# Reiniciar os serviços
docker-compose up -d

echo "Backup concluído: $BACKUP_DIR/$BACKUP_FILE"
EOF

chmod +x backup.sh

# Criar script para restauração
echo -e "${YELLOW}Criando script para restauração...${NC}"
cat > restore.sh << 'EOF'
#!/bin/bash

# Script para restaurar backup
if [ -z "$1" ]; then
    echo "Uso: ./restore.sh caminho/para/arquivo_backup.tar.gz"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "Iniciando restauração a partir de: $BACKUP_FILE"

# Parar os serviços
docker-compose down

# Fazer backup dos dados atuais antes de restaurar
CURRENT_BACKUP="backup_before_restore_$(date +%Y%m%d_%H%M%S).tar.gz"
mkdir -p ./backups
tar -czf "./backups/$CURRENT_BACKUP" \
    evolution-data \
    n8n-data \
    postgres-data \
    frontend \
    nginx \
    certbot \
    docker-compose.yml \
    .env \
    init-multiple-dbs.sh

echo "Backup dos dados atuais criado: ./backups/$CURRENT_BACKUP"

# Restaurar a partir do backup
echo "Restaurando dados..."
tar -xzf "$BACKUP_FILE"

# Reiniciar os serviços
docker-compose up -d

echo "Restauração concluída!"
EOF

chmod +x restore.sh

# Finalizar
echo -e "${GREEN}===========================================================${NC}"
echo -e "${GREEN}   Estrutura criada com sucesso!                           ${NC}"
echo -e "${GREEN}===========================================================${NC}"
echo -e "${YELLOW}Diretório do projeto: ${NC}$(pwd)"
echo -e "${YELLOW}Para iniciar os serviços, execute: ${NC}./start.sh"
echo -e "${YELLOW}Para instalar o nó da API Evolution no n8n, execute: ${NC}./install_evolution_node.sh"
echo -e "${YELLOW}Para mais informações, consulte o arquivo README.md${NC}"
echo -e "${BLUE}===========================================================${NC}"
