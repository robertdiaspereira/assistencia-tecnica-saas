# Fluxo de Automação para Assistência Técnica com Docker

Este documento descreve um fluxo de trabalho automatizado usando containers Docker para gerenciar o atendimento ao cliente de uma assistência técnica, integrando a API Evolution para comunicação via WhatsApp, um Sistema ERP e o n8n para automação, além do Google Calendar para agendamentos.

## Arquitetura do Sistema

O sistema será composto por três containers Docker principais:

1. **Container API Evolution**: Responsável pela integração com WhatsApp
2. **Container Sistema ERP**: Sistema de gestão da assistência técnica
3. **Container n8n**: Plataforma de automação que integrará todos os sistemas

## Funcionalidades do Fluxo

O fluxo automatizado incluirá as seguintes funcionalidades:
- Orçamentos
- Consulta de estoque
- Atualização de status de OS (Ordem de Serviço)
- Lembretes automáticos
- Agendamentos via Google Calendar

## Configuração dos Containers Docker

### Docker Compose

Abaixo está um exemplo de arquivo `docker-compose.yml` para configurar todos os containers necessários:

```yaml
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

  # Container do Sistema ERP (exemplo genérico - ajuste conforme seu ERP específico)
  sistema-erp:
    image: seu-sistema-erp:latest  # Substitua pela imagem do seu ERP
    container_name: sistema-erp
    restart: always
    ports:
      - "3000:3000"  # Ajuste conforme necessário
    environment:
      - DATABASE_URL=postgres://usuario:senha@db:5432/erp_db
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
    volumes:
      - ./n8n-data:/home/node/.n8n
    depends_on:
      - db
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

networks:
  assistencia-network:
    driver: bridge
```

### Script para Inicialização de Múltiplos Bancos de Dados

Crie um arquivo `init-multiple-dbs.sh` com o seguinte conteúdo:

```bash
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
```

Não esqueça de dar permissão de execução ao script:
```bash
chmod +x init-multiple-dbs.sh
```

## Instalação do Nó da API Evolution no n8n

Para integrar a API Evolution com o n8n, é necessário instalar o pacote de nós da API Evolution no n8n:

1. Acesse o container do n8n:
```bash
docker exec -it n8n /bin/bash
```

2. Instale o pacote de nós da API Evolution:
```bash
cd /home/node/.n8n
npm install n8n-nodes-evolution-api
```

3. Reinicie o container do n8n:
```bash
docker restart n8n
```

## Fluxo de Automação no n8n

### 1. Gatilho: Nova Mensagem no WhatsApp via API Evolution

O fluxo começa quando uma nova mensagem é recebida no WhatsApp através da API Evolution:

1. Configure um webhook na API Evolution para notificar o n8n quando uma nova mensagem for recebida.
2. No n8n, crie um novo fluxo de trabalho com um nó "Webhook" como gatilho.

### 2. Análise da Mensagem e Identificação da Intenção

Após receber a mensagem, o n8n analisa o conteúdo para identificar a intenção do cliente:

```
[Webhook] → [Switch]
                ├─ [Orçamento] → Fluxo de Orçamento
                ├─ [Consulta de Estoque] → Fluxo de Consulta
                ├─ [Status de OS] → Fluxo de Status
                ├─ [Agendamento] → Fluxo de Agendamento
                └─ [Outros] → Encaminhar para Atendente
```

### 3. Fluxo de Orçamento

Quando o cliente solicita um orçamento:

1. O n8n coleta informações sobre o dispositivo (tipo, marca, modelo, problema).
2. Consulta o Sistema ERP para verificar valores de peças e serviços.
3. Gera um orçamento preliminar.
4. Envia o orçamento para o cliente via WhatsApp (API Evolution).

```
[Coleta de Informações] → [HTTP Request para ERP] → [Processamento de Dados] → [Evolution API Send Message]
```

### 4. Fluxo de Consulta de Estoque

Quando o cliente pergunta sobre disponibilidade de peças:

1. O n8n identifica a peça mencionada na mensagem.
2. Consulta o Sistema ERP para verificar disponibilidade no estoque.
3. Retorna a informação para o cliente via WhatsApp.

```
[Identificação da Peça] → [HTTP Request para ERP] → [Formatação da Resposta] → [Evolution API Send Message]
```

### 5. Fluxo de Status de OS

