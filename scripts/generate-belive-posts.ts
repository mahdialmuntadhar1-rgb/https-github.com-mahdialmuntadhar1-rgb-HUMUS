#!/usr/bin/env node
/**
 * Belive Shaku Maku Post Generator
 * Generates posts compatible with belive schema (008_social_posts.sql)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const TARGET_POST_COUNT = 50;

// Category-based captions
const CATEGORY_CAPTIONS: Record<string, string[]> = {
  'Restaurant': [
    'أشهى المأكولات العراقية بانتظارك! تفضل بزيارتنا لتجربة طعام لا تُنسى 🍽️',
    'نكهات أصيلة من تراث العراق! استمتع بأطباقنا المميزة اليوم 🥘',
    'جودة الطعام تبدأ من مطبخنا! أفضل المكونات الطازجة لك فقط 🍲',
    'وجبة شهية في أجواء رائعة! احجز طاولتك الآن واستمتع بالتجربة 🍴',
    'طعام يليق بذوقك الرفيع! ننتظرك لتجربة مميزة 🌟'
  ],
  'Cafe': [
    'قهوتك المفضلة بانتظارك! استرخِ واستمتع بأجواء هادئة ☕',
    'فنجان قهوة ومحادثة جميلة! المكان المثالي للقاء الأصدقاء ☕✨',
    'نكهات قهوة مميزة من حول العالم! تفضل بزيارتنا واكتشف المذاق 🌍☕',
    'حلويات طازجة وقهوة لذيذة! بداية يومك تبدأ من هنا 🥐☕',
    'مكانك المفضل للاسترخاء! أجواء دافئة وقهوة ممتازة 🛋️☕'
  ],
  'Salon': [
    'جمالك يستحق الأفضل! احجزي موعدك الآن وتمتعي بتجربة فريدة 💇‍♀️',
    'أناقة وإطلالة مميزة! فريقنا المحترف بانتظارك ✨',
    'عناية متكاملة لإطلالة رائعة! اكتشفي خدماتنا المميزة 💅',
    'جديد الموضة بين يديك! تحدثي مع خبرائنا للحصول على أفضل إطلالة 👑',
    'ثقة وجمال في كل تفصيلة! نحن نهتم بك وبجمالك 💄'
  ],
  'default': [
    'أهلاً بكم في زاوية الشاكو ماكو! ✨ تجربة مميزة تنتظركم هنا',
    'اكتشفوا معنا أحدث عروضنا المميزة! لا تفوتوا الفرصة 🎉',
    'جودة وتميز في كل تفصيلة! نحن نضع رضاكم في المقام الأول ⭐',
    'خدمة ممتازة بانتظاركم! تفضلوا بزيارتنا واختبروا الفرق ✨',
    'مكانكم المفضل للتسوق! تشكيلة واسعة وأسعار مميزة 🛍️'
  ]
};

// Unsplash images by category
const CATEGORY_IMAGES: Record<string, string> = {
  'Restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  'Cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  'Salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
  'Pharmacy': 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&q=80',
  'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'Shopping': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'
};

interface Business {
  id: string;
  business_name: string;
  category: string;
  governorate: string;
  city?: string;
  image_url?: string;
}

function validateEnv(): void {
  if (!SUPABASE_SERVICE_KEY || !GEMINI_API_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_KEY or GEMINI_API_KEY in .env');
    process.exit(1);
  }
}

function getCaption(category: string, businessName: string): string {
  const captions = CATEGORY_CAPTIONS[category] || CATEGORY_CAPTIONS.default;
  const baseCaption = captions[Math.floor(Math.random() * captions.length)];
  return `أهلاً بكم في زاوية الشاكو ماكو! 👋\n\n${baseCaption}\n\n📍 ${businessName} في انتظاركم! تفضلوا بزيارتنا واكتشفوا المزيد 🌟`;
}

function getImageUrl(category: string): string {
  return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.default;
}

async function fetchBusinesses(client: SupabaseClient): Promise<Business[]> {
  console.log('📊 Fetching approved businesses...\n');
  
  const { data, error } = await client
    .from('businesses')
    .select('id, business_name, category, governorate, city, image_url')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(TARGET_POST_COUNT);
  
  if (error) {
    console.error('❌ Error fetching businesses:', error.message);
    throw error;
  }
  
  console.log(`✅ Found ${data?.length || 0} approved businesses\n`);
  return data || [];
}

async function generatePosts(client: SupabaseClient, genAI: GoogleGenerativeAI): Promise<void> {
  const businesses = await fetchBusinesses(client);
  
  if (businesses.length === 0) {
    console.error('❌ No approved businesses found');
    process.exit(1);
  }
  
  console.log('🤖 Generating posts...\n');
  
  const posts = businesses.map((business, i) => ({
    business_id: business.id,
    caption: getCaption(business.category, business.business_name),
    image_url: business.image_url || getImageUrl(business.category),
    likes_count: Math.floor(Math.random() * 100) + 10,
    comments_count: Math.floor(Math.random() * 20) + 1,
    is_active: true
  }));
  
  // Insert in batches
  const batchSize = 10;
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    const { error } = await client.from('posts').insert(batch);
    
    if (error) {
      console.error(`  ❌ Batch ${batchNum} failed: ${error.message}`);
      failed += batch.length;
    } else {
      console.log(`  ✅ Batch ${batchNum}: ${batch.length} posts`);
      success += batch.length;
    }
    
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n📊 Results: ${success} success, ${failed} failed`);
}

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   BELIVE SHAKU MAKU POST GENERATOR');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  validateEnv();
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  
  console.log('🔗 Connected to:', SUPABASE_URL);
  console.log('🤖 Gemini AI ready\n');
  
  await generatePosts(supabase, genAI);
  
  // Verify
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);
  
  console.log(`\n✅ Total active posts: ${count}`);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   GENERATION COMPLETE 🎉');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('\n💥 Error:', err);
  process.exit(1);
});
