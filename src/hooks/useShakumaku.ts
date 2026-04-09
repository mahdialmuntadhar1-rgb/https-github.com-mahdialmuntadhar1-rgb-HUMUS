import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface ShakumakuPost {
  id: string;
  businessId: string;
  caption: string;
  captionAr?: string;
  captionEn?: string;
  image: string;
  likes: number;
  views: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  businessName?: string;
  businessNameAr?: string;
  category?: string;
  governorate?: string;
  city?: string;
  neighborhood?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  adminNotes?: string;
}

interface UseShakumakuResult {
  posts: ShakumakuPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  likePost: (postId: string) => Promise<void>;
  incrementViews: (postId: string) => Promise<void>;
}

const POSTS_PER_PAGE = 12;

// Check if shakumaku_posts table exists
async function checkTableExists(supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('shakumaku_posts')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    return !error || error.code !== '42P01'; // 42P01 = table does not exist
  } catch {
    return false;
  }
}

// Generate caption from business data
function generateCaption(business: any): string {
  const templates = [
    "✨ اكتشفوا {name} في {city}! وجهة مميزة للـ {category} 🌟",
    "📍 {name} في {city} - حيث الجودة تلتقي بالتميز! ✨",
    "🔥 تجربة فريدة في {name}، {city}! أفضل {category} في المنطقة",
    "✨ {name} في {city} - عنوان التميز لعشاق {category}",
  ];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template
    .replace('{name}', business.name || 'هذا المكان')
    .replace('{city}', business.city || business.governorate || 'العراق')
    .replace('{category}', business.category || 'الخدمات');
}