Quando o cliente solicita atualização sobre sua ordem de serviço:

1. O n8n identifica o número da OS ou o telefone do cliente.
2. Consulta o Sistema ERP para obter o status atual.
3. Envia a atualização para o cliente via WhatsApp.

```
[Identificação da OS] → [HTTP Request para ERP] → [Formatação da Resposta] → [Evolution API Send Message]
```

### 6. Fluxo de Agendamento

Quando o cliente deseja agendar um serviço:

1. O n8n coleta informações sobre o serviço e preferências de data/horário.
2. Consulta o Google Calendar para verificar disponibilidade.
3. Sugere horários disponíveis para o cliente.
4. Após confirmação, cria o evento no Google Calendar.
5. Registra o agendamento no Sistema ERP.
6. Envia confirmação para o cliente via WhatsApp.

```
[Coleta de Informações] → [Google Calendar Query] → [Sugestão de Horários] → [Aguardar Confirmação] → [Google Calendar Create Event] → [HTTP Request para ERP] → [Evolution API Send Message]
```

### 7. Fluxo de Lembretes Automáticos

Para enviar lembretes de agendamentos:

1. O n8n consulta o Google Calendar diariamente para verificar agendamentos do dia seguinte.
2. Para cada agendamento, envia um lembrete para o cliente via WhatsApp.

```
[Schedule Trigger (Diário)] → [Google Calendar Query] → [Loop] → [Evolution API Send Message]
```

## Configuração das Integrações

### 1. Integração API Evolution com n8n

1. No painel do n8n, adicione uma nova credencial para a API Evolution:
   - Nome: Evolution API
   - URL da API: http://evolution-api:8080
   - Chave API: sua_chave_api_aqui

2. Teste a conexão para garantir que está funcionando corretamente.

### 2. Integração Sistema ERP com n8n

1. No painel do n8n, adicione uma nova credencial HTTP:
   - Nome: Sistema ERP
   - URL Base: http://sistema-erp:3000/api
   - Autenticação: Basic Auth ou Bearer Token (conforme seu ERP)
   - Usuário/Token: suas_credenciais_aqui

2. Teste a conexão para garantir que está funcionando corretamente.

### 3. Integração Google Calendar com n8n

1. No painel do n8n, adicione uma nova credencial OAuth2:
   - Nome: Google Calendar
   - Tipo de Credencial: Google OAuth2 API
   - Siga o processo de autenticação OAuth2 com sua conta Google.

2. Teste a conexão para garantir que está funcionando corretamente.

## Links para Download e Documentação

### API Evolution
- Repositório Oficial: [https://github.com/EvolutionAPI/evolution-api](https://github.com/EvolutionAPI/evolution-api)
- Documentação: [https://doc.evolution-api.com/](https://doc.evolution-api.com/)
- Docker Hub: [https://hub.docker.com/r/evolutionapi/evolution](https://hub.docker.com/r/evolutionapi/evolution)

### n8n
- Site Oficial: [https://n8n.io/](https://n8n.io/)
- Documentação: [https://docs.n8n.io/](https://docs.n8n.io/)
- Docker Hub: [https://hub.docker.com/r/n8nio/n8n](https://hub.docker.com/r/n8nio/n8n)
- Nó da API Evolution para n8n: [https://github.com/oriondesign2015/n8n-nodes-evolution-api](https://github.com/oriondesign2015/n8n-nodes-evolution-api)

### Google Calendar API
- Documentação: [https://developers.google.com/calendar](https://developers.google.com/calendar)
- Console de Desenvolvedores: [https://console.developers.google.com/](https://console.developers.google.com/)

### Docker e Docker Compose
- Docker: [https://www.docker.com/get-started](https://www.docker.com/get-started)
- Docker Compose: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

## Considerações Finais

Este fluxo de automação pode ser expandido e personalizado conforme as necessidades específicas da sua assistência técnica. Algumas possíveis melhorias incluem:

- Integração com sistemas de pagamento para cobranças automáticas
- Pesquisas de satisfação após a conclusão do serviço
- Análise de dados para identificar tendências e melhorar o atendimento
- Integração com chatbots baseados em IA para respostas mais inteligentes

Lembre-se de sempre manter suas credenciais seguras e considerar o uso de variáveis de ambiente ou um gerenciador de segredos para armazenar senhas e tokens de API.
