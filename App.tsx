import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { 
  Home, 
  Server, 
  Calendar, 
  MessageSquare, 
  CreditCard, 
  Code, 
  FileCode, 
  Download, 
  Database, 
  Settings,
  ChevronRight
} from "lucide-react";

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState("visao-geral");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 px-4 md:px-8 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Sistema SAAS para Assistência Técnica</h1>
          <p className="text-lg opacity-90">Documentação completa e guia de implementação</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 md:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8">
            <TabsTrigger value="visao-geral" className="flex items-center gap-2">
              <Home size={18} /> <span className="hidden md:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="arquitetura" className="flex items-center gap-2">
              <Server size={18} /> <span className="hidden md:inline">Arquitetura</span>
            </TabsTrigger>
            <TabsTrigger value="integracao" className="flex items-center gap-2">
              <Calendar size={18} /> <span className="hidden md:inline">Integrações</span>
            </TabsTrigger>
            <TabsTrigger value="fluxos" className="flex items-center gap-2">
              <MessageSquare size={18} /> <span className="hidden md:inline">Fluxos</span>
            </TabsTrigger>
            <TabsTrigger value="instalacao" className="flex items-center gap-2">
              <Download size={18} /> <span className="hidden md:inline">Instalação</span>
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Visão Geral do Sistema</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                O Sistema SAAS para Assistência Técnica é uma solução completa para gerenciar múltiplas assistências técnicas em um único ambiente, oferecendo automação de processos, comunicação via WhatsApp, agendamentos e gestão financeira.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Principais Funcionalidades</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="text-blue-600" size={20} />
                    <h4 className="font-medium text-blue-800">Comunicação via WhatsApp</h4>
                  </div>
                  <p className="text-sm text-gray-700">Atendimento automatizado via WhatsApp usando a API Evolution, com respostas personalizadas e fluxos inteligentes.</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-green-600" size={20} />
                    <h4 className="font-medium text-green-800">Agendamentos Inteligentes</h4>
                  </div>
                  <p className="text-sm text-gray-700">Integração com Google Calendar para gerenciar disponibilidade e agendamentos de serviços.</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="text-purple-600" size={20} />
                    <h4 className="font-medium text-purple-800">Gestão Financeira</h4>
                  </div>
                  <p className="text-sm text-gray-700">Integração com Asaas para pagamentos, cobranças recorrentes e gestão financeira completa.</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="text-amber-600" size={20} />
                    <h4 className="font-medium text-amber-800">Automação com n8n</h4>
                  </div>
                  <p className="text-sm text-gray-700">Fluxos de automação personalizáveis para orçamentos, consultas de estoque, status de OS e mais.</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Arquitetura Multiempresa</h3>
              <p className="text-gray-700 mb-4">
                O sistema foi projetado com uma arquitetura SAAS multiempresa, permitindo que múltiplas assistências técnicas utilizem a mesma infraestrutura com total isolamento de dados e configurações personalizadas.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-800 mb-2">Componentes Principais:</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>API Evolution para comunicação via WhatsApp</li>
                  <li>n8n para automação de fluxos de trabalho</li>
                  <li>Sistema ERP multiempresa para gestão</li>
                  <li>Google Calendar para agendamentos</li>
                  <li>Asaas para pagamentos e assinaturas</li>
                </ul>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setActiveTab("arquitetura")} className="flex items-center gap-2">
                  Ver Arquitetura Detalhada <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Arquitetura */}
          <TabsContent value="arquitetura" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Arquitetura do Sistema</h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-6">
                O sistema utiliza uma arquitetura baseada em containers Docker, com separação clara de responsabilidades e comunicação entre os componentes.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Diagrama da Arquitetura</h3>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 overflow-x-auto">
                <pre className="text-xs md:text-sm text-gray-800 whitespace-pre">
{`┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  API Evolution  │◄────┤      n8n        │◄────┤  Sistema ERP    │
│  (WhatsApp)     │     │  (Automação)    │     │  Multiempresa   │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Banco de Dados PostgreSQL                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         │                       │                       │
┌────────┴────────┐     ┌────────┴────────┐     ┌────────┴────────┐
│                 │     │                 │     │                 │
│ Google Calendar │     │ Asaas Payment   │     │ Frontend SAAS   │
│  (Agenda)       │     │  (Pagamentos)   │     │  (Interface)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘`}
                </pre>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Componentes do Sistema</h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Server size={18} /> Container API Evolution
                  </h4>
                  <p className="text-sm text-gray-700">
                    Responsável pela integração com WhatsApp, gerenciando múltiplas instâncias (uma para cada empresa) e permitindo o envio e recebimento de mensagens.
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Code size={18} /> Container n8n
                  </h4>
                  <p className="text-sm text-gray-700">
                    Plataforma de automação centralizada que gerencia todos os fluxos de trabalho, com webhooks específicos para cada empresa e processamento dinâmico baseado no ID da empresa.
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                    <Database size={18} /> Container Sistema ERP
                  </h4>
                  <p className="text-sm text-gray-700">
                    Sistema de gestão multiempresa que armazena dados de clientes, ordens de serviço, agendamentos e configurações específicas de cada assistência técnica.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                    <Database size={18} /> Container PostgreSQL
                  </h4>
                  <p className="text-sm text-gray-700">
                    Banco de dados compartilhado com isolamento de dados por empresa, armazenando informações do ERP e do n8n.
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                    <Settings size={18} /> Container Frontend
                  </h4>
                  <p className="text-sm text-gray-700">
                    Interface web para cadastro e gerenciamento das assistências técnicas, com painéis administrativos personalizados para cada empresa.
                  </p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Estrutura do Banco de Dados</h3>
              
              <p className="text-gray-700 mb-4">
                O banco de dados PostgreSQL utiliza um esquema multiempresa com isolamento de dados por empresa:
              </p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 overflow-x-auto">
                <ScrollArea className="h-64">
                  <pre className="text-xs md:text-sm text-gray-800 whitespace-pre">
{`-- Tabela de Empresas (Assistências Técnicas)
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco TEXT,
    logo_url TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de Configurações por Empresa
CREATE TABLE configuracoes_empresa (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    evolution_instance_id VARCHAR(255),
    google_calendar_id VARCHAR(255),
    asaas_wallet_id VARCHAR(255),
    horario_funcionamento_inicio TIME,
    horario_funcionamento_fim TIME,
    dias_funcionamento VARCHAR(20),
    mensagem_boas_vindas TEXT,
    mensagem_fora_expediente TEXT
);

-- Tabela de Assinaturas SAAS
CREATE TABLE assinaturas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    asaas_subscription_id VARCHAR(255),
    plano VARCHAR(50),
    valor DECIMAL(10,2),
    data_inicio DATE,
    data_proximo_pagamento DATE,
    status VARCHAR(50)
);

-- Tabela de Usuários por Empresa
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    permissoes JSON,
    ultimo_acesso TIMESTAMP,
    UNIQUE(empresa_id, email)
);

-- Tabela de Clientes (por empresa)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    endereco TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, telefone)
);

-- Tabela de Aparelhos
CREATE TABLE aparelhos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    tipo VARCHAR(50) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100),
    observacoes TEXT
);

-- Tabela de Ordens de Serviço
CREATE TABLE ordens_servico (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    cliente_id INTEGER REFERENCES clientes(id),
    aparelho_id INTEGER REFERENCES aparelhos(id),
    problema TEXT NOT NULL,
    diagnostico TEXT,
    status VARCHAR(50) DEFAULT 'recebido',
    valor_orcamento DECIMAL(10,2),
    valor_final DECIMAL(10,2),
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao TIMESTAMP,
    data_conclusao TIMESTAMP,
    tecnico_id INTEGER REFERENCES usuarios(id)
);

-- Tabela de Agendamentos
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    cliente_id INTEGER REFERENCES clientes(id),
    ordem_servico_id INTEGER REFERENCES ordens_servico(id),
    data_hora TIMESTAMP NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    google_event_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'agendado',
    observacoes TEXT
);

-- Tabela de Pagamentos
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    ordem_servico_id INTEGER REFERENCES ordens_servico(id),
    asaas_payment_id VARCHAR(255),
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    data_pagamento TIMESTAMP,
    link_pagamento TEXT
);`}
                  </pre>
                </ScrollArea>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setActiveTab("integracao")} className="flex items-center gap-2">
                  Ver Integrações <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Integrações */}
          <TabsContent value="integracao" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Integrações</h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-6">
                O sistema integra-se com diversas plataformas para oferecer funcionalidades completas de comunicação, agendamento e pagamento.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">API Evolution (WhatsApp)</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  A API Evolution permite a integração com o WhatsApp, com instâncias separadas para cada empresa cadastrada no sistema.
                </p>
                
                <h4 className="font-medium text-blue-800 mb-2">Exemplo de Criação de Instância:</h4>
                <div className="bg-white rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs md:text-sm text-gray-800 whitespace-pre">
{`// Exemplo de código para criar instância na API Evolution
async function criarInstanciaEvolution(empresa) {
  const evolutionApiUrl = 'http://evolution-api:8080';
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  
  // Criar instância com ID único para a empresa
  const instanceId = \`empresa_\${empresa.id}\`;
  
  const response = await $http.request({
    method: 'POST',
    url: \`\${evolutionApiUrl}/instance/create\`,
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    },
    body: {
      instanceName: instanceId,
      token: empresa.token,
      qrcode: true
    }
  });
  
  // Salvar ID da instância nas configurações da empresa
  await $http.request({
    method: 'PUT',
    url: \`http://sistema-erp:3000/api/empresas/\${empresa.id}/configuracoes\`,
    body: {
      evolution_instance_id: instanceId
    }
  });
  
  return {
    instanceId,
    status: response.data.status,
    qrcode: response.data.qrcode
  };
}`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Google Calendar</h3>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  Cada empresa configura sua própria integração OAuth com o Google Calendar para gerenciar agendamentos.
                </p>
                
                <h4 className="font-medium text-green-800 mb-2">Exemplo de Criação de Evento:</h4>
                <div className="bg-white rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs md:text-sm text-gray-800 whitespace-pre">
{`// Exemplo de código para criar evento no Google Calendar
async function criarEventoCalendario(empresa, agendamento) {
  // Carregar credenciais OAuth da empresa
  const oauthTokens = empresa.google_oauth_tokens;
  
  // Verificar se o token expirou e renovar se necessário
  if (new Date(oauthTokens.expiry_date) <= new Date()) {
    // Renovar token
    const newTokens = await renovarToken(empresa);
    oauthTokens.access_token = newTokens.access_token;
    oauthTokens.expiry_date = newTokens.expiry_date;
    
    // Salvar novos tokens
    await $http.request({
      method: 'PUT',
      url: \`http://sistema-erp:3000/api/empresas/\${empresa.id}/configuracoes\`,
      body: {
        google_oauth_tokens: oauthTokens
      }
    });
  }
  
  // Criar evento no calendário
  const response = await $http.request({
    method: 'POST',
    url: \`https://www.googleapis.com/calendar/v3/calendars/\${empresa.google_calendar_id}/events\`,
    headers: {
      'Authorization': \`Bearer \${oauthTokens.access_token}\`,
      'Content-Type': 'application/json'
    },
    body: {
      summary: \`Atendimento - \${agendamento.cliente.nome}\`,
      description: \`Serviço: \${agendamento.servico}\\nAparelho: \${agendamento.aparelho.marca} \${agendamento.aparelho.modelo}\\nProblema: \${agendamento.problema}\`,
      start: {
        dateTime: agendamento.dataHora,
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: new Date(new Date(agendamento.dataHora).getTime() + 60*60*1000).toISOString(), // +1 hora
        timeZone: 'America/Sao_Paulo'
      }
    }
  });
  
  // Salvar ID do evento no agendamento
  await $http.request({
    method: 'PUT',
    url: \`http://sistema-erp:3000/api/agendamentos/\${agendamento.id}\`,
    body: {
      google_event_id: response.data.id
    }
  });
  
  return {
    eventId: response.data.id,
    htmlLink: response.data.htmlLink
  };
}`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Asaas (Pagamentos)</h3>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  A integração com o Asaas permite gerenciar pagamentos de serviços e assinaturas SAAS.
                </p>
                
                <h4 className="font-medium text-purple-800 mb-2">Exemplo de Criação de Assinatura:</h4>
                <div className="bg-white rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs md:text-sm text-gray-800 whitespace-pre">
{`// Exemplo de integração com Asaas para criar assinatura
const createSubscription = async (empresaId, plano, valor, cliente) => {
  const asaasApiKey = process.env.ASAAS_API_KEY;
  const asaasApiUrl = process.env.ASAAS_API_URL;
  
  // Primeiro, criar ou obter o cliente no Asaas
  const customerResponse = await fetch(\`\${asaasApiUrl}/customers\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey
    },
    body: JSON.stringify({
      name: cliente.nome,
      cpfCnpj: cliente.cnpj,
      email: cliente.email,
      phone: cliente.telefone
    })
  });
  
  const customerData = await customerResponse.json();
  
  // Criar a assinatura recorrente
  const subscriptionResponse = await fetch(\`\${asaasApiUrl}/subscriptions\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey
    },
    body: JSON.stringify({
      customer: customerData.id,
      billingType: 'CREDIT_CARD', // ou outro método
      value: valor,
      nextDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
      cycle: 'MONTHLY',
      description: \`Assinatura \${plano} - Sistema de Assistência Técnica\`
    })
  });
  
  const subscriptionData = await subscriptionResponse.json();
  
  // Salvar os dados da assinatura no banco
  await db.query(
    'INSERT INTO assinaturas (empresa_id, asaas_subscription_id, plano, valor, data_inicio, data_proximo_pagamento, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [empresaId, subscriptionData.id, plano, valor, new Date(), subscriptionData.nextDueDate, subscriptionData.status]
  );
  
  return subscriptionData;
};`}
                  </pre>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setActiveTab("fluxos")} className="flex items-center gap-2">
                  Ver Fluxos de Automação <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Fluxos */}
          <TabsContent value="fluxos" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fluxos de Automação</h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-6">
                O sistema utiliza o n8n para criar fluxos de automação que atendem a todas as empresas de forma centralizada, usando parâmetros dinâmicos.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Webhook Central</h3>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  O webhook central recebe todas as requisições e identifica a empresa com base em parâmetros na URL ou no corpo da requisição:
                </p>
                
                <pre className="bg-white rounded-md p-3 text-xs md:text-sm text-gray-800 whitespace-pre overflow-x-auto">
{`[Webhook] → [Function: Identificar Empresa] → [Switch por Empresa]`}
                </pre>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Fluxo de Atendimento Dinâmico</h3>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  O sistema carrega as configurações específicas da empresa antes de processar a mensagem:
                </p>
                
                <pre className="bg-white rounded-md p-3 text-xs md:text-sm text-gray-800 whitespace-pre overflow-x-auto">
{`[Switch por Empresa] → [Carregar Configurações da Empresa] → [Switch por Tipo de Mensagem]
                                                              ├─ [Orçamento] → Fluxo de Orçamento
                                                              ├─ [Consulta de Estoque] → Fluxo de Consulta
                                                              ├─ [Status de OS] → Fluxo de Status
                                                              ├─ [Agendamento] → Fluxo de Agendamento
                                                              └─ [Outros] → Encaminhar para Atendente`}
                </pre>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Fluxo de Orçamento</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  Quando o cliente solicita um orçamento, o sistema coleta informações sobre o dispositivo, consulta o ERP e gera um orçamento personalizado:
                </p>
                
                <div className="bg-white rounded-md p-3 overflow-x-auto">
                  <pre className="text-xs md:text-sm text-gray-800 whitespace-pre">
{`// Exemplo de código no nó Function do n8n
function processarOrcamento(empresa, cliente, aparelho) {
  // Carregar configurações específicas da empresa
  const configEmpresa = items[0].json.configuracoes;
  
  // Consultar tabela de preços específica da empresa
  const precos = items[0].json.precos;
  
  // Calcular orçamento com base nas regras da empresa
  let valorOrcamento = 0;
  if (aparelho.tipo === 'celular') {
    valorOrcamento = precos.celular[aparelho.marca] || precos.celular.padrao;
  } else if (aparelho.tipo === 'tablet') {
    valorOrcamento = precos.tablet[aparelho.marca] || precos.tablet.padrao;
  } else if (aparelho.tipo === 'computador') {
    valorOrcamento = precos.computador[aparelho.marca] || precos.computador.padrao;
  }
  
  // Aplicar regras específicas da empresa
  if (configEmpresa.descontoClientesAntigos && cliente.dataRegistro < new Date(Date.now() - 180*24*60*60*1000)) {
    valorOrcamento *= 0.9; // 10% de desconto para clientes há mais de 6 meses
  }
  
  return {
    valorOrcamento,
    mensagemOrcamento: configEmpresa.mensagemOrcamento
      .replace('{{VALOR}}', valorOrcamento.toFixed(2))
      .replace('{{CLIENTE}}', cliente.nome)
      .replace('{{APARELHO}}', \`\${aparelho.marca} \${aparelho.modelo}\`)
  };
}`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Fluxo de Agendamento</h3>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  O fluxo de agendamento verifica a disponibilidade no Google Calendar, sugere horários e cria o evento após confirmação:
                </p>
                
                <pre className="bg-white rounded-md p-3 text-xs md:text-sm text-gray-800 whitespace-pre overflow-x-auto">
{`[Coleta de Informações] → [Google Calendar Query] → [Sugestão de Horários] → [Aguardar Confirmação] → [Google Calendar Create Event] → [HTTP Request para ERP] → [Evolution API Send Message]`}
                </pre>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Fluxo de Pagamento</h3>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  Integração com Asaas para pagamentos de serviços:
                </p>
                
                <pre className="bg-white rounded-md p-3 text-xs md:text-sm text-gray-800 whitespace-pre overflow-x-auto">
{`[Orçamento Aprovado] → [HTTP Request: Criar Pagamento Asaas] → [Evolution API: Enviar Link de Pagamento]`}
                </pre>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setActiveTab("instalacao")} className="flex items-center gap-2">
                  Ver Guia de Instalação <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Instalação */}
          <TabsContent value="instalacao" className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Guia de Instalação</h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-6">
                Siga este guia para instalar e configurar o sistema SAAS para assistência técnica em seu servidor.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Pré-requisitos</h3>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Docker e Docker Compose instalados</li>
                  <li>Domínio configurado para apontar para o servidor</li>
                  <li>Conta no Asaas para pagamentos</li>
                  <li>Conta no Google Cloud Platform para API do Google Calendar</li>
                </ul>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Script de Instalação Automática</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  Para facilitar a instalação, disponibilizamos um script que cria automaticamente toda a estrutura de pastas e arquivos necessários:
                </p>
                
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>Salve o script <code>setup_assistencia_tecnica_saas.sh</code> em seu servidor</li>
                  <li>Dê permissão de execução: <code>chmod +x setup_assistencia_tecnica_saas.sh</code></li>
                  <li>Execute: <code>./setup_assistencia_tecnica_saas.sh</code></li>
                </ol>
                
                <p className="text-sm text-gray-700 mt-4">
                  O script criará uma pasta chamada "assistencia_tecnica_saas" com toda a estrutura necessária.
                </p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Configuração do Docker Compose</h3>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  O arquivo docker-compose.yml criado pelo script contém a configuração de todos os containers necessários:
                </p>
                
                <ScrollArea className="h-64">
                  <pre className="bg-white rounded-md p-3 text-xs md:text-sm text-gray-800 whitespace-pre overflow-x-auto">
{`version: '3'

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
    driver: bridge`}
                  </pre>
                </ScrollArea>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Configuração das Variáveis de Ambiente</h3>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  Edite o arquivo <code>.env</code> criado pelo script para configurar as variáveis de ambiente:
                </p>
                
                <pre className="bg-white rounded-md p-3 text-xs md:text-sm text-gray-800 whitespace-pre overflow-x-auto">
{`# Configurações gerais
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
JWT_SECRET=seu_segredo_jwt_aqui`}
                </pre>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Inicialização dos Serviços</h3>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  Após configurar as variáveis de ambiente, inicie os serviços:
                </p>
                
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>Execute o script de inicialização: <code>./start.sh</code></li>
                  <li>Instale o nó da API Evolution no n8n: <code>./install_evolution_node.sh</code></li>
                  <li>Configure o SSL com Certbot: <code>docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d seu-dominio.com</code></li>
                </ol>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Links para Download</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <FileCode size={18} className="text-blue-600" /> API Evolution
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li><a href="https://github.com/EvolutionAPI/evolution-api" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Repositório Oficial</a></li>
                    <li><a href="https://doc.evolution-api.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Documentação</a></li>
                    <li><a href="https://hub.docker.com/r/evolutionapi/evolution" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Docker Hub</a></li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <FileCode size={18} className="text-green-600" /> n8n
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li><a href="https://n8n.io/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Site Oficial</a></li>
                    <li><a href="https://docs.n8n.io/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Documentação</a></li>
                    <li><a href="https://hub.docker.com/r/n8nio/n8n" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Docker Hub</a></li>
                    <li><a href="https://github.com/oriondesign2015/n8n-nodes-evolution-api" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Nó da API Evolution para n8n</a></li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <FileCode size={18} className="text-purple-600" /> Google Calendar API
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li><a href="https://developers.google.com/calendar" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Documentação</a></li>
                    <li><a href="https://console.developers.google.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Console de Desenvolvedores</a></li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <FileCode size={18} className="text-amber-600" /> Asaas API
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li><a href="https://www.asaas.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Site Oficial</a></li>
                    <li><a href="https://asaasdev.com.br/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Documentação da API</a></li>
                    <li><a href="https://sandbox.asaas.com/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Sandbox</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-8">
                <h4 className="font-medium text-blue-800 mb-2">Download do Script de Instalação</h4>
                <p className="text-sm text-gray-700">
                  Você pode baixar o script de instalação completo clicando no botão abaixo:
                </p>
                <div className="mt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download size={16} className="mr-2" /> Baixar Script de Instalação
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4 md:px-8 mt-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Sistema SAAS para Assistência Técnica</h3>
              <p className="text-gray-400 text-sm mt-1">Documentação e Guia de Implementação</p>
            </div>
            <div className="flex gap-4">
              <a href="https://github.com/EvolutionAPI/evolution-api" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                API Evolution
              </a>
              <a href="https://n8n.io/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                n8n
              </a>
              <a href="https://www.asaas.com/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                Asaas
              </a>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-4 pt-4 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Sistema SAAS para Assistência Técnica. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
