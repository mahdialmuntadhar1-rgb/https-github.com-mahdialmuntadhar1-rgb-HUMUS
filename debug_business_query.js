// Debug script to check businesses table structure and data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBusinessesTable() {
  console.log('=== DEBUGGING BUSINESSES TABLE ===\n');

  try {
    // 1. Check total records
    const { count: totalRecords, error: totalError } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('Error getting total records:', totalError);
      return;
    }
    console.log(`1. Total records in businesses table: ${totalRecords}`);

    // 2. Check table structure (first few records)
    const { data: sampleData, error: sampleError } = await supabase
      .from('businesses')
      .select('*')
      .limit(3);
    
    if (sampleError) {
      console.error('Error getting sample data:', sampleError);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('\n2. Sample record structure:');
      console.log('Columns:', Object.keys(sampleData[0]));
      console.log('Sample data:', JSON.stringify(sampleData[0], null, 2));
    }

    // 3. Check phone fields existence and data
    const { data: phoneData, error: phoneError } = await supabase
      .from('businesses')
      .select('id, business_name, phone, phone_1, phone_2, whatsapp')
      .limit(5);
    
    if (phoneError) {
      console.error('Error checking phone fields:', phoneError);
      return;
    }
    
    console.log('\n3. Phone fields analysis:');
    if (phoneData && phoneData.length > 0) {
      console.log('Phone columns found:', Object.keys(phoneData[0]));
      phoneData.forEach((record, idx) => {
        console.log(`Record ${idx + 1}:`, {
          id: record.id,
          name: record.business_name,
          phone: record.phone,
          phone_1: record.phone_1,
          phone_2: record.phone_2,
          whatsapp: record.whatsapp
        });
      });
    }

    // 4. Test current query from messaging.ts
    console.log('\n4. Testing current query from messaging.ts:');
    try {
      const { data: currentQueryData, count: currentQueryCount, error: currentQueryError } = await supabase
        .from('businesses')
        .select('id, business_name, phone_1, whatsapp, governorate, category', { count: 'exact' })
        .eq('status', 'active')
        .or('phone_1.not.is.null,whatsapp.not.is.null')
        .limit(10);
      
      if (currentQueryError) {
        console.error('Current query error:', currentQueryError);
      } else {
        console.log(`Current query results: ${currentQueryCount} records`);
        if (currentQueryData && currentQueryData.length > 0) {
          currentQueryData.forEach((record, idx) => {
            console.log(`  ${idx + 1}. ${record.business_name} - phone_1: ${record.phone_1}, whatsapp: ${record.whatsapp}`);
          });
        }
      }
    } catch (err) {
      console.error('Exception running current query:', err);
    }

    // 5. Test simplified query (bypass filters)
    console.log('\n5. Testing simplified query (no status filter):');
    try {
      const { data: simpleData, count: simpleCount, error: simpleError } = await supabase
        .from('businesses')
        .select('id, business_name, phone, phone_1, whatsapp', { count: 'exact' })
        .or('phone.not.is.null,phone_1.not.is.null,whatsapp.not.is.null')
        .limit(10);
      
      if (simpleError) {
        console.error('Simple query error:', simpleError);
      } else {
        console.log(`Simple query results: ${simpleCount} records`);
        if (simpleData && simpleData.length > 0) {
          simpleData.forEach((record, idx) => {
            console.log(`  ${idx + 1}. ${record.business_name} - phone: ${record.phone}, phone_1: ${record.phone_1}, whatsapp: ${record.whatsapp}`);
          });
        }
      }
    } catch (err) {
      console.error('Exception running simple query:', err);
    }

    // 6. Check status field values
    console.log('\n6. Status field distribution:');
    const { data: statusData, error: statusError } = await supabase
      .from('businesses')
      .select('status')
      .then(({ data, error }) => {
        if (error) throw error;
        const statusCounts = {};
        data.forEach(record => {
          const status = record.status || 'NULL';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        return statusCounts;
      });
    
    if (statusError) {
      console.error('Error checking status distribution:', statusError);
    } else {
      console.log('Status distribution:', statusData);
    }

    // 7. Check governorate and category filters
    console.log('\n7. Governorate and Category analysis:');
    const { data: filterData, error: filterError } = await supabase
      .from('businesses')
      .select('governorate, category')
      .limit(20);
    
    if (filterError) {
      console.error('Error checking filters:', filterError);
    } else {
      const governorates = [...new Set(filterData?.map(r => r.governorate).filter(Boolean))];
      const categories = [...new Set(filterData?.map(r => r.category).filter(Boolean))];
      console.log('Available governorates:', governorates.slice(0, 10));
      console.log('Available categories:', categories.slice(0, 10));
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

debugBusinessesTable();
