// Test script to verify the audience query fixes
// Run this in the browser console on the messaging page

window.testAudienceQuery = async function() {
  console.log('=== TESTING AUDIENCE QUERY FIXES ===\n');
  
  try {
    // Import the updated function
    const { fetchTargetBusinesses, CATEGORIES, GOVERNORATES } = await import('@/lib/messaging');
    
    console.log('1. Testing with no filters (should return all approved businesses with phones):');
    const result1 = await fetchTargetBusinesses({});
    console.log(`Result: ${result1.total} businesses found`);
    if (result1.businesses.length > 0) {
      console.log('Sample businesses:', result1.businesses.slice(0, 3).map(b => ({
        name: b.name,
        phone: b.phone,
        governorate: b.governorate,
        category: b.category
      })));
    }
    if (result1.error) {
      console.error('Error:', result1.error);
    }

    console.log('\n2. Testing with Baghdad governorate filter:');
    const result2 = await fetchTargetBusinesses({ governorate: 'Baghdad' });
    console.log(`Result: ${result2.total} businesses found`);
    if (result2.businesses.length > 0) {
      console.log('Sample Baghdad businesses:', result2.businesses.slice(0, 3).map(b => b.name));
    }
    if (result2.error) {
      console.error('Error:', result2.error);
    }

    console.log('\n3. Testing with Restaurant category filter:');
    const result3 = await fetchTargetBusinesses({ category: 'Restaurant' });
    console.log(`Result: ${result3.total} businesses found`);
    if (result3.businesses.length > 0) {
      console.log('Sample Restaurant businesses:', result3.businesses.slice(0, 3).map(b => b.name));
    }
    if (result3.error) {
      console.error('Error:', result3.error);
    }

    console.log('\n4. Testing with both filters:');
    const result4 = await fetchTargetBusinesses({ governorate: 'Baghdad', category: 'Restaurant' });
    console.log(`Result: ${result4.total} businesses found`);
    if (result4.businesses.length > 0) {
      console.log('Sample Baghdad Restaurant businesses:', result4.businesses.slice(0, 3).map(b => b.name));
    }
    if (result4.error) {
      console.error('Error:', result4.error);
    }

    console.log('\n5. Testing with small limit (like testing mode):');
    const result5 = await fetchTargetBusinesses({ limit: 5 });
    console.log(`Result: ${result5.total} businesses found (limited to 5)`);
    console.log('All 5 businesses:', result5.businesses.map(b => b.name));
    if (result5.error) {
      console.error('Error:', result5.error);
    }

    console.log('\n6. Available categories:');
    console.log(CATEGORIES.map(c => `${c.id} (${c.label})`));

    console.log('\n7. Available governorates:');
    console.log(GOVERNORATES.slice(0, 10)); // Show first 10

  } catch (err) {
    console.error('Test failed:', err);
  }
};

console.log('Test function created! Run window.testAudienceQuery() in the console to test the fixes.');
