import type { Business } from '@/lib/supabase';
import { CATEGORIES, GOVERNORATES } from '@/constants';

const EMPTY_VALUES = new Set(['', 'n/a', 'na', 'null', 'undefined', 'unknown', '-', '--']);

const CATEGORY_IDS = new Set(CATEGORIES.map((category) => category.id));

const CATEGORY_ALIAS_TO_ID: Record<string, string> = {
  restaurant: 'dining',
  restaurants: 'dining',
  'restaurants & dining': 'dining',
  'food & dining': 'dining',
  'food and dining': 'dining',
  food: 'dining',
  dining: 'dining',

  cafe: 'cafe',
  cafes: 'cafe',
  coffee: 'cafe',
  'coffee shop': 'cafe',
  'cafes & coffee': 'cafe',

  hotel: 'hotels',
  hotels: 'hotels',
  stays: 'hotels',
  accommodation: 'hotels',

  shopping: 'shopping',
  retail: 'shopping',
  mall: 'shopping',
  store: 'shopping',

  bank: 'banks',
  banks: 'banks',
  finance: 'banks',

  school: 'education',
  university: 'education',
  education: 'education',

  entertainment: 'entertainment',
  cinema: 'entertainment',

  tourism: 'tourism',
  travel: 'tourism',

  doctor: 'doctors',
  doctors: 'doctors',
  physician: 'doctors',

  lawyer: 'lawyers',
  lawyers: 'lawyers',
  legal: 'lawyers',

  hospital: 'hospitals',
  hospitals: 'hospitals',

  clinic: 'medical',
  clinics: 'medical',
  medical: 'medical',

  'real estate': 'realestate',
  realestate: 'realestate',

  event: 'events',
  events: 'events',
  venues: 'events',

  pharmacy: 'pharmacy',
  pharmacies: 'pharmacy',

  gym: 'gym',
  fitness: 'gym',

  beauty: 'beauty',
  salon: 'beauty',
  salons: 'beauty',

  supermarket: 'supermarkets',
  supermarkets: 'supermarkets',
  grocery: 'supermarkets',

  furniture: 'furniture',
  home: 'furniture',

  general: 'general',
  other: 'general',
  others: 'general',
};

const GOVERNORATE_BY_KEY = GOVERNORATES.reduce<Record<string, string>>((acc, governorate) => {
  acc[governorate.id.toLowerCase()] = governorate.name.en;
  acc[governorate.name.en.toLowerCase()] = governorate.name.en;
  acc[governorate.name.ar.toLowerCase()] = governorate.name.en;
  acc[governorate.name.ku.toLowerCase()] = governorate.name.en;
  return acc;
}, {});

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value.trim();
  if (!cleaned) return undefined;
  if (EMPTY_VALUES.has(cleaned.toLowerCase())) return undefined;
  return cleaned;
}

export function normalizeCategory(value: unknown): string {
  const cleaned = normalizeString(value)?.toLowerCase();
  if (!cleaned) return 'general';
  if (CATEGORY_IDS.has(cleaned)) return cleaned;

  return CATEGORY_ALIAS_TO_ID[cleaned] || 'general';
}

export function getCategoryFilterValues(selectedCategory: string | null): string[] | null {
  if (!selectedCategory) return null;
  const canonical = normalizeCategory(selectedCategory);

  const aliases = Object.entries(CATEGORY_ALIAS_TO_ID)
    .filter(([, id]) => id === canonical)
    .map(([alias]) => alias);

  return Array.from(new Set([canonical, ...aliases]));
}

export function normalizeGovernorate(value: unknown): string {
  const cleaned = normalizeString(value)?.toLowerCase();
  if (!cleaned) return '';

  return GOVERNORATE_BY_KEY[cleaned] || cleaned.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function normalizeBusiness(input: Record<string, any>): Business {
  const createdAt = input.created_at || input.createdAt;
  const updatedAt = input.updated_at || input.updatedAt || createdAt;

  const id = String(input.id ?? crypto.randomUUID());
  const category = normalizeCategory(input.category ?? input.category_id);

  return {
    id,
    name: normalizeString(input.name ?? input.business_name) || 'Unnamed Business',
    nameAr: normalizeString(input.name_ar ?? input.nameAr),
    nameKu: normalizeString(input.name_ku ?? input.nameKu),
    category,
    governorate: normalizeGovernorate(input.governorate),
    city: normalizeString(input.city) || 'Unknown City',
    address: normalizeString(input.address) || 'Address not provided',
    phone: normalizeString(input.phone ?? input.phone_number) || 'Phone not available',
    rating: Number.isFinite(Number(input.rating)) ? Number(input.rating) : 0,
    reviewCount: Number.isFinite(Number(input.review_count ?? input.reviewCount))
      ? Number(input.review_count ?? input.reviewCount)
      : 0,
    isFeatured: Boolean(input.is_featured ?? input.isFeatured),
    isVerified: Boolean(input.is_verified ?? input.isVerified),
    image: normalizeString(input.image_url ?? input.image),
    website: normalizeString(input.website),
    socialLinks: input.social_links ?? input.socialLinks ?? {},
    description: normalizeString(input.description),
    descriptionAr: normalizeString(input.description_ar ?? input.descriptionAr),
    openingHours: normalizeString(input.opening_hours ?? input.openingHours),
    ownerId: normalizeString(input.owner_id ?? input.ownerId),
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
  };
}
