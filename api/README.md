# Messaging Backend API

Serverless API endpoints for the Belive CRM messaging system. Built for Vercel serverless functions.

## Architecture

This backend provides secure API endpoints for:
- **Campaign Creation** - Create and manage WhatsApp campaigns
- **Message Queuing** - Fetch matching businesses from Supabase and queue messages
- **Message Sending** - Send via Nabda WhatsApp API with rate limiting

Secrets (NABDA_API_KEY, SUPABASE_SERVICE_ROLE_KEY) are kept server-side only.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/campaigns/create` | POST | Create a new campaign |
| `/api/messages/queue` | POST | Queue messages for a campaign |
| `/api/messages/send` | POST | Send queued messages via Nabda |

### POST /api/campaigns/create

Create a new campaign with filters.

**Request Body:**
```json
{
  "name": "Summer Promotion",
  "message_template": "Hi! Check out our new offers...",
  "governorate_filter": "Baghdad",
  "category_filter": "restaurant",
  "is_testing_mode": true
}
```

**Response:**
```json
{
  "success": true,
  "campaign": { "id": "uuid", "name": "...", ... },
  "filters": { "governorate_filter": "...", ... }
}
```

### POST /api/messages/queue

Fetch matching businesses and create pending message records.

**Request Body:**
```json
{
  "campaign_id": "uuid",
  "message_template": "Hi! Check out our new offers...",
  "governorate_filter": "Baghdad",
  "category_filter": "restaurant",
  "is_testing_mode": true
}
```

**Response:**
```json
{
  "success": true,
  "queued": 20,
  "total_matching": 150,
  "campaign_id": "uuid"
}
```

### POST /api/messages/send

Send queued messages via Nabda WhatsApp API with rate limiting (~15/min).

**Request Body:**
```json
{
  "campaign_id": "uuid",
  "batch_size": 20,
  "delay_ms": 4000
}
```

**Response:**
```json
{
  "success": true,
  "processed": 20,
  "sent": 18,
  "failed": 2,
  "results": [
    { "message_id": "uuid", "status": "sent", "provider_message_id": "..." },
    { "message_id": "uuid", "status": "failed", "error": "..." }
  ]
}
```

## Environment Variables

### Frontend (Vite)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=              # Empty for same-origin
```

### Backend (Vercel/Supabase Secrets)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NABDA_API_KEY=your_nabda_key
NABDA_BASE_URL=https://api.nabdaotp.com
NABDA_SENDER_ID=your_sender_id
```

## Local Development

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Link to your project
```bash
vercel link
```

### 3. Pull environment variables
```bash
vercel env pull
```

### 4. Start dev server
```bash
vercel dev
```

This will start both the Vite frontend and the API server on the same port (typically 3000).

## Phone Number Formatting

The backend automatically normalizes Iraqi phone numbers:

- Removes spaces, dashes, and non-digit characters
- Strips leading `0` and replaces with `964` country code
- Handles numbers already starting with `964`
- Result format: `964XXXXXXXXXX` (12-13 digits)

Examples:
- `0771 234 5678` → `9647712345678`
- `+964 771 234 5678` → `9647712345678`
- `009647712345678` → `9647712345678`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set environment variables in Project Settings
4. Deploy

Vercel automatically routes `/api/*` to the serverless functions.

### Manual

```bash
vercel --prod
```

## Testing

### Test with one number first

1. Create a campaign with testing mode ON
2. Target a specific governorate with few businesses (5-10)
3. Click "Create & Queue Messages"
4. Click "Start Sending"
5. Check console logs for Nabda API response

### Verify database state

```sql
-- Check queued messages
SELECT * FROM messages WHERE status = 'pending';

-- Check campaign stats
SELECT * FROM campaign_stats WHERE id = 'your-campaign-id';

-- Check conversations
SELECT * FROM conversations ORDER BY updated_at DESC;
```

## Security Notes

- **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend
- **NEVER** expose `NABDA_API_KEY` to the frontend
- The backend API runs server-side only
- Frontend uses anonymous Supabase key for public reads
- All writes and external API calls go through backend

## Database Schema

See `supabase/006_crm_messaging.sql` for full schema.

Key tables:
- `campaigns` - Campaign metadata and stats
- `messages` - Individual messages with status
- `conversations` - Thread tracking per business

## Rate Limiting

Default: 4000ms delay between messages = ~15 messages/minute

Adjust via `delay_ms` parameter in `/api/messages/send` request.
