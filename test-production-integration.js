// Production integration test script
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProductionIntegration() {
    console.log('🌍 PRODUCTION INTEGRATION TEST');
    console.log('================================');
    
    const results = {
        databaseConnection: false,
        businessDataLoading: false,
        filteringWorking: false,
        paginationWorking: false,
        dynamicComponentsWorking: false,
        errors: []
    };
    
    try {
        // Test 1: Database Connection
        console.log('\n1. Testing database connection...');
        const { count, error: countError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            results.errors.push(`Database connection error: ${countError.message}`);
            console.error('❌ Database connection failed:', countError.message);
        } else {
            results.databaseConnection = true;
            console.log(`✅ Database connected - ${count} businesses found`);
        }
        
        // Test 2: Business Data Loading (same as frontend)
        console.log('\n2. Testing business data loading...');
        const ITEMS_PER_PAGE = 12;
        const { data: businessData, error: dataError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .range(0, ITEMS_PER_PAGE - 1);
        
        if (dataError) {
            results.errors.push(`Business data loading error: ${dataError.message}`);
            console.error('❌ Business data loading failed:', dataError.message);
        } else {
            results.businessDataLoading = true;
            console.log(`✅ Business data loaded - ${businessData?.length} businesses fetched`);
            
            // Test data transformation
            const transformedData = businessData?.map(item => ({
                id: item.id,
                name: item.name,
                nameAr: item.nameAr,
                category: item.category,
                governorate: item.governorate,
                phone: item.phone,
                rating: item.rating || 0
            }));
            
            console.log(`✅ Data transformation successful - ${transformedData?.length} businesses mapped`);
        }
        
        // Test 3: Filtering
        console.log('\n3. Testing filtering...');
        const { data: baghdadData, error: baghdadError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .eq('governorate', 'Baghdad')
            .range(0, ITEMS_PER_PAGE - 1);
        
        if (baghdadError) {
            results.errors.push(`Baghdad filter error: ${baghdadError.message}`);
            console.error('❌ Baghdad filter failed:', baghdadError.message);
        } else {
            results.filteringWorking = true;
            console.log(`✅ Filtering working - ${baghdadData?.length} Baghdad businesses found`);
        }
        
        // Test 4: Pagination
        console.log('\n4. Testing pagination...');
        const { data: page2Data, error: page2Error } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .range(ITEMS_PER_PAGE, ITEMS_PER_PAGE * 2 - 1);
        
        if (page2Error) {
            results.errors.push(`Pagination error: ${page2Error.message}`);
            console.error('❌ Pagination failed:', page2Error.message);
        } else {
            results.paginationWorking = true;
            console.log(`✅ Pagination working - Page 2 has ${page2Data?.length} businesses`);
        }
        
        // Test 5: Dynamic Components Data
        console.log('\n5. Testing dynamic components data...');
        
        // Categories
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('businesses')
            .select('category')
            .not('category', 'is', null);
        
        // Governorates
        const { data: governoratesData, error: governoratesError } = await supabase
            .from('businesses')
            .select('governorate')
            .not('governorate', 'is', null);
        
        if (categoriesError || governoratesError) {
            results.errors.push(`Dynamic components data error: ${categoriesError?.message || governoratesError?.message}`);
            console.error('❌ Dynamic components data failed:', categoriesError?.message || governoratesError?.message);
        } else {
            const uniqueCategories = [...new Set(categoriesData?.map(c => c.category) || [])];
            const uniqueGovernorates = [...new Set(governoratesData?.map(g => g.governorate) || [])];
            
            results.dynamicComponentsWorking = true;
            console.log(`✅ Dynamic components data working:`);
            console.log(`   Categories: ${uniqueCategories.length} unique`);
            console.log(`   Governorates: ${uniqueGovernorates.length} unique`);
        }
        
    } catch (error) {
        results.errors.push(`Test execution error: ${error.message}`);
        console.error('❌ Test execution failed:', error.message);
    }
    
    // Final Report
    console.log('\n📊 PRODUCTION TEST RESULTS');
    console.log('==========================');
    console.log(`Database Connection: ${results.databaseConnection ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Business Data Loading: ${results.businessDataLoading ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Filtering Working: ${results.filteringWorking ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Pagination Working: ${results.paginationWorking ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Dynamic Components: ${results.dynamicComponentsWorking ? '✅ PASS' : '❌ FAIL'}`);
    
    if (results.errors.length > 0) {
        console.log('\n❌ ERRORS FOUND:');
        results.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
    } else {
        console.log('\n🎉 ALL TESTS PASSED - Production integration is working!');
    }
    
    return results;
}

testProductionIntegration();
