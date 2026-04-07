# CRM Messaging System Setup

## Environment Variables

Add these to your `.env` file (for local development) and to your Supabase project secrets (for Edge Functions):

### Frontend (.env)
```
# Existing variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# No new frontend env vars needed - using existing Supabase client
```

### Supabase Secrets (for Edge Functions)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WhatsApp Business API (Meta)
WHATSAPP_API_TOKEN=your-whatsapp-api-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# Telegram Bot (optional channel)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

Set secrets using Supabase CLI:
```bash
supabase secrets set WHATSAPP_API_TOKEN=your-token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=your-id
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
```

## Database Migration

Run the SQL migration to create tables:

```bash
# Using Supabase CLI
supabase db push

# Or run via Supabase Dashboard SQL Editor
# Copy contents of supabase/006_crm_messaging.sql
```

## Deploy Edge Functions

```bash
# Deploy the webhook handler
supabase functions deploy webhook-handler

# Get the webhook URL
supabase functions list
# URL will be: https://your-project.supabase.co/functions/v1/webhook-handler
```

## Configure WhatsApp Webhook

1. Go to Meta Developer Dashboard
2. WhatsApp > Configuration
3. Webhook URL: `https://your-project.supabase.co/functions/v1/webhook-handler`
4. Verify Token: Set to match WHATSAPP_WEBHOOK_VERIFY_TOKEN
5. Subscribe to events:
   - `messages` (incoming replies)
   - `message_statuses` (delivery updates)

## Testing End-to-End

### 1. Create a Campaign
```typescript
import { messagingService } from '@/services/messaging';

const campaign = await messagingService.createCampaign({
  name: 'Test Campaign',
  description: 'Testing WhatsApp integration',
  status: 'draft',
  channel: 'whatsapp',
  message_template: 'Hello {{name}}, check out our new offers!'
});
```

### 2. Send a Message
```typescript
// Send single message
const message = await messagingService.sendMessage({
  business_id: 'biz_123', // Must exist in businesses table
  phone: '+9647XXXXXXXX',
  message_body: 'Hello! Check out our offers.',
  campaign_id: campaign.id,
  channel: 'whatsapp'
});
```

### 3. Simulate a Reply (Development Only)
```typescript
// For testing without real WhatsApp
await messagingService.simulateReply(
  'biz_123',     // business_id
  '+9647XXXXXXXX', // phone
  'Yes, I am interested!' // reply text
);
```

### 4. Mark as Converted
```typescript
await messagingService.markAsConverted({
  conversation_id: 'conv-uuid',
  converted_value: 150.00,
  notes: 'Customer purchased package A'
});
```

### 5. Check Stats
```typescript
// Get campaign performance
const stats = await messagingService.getCampaignStats(campaign.id);
console.log(stats);
// {
//   messages_sent: 100,
//   delivered: 95,
//   replied: 20,
//   converted: 5,
//   conversion_rate: 5.00
// }

// Get conversations
const conversations = await messagingService.getConversations({
  replied: true,
  limit: 10
});
```

## Database Schema

### campaigns
- Stores campaign metadata
- Tracks aggregate stats (sent, delivered, replied, converted counts)

### messages
- Each outbound message creates a row
- Status progression: pending → sent → delivered → replied/converted
- Tracks external_message_id from WhatsApp/Telegram

### conversations
- One row per business+phone combination (unique constraint)
- Tracks reply state and conversion state
- Links to last_outbound_message_id

## Key Design Decisions

1. **business_id is TEXT**: Matches existing businesses.id type, no FK constraint enforced at DB level
2. **No hard foreign keys**: Application validates business existence before inserts
3. **Status progression**: Messages move forward through status states, webhook updates drive this
4. **Campaign stats**: Both stored on campaign row and calculated via view for accuracy
5. **Idempotent webhooks**: Same webhook can be processed multiple times safely

## Webhook Flow

1. WhatsApp sends message status update (sent/delivered/failed)
2. Edge Function finds message by external_message_id
3. Updates status and timestamps
4. Recalculates campaign stats via RPC

Reply Flow:
1. Customer replies to WhatsApp message
2. Webhook receives incoming message event
3. Edge Function finds matching outbound message by phone
4. Updates outbound message status to 'replied'
5. Upserts conversation record
6. Recalculates campaign stats
