# CSV to Supabase Upload Script

Uploads Iraqi business data from CSV to Supabase `businesses` table.

## Quick Start

### Option 1: Double-click (Easiest)
1. Navigate to `scripts/` folder
2. Double-click `upload.bat`
3. Follow prompts

### Option 2: Command Line
```powershell
cd "C:\Users\HB LAPTOP STORE\Documents\GitHub\belive\scripts"
python upload_csv_to_supabase.py
```

## What It Does

1. **Flexible Column Mapping** - Automatically matches CSV headers to Supabase columns
2. **Phone Normalization** - Converts Iraqi numbers (077XXXXXXXX → +96477XXXXXXXX)
3. **Data Validation** - Skips rows without business_name or phone_1
4. **Batch Upload** - Uploads in batches of 100 records
5. **Upsert Support** - Avoids duplicates based on phone_1

## CSV Column Mapping

| Supabase Field | CSV Headers Accepted |
|----------------|---------------------|
| id | ID, id, uuid |
| business_name | Business Name, name, NAME |
| arabic_name | Arabic Name, arabic |
| english_name | English Name, english |
| category | Category, type |
| subcategory | Subcategory, sub_category |
| governorate | Governorate, province, state |
| city | City, town |
| phone_1 | Phone 1, Phone, phone, mobile |
| phone_2 | Phone 2, phone2 |
| whatsapp | WhatsApp, whatsapp_number |
| email | Email 1, Email, email, mail |
| website | Website, web, url |
| facebook | Facebook, fb |
| instagram | Instagram, ig |
| tiktok | TikTok, tik_tok |
| telegram | Telegram, tg |
| opening_hours | Opening Hours, hours |
| status | Status |
| verification_status | Verification, verification_status |
| confidence_score | Confidence, score |
| source | _source_file, source |

## Default Values

Fields not in CSV get these defaults:
- `status`: "active"
- `verification_status`: "unverified"
- `confidence_score`: 0.5
- `source`: "csv_import"

## Requirements

- Python 3.8+
- `supabase` package (auto-installed by batch file)

## Configuration

Edit `upload_csv_to_supabase.py` to change:
- `CSV_PATH` - Path to your CSV file
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your service role key
- `TARGET_TABLE` - Target table name (default: "businesses")
- `REQUIRED_FIELDS` - Minimum fields needed (default: business_name + phone_1)

## Safety Features

- ✅ Confirms before upload
- ✅ Shows sample record before uploading
- ✅ Skips rows with missing required fields
- ✅ Normalizes phone numbers to +964 format
- ✅ Validates status/verification values
- ✅ Upsert prevents duplicates
- ✅ Batch processing (100 records at a time)

## Troubleshooting

**"Python is not installed"**
→ Install Python from https://python.org

**"CSV file not found"**
→ Check the `CSV_PATH` in the script

**"Failed to connect to Supabase"**
→ Verify SUPABASE_URL and SUPABASE_SERVICE_KEY

**"No valid records to upload"**
→ Check CSV has required columns (Business Name + Phone 1)

## Expected Output

```
SUPABASE CSV UPLOADER
============================================
CSV File: C:\...\with_valid_phone.csv
Supabase: https://hsadukhmcclwixuntqwu.supabase.co
Target Table: businesses
============================================
✅ Connected to Supabase

📖 Reading CSV file...
✅ CSV Headers found: 25

🗺️  Column Mapping:
   id -> ✅ ID
   business_name -> ✅ Business Name
   arabic_name -> ✅ Arabic Name
   ...

📊 Transformation Summary:
   Total CSV rows: 4300
   Valid records: 4200
   Skipped: 100

Upload 4200 records to 'businesses'? (yes/no): 

☁️  Uploading to Supabase...
✅ Batch 1/42: Uploaded 100 records
✅ Batch 2/42: Uploaded 100 records
...

UPLOAD COMPLETE
============================================
Total processed: 4200
Successfully uploaded: 4200
Failed: 0
```

---

# Data Migration Scripts

## 1. Supabase Cross-Project Migration (`migrate-supabase.ts`)

Migrates businesses from old Supabase project to new project's contacts table with phone normalization.

### Usage
```bash
npm run migrate
```

### Environment Variables (`.env`)
```env
OLD_SUPABASE_URL=https://hsadukhmcclwixuntqwu.supabase.co
OLD_SERVICE_ROLE_KEY=your_key_here
NEW_SUPABASE_URL=https://ujdsxzvvgaugypwtugdl.supabase.co
NEW_SERVICE_ROLE_KEY=your_key_here
```

### Features
- Batch processing (100 records at a time)
- Phone normalization (07... → +9647...)
- Upsert to prevent duplicates
- Arabic text preservation

---

## 2. Shaku Maku Post Generator (`generate-shakumaku-posts.ts`)

Generates 50 AI-powered social media posts for the Shaku Maku feed.

### Usage
```bash
npm run generate:posts
```

### Environment Variables (`.env`)
```env
SUPABASE_URL=https://hsadukhmcclwixuntqwu.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### What It Does
1. Selects 50 diverse businesses (restaurants, cafes, salons, etc.)
2. Generates Arabic captions using Gemini AI
3. Assigns category-appropriate Unsplash images
4. Inserts into `posts` table

### Post Structure
- **Arabic Caption**: AI-generated with "زاوية الشاكو ماكو" hook
- **Image**: High-quality stock photo by category
- **Featured**: First 5 posts marked as featured
- **Metadata**: category, governorate, business_id preserved

### Prerequisites
Run this SQL first (in Supabase SQL Editor):
```sql
-- Located at: supabase/009_migration_helpers.sql
```

---

## Script Dependencies

All TypeScript scripts require:
```bash
npm install @google/generative-ai @supabase/supabase-js dotenv tsx
```

(Already included in project dependencies)

---

## Security Notes

⚠️ **Service Role Keys** have full database access - keep them secure!
- Never commit `.env` files
- Use `.env.example` for documentation only
- Rotate keys if accidentally exposed
