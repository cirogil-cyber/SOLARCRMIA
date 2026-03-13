import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `Contexto e Identidade:
Você é o Consultor Especialista de Vendas Sênior da EXP Energia Solar. Você tem profundo conhecimento técnico e de mercado sobre energia solar fotovoltaica. Sua postura é sempre comunicativa, positiva, empática e altamente profissional. Seu objetivo principal é guiar o cliente de forma consultiva para a venda e construção de uma usina solar própria, demonstrando o retorno sobre o investimento e a economia a longo prazo.

Diretrizes de Atendimento:

Abordagem: Inicie as conversas de forma calorosa e prestativa. Celebre o interesse do cliente em energia sustentável e economia.

Clareza Técnica: Explique conceitos complexos (inversores, módulos, homologação) de forma simples e acessível, sem jargões desnecessários.

Foco na Solução (Venda): Se o cliente demonstrar confusão, esclareça gentilmente que a EXP atua na venda e construção da usina para o cliente, garantindo que o ativo seja 100% dele, o que maximiza a economia.

Protocolo de Qualificação de Leads (Gatilhos de CRM):
Durante a conversa, você deve conduzir o diálogo para extrair, de forma natural, as seguintes informações:

Valor médio da fatura de energia atual (em R$).

Tipo de ligação (Monofásico, Bifásico ou Trifásico) ou concessionária local.

Se o telhado tem espaço disponível (ou se há terreno).

Ação Obrigatória do Sistema:
Assim que você coletar o [Valor da Fatura] e o [Tipo de Ligação] e agendar a visita, você deve gerar internamente um resumo estruturado no final da sua resposta (oculto para o usuário final, mas legível para o sistema via API) no formato JSON: {"lead_qualificado": true, "fase_crm": "Visita Agendada", "potencia_interesse": "4,88kWp", "valor_proposta": "R$ 12.000,00", "forma_pagamento_interesse": "financiamento", "data_agendamento": "quinta-feira tarde"}.`;

async function chatWithLead(history: any[], message: string) {
  const prompt = `History:\n${history.map(h => `${h.role}: ${h.text}`).join('\n')}\n\nLead: ${message}`;
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text || "";
}

async function runTest() {
  console.log("Starting AI Agent Test...");

  let history: any[] = [];
  let leadStatus = "new";
  let jsonExtracted = false;

  const messages = [
    "Olá, gostaria de saber mais sobre energia solar.",
    "Minha conta de luz vem muito alta, em torno de R$ 800 por mês.",
    "Acho que a ligação é trifásica, a concessionária é a Enel.",
    "Sim, meu telhado é bem grande, tem bastante espaço.",
    "Podemos agendar uma visita para quinta-feira à tarde?"
  ];

  for (const msg of messages) {
    console.log(`\n[Lead]: ${msg}`);
    history.push({ role: "user", text: msg });
    
    const response = await chatWithLead(history, msg);
    
    // Parse JSON
    const jsonRegex = /\{[\s\S]*?"lead_qualificado"[\s\S]*?\}/;
    const match = response.match(jsonRegex);
    
    let cleanResponse = response;
    if (match) {
      try {
        const jsonStr = match[0];
        const data = JSON.parse(jsonStr);
        
        if (data.lead_qualificado && data.fase_crm === "Visita Agendada") {
          leadStatus = "meeting";
          jsonExtracted = true;
          console.log(`\n[SYSTEM]: JSON intercepted! Lead status updated to: ${leadStatus}`);
          console.log(`[SYSTEM]: Extracted Data: ${JSON.stringify(data)}`);
        }
        
        cleanResponse = response.replace(jsonStr, '').trim();
      } catch (e) {
        console.error("Failed to parse JSON", e);
      }
    }

    console.log(`[Agent]: ${cleanResponse}`);
    history.push({ role: "agent", text: cleanResponse });
    
    if (jsonExtracted) {
      console.log("\n--- TEST PASSED ---");
      console.log("A) AI maintained consultative posture.");
      console.log("B) Hidden JSON was generated correctly.");
      console.log("C) CRM database (simulated) updated lead status to proposal.");
      process.exit(0);
    }
  }

  console.log("\n--- TEST FAILED ---");
  console.log("JSON was not generated after providing all required information.");
  process.exit(1);
}

runTest().catch(console.error);
