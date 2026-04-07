/**
 * Nabda WhatsApp API Service
 * 
 * Handles all WhatsApp message sending via Nabda API.
 * Phone numbers are normalized to Iraqi format (964XXXXXXXXXX).
 * 
 * Required env vars:
 * - NABDA_API_KEY: API key from Nabda
 * - NABDA_BASE_URL: API base URL (default: https://api.nabdaotp.com)
 * - NABDA_SENDER_ID: Your registered sender ID/phone number with Nabda
 */

const NABDA_API_KEY = process.env.NABDA_API_KEY || '';
const NABDA_BASE_URL = process.env.NABDA_BASE_URL || 'https://api.nabdaotp.com';
const NABDA_SENDER_ID = process.env.NABDA_SENDER_ID || '';

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Normalize Iraqi phone numbers to standard format
 * - Removes spaces, dashes, and other non-digit characters
 * - Ensures country code 964 is present
 * - Handles numbers starting with 0 (replaces with 964)
 * - Removes duplicate + signs
 */
export function formatIraqiPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Step 1: Remove all non-digit characters except the leading +
  let formatted = phone.trim();
  
  // Remove spaces, dashes, parentheses
  formatted = formatted.replace(/[\s\-\(\)]/g, '');
  
  // Handle duplicate + signs
  if (formatted.startsWith('++')) {
    formatted = formatted.replace(/^\++/, '+');
  }
  
  // Step 2: Extract just digits, preserving any leading +
  const hasPlus = formatted.startsWith('+');
  let digits = formatted.replace(/\D/g, '');
  
  // Step 3: Normalize to 964XXXXXXXXXX format
  if (digits.startsWith('00')) {
    // Remove leading 00 (international dial prefix)
    digits = digits.slice(2);
  }
  
  if (digits.startsWith('0') && digits.length === 11) {
    // Iraqi mobile starting with 07XX XXX XXXX -> 9647XX XXX XXXX
    digits = '964' + digits.slice(1);
  } else if (!digits.startsWith('964')) {
    // Add 964 prefix if missing
    digits = '964' + digits;
  }
  
  // Step 4: Validate length (Iraqi numbers should be 12-13 digits with 964)
  if (digits.length < 12 || digits.length > 13) {
    console.warn(`[nabda] Warning: Phone number ${phone} normalized to ${digits} has unusual length: ${digits.length}`);
  }
  
  return hasPlus ? '+' + digits : digits;
}

/**
 * Send a WhatsApp message via Nabda API
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  options?: { priority?: 'high' | 'normal' | 'low' }
): Promise<SendMessageResult> {
  const formattedPhone = formatIraqiPhoneNumber(to);
  
  if (!formattedPhone) {
    return { success: false, error: 'Invalid phone number' };
  }

  if (!NABDA_API_KEY) {
    console.error('[nabda] NABDA_API_KEY not configured');
    return { success: false, error: 'Nabda API not configured' };
  }

  const payload = {
    to: formattedPhone,
    message: message,
    sender_id: NABDA_SENDER_ID || undefined,
    priority: options?.priority || 'normal',
  };

  console.log(`[nabda] Sending to ${formattedPhone}...`);

  try {
    const response = await fetch(`${NABDA_BASE_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NABDA_API_KEY}`,
        'X-API-Key': NABDA_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[nabda] HTTP ${response.status}: ${errorText}`);
      return { 
        success: false, 
        error: `Nabda API error (${response.status}): ${errorText}` 
      };
    }

    const data = await response.json();
    
    // Nabda may return different response structures
    // Common patterns: { message_id: string } or { id: string } or { success: true }
    const messageId = data.message_id || data.id || data.msg_id || `nabda-${Date.now()}`;
    
    console.log(`[nabda] ✓ Sent, ID: ${messageId}`);
    
    return { 
      success: true, 
      messageId 
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[nabda] ✗ Failed: ${errorMessage}`);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Send a batch of messages with rate limiting
 * Default: ~15 messages per minute (4000ms delay)
 */
export async function sendBatchMessages(
  messages: Array<{ phone: string; message: string; id: string }>,
  onProgress?: (sent: number, failed: number, total: number) => void,
  delayMs: number = 4000
): Promise<{ sent: number; failed: number; results: Map<string, SendMessageResult> }> {
  const results = new Map<string, SendMessageResult>();
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < messages.length; i++) {
    const { phone, message, id } = messages[i];
    
    const result = await sendWhatsAppMessage(phone, message);
    results.set(id, result);
    
    if (result.success) {
      sent++;
    } else {
      failed++;
    }

    onProgress?.(sent, failed, messages.length);

    // Rate limiting delay (skip for last message)
    if (i < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { sent, failed, results };
}
