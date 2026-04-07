/**
 * POST /api/messages/queue
 * 
 * Fetches matching businesses and creates queued message records.
 * Used by the "Queue Messages" or "Create & Queue" button.
 * 
 * Request body:
 * {
 *   campaign_id: string;
 *   message_template: string;
 *   governorate_filter?: string | null;
 *   category_filter?: string | null;
 *   is_testing_mode?: boolean;
 *   limit?: number;
 * }
 * 
 * Response:
 * { success: true, queued: number, total_matching: number }
 * { success: false, error: string }
 */

import { supabaseAdmin } from '../lib/supabaseAdmin';
import { formatIraqiPhoneNumber } from '../lib/nabda';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
      message_template,
      governorate_filter,
      category_filter,
      is_testing_mode = false,
      limit = is_testing_mode ? 20 : 10000,
    } = req.body;

    // Validation
    if (!campaign_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campaign ID is required' 
      });
    }

    if (!message_template?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message template is required' 
      });
    }

    console.log('[messages/queue] Queuing for campaign:', campaign_id);
    console.log('[messages/queue] Filters:', { governorate_filter, category_filter, limit });

    // Build query for businesses
    let query = supabaseAdmin
      .from('businesses')
      .select('id, business_name, phone_1, phone_2, whatsapp, governorate, category', { count: 'exact' })
      .eq('status', 'active')
      .or('phone_1.not.is.null,whatsapp.not.is.null');

    if (governorate_filter) {
      query = query.eq('governorate', governorate_filter);
    }

    if (category_filter) {
      query = query.eq('category', category_filter);
    }

    const { data: businesses, error: fetchError, count: totalMatching } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fetchError) {
      console.error('[messages/queue] Fetch error:', fetchError);
      return res.status(500).json({ 
        success: false, 
        error: `Failed to fetch businesses: ${fetchError.message}` 
      });
    }

    if (!businesses || businesses.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No businesses found matching the selected filters',
      });
    }

    // Filter to only businesses with valid phone numbers
    const validBusinesses = businesses.filter(b => {
      const phone = b.whatsapp || b.phone_1 || b.phone_2;
      return phone && formatIraqiPhoneNumber(phone);
    });

    if (validBusinesses.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No businesses with valid phone numbers found',
      });
    }

    // Prepare message records
    const messages = validBusinesses.map(b => {
      // Phone priority: whatsapp > phone_1 > phone_2
      const rawPhone = b.whatsapp || b.phone_1 || b.phone_2 || '';
      const phone = formatIraqiPhoneNumber(rawPhone);

      return {
        campaign_id: campaign_id,
        business_id: b.id,
        phone: phone,
        message_body: message_template.trim(),
        status: 'pending' as const,
        channel: 'whatsapp' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    // Insert messages in batches to avoid payload limits
    const batchSize = 500;
    let totalQueued = 0;

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('messages')
        .insert(batch)
        .select();

      if (insertError) {
        console.error('[messages/queue] Insert error:', insertError);
        return res.status(500).json({
          success: false,
          error: `Failed to queue messages: ${insertError.message}`,
        });
      }

      totalQueued += inserted?.length || 0;
    }

    // Update campaign status
    const { error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'active',
        total_recipients: totalQueued,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaign_id);

    if (updateError) {
      console.error('[messages/queue] Campaign update error:', updateError);
      // Non-fatal, continue
    }

    console.log(`[messages/queue] Queued ${totalQueued} messages for campaign ${campaign_id}`);

    return res.status(200).json({
      success: true,
      queued: totalQueued,
      total_matching: totalMatching || validBusinesses.length,
      campaign_id,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[messages/queue] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
}
