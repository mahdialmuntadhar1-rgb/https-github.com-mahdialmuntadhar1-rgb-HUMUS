// Supabase Edge Function: Webhook handler for incoming WhatsApp/Telegram replies
// Deploy with: supabase functions deploy webhook-handler

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WebhookPayload {
  // WhatsApp Business API format (simplified)
  object?: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
        contacts?: Array<{
          wa_id: string;
          profile?: { name: string };
        }>;
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
        }>;
      };
    }>;
  }>;
  // Generic webhook format (for Telegram or custom)
  message?: {
    chat?: { id: number };
    from?: { id: number; first_name?: string; last_name?: string };
    text?: string;
    date?: number;
  };
  callback_query?: any;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get webhook payload
    const payload: WebhookPayload = await req.json()
    console.log('Webhook received:', JSON.stringify(payload, null, 2))

    // Handle WhatsApp message status updates (delivered, read, failed)
    if (payload.entry?.[0]?.changes?.[0]?.value?.statuses) {
      const statuses = payload.entry[0].changes[0].value.statuses
      for (const status of statuses) {
        await handleStatusUpdate(supabase, status)
      }
    }

    // Handle incoming messages (replies from customers)
    if (payload.entry?.[0]?.changes?.[0]?.value?.messages) {
      const messages = payload.entry[0].changes[0].value.messages
      const contacts = payload.entry[0].changes[0].value.contacts || []
      
      for (const message of messages) {
        const contact = contacts.find(c => c.wa_id === message.from)
        await handleIncomingMessage(supabase, message, contact)
      }
    }

    // Handle Telegram messages (alternative channel)
    if (payload.message?.chat?.id) {
      await handleTelegramMessage(supabase, payload)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Handle WhatsApp message status updates
async function handleStatusUpdate(
  supabase: any, 
  status: { id: string; status: string; timestamp: string; recipient_id: string }
) {
  const { id: externalId, status: msgStatus, timestamp } = status
  
  // Find message by external ID
  const { data: message, error: findError } = await supabase
    .from('messages')
    .select('id, campaign_id, business_id, status')
    .eq('external_message_id', externalId)
    .single()

  if (findError || !message) {
    console.error('Message not found for status update:', externalId)
    return
  }

  // Map WhatsApp status to our status
  let newStatus: string
  const timestampDate = new Date(parseInt(timestamp) * 1000).toISOString()
  
  switch (msgStatus) {
    case 'sent':
      newStatus = 'sent'
      break
    case 'delivered':
      newStatus = 'delivered'
      break
    case 'read':
      // If already replied or converted, don't downgrade
      if (message.status === 'replied' || message.status === 'converted') {
        newStatus = message.status
      } else {
        newStatus = 'delivered'
      }
      break
    case 'failed':
      newStatus = 'failed'
      break
    default:
      return
  }

  // Only update if status is advancing
  const statusOrder = ['pending', 'sent', 'delivered', 'replied', 'converted', 'failed']
  const currentIndex = statusOrder.indexOf(message.status)
  const newIndex = statusOrder.indexOf(newStatus)
  
  if (newIndex > currentIndex || newStatus === 'failed') {
    const updateData: any = { status: newStatus }
    
    if (newStatus === 'sent') updateData.sent_at = timestampDate
    if (newStatus === 'delivered') updateData.delivered_at = timestampDate
    
    const { error: updateError } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', message.id)

    if (updateError) {
      console.error('Failed to update message status:', updateError)
      return
    }

    // Update campaign stats if message has campaign
    if (message.campaign_id) {
      await supabase.rpc('update_campaign_stats', { p_campaign_id: message.campaign_id })
    }

    console.log(`Message ${message.id} status updated: ${message.status} -> ${newStatus}`)
  }
}

// Handle incoming customer replies
async function handleIncomingMessage(
  supabase: any,
  message: { from: string; id: string; timestamp: string; text?: { body: string }; type: string },
  contact?: { wa_id: string; profile?: { name: string } }
) {
  const phone = message.from
  const messageBody = message.text?.body || ''
  const timestamp = new Date(parseInt(message.timestamp) * 1000).toISOString()

  // Find the most recent outbound message to this phone number
  const { data: outboundMessage, error: findError } = await supabase
    .from('messages')
    .select('id, business_id, campaign_id')
    .eq('phone', phone)
    .in('status', ['sent', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (findError || !outboundMessage) {
    console.log('No matching outbound message found for reply from:', phone)
    // Still create/update conversation for tracking
  }

  const businessId = outboundMessage?.business_id

  // Update the outbound message status to 'replied'
  if (outboundMessage) {
    const { error: msgUpdateError } = await supabase
      .from('messages')
      .update({ 
        status: 'replied',
        replied_at: timestamp
      })
      .eq('id', outboundMessage.id)

    if (msgUpdateError) {
      console.error('Failed to update message to replied status:', msgUpdateError)
    } else {
      // Update campaign stats
      if (outboundMessage.campaign_id) {
        await supabase.rpc('update_campaign_stats', { p_campaign_id: outboundMessage.campaign_id })
      }
    }
  }

  // Upsert conversation record
  if (businessId) {
    const { error: convError } = await supabase
      .from('conversations')
      .upsert({
        business_id: businessId,
        phone: phone,
        last_message: messageBody,
        last_message_at: timestamp,
        last_outbound_message_id: outboundMessage?.id,
        replied: true,
        message_count: supabase.rpc('increment_message_count', { row_id: businessId, phone_num: phone }),
        updated_at: timestamp
      }, {
        onConflict: 'business_id,phone'
      })

    if (convError) {
      console.error('Failed to upsert conversation:', convError)
    } else {
      console.log('Conversation updated for business:', businessId, 'phone:', phone)
    }
  }
}

// Handle Telegram messages
async function handleTelegramMessage(supabase: any, payload: WebhookPayload) {
  if (!payload.message) return

  const chatId = payload.message.chat?.id?.toString()
  const text = payload.message.text || ''
  const from = payload.message.from
  const phone = from?.id?.toString() || chatId || 'unknown'
  const timestamp = payload.message.date 
    ? new Date(payload.message.date * 1000).toISOString() 
    : new Date().toISOString()

  // Similar logic to WhatsApp - find outbound message and update
  const { data: outboundMessage, error: findError } = await supabase
    .from('messages')
    .select('id, business_id, campaign_id')
    .eq('phone', phone)
    .eq('channel', 'telegram')
    .in('status', ['sent', 'delivered'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (outboundMessage) {
    // Update message status
    await supabase
      .from('messages')
      .update({ status: 'replied', replied_at: timestamp })
      .eq('id', outboundMessage.id)

    // Update conversation
    await supabase
      .from('conversations')
      .upsert({
        business_id: outboundMessage.business_id,
        phone: phone,
        last_message: text,
        last_message_at: timestamp,
        last_outbound_message_id: outboundMessage.id,
        replied: true,
        updated_at: timestamp
      }, { onConflict: 'business_id,phone' })

    // Update campaign stats
    if (outboundMessage.campaign_id) {
      await supabase.rpc('update_campaign_stats', { p_campaign_id: outboundMessage.campaign_id })
    }
  }
}
