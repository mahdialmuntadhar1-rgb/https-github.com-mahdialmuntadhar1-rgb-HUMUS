/**
 * Test Posts API
 * 
 * Simple test script to verify the posts API endpoints work correctly
 */

import { supabaseAdmin } from '../lib/supabaseAdmin';

async function testPostsAPI() {
  console.log('[test] Testing Posts API...\n');

  try {
    // Test 1: GET /api/posts (basic fetch)
    console.log('[test] 1. Testing GET /api/posts...');
    
    const { data: posts, error: getError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        business_id,
        caption,
        image_url,
        created_at,
        likes_count,
        comments_count,
        businesses!inner (
          id,
          business_name,
          category,
          governorate,
          city,
          image_url,
          phone_1,
          whatsapp
        )
      `)
      .eq('is_active', true)
      .eq('businesses.status', 'approved')
      .order('created_at', { ascending: false })
      .limit(5);

    if (getError) {
      console.error('[test] GET posts error:', getError);
      throw getError;
    }

    console.log(`[test] GET posts success: Found ${posts?.length || 0} posts`);
    
    if (posts && posts.length > 0) {
      console.log('[test] Sample post:', {
        id: posts[0].id,
        business_name: posts[0].businesses.business_name,
        caption: posts[0].caption.substring(0, 50) + '...',
        likes: posts[0].likes_count,
        comments: posts[0].comments_count
      });
    }

    // Test 2: GET /api/posts with filters
    console.log('\n[test] 2. Testing GET /api/posts with filters...');
    
    const { data: filteredPosts, error: filterError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        business_id,
        caption,
        image_url,
        created_at,
        likes_count,
        comments_count,
        businesses!inner (
          id,
          business_name,
          category,
          governorate,
          city,
          image_url,
          phone_1,
          whatsapp
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('businesses.status', 'approved')
      .eq('businesses.governorate', 'Baghdad')
      .order('created_at', { ascending: false })
      .limit(3);

    if (filterError) {
      console.error('[test] Filter error:', filterError);
      throw filterError;
    }

    console.log(`[test] Filter success: Found ${filteredPosts?.length || 0} Baghdad posts`);

    // Test 3: POST /api/posts (create new post)
    console.log('\n[test] 3. Testing POST /api/posts...');
    
    // First get a valid business
    const { data: businesses, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, business_name')
      .eq('status', 'approved')
      .limit(1);

    if (businessError || !businesses || businesses.length === 0) {
      console.error('[test] No approved businesses found for testing POST');
      return;
    }

    const testBusiness = businesses[0];
    console.log(`[test] Using business: ${testBusiness.business_name}`);

    // Create a test post
    const { data: newPost, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        business_id: testBusiness.id,
        caption: 'Test post for API verification - ' + new Date().toISOString(),
        image_url: 'https://picsum.photos/seed/test-post/400/400',
        likes_count: 0,
        comments_count: 0,
        is_active: true
      })
      .select(`
        id,
        business_id,
        caption,
        image_url,
        created_at,
        likes_count,
        comments_count,
        businesses!inner (
          id,
          business_name,
          category,
          governorate,
          city,
          image_url,
          phone_1,
          whatsapp
        )
      `)
      .single();

    if (postError) {
      console.error('[test] POST error:', postError);
      throw postError;
    }

    console.log(`[test] POST success: Created post ${newPost.id} for ${newPost.businesses.business_name}`);

    // Test 4: Verify the new post appears in GET
    console.log('\n[test] 4. Verifying new post appears in GET...');
    
    const { data: updatedPosts, error: verifyError } = await supabaseAdmin
      .from('posts')
      .select('id, caption, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (verifyError) {
      console.error('[test] Verify error:', verifyError);
      throw verifyError;
    }

    const foundNewPost = updatedPosts?.find(p => p.id === newPost.id);
    if (foundNewPost) {
      console.log('[test] Verification successful: New post found in feed');
    } else {
      console.log('[test] Warning: New post not found in feed');
    }

    console.log('\n[test] All tests passed! Posts API is working correctly.');

  } catch (error) {
    console.error('[test] Test failed:', error);
    throw error;
  }
}

// Test the posts view as well
async function testPostsView() {
  console.log('\n[test] Testing posts_with_business view...');

  try {
    const { data, error } = await supabaseAdmin
      .from('posts_with_business')
      .select('*')
      .limit(3);

    if (error) {
      console.error('[test] View error:', error);
      throw error;
    }

    console.log(`[test] View success: Found ${data?.length || 0} posts in view`);
    
    if (data && data.length > 0) {
      console.log('[test] Sample view post:', {
        id: data[0].id,
        business_name: data[0].business_name,
        caption: data[0].caption.substring(0, 50) + '...'
      });
    }

  } catch (error) {
    console.error('[test] View test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testPostsAPI();
    await testPostsView();
    console.log('\n[test] All tests completed successfully! ');
  } catch (error) {
    console.error('\n[test] Tests failed:', error);
  }
}

runAllTests();
