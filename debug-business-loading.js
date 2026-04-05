// Debug script to check actual database schema and business data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugBusinessLoading() {
    console.log('🔍 Debugging business loading...');
    
    try {
        // Get sample business to see actual columns
        const { data: sample, error: sampleError } = await supabase
            .from('businesses')
            .select('*')
            .limit(1);
        
        if (sampleError) {
            console.error('❌ Error getting sample:', sampleError.message);
            return;
        }
        
        if (sample && sample.length > 0) {
            console.log('\n📋 Actual database columns:');
            console.log(Object.keys(sample[0]));
            
            console.log('\n📄 Sample business data:');
            console.log(JSON.stringify(sample[0], null, 2));
        }
        
        // Test filtering by governorate
        console.log('\n🏛️ Testing governorate filter:');
        const { data: baghdadBusinesses, error: baghdadError } = await supabase
            .from('businesses')
            .select('name, nameAr, category, governorate, city')
            .eq('governorate', 'Baghdad')
            .limit(5);
        
        if (baghdadError) {
            console.error('❌ Governorate filter error:', baghdadError.message);
        } else {
            console.log(`✅ Found ${baghdadBusinesses?.length || 0} Baghdad businesses`);
            baghdadBusinesses?.forEach((biz, index) => {
                console.log(`${index + 1}. ${biz.name} (${biz.nameAr || 'No Arabic'}) - ${biz.category}`);
            });
        }
        
        // Test filtering by category
        console.log('\n📂 Testing category filter:');
        const { data: restaurantBusinesses, error: restaurantError } = await supabase
            .from('businesses')
            .select('name, nameAr, category, governorate, city')
            .eq('category', 'Restaurants & Dining')
            .limit(5);
        
        if (restaurantError) {
            console.error('❌ Category filter error:', restaurantError.message);
        } else {
            console.log(`✅ Found ${restaurantBusinesses?.length || 0} Restaurants & Dining businesses`);
            restaurantBusinesses?.forEach((biz, index) => {
                console.log(`${index + 1}. ${biz.name} (${biz.nameAr || 'No Arabic'}) - ${biz.governorate}`);
            });
        }
        
        // Test combined filter
        console.log('\n🔍 Testing combined filter (Baghdad + Restaurants):');
        const { data: combinedBusinesses, error: combinedError } = await supabase
            .from('businesses')
            .select('name, nameAr, category, governorate, city')
            .eq('governorate', 'Baghdad')
            .eq('category', 'Restaurants & Dining')
            .limit(5);
        
        if (combinedError) {
            console.error('❌ Combined filter error:', combinedError.message);
        } else {
            console.log(`✅ Found ${combinedBusinesses?.length || 0} Baghdad restaurants`);
            combinedBusinesses?.forEach((biz, index) => {
                console.log(`${index + 1}. ${biz.name} (${biz.nameAr || 'No Arabic'}) - ${biz.city}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugBusinessLoading();
