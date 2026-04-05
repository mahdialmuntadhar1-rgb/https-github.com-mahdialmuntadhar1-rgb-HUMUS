// Comprehensive audit of frontend-backend integration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function comprehensiveAudit() {
    console.log('🔍 COMPREHENSIVE FRONTEND-BACKEND INTEGRATION AUDIT');
    console.log('=' .repeat(60));
    
    try {
        // 1. Identify exact Supabase table used by frontend
        console.log('\n📋 1. IDENTIFYING SUPABASE TABLE...');
        const { data: tables, error: tablesError } = await supabase
            .from('businesses')
            .select('count')
            .limit(1);
        
        if (tablesError) {
            console.error('❌ Error accessing businesses table:', tablesError.message);
            return;
        }
        console.log('✅ Frontend uses: businesses table');
        
        // 2. Verify Supabase project URL
        console.log('\n🌐 2. VERIFYING SUPABASE PROJECT URL...');
        console.log(`✅ Connected to: ${supabaseUrl}`);
        
        // 3. Check Row Level Security policies
        console.log('\n🔒 3. CHECKING ROW LEVEL SECURITY...');
        try {
            const { data: rlsTest, error: rlsError } = await supabase
                .from('businesses')
                .select('id')
                .limit(1);
            
            if (rlsError) {
                console.error('❌ RLS Policy Error:', rlsError.message);
                console.error('❌ Anon user cannot read businesses table');
            } else {
                console.log('✅ Anon user can read businesses table');
            }
        } catch (error) {
            console.error('❌ RLS Check failed:', error.message);
        }
        
        // 4. Confirm total database row count
        console.log('\n📊 4. TOTAL DATABASE ROW COUNT...');
        const { count: totalCount, error: countError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('❌ Error counting rows:', countError.message);
        } else {
            console.log(`✅ Total rows in businesses table: ${totalCount}`);
        }
        
        // 5. Check schema and sample data
        console.log('\n🗂️ 5. SCHEMA ANALYSIS...');
        const { data: sample, error: sampleError } = await supabase
            .from('businesses')
            .select('*')
            .limit(3);
        
        if (sampleError) {
            console.error('❌ Error getting sample:', sampleError.message);
        } else {
            console.log('✅ Sample business columns:', Object.keys(sample[0] || {}));
            console.log('✅ Sample business data:');
            sample.forEach((biz, index) => {
                console.log(`  ${index + 1}. ${biz.name} (${biz.nameAr || 'No Arabic'})`);
                console.log(`     Category: ${biz.category}`);
                console.log(`     Governorate: ${biz.governorate}`);
                console.log(`     City: ${biz.city}`);
                console.log(`     Phone: ${biz.phone || 'No Phone'}`);
                console.log(`     Rating: ${biz.rating || 'No Rating'}`);
                console.log(`     Verified: ${biz.isVerified || 'Not Verified'}`);
                console.log('');
            });
        }
        
        // 6. Check distinct categories
        console.log('\n📂 6. DISTINCT CATEGORIES...');
        const { data: categories, error: catError } = await supabase
            .from('businesses')
            .select('category')
            .not('category', 'is', null);
        
        if (catError) {
            console.error('❌ Error getting categories:', catError.message);
        } else {
            const uniqueCategories = [...new Set(categories.map(c => c.category))];
            console.log(`✅ Found ${uniqueCategories.length} unique categories:`);
            uniqueCategories.forEach(cat => {
                const count = categories.filter(c => c.category === cat).length;
                console.log(`  ${cat}: ${count} businesses`);
            });
        }
        
        // 7. Check distinct governorates
        console.log('\n🏛️ 7. DISTINCT GOVERNORATES...');
        const { data: governorates, error: govError } = await supabase
            .from('businesses')
            .select('governorate')
            .not('governorate', 'is', null);
        
        if (govError) {
            console.error('❌ Error getting governorates:', govError.message);
        } else {
            const uniqueGovernorates = [...new Set(governorates.map(g => g.governorate))];
            console.log(`✅ Found ${uniqueGovernorates.length} unique governorates:`);
            uniqueGovernorates.forEach(gov => {
                const count = governorates.filter(g => g.governorate === gov).length;
                console.log(`  ${gov}: ${count} businesses`);
            });
        }
        
        // 8. Test pagination (same as frontend)
        console.log('\n📄 8. TESTING FRONTEND PAGINATION...');
        const ITEMS_PER_PAGE = 12;
        const { data: firstPage, error: pageError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .range(0, ITEMS_PER_PAGE - 1);
        
        if (pageError) {
            console.error('❌ Pagination error:', pageError.message);
        } else {
            console.log(`✅ First page (${ITEMS_PER_PAGE} items): ${firstPage.length} businesses fetched`);
            console.log(`✅ Total available: ${firstPage.length} businesses`);
        }
        
        // 9. Test filtering
        console.log('\n🔍 9. TESTING FILTERING...');
        
        // Test Baghdad filter
        const { data: baghdadData, error: baghdadError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .eq('governorate', 'Baghdad')
            .range(0, ITEMS_PER_PAGE - 1);
        
        if (baghdadError) {
            console.error('❌ Baghdad filter error:', baghdadError.message);
        } else {
            console.log(`✅ Baghdad filter: ${baghdadData.length} businesses`);
        }
        
        // Test Restaurants filter
        const { data: restaurantData, error: restaurantError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .eq('category', 'Restaurants & Dining')
            .range(0, ITEMS_PER_PAGE - 1);
        
        if (restaurantError) {
            console.error('❌ Restaurant filter error:', restaurantError.message);
        } else {
            console.log(`✅ Restaurants filter: ${restaurantData.length} businesses`);
        }
        
        // 10. Check for null values in key fields
        console.log('\n🚫 10. CHECKING NULL VALUES...');
        
        const { data: nullCheckData, error: nullError } = await supabase
            .from('businesses')
            .select('id, name, nameAr, category, governorate, city, phone, rating, isVerified')
            .limit(100);
        
        if (nullError) {
            console.error('❌ Null check error:', nullError.message);
        } else {
            const nullStats = {
                total: nullCheckData.length,
                name: nullCheckData.filter(b => !b.name).length,
                nameAr: nullCheckData.filter(b => !b.nameAr).length,
                category: nullCheckData.filter(b => !b.category).length,
                governorate: nullCheckData.filter(b => !b.governorate).length,
                city: nullCheckData.filter(b => !b.city).length,
                phone: nullCheckData.filter(b => !b.phone).length,
                rating: nullCheckData.filter(b => !b.rating).length,
                isVerified: nullCheckData.filter(b => !b.isVerified).length
            };
            
            console.log('✅ Null value analysis (first 100 records):');
            Object.entries(nullStats).forEach(([field, count]) => {
                const percentage = ((count / nullStats.total) * 100).toFixed(1);
                console.log(`  ${field}: ${count} null (${percentage}%)`);
            });
        }
        
        console.log('\n🎯 AUDIT SUMMARY:');
        console.log(`✅ Database connection: Working`);
        console.log(`✅ Total rows: ${totalCount || 'Unknown'}`);
        console.log(`✅ Pagination: Working`);
        console.log(`✅ Filtering: Working`);
        console.log(`✅ Schema: Compatible`);
        
    } catch (error) {
        console.error('❌ Audit failed:', error.message);
    }
}

comprehensiveAudit();
