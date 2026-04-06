import type { SupabaseClient } from '@supabase/supabase-js';

export const CLEAN_BUSINESSES_COLUMNS = [
  'id',
  'name',
  'nameAr',
  'nameKu',
  'category',
  'subcategory',
  'governorate',
  'city',
  'address',
  'phone',
  'whatsapp',
  'website',
  'description',
  'descriptionAr',
  'descriptionKu',
  'image_url',
  'coverimage',
  'openHours',
  'pricerange',
  'tags',
  'lat',
  'lng',
  'rating',
  'verified',
  'status',
  'source_name',
  'external_source_id',
  'confidence_score',
  'created_by_agent'
] as const;

export type CleanBusinessesColumn = typeof CLEAN_BUSINESSES_COLUMNS[number];
export type CleanBusinessInsertRecord = Partial<Record<CleanBusinessesColumn, string | number | boolean | string[]>>;

const ALLOWED_COLUMNS = new Set<CleanBusinessesColumn>(CLEAN_BUSINESSES_COLUMNS);
const NULLISH_VALUES = new Set(['', 'unknown', 'n/a', 'na', 'null', 'undefined', '-', '--']);

const CSV_TO_DB_COLUMN_MAP: Record<string, CleanBusinessesColumn> = {
  // Core names
  name: 'name',
  businessname: 'name',
  business_name: 'name',
  arabicname: 'nameAr',
  arabic_name: 'nameAr',
  kurdishname: 'nameKu',
  kurdish_name: 'nameKu',

  // Taxonomy
  category: 'category',
  subcategory: 'subcategory',

  // Location
  governorate: 'governorate',
  city: 'city',
  address: 'address',

  // Contact
  phone: 'phone',
  phone1: 'phone',
  phone_1: 'phone',
  whatsapp: 'whatsapp',
  website: 'website',

  // Content
  description: 'description',
  descriptionarabic: 'descriptionAr',
  description_arabic: 'descriptionAr',
  descriptionkurdish: 'descriptionKu',
  description_kurdish: 'descriptionKu',

  // Media
  imageurl: 'image_url',
  image_url: 'image_url',
  image: 'image_url',
  coverimage: 'coverimage',
  cover_image: 'coverimage',

  // Operations
  openinghours: 'openHours',
  opening_hours: 'openHours',
  openhours: 'openHours',
  pricerange: 'pricerange',
  price_range: 'pricerange',

  // Quality / source
  rating: 'rating',
  source: 'source_name',
  source_name: 'source_name',
  externalid: 'external_source_id',
  external_id: 'external_source_id',
  external_source_id: 'external_source_id',
  confidence: 'confidence_score',
  confidence_score: 'confidence_score',
  agent: 'created_by_agent',
  created_by_agent: 'created_by_agent',

  // Direct passthrough for clean schema columns
  id: 'id',
  namear: 'nameAr',
  nameku: 'nameKu',
  descriptionar: 'descriptionAr',
  descriptionku: 'descriptionKu',
  openHours: 'openHours',
  tags: 'tags',
  lat: 'lat',
  lng: 'lng',
  verified: 'verified',
  status: 'status'
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '').replace(/-/g, '_');
}

function normalizeValue(value: unknown): string | number | boolean | string[] | null {
  if (value === null || value === undefined) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (NULLISH_VALUES.has(trimmed.toLowerCase())) return null;
    return trimmed;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return null;
}

function coerceColumnValue(column: CleanBusinessesColumn, value: string | number | boolean | string[]): string | number | boolean | string[] | null {
  if (column === 'lat' || column === 'lng' || column === 'rating' || column === 'confidence_score') {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  if (column === 'verified') {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
      const lowered = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y'].includes(lowered)) return true;
      if (['false', '0', 'no', 'n'].includes(lowered)) return false;
    }
    return null;
  }

  if (column === 'tags' && typeof value === 'string') {
    const tags = value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    return tags.length > 0 ? tags : null;
  }

  return value;
}

function resolveColumn(rawHeader: string): CleanBusinessesColumn | null {
  const mapped = CSV_TO_DB_COLUMN_MAP[rawHeader] ?? CSV_TO_DB_COLUMN_MAP[normalizeHeader(rawHeader)];
  if (!mapped) return null;
  return ALLOWED_COLUMNS.has(mapped) ? mapped : null;
}

export function transformCsvRowToBusinessRecord(rawRow: Record<string, unknown>): CleanBusinessInsertRecord {
  const record: CleanBusinessInsertRecord = {};

  for (const [rawKey, rawValue] of Object.entries(rawRow)) {
    const column = resolveColumn(rawKey);
    if (!column) continue;

    const normalized = normalizeValue(rawValue);
    if (normalized === null) continue;

    const coerced = coerceColumnValue(column, normalized);
    if (coerced === null) continue;

    record[column] = coerced;
  }

  if (record.verified === undefined) {
    record.verified = false;
  }

  if (record.status === undefined) {
    record.status = 'approved';
  }

  return record;
}

export function buildCleanBusinessesPayload(rows: Record<string, unknown>[]): CleanBusinessInsertRecord[] {
  return rows
    .map(transformCsvRowToBusinessRecord)
    .filter((row) => Object.keys(row).length > 0);
}

export async function insertBusinessCsvRows(
  supabase: SupabaseClient,
  rawRows: Record<string, unknown>[],
  batchSize = 200
): Promise<{ inserted: number }> {
  const payload = buildCleanBusinessesPayload(rawRows);

  if (payload.length === 0) {
    console.log('[CSV IMPORT] No valid rows to insert after cleaning.');
    return { inserted: 0 };
  }

  console.log('[CSV IMPORT] First cleaned record sample:', payload[0]);

  let inserted = 0;

  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize);

    const { error } = await supabase
      .from('businesses')
      .insert(batch);

    if (error) {
      console.error('[CSV IMPORT] Supabase insert failed', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        batchStartIndex: i,
        batchSize: batch.length
      });
      throw error;
    }

    inserted += batch.length;
    console.log(`[CSV IMPORT] Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} rows)`);
  }

  return { inserted };
}
