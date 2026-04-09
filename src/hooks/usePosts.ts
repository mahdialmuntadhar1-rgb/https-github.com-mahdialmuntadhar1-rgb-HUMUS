import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Post } from '@/lib/supabase';

export function usePosts(businessId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchPosts = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setPage(0);
    }
    setError(null);
    try {
      const from = isLoadMore ? (page + 1) * PAGE_SIZE : 0;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('shakumaku_posts')
        .select(`
          *,
          businesses (
            name,
            "nameAr",
            city,
            category,
            governorate,
            phone,
            "imageUrl"
          )
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      if (data) {
        const mappedPosts: Post[] = data.map((item: any) => {
          const biz = item.businesses || {};
          return {
            id: item.id,
            businessId: String(item.business_id),
            content: item.caption_ar || item.caption,
            image: item.image_url || biz.imageUrl,
            likes: item.likes_count || 0,
            createdAt: new Date(item.created_at),
            authorName: biz.nameAr || biz.name,
            authorAvatar: null,
            city: biz.city || biz.governorate,
            category: biz.category,
            governorate: biz.governorate
          };
        });

        if (isLoadMore) {
          setPosts(prev => [...prev, ...mappedPosts]);
          setPage(prev => prev + 1);
        } else {
          setPosts(mappedPosts);
        }

        if (count !== null) {
          setHasMore(from + data.length < count);
        }
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [businessId, page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(true);
    }
  };

  const createPost = async (content: string, imageUrl?: string) => {
    if (!businessId) return;
    
    try {
      const { data, error: insertError } = await supabase
        .from('shakumaku_posts')
        .insert([
          {
            business_id: String(businessId),
            caption: content,
            caption_ar: content,
            image_url: imageUrl,
            likes_count: 0,
            is_active: true
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      
      if (data) {
        // Refresh posts
        fetchPosts();
      }
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  const likePost = async (postId: string) => {
    try {
      const { error: likeError } = await supabase
        .from('shakumaku_posts')
        .update({ likes_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', postId);
      
      if (likeError) {
        // Fallback: just update local state
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      } else {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (err) {
      console.error('Error liking post:', err);
      // Still update UI optimistically
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, hasMore, loadMore, createPost, likePost, refresh: fetchPosts };
}
