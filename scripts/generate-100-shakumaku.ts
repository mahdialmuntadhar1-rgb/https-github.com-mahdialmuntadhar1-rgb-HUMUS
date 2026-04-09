#!/usr/bin/env tsx
/**
 * Generate 100 Shakumaku Posts Script
 * 
 * This script:
 * 1. Fetches real businesses from the database
 * 2. Generates unique Arabic captions for each
 * 3. Creates visually diverse postcards
 * 4. Seeds the shakumaku_posts table
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Category-based Arabic caption templates
const CATEGORY_CAPTIONS: Record<string, string[]> = {
  'dining': [
    "✨ تجربة طعام لا تُنسى في {name} بـ{city}! أشهى المأكولات العراقية بانتظاركم 🍽️",
    "🔥 {name} - حيث تلتقي النكهات الأصيلة بالأجواء الرائعة في {city}! استمتعوا بأفضل وجبة 🥘",
    "📍 اكتشفوا سر تميز {name} في {city}! مطعم يجمع بين الأصالة والحداثة في كل طبق ✨",
    "🌟 وجبة شهية بانتظاركم في {name}، {city}! جودة الطعام تبدأ من اختيارنا للمكونات الطازجة 🍲",
    "✨ {name} في {city} - وجهتكم المثالية لعشاق المأكولات الراقية! احجزوا طاولتكم الآن 🍴",
  ],
  'cafe': [
    "☕ قهوتك المفضلة بانتظارك في {name}، {city}! استرخِ في أجواء هادئة ومميزة ✨",
    "✨ {name} في {city} - فنجان قهوة ومحادثة جميلة! المكان المثالي للقاء الأصدقاء ☕",
    "🌟 نكهات قهوة مميزة في {name}، {city}! تفضل بزيارتنا واكتشف المذاق الرائع ☕",
    "📍 {name} - عنوان الراحة في {city}! حلويات طازجة وقهوة لذيذة بانتظاركم 🥐",
    "☕✨ مكانكم المفضل للاسترخاء: {name} في {city}! أجواء دافئة وقهوة ممتازة 🛋️",
  ],
  'hotels': [
    "🏨 إقامة فاخرة بانتظاركم في {name}، {city}! غرف مريحة وخدمة استثنائية ✨",
    "✨ {name} في {city} - بيتكم الثاني! راحة ورفاهية في قلب المدينة 🌟",
    "🌟 تجربة إقامة لا تُنسى في {name}، {city}! حيث يلتقي الفخامة بالضيافة العراقية 🏨",
    "📍 {name} - وجهتكم المثالية في {city} للإقامة الراقية والخدمة الممتازة ✨",
  ],
  'shopping': [
    "🛍️ تجربة تسوق فريدة في {name}، {city}! تشكيلة واسعة من المنتجات الراقية ✨",
    "✨ {name} في {city} - حيث الجودة تلتقي بالأسعار المميزة! تسوقوا الآن 🌟",
    "🌟 اكتشفوا أحدث المنتجات في {name}، {city}! جودة عالية لكل الأسرة 🛍️",
    "📍 {name} - وجهتكم المفضلة للتسوق في {city}! تشكيلة متنوعة وخدمة راقية ✨",
  ],
  'beauty': [
    "💇‍♀️ جمالكم يستحق الأفضل! {name} في {city} بانتظاركم لتجربة فريدة ✨",
    "✨ {name} في {city} - أناقة وإطلالة مميزة! فريق محترف بخدمة راقية 🌟",
    "🌟 عناية متكاملة في {name}، {city}! اكتشفوا خدماتنا المميزة للعناية بجمالكم 💅",
    "📍 {name} - عنوان الجمال في {city}! ثقة وجمال في كل تفصيلة 💄",
  ],
  'hospitals': [
    "🏥 رعاية صحية متكاملة في {name}، {city}! فريق طبي متخصص بخدمة راقية ✨",
    "✨ {name} في {city} - صحتكم في أيدٍ أمينة! خدمات طبية على أعلى مستوى 🌟",
    "🌟 اكتشفوا التميز في {name}، {city}! رعاية صحية شاملة بأحدث التقنيات 🏥",
  ],
  'medical': [
    "⚕️ عيادة {name} في {city} - رعاية صحية شخصية بمعايير عالمية ✨",
    "✨ صحتكم تهمنا! {name} في {city} يقدم خدمات طبية متميزة 🌟",
    "📍 {name} - عنوان الرعاية الصحية في {city}! فريق متخصص بانتظاركم ⚕️",
  ],
  'realestate': [
    "🏠 عقارات مميزة في {name}، {city}! وجهتكم لاستثمار آمن ومربح ✨",
    "✨ {name} في {city} - حيث يلتقي الإبداع بالجودة في كل مشروع عقاري 🌟",
    "🌟 اكتشفوا فرصًا استثنائية مع {name} في {city}! عقارات بمعايير عالمية 🏠",
  ],
  'default': [
    "✨ اكتشفوا {name} في قلب {city}! وجهة مميزة بانتظاركم 🌟",
    "📍 {name} في {city} - حيث الجودة تلتقي بالتميز! تفضلوا بزيارتنا ✨",
    "🔥 تجربة فريدة بانتظاركم في {name}، {city}! نحن نضع رضاكم في المقام الأول 🌟",
    "✨ {name} - عنوان التميز في {city}! خدمة ممتازة وجودة عالية 📍",
    "🌟 مكانكم المفضل في {city}: {name}! اكتشفوا المزيد معنا ✨",
  ]
};

// Category-based fallback images
const CATEGORY_IMAGES: Record<string, string[]> = {
  'dining': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  ],
  'cafe': [
    'https://images.unsplash.com/photo-1501339819398-ed495197ff21?w=800&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  ],
  'hotels': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  ],
  'shopping': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  ],
  'beauty': [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80',
  ],
  'hospitals': [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    'https://images.unsplash.com/photo-1587351021759-3e566b1af862?w=800&q=80',
  ],
  'medical': [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80',
  ],
  'realestate': [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  ],
  'default': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
  ]
};

interface Business {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  governorate: string;
  city?: string;
  imageUrl?: string;
}

function getRandomCaption(category: string, business: Business): string {
  const templates = CATEGORY_CAPTIONS[category] || CATEGORY_CAPTIONS.default;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const cityName = business.city || business.governorate || 'العراق';
  const businessName = business.nameAr || business.name || 'هذا المكان';
  
  return template
    .replace('{name}', businessName)
    .replace('{city}', cityName)
    .replace('{category}', category);
}

function getRandomImage(category: string, businessImage?: string): string {
  if (businessImage && !businessImage.includes('placeholder')) {
    return businessImage;
  }
  
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.default;
  return images[Math.floor(Math.random() * images.length)];
}

async function fetchDiverseBusinesses(supabase: any, count: number): Promise<Business[]> {
  console.log('📊 Fetching diverse businesses...\n');
  
  // Get businesses from different categories and governorates
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, nameAr, category, subcategory, governorate, city, phone, imageUrl, isPremium, isFeatured')
    .eq('status', 'approved')
    .not('name', 'is', null)
    .limit(count * 2); // Fetch extra for diversity
  
  if (error) {
    console.error('❌ Error fetching businesses:', error.message);
    throw error;
  }
  
  if (!data || data.length === 0) {
    console.error('❌ No approved businesses found');
    return [];
  }
  
  // Select diverse businesses
  const selected: Business[] = [];
  const usedCategories = new Set<string>();
  const usedGovernorates = new Set<string>();
  
  // First pass: ensure category diversity
  for (const business of data) {
    if (selected.length >= count) break;
    if (!usedCategories.has(business.category)) {
      selected.push(business);
      usedCategories.add(business.category);
      usedGovernorates.add(business.governorate);
    }
  }
  
  // Second pass: ensure governorate diversity
  for (const business of data) {
    if (selected.length >= count) break;
    if (!usedGovernorates.has(business.governorate) && !selected.find(s => s.id === business.id)) {
      selected.push(business);
      usedGovernorates.add(business.governorate);
    }
  }
  
  // Fill remaining slots randomly
  for (const business of data) {
    if (selected.length >= count) break;
    if (!selected.find(s => s.id === business.id)) {
      selected.push(business);
    }
  }
  
  console.log(`✅ Selected ${selected.length} diverse businesses`);
  console.log(`📍 Categories: ${[...new Set(selected.map(b => b.category))].join(', ')}`);
  console.log(`🗺️  Governorates: ${[...new Set(selected.map(b => b.governorate))].join(', ')}\n`);
  
  return selected;
}

async function generatePosts(supabase: any, businesses: Business[]): Promise<void> {
  console.log('🎨 Generating Shakumaku posts...\n');
  
  const posts = businesses.map((business, index) => {
    const category = business.category || 'default';
    const captionAr = getRandomCaption(category, business);
    const imageUrl = getRandomImage(category, business.imageUrl);
    
    return {
      business_id: business.id,
      caption: captionAr, // Store Arabic as main caption
      caption_ar: captionAr,
      caption_en: `Discover ${business.name} in ${business.city || business.governorate || 'Iraq'}!`,
      image_url: imageUrl,
      likes_count: Math.floor(Math.random() * 200) + 50, // Random likes 50-250
      views_count: Math.floor(Math.random() * 1000) + 100, // Random views 100-1100
      is_active: true,
      is_featured: index < 10, // First 10 are featured
      display_order: index,
      admin_notes: `Auto-generated from ${business.name} (${business.category || 'general'})`
    };
  });
  
  // Insert in batches
  const batchSize = 25;
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    const { error } = await supabase.from('shakumaku_posts').insert(batch);
    
    if (error) {
      console.error(`  ❌ Batch ${batchNum} failed:`, error.message);
      failed += batch.length;
    } else {
      console.log(`  ✅ Batch ${batchNum}: ${batch.length} posts`);
      success += batch.length;
    }
    
    // Small delay between batches
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n📊 Results: ${success} success, ${failed} failed`);
}

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   GENERATE 100 SHAKUMAKU POSTS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables. Check VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  console.log('🔗 Connected to:', SUPABASE_URL);
  
  // Check if posts already exist
  const { count } = await supabase
    .from('shakumaku_posts')
    .select('*', { count: 'exact', head: true });
  
  if (count && count > 0) {
    console.log(`\n⚠️  ${count} posts already exist in shakumaku_posts table.`);
    console.log('   Use the admin panel to manage existing posts.');
    console.log('   Or delete existing posts first if you want to regenerate.\n');
    
    const proceed = process.argv.includes('--force');
    if (!proceed) {
      console.log('   Run with --force flag to regenerate anyway.');
      process.exit(0);
    }
    
    console.log('   --force flag detected. Clearing existing posts...\n');
    await supabase.from('shakumaku_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }
  
  // Fetch businesses
  const businesses = await fetchDiverseBusinesses(supabase, 100);
  
  if (businesses.length === 0) {
    console.error('❌ No businesses available to generate posts');
    process.exit(1);
  }
  
  // Generate posts
  await generatePosts(supabase, businesses);
  
  // Final count
  const { count: finalCount } = await supabase
    .from('shakumaku_posts')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n✅ Total posts in database: ${finalCount}`);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   GENERATION COMPLETE 🎉');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nNext steps:');
  console.log('1. Visit the admin panel at /admin/shakumaku to manage posts');
  console.log('2. Edit captions and images as needed');
  console.log('3. Toggle featured status for promoted posts');
}

main().catch(err => {
  console.error('\n💥 Error:', err);
  process.exit(1);
});
