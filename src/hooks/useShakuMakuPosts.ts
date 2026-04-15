import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface ShakuMakuPost {
  id: string;
  businessId: string;
  content: string;
  caption: string;
  image_url: string;
  imageUrl: string;
  likes: number;
  created_at: string;
  businessName?: string;
  business?: {
    id: string;
    name: string;
    nameAr?: string;
    nameKu?: string;
    category: string;
    city: string;
    governorate: string;
  };
  is_demo?: boolean;
}

export interface Business {
  id: string;
  name: string;
  nameAr?: string;
  nameKu?: string;
  category: string;
  city: string;
  governorate: string;
}

export function useShakuMakuPosts() {
  const [posts, setPosts] = useState<ShakuMakuPost[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all posts with business details
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *,
          business:businesses(id, name, name_ar, name_ku, category, city, governorate)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('[ShakuMaku] Fetch error:', fetchError);
        setError(`Failed to fetch posts: ${fetchError.message}`);
        return;
      }

      setPosts(data || []);
    } catch (err) {
      console.error('[ShakuMaku] Exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch businesses for dropdown
  const fetchBusinesses = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('id, name, name_ar, name_ku, category, city, governorate')
        .order('name', { ascending: true })
        .limit(500);

      if (fetchError) {
        console.error('[ShakuMaku] Businesses fetch error:', fetchError);
        return;
      }

      setBusinesses(data || []);
    } catch (err) {
      console.error('[ShakuMaku] Businesses exception:', err);
    }
  };

  // Create new post
  const createPost = async (businessId: string, caption: string, imageUrl: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Get business name
      const business = businesses.find(b => b.id === businessId);
      const businessName = business?.name || 'Business';

      const { error: insertError } = await supabase
        .from('posts')
        .insert([{
          businessId,
          content: caption,
          caption,
          image_url: imageUrl,
          imageUrl,
          likes: 0,
          businessName,
          is_demo: false,
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('[ShakuMaku] Create error:', insertError);
        setError(`Failed to create post: ${insertError.message}`);
        return false;
      }

      console.log('[ShakuMaku] ✓ Post created successfully');
      await fetchPosts();
      return true;
    } catch (err) {
      console.error('[ShakuMaku] Create exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to create post';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update post
  const updatePost = async (postId: string, caption: string, imageUrl: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          content: caption,
          caption,
          image_url: imageUrl,
          imageUrl
        })
        .eq('id', postId);

      if (updateError) {
        console.error('[ShakuMaku] Update error:', updateError);
        setError(`Failed to update post: ${updateError.message}`);
        return false;
      }

      console.log('[ShakuMaku] ✓ Post updated successfully');
      await fetchPosts();
      return true;
    } catch (err) {
      console.error('[ShakuMaku] Update exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to update post';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const deletePost = async (postId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (deleteError) {
        console.error('[ShakuMaku] Delete error:', deleteError);
        setError(`Failed to delete post: ${deleteError.message}`);
        return false;
      }

      console.log('[ShakuMaku] ✓ Post deleted successfully');
      await fetchPosts();
      return true;
    } catch (err) {
      console.error('[ShakuMaku] Delete exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete all demo posts
  const deleteDemoPosts = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('is_demo', true);

      if (deleteError) {
        console.error('[ShakuMaku] Delete demo error:', deleteError);
        setError(`Failed to delete demo posts: ${deleteError.message}`);
        return false;
      }

      console.log('[ShakuMaku] ✓ Demo posts deleted successfully');
      await fetchPosts();
      return true;
    } catch (err) {
      console.error('[ShakuMaku] Delete demo exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete demo posts';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create demo posts with Arabic captions by category
  const createDemoPosts = async (count: number, mixedCategory: boolean = false): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const demoCaptions: Record<string, string[]> = {
        restaurants: [
          'أفضل مطعم في بغداد! 🍽️',
          'تجربة طعام عراقية أصيلة 🥘',
          'أشهى المأكولات العراقية 🍲',
          'مطعم عائلي مميز 👨‍👩‍👧‍👦',
          'أجواء رائعة ومأكولات لذيذة ✨',
          'مطبخ عراقي تقليدي 🇮🇶',
          'وجبات غداء مميزة 🍱',
          'أفضل الكباب في المدينة 🥙',
          'مأكولات شعبية عراقية 🌶️',
          'طعام طازج يومياً 🥬'
        ],
        cafes: [
          'قهوة عربية أصلية ☕',
          'مقهى هادئ ومريح 📚',
          'أفضل القهوة في بغداد 🌟',
          'أجواء جميلة للدراسة 📖',
          'حلويات عراقية تقليدية 🍰',
          'مقهى عائلي مميز 👨‍👩‍👧‍👦',
          'قهوة تركية فاخرة ☕',
          'أجواء مسائية جميلة 🌙',
          'حلويات ومخبوزات طازجة 🥐',
          'مكان مثالي للاجتماعات 💼'
        ],
        hotels: [
          'فندق فاخر في قلب بغداد 🏨',
          'إقامة مريحة وخدمة مميز️',
          'غرف نظيفة وأجواء جميلة ✨',
          'أفضل فندق في المدينة 🌟',
          'خدمة استقبال ممتاز 🛎️',
          'إفطار متنوع ولذيذ 🍳',
          'مكان مثالي للإقامة 📍',
          'فندق عائلي مميز 👨‍👩‍👧‍👦',
          'خدمة غرف على مدار الساعة 🕐',
          'أجواء راقية وفاخرة 💎'
        ],
        pharmacies: [
          'صيدلية موثوقة 💊',
          'أفضل الأدوية والمستحضرات 🏥',
          'خدمة صيدلية ممتاز️',
          'أدوية أصلية بأسعار مناسبة 💰',
          'صيدلية على مدار الساعة 🕐',
          'استشارات دوائية مجانية 💬',
          'أدوية طبيعية ومكملات 🌿',
          'خدمة توصيل سريعة 🚗',
          'أدوية للأطفال والرضع 👶',
          'أجهزة طبية ومستلزمات 🩺'
        ],
        beauty: [
          'صالون تجميل مميز 💇‍♀️',
          'أفضل قصات الشعر في المدينة ✂️',
          'خدمة تجميل شاملة 💅',
          'مكياج احترافي 💄',
          'عناية بالبشرة والوجه 🧴',
          'صالون عائلي مميز 👨‍👩‍👧‍👦',
          'أفضل العطور والمنتجات 🌸',
          'خدمة سبا واسترخاء 🧖‍♀️',
          'عناية بالشعر والجسم 💆',
          'مكان مميز للسيدات 👩'
        ],
        shops: [
          'متجر متنوع ومنتجات مميز️',
          'أفضل الأسعار في المدينة 💰',
          'منتجات عالية الجودة 🌟',
          'تسوق سهل ومريح 🛍️',
          'خدمة عملاء ممتاز️',
          'عروض وتخفيضات مميز️',
          'منتجات محلية وأجنبية 🌍',
          'متجر عائلي مميز 👨‍👩‍👧‍👦',
          'خدمة توصيل سريعة 🚗',
          'تجربة تسوق فريدة ✨'
        ]
      };

      const demoImages = [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'
      ];

      const demoPosts = [];

      for (let i = 0; i < count; i++) {
        let category: string;
        if (mixedCategory) {
          const categories = Object.keys(demoCaptions);
          category = categories[Math.floor(Math.random() * categories.length)];
        } else {
          category = 'restaurants';
        }

        const captions = demoCaptions[category];
        const caption = captions[Math.floor(Math.random() * captions.length)];
        const imageUrl = demoImages[Math.floor(Math.random() * demoImages.length)];

        // Get a random business from the same category
        const categoryBusinesses = businesses.filter(b => 
          b.category.toLowerCase() === category.toLowerCase()
        );
        
        const business = categoryBusinesses.length > 0 
          ? categoryBusinesses[Math.floor(Math.random() * categoryBusinesses.length)]
          : businesses[Math.floor(Math.random() * businesses.length)];

        if (business) {
          demoPosts.push({
            businessId: business.id,
            content: caption,
            caption,
            image_url: imageUrl,
            imageUrl,
            likes: Math.floor(Math.random() * 100),
            businessName: business.name,
            is_demo: true,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
          });
        }
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert(demoPosts);

      if (insertError) {
        console.error('[ShakuMaku] Create demo error:', insertError);
        setError(`Failed to create demo posts: ${insertError.message}`);
        return false;
      }

      console.log(`[ShakuMaku] ✓ Created ${count} demo posts successfully`);
      await fetchPosts();
      return true;
    } catch (err) {
      console.error('[ShakuMaku] Create demo exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to create demo posts';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchPosts();
    fetchBusinesses();
  }, []);

  return {
    posts,
    businesses,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    deleteDemoPosts,
    createDemoPosts
  };
}
