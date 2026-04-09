"""
Flexible CSV to Supabase Upload Script (HTTP/REST API Version)
Uploads businesses from CSV to Supabase using direct HTTP requests
"""

import csv
import json
import os
import sys
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

# Try to use requests, fall back to urllib if not available
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    import urllib.request
    import urllib.error

# Supabase configuration
SUPABASE_URL = "https://hsadukhmcclwixuntqwu.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY"

# CSV file path
CSV_PATH = r"C:\Users\HB LAPTOP STORE\Documents\FOR-CLEANING-ALL\analysis_output\with_valid_phone.csv"

# Target table
TARGET_TABLE = "businesses"

# Column mapping: CSV Header -> Supabase Column
# Based on ACTUAL schema from Supabase
COLUMN_MAPPING = {
    "id": ["ID", "id", "uuid", "UUID"],
    "name": ["Business Name", "business_name", "name", "Name", "BUSINESS_NAME"],
    "nameAr": ["Arabic Name", "arabic_name", "ARABIC_NAME", "arabic"],
    "category": ["Category", "category", "CATEGORY", "type", "Type"],
    "subcategory": ["Subcategory", "subcategory", "SUBCATEGORY", "sub_category"],
    "governorate": ["Governorate", "governorate", "GOVERNORATE", "province", "Province", "state", "State"],
    "city": ["City", "city", "CITY", "town", "Town"],
    "address": ["Neighborhood", "neighborhood", "NEIGHBORHOOD", "area", "Area", "district", "District", "address", "Address"],
    "phone": ["Phone 1", "Phone1", "phone_1", "PHONE_1", "phone", "Phone", "PHONE", "mobile", "Mobile"],
    "whatsapp": ["WhatsApp", "whatsapp", "WHATSAPP", "whatsapp_number", "WhatsApp Number"],
    "website": ["Website", "website", "WEBSITE", "web", "Web", "url", "URL"],
    "openHours": ["Opening Hours", "opening_hours", "OPENING_HOURS", "hours", "Hours", "business_hours", "openhours"],
    "status": ["Status", "status", "STATUS"],
    "verification_status": ["Verification", "verification", "VERIFICATION", "verification_status", "Verification Status"],
    "confidence_score": ["Confidence", "confidence", "CONFIDENCE", "confidence_score", "score", "Score"],
    "source_name": ["_source_file", "source", "SOURCE", "Source", "data_source"],
}

DEFAULT_VALUES = {
    "status": "approved",
    "verification_status": "pending",
    "confidence_score": 0.5,
    "source_name": "csv_import",
}

REQUIRED_FIELDS = ["name", "phone"]


def find_column_mapping(csv_headers: List[str]) -> Dict[str, Optional[str]]:
    """Map CSV headers to Supabase columns using flexible matching."""
    mapping = {}
    csv_headers_lower = {h.lower().strip(): h for h in csv_headers}
    
    for supabase_col, possible_names in COLUMN_MAPPING.items():
        found = None
        for name in possible_names:
            if name in csv_headers:
                found = name
                break
            if name.lower() in csv_headers_lower:
                found = csv_headers_lower[name.lower()]
                break
        mapping[supabase_col] = found
    
    return mapping


def clean_phone_number(phone: str) -> Optional[str]:
    """Clean and normalize Iraqi phone number"""
    if not phone:
        return None
    
    cleaned = ''.join(c for c in str(phone) if c.isdigit())
    
    if not cleaned:
        return None
    
    # Iraqi numbers: convert 07XXXXXXXX to +9647XXXXXXXX
    if cleaned.startswith('0') and len(cleaned) == 11:
        return '+964' + cleaned[1:]
    
    if cleaned.startswith('964') and not cleaned.startswith('+964'):
        return '+' + cleaned
    
    if cleaned.startswith('+964'):
        return cleaned
    
    if len(cleaned) == 10 and cleaned.startswith('7'):
        return '+964' + cleaned
    
    return cleaned if len(cleaned) >= 7 else None


def extract_location_from_address(address: str) -> tuple:
    """Extract governorate and city from address string like 'Street X, City, Governorate'"""
    if not address:
        return None, None
    
    parts = [p.strip() for p in address.split(',')]
    
    # Last part is usually governorate
    governorate = parts[-1] if len(parts) >= 1 else None
    # Second to last is usually city
    city = parts[-2] if len(parts) >= 2 else None
    
    return city, governorate


