## Fluxo de Automação para Assistência Técnica com n8n, Whaticket e Agenda

Este documento descreve um fluxo de trabalho automatizado usando n8n para gerenciar o atendimento ao cliente de uma assistência técnica, integrando o Whaticket para comunicação via WhatsApp e uma ferramenta de agenda (como o Google Agenda) para agendamentos.

**Objetivo:** Automatizar o processo desde o contato inicial do cliente até o agendamento do serviço, otimizando o tempo da equipe e melhorando a experiência do cliente.

**Ferramentas Envolvidas:**

*   **n8n:** Plataforma de automação de fluxo de trabalho (o "cérebro" da automação).
*   **Whaticket:** Plataforma de atendimento multiagente para WhatsApp (canal de comunicação com o cliente).
*   **Google Agenda (ou similar):** Ferramenta de calendário para verificar disponibilidade e registrar agendamentos.

**Etapas do Fluxo no n8n:**

1.  **Gatilho (Trigger): Nova Mensagem no Whaticket**
    *   O fluxo é iniciado sempre que uma nova mensagem de um cliente chega no Whaticket.
    *   Utiliza-se o Webhook do Whaticket ou o nó específico (se disponível/configurado) para receber a notificação no n8n.

2.  **Análise Inicial da Mensagem:**
    *   O n8n recebe o conteúdo da mensagem e o contato do cliente.
    *   Pode-se usar nós de lógica (IF, Switch) ou até mesmo integração com IA (como OpenAI) para interpretar a intenção do cliente:
        *   **Consulta Simples:** Se for uma pergunta sobre horário de funcionamento, endereço, etc., o n8n busca a informação (de um Google Sheets, banco de dados ou texto fixo) e envia a resposta via Whaticket.
        *   **Pedido de Reparo/Agendamento:** Se a mensagem indicar a necessidade de um serviço (ex: "celular quebrou", "preciso consertar", "agendar horário"), o fluxo prossegue para a coleta de informações.
        *   **Outros Assuntos:** Mensagens não identificadas podem ser encaminhadas para um atendente humano no Whaticket.

3.  **Coleta de Informações (Interação via Whaticket):**
    *   Se for um pedido de reparo, o n8n envia mensagens automáticas via Whaticket para coletar detalhes essenciais:
        *   "Qual o tipo de aparelho (celular, tablet, computador)?"
        *   "Qual a marca e modelo?"
        *   "Poderia descrever o problema, por favor?"
        *   "Qual sua preferência de data e horário para trazer o aparelho? (Manhã/Tarde)"
    *   O n8n aguarda as respostas do cliente para cada pergunta.

4.  **Verificação de Disponibilidade na Agenda:**
    *   Com as informações coletadas (especialmente a preferência de data/horário), o n8n utiliza o nó do Google Agenda para:
        *   Verificar os horários livres na agenda da assistência técnica que correspondam à preferência do cliente.
        *   Se não houver horário na preferência, busca os próximos horários disponíveis.

5.  **Proposta de Agendamento (Interação via Whaticket):**
    *   O n8n envia uma mensagem ao cliente via Whaticket com as opções de horários disponíveis encontradas.
    *   Ex: "Temos disponibilidade nos seguintes horários: [Lista de Horários]. Qual prefere?"
    *   O n8n aguarda a confirmação do cliente.

6.  **Confirmação e Criação do Evento na Agenda:**
    *   Após o cliente escolher e confirmar um horário:
        *   O n8n utiliza o nó do Google Agenda para criar um novo evento.
        *   O evento deve conter as informações: Nome do cliente, contato, tipo de aparelho, problema descrito, data e hora agendada.

7.  **Mensagem de Confirmação Final (Via Whaticket):**
    *   O n8n envia uma mensagem final de confirmação para o cliente via Whaticket:
        *   "Agendamento confirmado para [Data] às [Hora]. Por favor, traga o [Aparelho] e, se possível, [informações adicionais, como carregador]. Nosso endereço é [Endereço]."

8.  **Notificação Interna (Opcional):**
    *   O n8n pode enviar uma notificação para a equipe técnica (via Slack, Email, Telegram, etc.) sobre o novo agendamento, incluindo os detalhes.

**Links para as Ferramentas:**

*   **n8n:**
    *   Site Oficial: https://n8n.io/
    *   Opções de Instalação (Cloud ou Auto-hospedado): https://docs.n8n.io/choose-n8n/
    *   Documentação: https://docs.n8n.io/
    *   GitHub (Código Fonte): https://github.com/n8n-io/n8n
*   **Whaticket:**
    *   Site Oficial: https://whaticket.com/pt/
    *   Login na Plataforma: https://app.whaticket.com/
    *   Versão Comunitária (Código Fonte - pode diferir da versão SaaS): https://github.com/canove/whaticket-community
*   **Google Agenda:**
    *   Acesso Web: https://calendar.google.com/
    *   Documentação da Integração com n8n: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/

**Observações:**

*   Este é um fluxo base. Ele pode ser adaptado e expandido com mais funcionalidades, como envio de lembretes automáticos antes do horário agendado, pesquisa de satisfação pós-serviço, integração com sistemas de CRM, etc.
*   A complexidade da etapa de "Análise Inicial da Mensagem" pode variar. Para interações mais complexas, pode ser interessante integrar o n8n com plataformas de chatbot como Dialogflow ou Typebot (conforme visto nas pesquisas).
*   A configuração dos Webhooks e APIs entre Whaticket, n8n e Google Agenda é crucial para o funcionamento do fluxo.
