# Requisitos para Sistema SAAS de Assistência Técnica com Django Multitenancy

## Visão Geral

Este documento define os requisitos para um sistema SAAS (Software as a Service) de assistência técnica desenvolvido em Django, com arquitetura híbrida que mantém a API Evolution e n8n em Docker. O sistema permitirá que múltiplas assistências técnicas utilizem a mesma plataforma, com isolamento de dados e configurações personalizadas.

## Requisitos de Multitenancy

### 1. Isolamento de Dados

- **Modelo de Tenant**: Implementar modelo de tenant para representar cada assistência técnica
- **Isolamento por Tenant**: Garantir que os dados de uma assistência não sejam acessíveis por outras
- **Middleware de Tenant**: Identificar o tenant atual com base no subdomínio ou URL
- **Filtros Automáticos**: Aplicar filtros automáticos em todas as consultas para limitar ao tenant atual

### 2. Autenticação e Autorização

- **Hierarquia de Usuários**:
  - Super Admin (acesso a todas as assistências)
  - Admin de Assistência (acesso apenas à sua assistência)
  - Técnicos (acesso limitado dentro da assistência)
  - Clientes (acesso apenas aos seus próprios dados)
  
- **Permissões Granulares**:
  - Gerenciamento de assistências (Super Admin)
  - Configurações da assistência (Admin)
  - Gerenciamento de usuários (Admin)
  - Gerenciamento de ordens de serviço (Admin, Técnicos)
  - Consulta de status (Todos os níveis)

### 3. Personalização por Tenant

- **Configurações Específicas**:
  - Logo e identidade visual
  - Horários de funcionamento
  - Mensagens automáticas
  - Preços e serviços oferecidos
  
- **Integrações Personalizadas**:
  - Credenciais da API Evolution
  - Configurações do Google Calendar
  - Credenciais do Asaas

## Requisitos Funcionais

### 1. Gestão de Assistências Técnicas (Super Admin)

- Cadastro de novas assistências técnicas
- Gerenciamento de planos e assinaturas
- Monitoramento de uso e métricas
- Suporte e atendimento às assistências

### 2. Gestão de Clientes e Aparelhos (Admin/Técnicos)

- Cadastro de clientes
- Registro de aparelhos por cliente
- Histórico de serviços por aparelho
- Busca e filtros avançados

### 3. Ordens de Serviço

- Criação e edição de OS
- Fluxo de status (recebido, em análise, orçamento, aprovado, em reparo, concluído)
- Atribuição a técnicos
- Registro de peças e serviços
- Cálculo automático de valores
- Geração de orçamentos em PDF

### 4. Agendamentos

- Visualização de agenda
- Criação de compromissos
- Verificação de disponibilidade
- Notificações e lembretes

### 5. Financeiro

- Geração de cobranças
- Acompanhamento de pagamentos
- Relatórios financeiros
- Integração com Asaas

### 6. Comunicação

- Envio de mensagens via WhatsApp (API Evolution)
- Notificações automáticas de status
- Lembretes de agendamentos
- Envio de orçamentos e links de pagamento

## Requisitos de Integração

### 1. API Evolution (Docker)

- **Autenticação**: Gerenciamento de credenciais por assistência
- **Instâncias**: Criação e gerenciamento de instâncias por assistência
- **Comunicação**: Envio e recebimento de mensagens
- **Webhooks**: Configuração de webhooks para recebimento de eventos

### 2. n8n (Docker)

- **Fluxos de Trabalho**: Criação e gerenciamento de fluxos por assistência
- **Webhooks**: Configuração de endpoints para integração
- **Credenciais**: Gerenciamento seguro de credenciais de integração
- **Execução**: Monitoramento de execuções e tratamento de erros

### 3. Google Calendar

- **OAuth**: Configuração de OAuth por assistência
- **Eventos**: Criação e gerenciamento de eventos
- **Disponibilidade**: Verificação de horários disponíveis
- **Notificações**: Configuração de notificações de eventos

### 4. Asaas

- **Pagamentos**: Geração de cobranças e links de pagamento
- **Assinaturas**: Gerenciamento de assinaturas recorrentes
- **Webhooks**: Recebimento de notificações de pagamento
- **Relatórios**: Geração de relatórios financeiros

## Requisitos Técnicos

### 1. Arquitetura Django

- **Django 4.2+**: Utilizar versão mais recente e estável
- **Django REST Framework**: Para APIs RESTful
- **Celery**: Para tarefas assíncronas e agendadas
- **Channels**: Para comunicação em tempo real (opcional)

### 2. Banco de Dados

- **PostgreSQL**: Banco de dados principal
- **Schema por Tenant**: Isolamento de dados por schema do PostgreSQL
- **Migrações**: Gerenciamento de migrações por tenant

### 3. Comunicação com Docker

- **API REST**: Comunicação com containers via API REST
- **Webhooks**: Configuração de webhooks para eventos
- **Autenticação**: Tokens JWT para autenticação segura

### 4. Frontend

- **Templates Django**: Para painel administrativo
- **Framework JS**: React ou Vue.js para interfaces mais complexas
- **Responsividade**: Design adaptável para diferentes dispositivos

### 5. Segurança

- **Autenticação**: JWT, OAuth2
- **Autorização**: Permissões granulares
- **Proteção de Dados**: Criptografia de dados sensíveis
- **HTTPS**: Comunicação segura

### 6. Monitoramento e Logs

- **Logging**: Registro de atividades e erros
- **Monitoramento**: Métricas de uso e desempenho
- **Alertas**: Notificações de problemas

## Requisitos de Implantação

### 1. Ambiente de Desenvolvimento

- **Docker Compose**: Para serviços externos (API Evolution, n8n)
- **Virtualenv**: Para ambiente Python isolado
- **Scripts**: Automação de tarefas comuns

### 2. Ambiente de Produção

- **Gunicorn/uWSGI**: Servidor WSGI
- **Nginx**: Servidor web e proxy reverso
- **Docker**: Para serviços externos
- **Redis**: Para cache e filas
- **Backup**: Rotinas de backup automático

### 3. CI/CD

- **Testes Automatizados**: Unitários e de integração
- **Pipeline**: Integração e entrega contínuas
- **Versionamento**: Controle de versão com Git

## Requisitos de Escalabilidade

- **Balanceamento de Carga**: Distribuição de requisições
- **Cache**: Estratégias de cache para melhorar desempenho
- **Banco de Dados**: Otimização de consultas e índices
- **Filas**: Processamento assíncrono de tarefas pesadas
