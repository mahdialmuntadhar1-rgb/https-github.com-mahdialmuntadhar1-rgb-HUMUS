/**
 * GET /api/posts - Fetch posts with optional filters
 * POST /api/posts - Create new post
 * 
 * Social Posts API for business feed functionality
 */

import { supabaseAdmin } from '../lib/supabaseAdmin';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Database } from '../lib/database.types';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface PostWithBusiness {
  id: string;
  business_id: string;
  caption: string;
  image_url: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_active: boolean;
  business: {
    id: string;
    business_name: string;
    category: string | null;
    governorate: string | null;
    city: string | null;
    image_url: string | null;
    phone_1: string | null;
    whatsapp: string | null;
  };
}

type PostRow = Database['public']['Tables']['posts']['Row'];
type BusinessRow = Database['public']['Tables']['businesses']['Row'];

interface PostWithBusinessRow extends PostRow {
  businesses: BusinessRow;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    const method = req.method;

    // GET /api/posts - Fetch posts with optional filters
    if (method === 'GET') {
      const { city, category, limit = '20', offset = '0' } = req.query;

      const limitNum = Math.min(parseInt(limit as string), 50); // Max 50
      const offsetNum = parseInt(offset as string);

      console.log(`[posts] GET request - city: ${city}, category: ${category}, limit: ${limitNum}, offset: ${offsetNum}`);

      let query = supabaseAdmin
        .from('posts')
        .select(`
          id,
          business_id,
          caption,
          image_url,
          created_at,
          likes_count,
          comments_count,
          is_active,
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
        .order('created_at', { ascending: false })
        .range(offsetNum, offsetNum + limitNum - 1);

      // Apply filters if provided
      if (city) {
        query = query.eq('businesses.governorate', city);
      }
      if (category) {
        query = query.eq('businesses.category', category);
      }

      const { data: posts, error, count } = await query as any;

      if (error) {
        console.error('[posts] Database error:', error);
        return res.status(500).json({
          success: false,
          error: `Database error: ${error.message}`
        });
      }

      // Transform data to match expected format
      const transformedPosts: PostWithBusiness[] = (posts || []).map((post: any) => ({
        id: post.id,
        business_id: post.business_id,
        caption: post.caption,
        image_url: post.image_url,
        created_at: post.created_at,
        likes_count: post.likes_count,
        comments_count: post.comments_count,
        is_active: post.is_active,
        business: {
          id: post.businesses.id,
          business_name: post.businesses.business_name,
          category: post.businesses.category,
          governorate: post.businesses.governorate,
          city: post.businesses.city,
          image_url: post.businesses.image_url,
          phone_1: post.businesses.phone_1,
          whatsapp: post.businesses.whatsapp,
        }
      }));

      console.log(`[posts] Returning ${transformedPosts.length} posts (total: ${count || 0})`);

      return res.status(200).json({
        success: true,
        data: transformedPosts,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          total: count || 0,
          hasMore: (offsetNum + transformedPosts.length) < (count || 0)
        }
      });
    }

    // POST /api/posts - Create new post
    if (method === 'POST') {
      const { business_id, caption, image_url } = req.body;

      console.log(`[posts] POST request - business_id: ${business_id}`);

      // Validate required fields
      if (!business_id || !caption || !image_url) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: business_id, caption, image_url'
        });
      }

      // Validate business exists and is approved
      const { data: business, error: businessError } = await supabaseAdmin
        .from('businesses')
        .select('id, business_name, status')
        .eq('id', business_id)
        .eq('status', 'approved')
        .single();

      if (businessError || !business) {
        console.error('[posts] Business validation error:', businessError);
        return res.status(404).json({
          success: false,
          error: 'Business not found or not approved'
        });
      }

      // Create the post
      const { data: newPost, error: postError } = await (supabaseAdmin
        .from('posts') as any)
        .insert({
          business_id,
          caption: caption.trim(),
          image_url: image_url.trim(),
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
          is_active,
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
        .single() as any;

      if (postError) {
        console.error('[posts] Post creation error:', postError);
        return res.status(500).json({
          success: false,
          error: `Database error: ${postError.message}`
        });
      }

      if (!newPost) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create post'
        });
      }

      // Transform response
      const transformedPost: PostWithBusiness = {
        id: newPost.id,
        business_id: newPost.business_id,
        caption: newPost.caption,
        image_url: newPost.image_url,
        created_at: newPost.created_at,
        likes_count: newPost.likes_count,
        comments_count: newPost.comments_count,
        is_active: newPost.is_active,
        business: {
          id: newPost.businesses.id,
          business_name: newPost.businesses.business_name,
          category: newPost.businesses.category,
          governorate: newPost.businesses.governorate,
          city: newPost.businesses.city,
          image_url: newPost.businesses.image_url,
          phone_1: newPost.businesses.phone_1,
          whatsapp: newPost.businesses.whatsapp,
        }
      };

      console.log(`[posts] Created new post: ${newPost.id} for business: ${(business as any).business_name}`);

      return res.status(201).json({
        success: true,
        data: transformedPost
      });
    }

    // Method not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[posts] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}