def transform_row(row: Dict[str, str], mapping: Dict[str, Optional[str]]) -> Optional[Dict[str, Any]]:
    """Transform a CSV row to Supabase format."""
    result = {}
    
    for supabase_col, csv_header in mapping.items():
        if csv_header and csv_header in row:
            value = row[csv_header].strip() if row[csv_header] else None
            result[supabase_col] = value if value else None
        else:
            result[supabase_col] = None
    
    # Extract location from address if governorate/city missing
    if not result.get('governorate') or not result.get('city'):
        # Try to extract from neighborhood/address field
        address = row.get('Neighborhood') or row.get('Address')
        if address:
            city, governorate = extract_location_from_address(address)
            if not result.get('city') and city:
                result['city'] = city
            if not result.get('governorate') and governorate:
                result['governorate'] = governorate
    
    for field, default in DEFAULT_VALUES.items():
        if not result.get(field):
            result[field] = default
    
    # Generate a proper UUID if ID is missing or invalid (not a valid UUID format)
    import re
    id_val = result.get('id', '')
    # UUID pattern: 8-4-4-4-12 hex digits
    uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
    if not id_val or not uuid_pattern.match(str(id_val)):
        result['id'] = str(uuid.uuid4())
    
    # Clean phone numbers
    if result.get("phone"):
        result["phone"] = clean_phone_number(result["phone"])
    if result.get("whatsapp"):
        result["whatsapp"] = clean_phone_number(result["whatsapp"])
    
    # STRICT validation: skip if missing required fields
    missing = []
    for field in REQUIRED_FIELDS:
        if not result.get(field):
            missing.append(field)
    
    if missing:
        return None
    
    if result.get("confidence_score"):
        try:
            result["confidence_score"] = float(result["confidence_score"])
        except (ValueError, TypeError):
            result["confidence_score"] = DEFAULT_VALUES["confidence_score"]
    
    valid_statuses = ["active", "closed", "suspended", "pending", "approved"]
    if result.get("status") not in valid_statuses:
        result["status"] = DEFAULT_VALUES["status"]
    
    # Normalize category - only valid value in DB is "cafe" and "general"
    # Map common categories to valid ones or use "general" as fallback
    category_mapping = {
        'cafe': 'cafe',
        'restaurant': 'cafe',
        'food': 'cafe',
        'coffee': 'cafe',
        'shop': 'general',
        'retail': 'general',
        'store': 'general',
        'healthcare': 'general',
        'health': 'general',
        'pharmacy': 'general',
        'hospital': 'general',
        'school': 'general',
        'education': 'general',
        'hotel': 'general',
        'fuel': 'general',
        'gas': 'general',
        'bank': 'general',
        'furniture': 'general',
        'clothes': 'general',
        'electronics': 'general',
        'supermarket': 'general',
        'gym': 'general',
        'bus_station': 'general',
        'mosque': 'general',
        'general': 'general',
    }
    
    raw_category = result.get("category", "").lower().strip()
    # Try to match or use first word
    matched = False
    for key, val in category_mapping.items():
        if key in raw_category or raw_category in key:
            result["category"] = val
            matched = True
            break
    
    if not matched:
        result["category"] = "general"
    
    # Also clear subcategory if it has invalid values (set to null to be safe)
    result["subcategory"] = None
    
    valid_verifications = ["unverified", "pending", "verified", "rejected"]
    if result.get("verification_status") not in valid_verifications:
        result["verification_status"] = DEFAULT_VALUES["verification_status"]
    
    # Whitelist based on ACTUAL Supabase schema
    ALLOWED_FIELDS = [
        'id', 'name', 'nameAr', 'category', 'subcategory',
        'governorate', 'city', 'address', 'phone', 'whatsapp', 'website',
        'openHours', 'status', 'verification_status', 
        'confidence_score', 'source_name'
    ]
    
    # Remove any fields not in whitelist
    for field in list(result.keys()):
        if field not in ALLOWED_FIELDS:
            del result[field]
    
    return result


def upload_batch_requests(batch: List[Dict], batch_num: int, total_batches: int) -> bool:
    """Upload a batch using requests library"""
    url = f"{SUPABASE_URL}/rest/v1/{TARGET_TABLE}"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    try:
        response = requests.post(url, headers=headers, json=batch, timeout=30)
        
        if response.status_code in [200, 201]:
            print(f"✅ Batch {batch_num}/{total_batches}: Uploaded {len(batch)} records")
            return True
        else:
            print(f"❌ Batch {batch_num}/{total_batches} failed: HTTP {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Batch {batch_num}/{total_batches} error: {e}")
        return False


def upload_batch_urllib(batch: List[Dict], batch_num: int, total_batches: int) -> bool:
    """Upload a batch using urllib (fallback)"""
    url = f"{SUPABASE_URL}/rest/v1/{TARGET_TABLE}"
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    try:
        data = json.dumps(batch).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status in [200, 201]:
                print(f"✅ Batch {batch_num}/{total_batches}: Uploaded {len(batch)} records")
                return True
            else:
                print(f"❌ Batch {batch_num}/{total_batches} failed: HTTP {response.status}")
                return False
                
    except urllib.error.HTTPError as e:
        print(f"❌ Batch {batch_num}/{total_batches} failed: HTTP {e.code}")
        print(f"   {e.read().decode()[:200]}")
        return False
    except Exception as e:
        print(f"❌ Batch {batch_num}/{total_batches} error: {e}")
        return False


