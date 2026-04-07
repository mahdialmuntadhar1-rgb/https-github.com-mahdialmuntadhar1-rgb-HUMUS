import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Post, PostComment } from '@/lib/supabase';

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

      let data, error: any, count: number | null;

      if (businessId) {
        // If filtering by business, use the regular query with business filter
        // Note: posts_with_business view already filters by status='active' and businesses.status='approved'
        const result = await supabase
          .from('posts_with_business')
          .select('*', { count: 'exact' })
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .range(from, to);
        
        data = result.data;
        error = result.error;
        count = result.count;
      } else {
        // Use the new get_feed function for better performance
        const result = await supabase
          .rpc('get_feed', { 
            p_limit: PAGE_SIZE, 
            p_offset: from 
          });
        
        data = result.data;
        error = result.error;
        count = null; // RPC function doesn't return count
      }

      if (error) {
        console.error('[usePosts] Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          businessId: businessId || 'none'
        });
        throw error;
      }

      if (data) {
        const mappedPosts: Post[] = data.map((item: any) => ({
          id: item.id,
          businessId: item.business_id,
          content: item.caption, // Schema uses 'caption' not 'content'
          image: item.image_url, // Schema uses 'image_url' not 'image'
          likes: item.likes_count || 0,
          comments: item.comments_count || 0,
          shares: item.shares_count || 0,
          createdAt: new Date(item.created_at),
          authorName: item.business_name, // View provides this directly
          authorAvatar: item.business_logo, // View provides this directly (from businesses.image_url)
          businessName: item.business_name,
          businessCity: item.city,
          businessCategory: item.category,
          businessPhone: item.phone_1,
          businessWhatsapp: item.whatsapp,
          postComments: item.comments || [] // From get_feed function JSONB
        }));

        if (isLoadMore) {
          setPosts(prev => [...prev, ...mappedPosts]);
          setPage(prev => prev + 1);
        } else {
          setPosts(mappedPosts);
        }

        if (count !== null) {
          setHasMore(from + data.length < count);
        } else if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    } catch (err: any) {
      console.error('[usePosts] Error fetching posts:', err);
      console.error('[usePosts] Full error object:', JSON.stringify(err, null, 2));
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

  const createPost = async (caption: string, imageUrl?: string) => {
    if (!businessId) return;
    
    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            business_id: businessId,
            caption,
            image_url: imageUrl,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      
      if (data) {
        // Refresh posts
        fetchPosts();
      }
      return data;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  const likePost = async (postId: string) => {
    try {
      const { error: likeError } = await supabase.rpc('increment_likes', { p_post_id: postId });
      if (likeError) throw likeError;
      
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const addComment = async (postId: string, authorName: string, commentText: string) => {
    try {
      const { data, error: commentError } = await supabase
        .from('post_comments')
        .insert([
          {
            post_id: postId,
            author_name: authorName,
            comment_text: commentText
          }
        ])
        .select()
        .single();

      if (commentError) throw commentError;

      // Update comment count
      await supabase.rpc('increment_comments', { p_post_id: postId });
      
      // Refresh posts to get updated comment count
      fetchPosts();
      
      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { 
    posts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    createPost, 
    likePost, 
    addComment,
    refresh: fetchPosts 
  };
}
