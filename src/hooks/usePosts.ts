import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { Post } from '@/lib/supabase';

export function usePosts(businessId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const initialized = useAuthStore((state) => state.initialized);

  const fetchPosts = useCallback(async (isLoadMore = false) => {
    if (!initialized) { setLoading(false); return; }
    if (!isLoadMore) { setLoading(true); setPage(0); }
    setError(null);

    try {
      const from = isLoadMore ? (page + 1) * PAGE_SIZE : 0;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('posts')
        .select(`*, businesses:business_id (id, name, business_name, category, city, image_url, logo_url, phone_1, phone, whatsapp, social_links, is_active, status)`)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (businessId) { query = query.eq('business_id', businessId); }

      const { data, error: queryError } = await query;
      if (queryError) {
        console.warn('[usePosts] Query error (non-fatal):', queryError.message);
        if (!isLoadMore) setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      if (!data || data.length === 0) {
        if (!isLoadMore) setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const mappedPosts: Post[] = data
        .filter((item: any) => {
          const hasValidBusiness = item.businesses && (item.businesses.is_active === true || item.businesses.status === 'approved');
          if (!hasValidBusiness) console.warn('[usePosts] Filtering out post with invalid business:', { postId: item.id, businessId: item.business_id });
          return hasValidBusiness;
        })
        .map((item: any) => {
          const business = item.businesses || {};
          return {
            id: item.id || '',
            businessId: item.business_id || '',
            content: item.caption || item.content || '',
            image: item.image_url || item.image || null,
            likes: item.likes_count || item.likes || 0,
            comments: item.comments_count || item.comments || 0,
            shares: item.shares_count || item.shares || 0,
            createdAt: item.created_at ? new Date(item.created_at) : new Date(),
            authorName: business.business_name || business.name || item.author_name || 'Unknown Business',
            authorAvatar: business.image_url || business.logo_url || item.author_avatar || null,
            businessName: business.business_name || business.name || 'Unknown Business',
            businessCity: business.city || '',
            businessCategory: business.category || 'General',
            businessPhone: business.phone_1 || business.phone || '',
            businessWhatsapp: business.whatsapp || business.social_links?.whatsapp || '',
            postComments: []
          };
        });

      if (isLoadMore) { setPosts(prev => [...prev, ...mappedPosts]); setPage(prev => prev + 1); }
      else { setPosts(mappedPosts); }
      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      console.error('[usePosts] Fatal error (recovered):', err);
      setError(null);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [businessId, page, initialized]);

  const loadMore = () => { if (!loading && hasMore) fetchPosts(true); };

  const createPost = async (caption: string, imageUrl?: string) => {
    if (!businessId) return null;
    try {
      const insertData: any = { business_id: businessId, caption };
      if (imageUrl) insertData.image_url = imageUrl;
      const { data, error: insertError } = await supabase.from('posts').insert([insertData]).select().single();
      if (insertError) { console.error('[usePosts] Create error:', insertError); return null; }
      fetchPosts();
      return data;
    } catch (err) { console.error('[usePosts] Create fatal error:', err); return null; }
  };

  const likePost = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
  };

  const addComment = async (postId: string, authorName: string, commentText: string) => {
    try {
      const { data, error } = await supabase.from('post_comments').insert([{ post_id: postId, author_name: authorName, comment_text: commentText }]).select().single();
      if (error) { console.error('[usePosts] Comment error:', error); return null; }
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
      return data;
    } catch (err) { console.error('[usePosts] Comment fatal error:', err); return null; }
  };

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return { posts, loading, error, hasMore, loadMore, createPost, likePost, addComment, refresh: fetchPosts };
}