def upload_to_supabase(records: List[Dict[str, Any]], batch_size: int = 100) -> Dict[str, Any]:
    """Upload records to Supabase in batches"""
    stats = {
        "total": len(records),
        "success": 0,
        "failed": 0,
        "errors": []
    }
    
    upload_func = upload_batch_requests if HAS_REQUESTS else upload_batch_urllib
    total_batches = (len(records) + batch_size - 1) // batch_size
    
    print(f"\n☁️  Uploading {len(records)} records in {total_batches} batches...")
    print(f"   Using: {'requests library' if HAS_REQUESTS else 'urllib (fallback)'}")
    print()
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        batch_num = i // batch_size + 1
        
        if upload_func(batch, batch_num, total_batches):
            stats["success"] += len(batch)
        else:
            stats["failed"] += len(batch)
        
        # Progress indicator
        if batch_num % 10 == 0:
            print(f"   Progress: {stats['success']}/{stats['total']} uploaded")
    
    return stats


def main():
    print("=" * 70)
    print("SUPABASE CSV UPLOADER (HTTP/REST API)")
    print("=" * 70)
    print(f"CSV File: {CSV_PATH}")
    print(f"Supabase: {SUPABASE_URL}")
    print(f"Target Table: {TARGET_TABLE}")
    print(f"HTTP Library: {'requests' if HAS_REQUESTS else 'urllib'}")
    print("=" * 70)
    
    # Check CSV exists
    if not os.path.exists(CSV_PATH):
        print(f"\n❌ CSV file not found: {CSV_PATH}")
        return
    
    print(f"\n📖 Reading CSV file...")
    
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        csv_headers = reader.fieldnames or []
        
        print(f"✅ CSV Headers found: {len(csv_headers)}")
        print(f"   {', '.join(csv_headers[:8])}{'...' if len(csv_headers) > 8 else ''}")
        
        # Find column mapping
        mapping = find_column_mapping(csv_headers)
        print(f"\n🗺️  Column Mapping:")
        mapped_count = 0
        for supabase_col, csv_header in mapping.items():
            if csv_header:
                mapped_count += 1
                print(f"   ✅ {supabase_col} <- '{csv_header}'")
        
        print(f"\n   Mapped: {mapped_count}/{len(mapping)} fields")
        
        # Check required fields
        print(f"\n📋 Required Fields:")
        all_required_found = True
        for field in REQUIRED_FIELDS:
            csv_header = mapping.get(field)
            if csv_header:
                print(f"   ✅ {field}: '{csv_header}'")
            else:
                print(f"   ❌ {field}: NOT FOUND")
                all_required_found = False
        
        if not all_required_found:
            print("\n⚠️  Some required fields not found. Rows without these will be skipped.")
        
        # Transform records
        print(f"\n🔄 Transforming records...")
        records = []
        skipped = 0
        row_count = 0
        
        for row in reader:
            row_count += 1
            transformed = transform_row(row, mapping)
            
            if transformed:
                records.append(transformed)
            else:
                skipped += 1
            
            if row_count % 500 == 0:
                print(f"   Processed {row_count} rows... ({len(records)} valid, {skipped} skipped)")
        
        print(f"\n📊 Transformation Summary:")
        print(f"   Total CSV rows: {row_count}")
        print(f"   Valid records: {len(records)}")
        print(f"   Skipped (missing required): {skipped}")
        
        if len(records) == 0:
            print("\n❌ No valid records to upload!")
            return
        
        # Show sample
        print(f"\n📝 Sample Record:")
        sample = records[0]
        for key in ["business_name", "phone_1", "city", "governorate", "category", "status"]:
            value = sample.get(key, "N/A")
            if isinstance(value, str) and len(value) > 40:
                value = value[:37] + "..."
            print(f"   {key}: {value}")
        
        # Confirm
        print(f"\n" + "=" * 70)
        confirm = input(f"Upload {len(records)} records to '{TARGET_TABLE}'? (yes/no): ")
        
        if confirm.lower() not in ['yes', 'y']:
            print("Upload cancelled.")
            return
        
        # Upload with smaller batch size to isolate issues
        stats = upload_to_supabase(records, batch_size=10)
        
        # Report
        print(f"\n" + "=" * 70)
        print("UPLOAD COMPLETE")
        print("=" * 70)
        print(f"Total: {stats['total']}")
        print(f"Success: {stats['success']}")
        print(f"Failed: {stats['failed']}")
        
        if stats['failed'] > 0:
            print(f"\n⚠️  {stats['failed']} records failed to upload")
        
        print(f"\n✅ Finished at {datetime.now().isoformat()}")


if __name__ == "__main__":
    main()