export function useShakumaku(): UseShakumakuResult {
  const [posts, setPosts] = useState<ShakumakuPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setPage(0);
    }
    setError(null);

    try {
      const currentPage = isRefresh ? 0 : page;
      const from = currentPage * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      // Check if table exists on first load
      let exists = tableExists;
      if (exists === null) {
        exists = await checkTableExists(supabase);
        setTableExists(exists);
      }

      let data: any[] = [];
      let count = 0;

      console.log('[Shakumaku] Fetching from shakumaku_posts table...');
      
      if (exists) {
        // Fetch from shakumaku_posts - use correct camelCase column names
        const result = await supabase
          .from('shakumaku_posts')
          .select(`
            *,
            businesses!inner (
              name,
              "nameAr",
              category,
              subcategory,
              governorate,
              city,
              phone,
              "imageUrl",
              "isPremium",
              "isFeatured"
            )
          `, { count: 'exact' })
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .range(from, to);

        console.log('[Shakumaku] Query result:', { 
          error: result.error?.message, 
          dataLength: result.data?.length,
          count: result.count 
        });

        if (result.error) throw result.error;
        data = result.data || [];
        count = result.count || 0;
      } else {
        // Fallback: fetch from businesses and convert to posts format
        const result = await supabase
          .from('businesses')
          .select('*', { count: 'exact' })
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .range(from, to);

        if (result.error) throw result.error;
        
        // Convert businesses to shakumaku format
        data = (result.data || []).map((biz: any, idx: number) => ({
          id: biz.id,
          business_id: biz.id,
          caption: generateCaption(biz),
          caption_ar: generateCaption(biz),
          caption_en: `Discover ${biz.name} in ${biz.city || biz.governorate || 'Iraq'}!`,
          image_url: biz.image_url || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80`,
          likes_count: Math.floor(Math.random() * 200) + 50,
          views_count: Math.floor(Math.random() * 1000) + 100,
          is_featured: idx < 10,
          is_active: true,
          created_at: biz.created_at,
          updated_at: biz.updated_at,
          businesses: biz
        }));
        count = result.count || 0;
      }

      console.log('[Shakumaku] Mapping', data.length, 'posts');
      
      if (data && data.length > 0) {
        const mappedPosts: ShakumakuPost[] = data.map((item: any, idx: number) => {
          // Handle joined business data with safe fallbacks
          const biz = item.businesses || {};
          const post = {
            id: item.id,
            businessId: item.business_id,
            caption: item.caption_ar || item.caption || '✨ اكتشف هذا المكان المميز!',
            captionAr: item.caption_ar || item.caption,
            captionEn: item.caption_en || '',
            image: item.image_url || biz.imageUrl || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80`,
            likes: item.likes_count || 0,
            views: item.views_count || 0,
            isFeatured: item.is_featured || false,
            isActive: item.is_active ?? true,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
            businessName: biz.name || 'مجهول',
            businessNameAr: biz.nameAr || biz.name || 'مجهول',
            category: biz.category || 'عام',
            governorate: biz.governorate || 'العراق',
            city: biz.city || biz.governorate || 'العراق',
            phone: biz.phone || '',
            adminNotes: item.admin_notes || ''
          };
          if (idx === 0) console.log('[Shakumaku] First post mapped:', post);
          return post;
        });

        setPosts(prev => {
          const newPosts = isRefresh ? mappedPosts : [...prev, ...mappedPosts];
          const countVal = count || 0;
          setHasMore(newPosts.length < countVal);
          return newPosts;
        });
      }
    } catch (err) {
      console.error('Error fetching shakumaku posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  useEffect(() => {
    if (page > 0) {
      fetchPosts(false);
    }
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setPage(0);
    fetchPosts(true);
  };

  const likePost = async (postId: string) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));

      // Call the increment function
      const { error } = await supabase.rpc('increment_shakumaku_likes', { post_id: postId });
      
      if (error) {
        // Revert on error
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes: p.likes - 1 } : p
        ));
        throw error;
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const incrementViews = async (postId: string) => {
    try {
      await supabase
        .from('shakumaku_posts')
        .update({ views_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', postId);
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  return { posts, loading, error, hasMore, loadMore, refresh, likePost, incrementViews };
}

// Admin hook for managing posts
export function useShakumakuAdmin() {
  const [posts, setPosts] = useState<ShakumakuPost[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shakumaku_posts')
        .select(`
          *,
          businesses (
            name,
            name_ar,
            category,
            governorate,
            city
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPosts(data.map((item: any) => ({
          id: item.id,
          businessId: item.business_id,
          caption: item.caption_ar || item.caption,
          captionAr: item.caption_ar,
          captionEn: item.caption_en,
          image: item.image_url,
          likes: item.likes_count || 0,
          views: item.views_count || 0,
          isFeatured: item.is_featured || false,
          isActive: item.is_active ?? true,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          businessName: item.businesses?.name,
          businessNameAr: item.businesses?.name_ar,
          category: item.businesses?.category,
          governorate: item.businesses?.governorate,
          city: item.businesses?.city,
          adminNotes: item.admin_notes
        })));
      }
    } catch (err) {
      console.error('Error fetching admin posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (postId: string, updates: Partial<ShakumakuPost>) => {
    try {
      const { error } = await supabase
        .from('shakumaku_posts')
        .update({
          caption_ar: updates.captionAr,
          caption_en: updates.captionEn,
          image_url: updates.image,
          is_featured: updates.isFeatured,
          is_active: updates.isActive,
          admin_notes: updates.adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;
      
      // Refresh local state
      await fetchAllPosts();
      return { success: true };
    } catch (err) {
      console.error('Error updating post:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('shakumaku_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      await fetchAllPosts();
      return { success: true };
    } catch (err) {
      console.error('Error deleting post:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Delete failed' };
    }
  };

  const createPost = async (post: Omit<ShakumakuPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('shakumaku_posts')
        .insert({
          business_id: post.businessId,
          caption: post.caption,
          caption_ar: post.captionAr,
          caption_en: post.captionEn,
          image_url: post.image,
          is_featured: post.isFeatured,
          admin_notes: post.adminNotes
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchAllPosts();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating post:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Create failed' };
    }
  };

  return { posts, loading, fetchAllPosts, updatePost, deletePost, createPost };
}
