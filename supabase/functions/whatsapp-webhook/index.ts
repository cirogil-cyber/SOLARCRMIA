import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configurações do WhatsApp Cloud API
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')
const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN')

// Configurações do Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  const url = new URL(req.url)

  // 1. Verificação do Webhook (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // 2. Recebimento de Mensagens (POST)
  if (req.method === 'POST') {
    try {
      const body = await req.json()

      // Verifica se é um evento de mensagem do WhatsApp
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.value && change.value.messages) {
              const message = change.value.messages[0]
              const contact = change.value.contacts[0]
              
              const phone = contact.wa_id
              const name = contact.profile.name
              const text = message.text?.body || ''
              
              // Lógica de Integração com o CRM
              
              // 1. Buscar ou Criar Lead
              let { data: lead } = await supabase
                .from('leads')
                .select('*')
                .eq('phone', phone)
                .single()

              if (!lead) {
                const { data: newLead } = await supabase
                  .from('leads')
                  .insert({
                    name: name,
                    phone: phone,
                    source: 'WhatsApp',
                    fase_crm: 'new',
                    ai_handled: true // IA atende por padrão
                  })
                  .select()
                  .single()
                lead = newLead
              }

              // 2. Salvar a mensagem recebida
              await supabase
                .from('interacoes_chat')
                .insert({
                  lead_id: lead.id,
                  role: 'user',
                  text: text,
                  // audio_url: ... (lógica para baixar áudio do WhatsApp se message.type === 'audio')
                })

              // 3. Se a IA estiver ativa para este lead, gerar resposta
              if (lead.ai_handled) {
                // Aqui chamaria a API do Gemini (ou uma função separada) para gerar a resposta
                // e depois enviaria de volta via WhatsApp Cloud API
                
                /* Exemplo de envio:
                await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: phone,
                    text: { body: "Resposta da IA..." }
                  })
                })
                */
              }
            }
          }
        }
      }
      return new Response('OK', { status: 200 })
    } catch (error) {
      console.error('Erro no webhook:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
})
