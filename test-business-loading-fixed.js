// Test the fixed business loading logic
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBusinessLoading() {
    console.log('🔍 Testing fixed business loading...');
    
    try {
        // Test basic business loading
        console.log('\n📦 Testing basic business loading:');
        const { data: businesses, error: businessError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .range(0, 11); // First 12 businesses (0-11)
        
        if (businessError) {
            console.error('❌ Business loading error:', businessError.message);
            return;
        }
        
        console.log(`✅ Found ${businesses?.length || 0} businesses`);
        
        // Test mapping logic
        if (businesses && businesses.length > 0) {
            console.log('\n🗺️ Testing mapping logic:');
            const mappedBusiness = businesses[0];
            
            const mappedData = {
                id: mappedBusiness.id,
                name: mappedBusiness.name,
                nameAr: mappedBusiness.nameAr,
                category: mappedBusiness.category,
                governorate: mappedBusiness.governorate,
                city: mappedBusiness.city,
                address: mappedBusiness.address,
                phone: mappedBusiness.phone,
                rating: mappedBusiness.rating || 0,
                reviewCount: mappedBusiness.reviewCount || 0,
                isFeatured: mappedBusiness.isFeatured || false,
                isVerified: mappedBusiness.isVerified || false,
                image: mappedBusiness.imageUrl || mappedBusiness.image || `https://picsum.photos/seed/${mappedBusiness.id}/600/400`,
                website: mappedBusiness.website,
                socialLinks: {
                    facebook: mappedBusiness.facebook,
                    instagram: mappedBusiness.instagram,
                    twitter: mappedBusiness.twitter,
                    whatsapp: mappedBusiness.whatsapp
                },
                description: mappedBusiness.description,
                descriptionAr: mappedBusiness.descriptionAr,
                openingHours: mappedBusiness.openHours,
                createdAt: new Date(mappedBusiness.createdAt),
                updatedAt: new Date(mappedBusiness.createdAt)
            };
            
            console.log('✅ Mapped business data:');
            console.log(`  Name: ${mappedData.name} (${mappedData.nameAr || 'No Arabic'})`);
            console.log(`  Category: ${mappedData.category}`);
            console.log(`  Location: ${mappedData.city}, ${mappedData.governorate}`);
            console.log(`  Phone: ${mappedData.phone || 'No Phone'}`);
            console.log(`  Rating: ${mappedData.rating || 'No Rating'}`);
            console.log(`  Website: ${mappedData.website || 'No Website'}`);
        }
        
        // Test filtering
        console.log('\n🔍 Testing filtering by Baghdad:');
        const { data: baghdadBusinesses, error: baghdadError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .eq('governorate', 'Baghdad')
            .range(0, 4);
        
        if (baghdadError) {
            console.error('❌ Baghdad filter error:', baghdadError.message);
        } else {
            console.log(`✅ Found ${baghdadBusinesses?.length || 0} Baghdad businesses`);
        }
        
        console.log('\n🍽️ Testing filtering by Restaurants & Dining:');
        const { data: restaurantBusinesses, error: restaurantError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .eq('category', 'Restaurants & Dining')
            .range(0, 4);
        
        if (restaurantError) {
            console.error('❌ Restaurant filter error:', restaurantError.message);
        } else {
            console.log(`✅ Found ${restaurantBusinesses?.length || 0} Restaurants & Dining businesses`);
        }
        
        console.log('\n🎯 Testing combined filter (Baghdad + Restaurants):');
        const { data: combinedBusinesses, error: combinedError } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .eq('governorate', 'Baghdad')
            .eq('category', 'Restaurants & Dining')
            .range(0, 4);
        
        if (combinedError) {
            console.error('❌ Combined filter error:', combinedError.message);
        } else {
            console.log(`✅ Found ${combinedBusinesses?.length || 0} Baghdad restaurants`);
        }
        
        console.log('\n🎉 Business loading test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testBusinessLoading();
