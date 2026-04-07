// Browser console debugging script
// Copy and paste this into the browser console on the messaging page

window.debugBusinessQuery = async function() {
  console.log('=== DEBUGGING BUSINESS QUERY ===\n');
  
  try {
    // Import supabase from the page context
    const { supabase } = await import('@/services/supabase');
    
    // 1. Check total records
    const { count: totalRecords, error: totalError } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('Error getting total records:', totalError);
      return;
    }
    console.log(`1. Total records in businesses table: ${totalRecords}`);

    // 2. Check table structure (first record)
    const { data: sampleData, error: sampleError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Error getting sample data:', sampleError);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('\n2. Sample record structure:');
      console.log('Columns:', Object.keys(sampleData[0]));
      console.log('Sample data:', sampleData[0]);
    }

    // 3. Check phone fields
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
            console.log(`  ${idx + 1}. ${record.business_name} - phone_1: ${record.phone_1}, whatsapp: ${record.whatsapp}, status: ${record.status}`);
          });
        }
      }
    } catch (err) {
      console.error('Exception running current query:', err);
    }

    // 5. Test with status 'approved' instead of 'active'
    console.log('\n5. Testing with status="approved":');
    try {
      const { data: approvedData, count: approvedCount, error: approvedError } = await supabase
        .from('businesses')
        .select('id, business_name, phone_1, whatsapp, governorate, category, status', { count: 'exact' })
        .eq('status', 'approved')
        .or('phone_1.not.is.null,whatsapp.not.is.null')
        .limit(10);
      
      if (approvedError) {
        console.error('Approved query error:', approvedError);
      } else {
        console.log(`Approved status query results: ${approvedCount} records`);
        if (approvedData && approvedData.length > 0) {
          approvedData.forEach((record, idx) => {
            console.log(`  ${idx + 1}. ${record.business_name} - phone_1: ${record.phone_1}, whatsapp: ${record.whatsapp}, status: ${record.status}`);
          });
        }
      }
    } catch (err) {
      console.error('Exception running approved query:', err);
    }

    // 6. Test without any status filter
    console.log('\n6. Testing without status filter:');
    try {
      const { data: noStatusData, count: noStatusCount, error: noStatusError } = await supabase
        .from('businesses')
        .select('id, business_name, phone_1, whatsapp, governorate, category, status', { count: 'exact' })
        .or('phone_1.not.is.null,whatsapp.not.is.null')
        .limit(10);
      
      if (noStatusError) {
        console.error('No status query error:', noStatusError);
      } else {
        console.log(`No status filter query results: ${noStatusCount} records`);
        if (noStatusData && noStatusData.length > 0) {
          noStatusData.forEach((record, idx) => {
            console.log(`  ${idx + 1}. ${record.business_name} - phone_1: ${record.phone_1}, whatsapp: ${record.whatsapp}, status: ${record.status}`);
          });
        }
      }
    } catch (err) {
      console.error('Exception running no status query:', err);
    }

    // 7. Check status field distribution
    console.log('\n7. Status field distribution:');
    try {
      const { data: statusData, error: statusError } = await supabase
        .from('businesses')
        .select('status');
      
      if (statusError) {
        console.error('Error checking status distribution:', statusError);
      } else {
        const statusCounts = {};
        statusData.forEach(record => {
          const status = record.status || 'NULL';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        console.log('Status distribution:', statusCounts);
      }
    } catch (err) {
      console.error('Exception checking status distribution:', err);
    }

    // 8. Test with different phone field combinations
    console.log('\n8. Testing different phone field combinations:');
    
    // Test with 'phone' field instead of 'phone_1'
    try {
      const { data: phoneFieldData, count: phoneFieldCount, error: phoneFieldError } = await supabase
        .from('businesses')
        .select('id, business_name, phone, whatsapp', { count: 'exact' })
        .eq('status', 'approved')
        .or('phone.not.is.null,whatsapp.not.is.null')
        .limit(10);
      
      if (phoneFieldError) {
        console.error('Phone field query error:', phoneFieldError);
      } else {
        console.log(`Using 'phone' field results: ${phoneFieldCount} records`);
        if (phoneFieldData && phoneFieldData.length > 0) {
          phoneFieldData.forEach((record, idx) => {
            console.log(`  ${idx + 1}. ${record.business_name} - phone: ${record.phone}, whatsapp: ${record.whatsapp}`);
          });
        }
      }
    } catch (err) {
      console.error('Exception running phone field query:', err);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

console.log('Debug function created! Run window.debugBusinessQuery() in the console to start debugging.');
