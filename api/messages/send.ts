/**
 * POST /api/messages/send
 * 
 * Sends queued messages via Nabda WhatsApp API.
 * Used by the "Start Sending" button.
 * 
 * Request body:
 * {
 *   campaign_id?: string;  // Send all pending for this campaign
 *   message_ids?: string[]; // Or send specific messages
 *   batch_size?: number;   // Max messages to send (default: 20)
 *   delay_ms?: number;      // Delay between sends (default: 4000ms = ~15/min)
 * }
 * 
 * Response:
 * { 
 *   success: true, 
 *   processed: number,
 *   sent: number, 
 *   failed: number,
 *   results: Array<{ message_id: string, status: 'sent'|'failed', error?: string }>
 * }
 * { success: false, error: string }
 */

import { supabaseAdmin } from '../lib/supabaseAdmin';
import { sendWhatsAppMessage, formatIraqiPhoneNumber } from '../lib/nabda';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SendResult {
  message_id: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string;
  provider_message_id?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      campaign_id,
      message_ids,
      batch_size = 20,
      delay_ms = 4000,
    } = req.body;

    // Fetch pending messages to send
    let query = supabaseAdmin
      .from('messages')
      .select('*')
      .eq('status', 'pending')
      .eq('channel', 'whatsapp')
      .order('created_at', { ascending: true })
      .limit(Math.min(batch_size, 100)); // Hard limit for safety

    if (campaign_id) {
      query = query.eq('campaign_id', campaign_id);
    }

    if (message_ids && message_ids.length > 0) {
      query = query.in('id', message_ids.slice(0, 100));
    }

    const { data: pendingMessages, error: fetchError } = await query;

    if (fetchError) {
      console.error('[messages/send] Fetch error:', fetchError);
      return res.status(500).json({
        success: false,
        error: `Failed to fetch pending messages: ${fetchError.message}`,
      });
    }

    if (!pendingMessages || pendingMessages.length === 0) {
      return res.status(200).json({
        success: true,
        processed: 0,
        sent: 0,
        failed: 0,
        results: [],
        message: 'No pending messages found',
      });
    }

    console.log(`[messages/send] Sending ${pendingMessages.length} messages...`);

    const results: SendResult[] = [];
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    // Process messages sequentially with rate limiting
    for (let i = 0; i < pendingMessages.length; i++) {
      const message = pendingMessages[i];

      // Validate phone number
      const formattedPhone = formatIraqiPhoneNumber(message.phone);
      if (!formattedPhone) {
        const error = 'Invalid phone number';
        
        await supabaseAdmin
          .from('messages')
          .update({
            status: 'failed',
            error_message: error,
            updated_at: new Date().toISOString(),
          })
          .eq('id', message.id);

        results.push({ message_id: message.id, status: 'skipped', error });
        skipped++;
        continue;
      }

      // Send via Nabda
      const nabdaResult = await sendWhatsAppMessage(
        formattedPhone,
        message.message_body
      );

      if (nabdaResult.success) {
        // Mark as sent
        const { error: updateError } = await supabaseAdmin
          .from('messages')
          .update({
            status: 'sent',
            external_message_id: nabdaResult.messageId,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', message.id);

        if (updateError) {
          console.error('[messages/send] Update error:', updateError);
        }

        // Update or create conversation
        await updateConversation(message.business_id, formattedPhone, message.id, message.message_body);

        results.push({
          message_id: message.id,
          status: 'sent',
          provider_message_id: nabdaResult.messageId,
        });
        sent++;
      } else {
        // Mark as failed
        const { error: updateError } = await supabaseAdmin
          .from('messages')
          .update({
            status: 'failed',
            error_message: nabdaResult.error || 'Unknown error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', message.id);

        if (updateError) {
          console.error('[messages/send] Update error:', updateError);
        }

        results.push({
          message_id: message.id,
          status: 'failed',
          error: nabdaResult.error,
        });
        failed++;
      }

      // Rate limiting delay (skip for last message)
      if (i < pendingMessages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay_ms));
      }
    }

    // Update campaign stats if campaign_id provided
    if (campaign_id) {
      try {
        await supabaseAdmin.rpc('update_campaign_stats', {
          p_campaign_id: campaign_id,
        });
      } catch (e) {
        console.error('[messages/send] Failed to update campaign stats:', e);
      }
    }

    console.log(`[messages/send] Complete: ${sent} sent, ${failed} failed, ${skipped} skipped`);

    return res.status(200).json({
      success: true,
      processed: pendingMessages.length,
      sent,
      failed,
      skipped,
      results,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[messages/send] Error:', error);
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

/**
 * Update or create a conversation record for tracking
 */
async function updateConversation(
  businessId: string,
  phone: string,
  messageId: string,
  messageBody: string
): Promise<void> {
  try {
    // Check for existing conversation
    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('message_count')
      .eq('business_id', businessId)
      .eq('phone', phone)
      .maybeSingle();

    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('conversations')
      .upsert({
        business_id: businessId,
        phone: phone,
        last_message: messageBody,
        last_message_at: now,
        last_outbound_message_id: messageId,
        message_count: (existing?.message_count || 0) + 1,
        updated_at: now,
      }, {
        onConflict: 'business_id,phone',
      });

    if (error) {
      console.error('[messages/send] Conversation upsert error:', error);
    }
  } catch (e) {
    console.error('[messages/send] Conversation error:', e);
  }
}
