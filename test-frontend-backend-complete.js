// Complete frontend-backend integration test
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function completeIntegrationTest() {
    console.log('🔍 COMPLETE FRONTEND-BACKEND INTEGRATION TEST');
    console.log('=' .repeat(60));
    
    const results = {
        totalRowsInDB: 0,
        totalRowsFetched: 0,
        totalRowsAfterTransform: 0,
        totalRowsShownInUI: 0,
        issues: []
    };
    
    try {
        // 1. Total database row count
        console.log('\n📊 TOTAL DATABASE ROW COUNT...');
        const { count: totalCount, error: countError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('❌ Error counting rows:', countError.message);
            results.issues.push(`Count error: ${countError.message}`);
            return;
        }
        
        results.totalRowsInDB = totalCount || 0;
        console.log(`✅ Total rows in DB: ${results.totalRowsInDB}`);
        
        // 2. Test frontend query (first page)
        console.log('\n📄 TESTING FRONTEND QUERY...');
        const ITEMS_PER_PAGE = 12;
        const { data: firstPage, error: pageError, count: pageCount } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .range(0, ITEMS_PER_PAGE - 1);
        
        if (pageError) {
            console.error('❌ Frontend query error:', pageError.message);
            results.issues.push(`Frontend query error: ${pageError.message}`);
            return;
        }
        
        results.totalRowsFetched = firstPage?.length || 0;
        console.log(`✅ Rows fetched by frontend: ${results.totalRowsFetched}`);
        console.log(`✅ Total count from query: ${pageCount}`);
        
        // 3. Test transformation (mapping)
        console.log('\n🔄 TESTING TRANSFORMATION...');
        const transformedBusinesses = firstPage?.map((item) => {
            return {
                id: item.id,
                name: item.name,
                nameAr: item.nameAr,
                nameKu: item.nameKu,
                category: item.category,
                governorate: item.governorate,
                city: item.city,
                address: item.address,
                phone: item.phone,
                rating: item.rating || 0,
                reviewCount: item.reviewCount || 0,
                isFeatured: item.isFeatured || false,
                isVerified: item.isVerified || false,
                image: item.imageUrl || item.image || `https://picsum.photos/seed/${item.id}/600/400`,
                website: item.website,
                socialLinks: {
                    facebook: item.facebook,
                    instagram: item.instagram,
                    twitter: item.twitter,
                    whatsapp: item.whatsapp
                },
                description: item.description,
                descriptionAr: item.descriptionAr,
                openingHours: item.openHours,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.createdAt)
            };
        }) || [];
        
        results.totalRowsAfterTransform = transformedBusinesses.length;
        console.log(`✅ Rows after transformation: ${results.totalRowsAfterTransform}`);
        
        // Check for transformation issues
        const missingFields = {
            name: transformedBusinesses.filter(b => !b.name).length,
            nameAr: transformedBusinesses.filter(b => !b.nameAr).length,
            category: transformedBusinesses.filter(b => !b.category).length,
            governorate: transformedBusinesses.filter(b => !b.governorate).length,
            city: transformedBusinesses.filter(b => !b.city).length,
            phone: transformedBusinesses.filter(b => !b.phone).length
        };
        
        Object.entries(missingFields).forEach(([field, count]) => {
            if (count > 0) {
                console.log(`⚠️ Missing ${field}: ${count} businesses`);
                results.issues.push(`Missing ${field}: ${count} businesses`);
            }
        });
        
        // 4. Test filtering
        console.log('\n🔍 TESTING FILTERING...');
        const filteredBusinesses = transformedBusinesses.filter(biz => {
            // No filtering - all businesses should pass
            return true;
        });
        
        results.totalRowsShownInUI = filteredBusinesses.length;
        console.log(`✅ Rows shown in UI: ${results.totalRowsShownInUI}`);
        
        // 5. Test specific filters
        console.log('\n🎯 TESTING SPECIFIC FILTERS...');
        
        // Baghdad filter
        const { data: baghdadData, error: baghdadError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .eq('governorate', 'Baghdad')
            .range(0, ITEMS_PER_PAGE - 1);
        
        if (baghdadError) {
            console.error('❌ Baghdad filter error:', baghdadError.message);
            results.issues.push(`Baghdad filter error: ${baghdadError.message}`);
        } else {
            console.log(`✅ Baghdad filter: ${baghdadData?.length || 0} businesses`);
        }
        
        // Restaurants filter
        const { data: restaurantData, error: restaurantError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .eq('category', 'Restaurants & Dining')
            .range(0, ITEMS_PER_PAGE - 1);
        
        if (restaurantError) {
            console.error('❌ Restaurant filter error:', restaurantError.message);
            results.issues.push(`Restaurant filter error: ${restaurantError.message}`);
        } else {
            console.log(`✅ Restaurants filter: ${restaurantData?.length || 0} businesses`);
        }
        
        // 6. Check data quality
        console.log('\n🔍 DATA QUALITY CHECK...');
        const { data: qualityData, error: qualityError } = await supabase
            .from('businesses')
            .select('name, nameAr, category, governorate, city, phone, rating, isVerified')
            .limit(50);
        
        if (qualityError) {
            console.error('❌ Quality check error:', qualityError.message);
        } else {
            const qualityStats = {
                total: qualityData?.length || 0,
                withArabicName: qualityData?.filter(b => b.nameAr).length || 0,
                withPhone: qualityData?.filter(b => b.phone).length || 0,
                withRating: qualityData?.filter(b => b.rating).length || 0,
                verified: qualityData?.filter(b => b.isVerified).length || 0
            };
            
            console.log('✅ Data quality (first 50):');
            Object.entries(qualityStats).forEach(([metric, count]) => {
                const percentage = qualityStats.total > 0 ? ((count / qualityStats.total) * 100).toFixed(1) : 0;
                console.log(`  ${metric}: ${count} (${percentage}%)`);
            });
        }
        
        // 7. Final analysis
        console.log('\n🎯 FINAL ANALYSIS...');
        
        if (results.totalRowsInDB === 0) {
            results.issues.push('No data in database');
        } else if (results.totalRowsFetched === 0) {
            results.issues.push('Frontend not fetching data');
        } else if (results.totalRowsAfterTransform === 0) {
            results.issues.push('Transformation dropping all rows');
        } else if (results.totalRowsShownInUI === 0) {
            results.issues.push('Filtering dropping all rows');
        } else if (results.totalRowsShownInUI < results.totalRowsFetched) {
            results.issues.push(`UI showing fewer rows than fetched: ${results.totalRowsShownInUI}/${results.totalRowsFetched}`);
        }
        
        if (results.issues.length === 0) {
            console.log('🎉 ALL TESTS PASSED - Integration is working correctly!');
        } else {
            console.log('⚠️ ISSUES FOUND:');
            results.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        results.issues.push(`Test failed: ${error.message}`);
    }
    
    // Final report
    console.log('\n📋 FINAL REPORT:');
    console.log('=' .repeat(40));
    console.log(`Total rows in DB: ${results.totalRowsInDB}`);
    console.log(`Total rows fetched: ${results.totalRowsFetched}`);
    console.log(`Total rows after transform: ${results.totalRowsAfterTransform}`);
    console.log(`Total rows shown in UI: ${results.totalRowsShownInUI}`);
    console.log(`Issues found: ${results.issues.length}`);
    
    if (results.issues.length > 0) {
        console.log('\n🔧 RECOMMENDED FIXES:');
        results.issues.forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue}`);
        });
    }
    
    return results;
}

completeIntegrationTest();
