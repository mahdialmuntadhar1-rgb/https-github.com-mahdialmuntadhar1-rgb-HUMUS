#!/usr/bin/env node
/**
 * Shaku Maku Post Generator
 * Generates 50 beautiful postcard-style posts for the social feed
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.shakumaku') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hsadukhmcclwixuntqwu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const TARGET_POST_COUNT = 50;

const TARGET_CATEGORIES = [
  'مطعم', 'Restaurant', 'كافيه', 'Cafe', 'صالون', 'Salon',
  'صيدلية', 'Pharmacy', 'مخبز', 'Bakery', 'ملابس', 'Clothing'
];

const CATEGORY_IMAGES: Record<string, string> = {
  'مطعم': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  'Restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  'كافيه': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  'Cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  'صالون': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  'Salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'
};

interface Business {
  id: number;
  name: string;
  phone?: string;
  governorate: string;
  category?: string;
}

interface GeneratedPost {
  business_id: number;
  display_name: string;
  caption_ar: string;
  image_url: string;
  category: string;
  governorate: string;
  featured: boolean;
}

function validateEnv(): void {
  if (!SUPABASE_SERVICE_KEY || !GEMINI_API_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_KEY or GEMINI_API_KEY');
    process.exit(1);
  }
}

function normalizePhone(phone?: string): string {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('07')) cleaned = '+964' + cleaned.substring(1);
  else if (cleaned.startsWith('7') && cleaned.length >= 10) cleaned = '+964' + cleaned;
  else if (cleaned.startsWith('964')) cleaned = '+' + cleaned;
  return cleaned;
}

async function selectDiverseBusinesses(client: SupabaseClient): Promise<Business[]> {
  console.log('📊 Selecting diverse businesses...\n');
  
  const selected: Business[] = [];
  const seenIds = new Set<number>();
  
  for (const category of TARGET_CATEGORIES) {
    if (selected.length >= TARGET_POST_COUNT) break;
    
    const { data } = await client
      .from('businesses')
      .select('id, name, phone, governorate, category')
      .ilike('category', `%${category}%`)
      .not('name', 'is', null)
      .limit(10);
    
    if (data) {
      for (const business of data) {
        if (!seenIds.has(business.id) && selected.length < TARGET_POST_COUNT) {
          selected.push(business);
          seenIds.add(business.id);
        }
      }
    }
  }
  
  console.log(`✅ Selected ${selected.length} diverse businesses\n`);
  return selected;
}

async function generateCaption(business: Business, genAI: GoogleGenerativeAI): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `Create an engaging Arabic Instagram caption for "${business.name}" (${business.category}) in ${business.governorate}, Iraq.

Structure:
1. Welcome to "زاوية الشاكو ماكو"
2. 2-3 enthusiastic sentences about the business
3. Call to action to visit
4. Brief location mention

Tone: Friendly, conversational, Iraqi Arabic style. 80-120 words.

Return ONLY the Arabic caption.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return `أهلاً بكم في زاوية الشاكو ماكو! ✨\n\nاليوم نأخذكم في جولة سريعة لـ ${business.name}، المكان المثالي في ${business.governorate}. تفضل بزيارتهم واكتشف المزيد! 🌟`;
  }
}

function getImageUrl(category?: string): string {
  if (!category) return CATEGORY_IMAGES.default;
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.default;
}

async function generatePosts(businesses: Business[], genAI: GoogleGenerativeAI): Promise<GeneratedPost[]> {
  console.log('🤖 Generating captions with Gemini AI...\n');
  
  const posts: GeneratedPost[] = [];
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    console.log(`  [${i + 1}/${businesses.length}] ${business.name}...`);
    
    const caption = await generateCaption(business, genAI);
    
    posts.push({
      business_id: business.id,
      display_name: business.name,
      caption_ar: caption,
      image_url: getImageUrl(business.category),
      category: business.category || 'General',
      governorate: business.governorate,
      featured: i < 5
    });
    
    if (i < businesses.length - 1) await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n✅ Generated ${posts.length} posts\n`);
  return posts;
}

async function insertPosts(client: SupabaseClient, posts: GeneratedPost[]): Promise<void> {
  console.log('💾 Inserting posts to database...\n');
  
  const { data: sampleData } = await client.from('posts').select('*').limit(1);
  const existingColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
  
  const batchSize = 10;
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    const preparedBatch = batch.map(post => {
      const prepared: any = {};
      
      if (existingColumns.includes('businessId')) prepared.businessId = post.business_id;
      if (existingColumns.includes('business_id')) prepared.business_id = post.business_id;
      if (existingColumns.includes('businessName')) prepared.businessName = post.display_name;
      if (existingColumns.includes('display_name')) prepared.display_name = post.display_name;
      if (existingColumns.includes('caption')) prepared.caption = post.caption_ar;
      if (existingColumns.includes('caption_ar')) prepared.caption_ar = post.caption_ar;
      if (existingColumns.includes('content')) prepared.content = post.caption_ar;
      if (existingColumns.includes('imageUrl')) prepared.imageUrl = post.image_url;
      if (existingColumns.includes('image_url')) prepared.image_url = post.image_url;
      if (existingColumns.includes('category')) prepared.category = post.category;
      if (existingColumns.includes('governorate')) prepared.governorate = post.governorate;
      if (existingColumns.includes('featured')) prepared.featured = post.featured;
      if (existingColumns.includes('isVerified')) prepared.isVerified = false;
      if (existingColumns.includes('likes')) prepared.likes = 0;
      if (existingColumns.includes('createdAt')) prepared.createdAt = new Date().toISOString();
      if (existingColumns.includes('created_at')) prepared.created_at = new Date().toISOString();
      
      return prepared;
    });
    
    const { error } = await client.from('posts').insert(preparedBatch);
    
    if (error) {
      console.error(`  ❌ Batch ${batchNum} failed: ${error.message}`);
      failed += batch.length;
    } else {
      console.log(`  ✅ Batch ${batchNum} inserted (${batch.length} posts)`);
      success += batch.length;
    }
    
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n📊 Results: ${success} success, ${failed} failed\n`);
}

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   SHAKU MAKU POST GENERATOR');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  validateEnv();
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  console.log('🔗 Connected to Supabase:', SUPABASE_URL);
  console.log('🤖 Gemini AI initialized\n');
  
  const businesses = await selectDiverseBusinesses(supabase);
  
  if (businesses.length === 0) {
    console.error('❌ No businesses found');
    process.exit(1);
  }
  
  const posts = await generatePosts(businesses, genAI);
  
  console.log('⚡ Ready to insert (continuing in 3s)...\n');
  await new Promise(r => setTimeout(r, 3000));
  
  await insertPosts(supabase, posts);
  
  const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true });
  console.log(`✅ Total posts in database: ${count}`);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   GENERATION COMPLETE 🎉');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('\n💥 Error:', err);
  process.exit(1);
});
