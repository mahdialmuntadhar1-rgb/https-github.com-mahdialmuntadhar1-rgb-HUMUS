/**
 * POST /api/campaigns/create
 * 
 * Creates a new campaign with filters and message template.
 * Used by the Campaign Builder "Create" button.
 * 
 * Request body:
 * {
 *   name: string;
 *   message_template: string;
 *   governorate_filter?: string | null;
 *   category_filter?: string | null;
 *   is_testing_mode?: boolean;
 * }
 * 
 * Response:
 * { success: true, campaign: Campaign }
 * { success: false, error: string }
 */

import { supabaseAdmin } from '../lib/supabaseAdmin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

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
      name,
      message_template,
      governorate_filter,
      category_filter,
      is_testing_mode = false,
    } = req.body;

    // Validation
    if (!name?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campaign name is required' 
      });
    }

    if (!message_template?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message template is required' 
      });
    }

    // Create campaign
    const { data: campaign, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        name: name.trim(),
        description: null,
        message_template: message_template.trim(),
        status: 'draft',
        channel: 'whatsapp',
        total_recipients: 0,
        sent_count: 0,
        delivered_count: 0,
        replied_count: 0,
        converted_count: 0,
        failed_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[campaigns/create] Supabase error:', error);
      return res.status(500).json({ 
        success: false, 
        error: `Database error: ${error.message}` 
      });
    }

    console.log('[campaigns/create] Created campaign:', campaign.id);

    return res.status(200).json({
      success: true,
      campaign,
      filters: {
        governorate_filter,
        category_filter,
        is_testing_mode,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[campaigns/create] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
}
