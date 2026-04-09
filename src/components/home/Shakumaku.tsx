import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MapPin, Building2, Share2, ExternalLink, Sparkles, Eye } from 'lucide-react';
import type { ShakumakuPost } from '@/hooks/useShakumaku';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES } from '@/constants';

interface ShakumakuProps {
  posts: ShakumakuPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onLike: (postId: string) => void;
}

// Arabic caption templates for variety
const arabicCaptions = [
  "✨ اكتشفوا {name} في قلب {city}! وجهتكم المثالية للـ {category}.",
  "📍 {name} في {city} - حيث الجودة تلتقي بالتميز! ✨",
  "🔥 تجربة لا تُنسى في {name} - أفضل {category} في {city}!",
  "✨ هل زرتم {name} في {city}؟ وجهة مميزة تستحق الاكتشاف! 🌟",
  "📍 {name} - عنوان التميز في {city} لعشاق {category}.",
  "🔥 مكانكم المفضل في {city}: {name} - تجربة فريدة بانتظاركم!",
  "✨ {name} في {city} - حيث يلتقي الإبداع بالجودة العالية! 🌟",
  "📍 اكتشفوا سر تميز {name} في قلب {city}! ✨",
];

export default function Shakumaku({ posts, loading, error, hasMore, onLoadMore, onLike }: ShakumakuProps) {
  const { language } = useHomeStore();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<ShakumakuPost | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const isRTL = language === 'ar' || language === 'ku';

  // Auto-load more on scroll
  useEffect(() => {
    if (loadMoreRef.current && hasMore && !loading) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        { threshold: 0.5 }
      );
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore]);

  const handleLike = (postId: string) => {
    if (likedPosts.has(postId)) return;
    
    setLikedPosts(prev => new Set(prev).add(postId));
    onLike(postId);
  };

  const getCaption = (post: ShakumakuPost): string => {
    if (post.captionAr) return post.captionAr;
    if (post.caption) return post.caption;
    
    // Generate dynamic caption
    const template = arabicCaptions[Math.floor(Math.random() * arabicCaptions.length)];
    return template
      .replace('{name}', post.businessName || 'هذا المكان')
      .replace('{city}', post.city || post.governorate || 'العراق')
      .replace('{category}', post.category || 'الخدمات');
  };

  const getCategoryIcon = (categoryId?: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || Building2;
  };

  const getFallbackImage = (post: ShakumakuPost): string => {
    if (post.image && !post.image.includes('placeholder')) return post.image;
    
    // Category-based fallbacks
    const categoryImages: Record<string, string> = {
      'dining': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      'cafe': 'https://images.unsplash.com/photo-1501339819398-ed495197ff21?w=800&q=80',
      'hotels': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      'beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
      'medical': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      'hospitals': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      'realestate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
      'events': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
    };
    
    return categoryImages[post.category || ''] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
  };

  const translations = {
    title: {
      en: 'Shaku Maku',
      ar: 'شاكو ماكو',
      ku: 'شاکۆ ماکۆ'
    },
    subtitle: {
      en: 'Discover amazing businesses across Iraq',
      ar: 'اكتشف أماكن رائعة في جميع أنحاء العراق',
      ku: 'شوێنی سەرنجراکێشی عێراق ببینە'
    },
    loading: {
      en: 'Loading more...',
      ar: 'جاري التحميل...',
      ku: 'بارکردن...'
    },
    noPosts: {
      en: 'No posts yet',
      ar: 'لا توجد منشورات بعد',
      ku: 'هێشتا پۆست نیە'
    },
    viewMore: {
      en: 'View Details',
      ar: 'عرض التفاصيل',
      ku: 'بینینی وردەکاری'
    },
    likes: {
      en: 'likes',
      ar: 'إعجاب',
      ku: 'دڵخوازی'
    },
    views: {
      en: 'views',
      ar: 'مشاهدة',
      ku: 'بینین'
    }
  };

  // Show error state
  if (error && posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-500 font-bold mb-2">Feed Error</p>
        <p className="text-slate-400 text-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-bg-dark text-white rounded-lg text-sm font-bold"
        >
          Retry
        </button>
        <p className="text-slate-400 text-xs mt-4">Check browser console (F12) for details</p>
      </div>
    );
  }

  if (loading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-bg-dark uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {translations.title[language]}
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
            {translations.subtitle[language]}
          </p>
        </div>
      </div>

      {/* Masonry Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold">
            {translations.noPosts[language]}
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Check browser console (F12) for connection details
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => {
              const isLiked = likedPosts.has(post.id);
              const CategoryIcon = getCategoryIcon(post.category);
              const displayCaption = getCaption(post);
              const imageUrl = getFallbackImage(post);

              return (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: (index % 8) * 0.05 }}
                  className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer ${
                    post.isFeatured ? 'ring-2 ring-primary' : ''
                  } ${index % 7 === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
                  onClick={() => setSelectedPost(post)}
                >
                  {/* Image Container - 1:1 Aspect Ratio for most, varied for featured */}
                  <div className={`relative overflow-hidden ${
                    index % 7 === 0 ? 'aspect-square' : 'aspect-[3/4]'
                  }`}>
                    <img
                      src={imageUrl}
                      alt={post.businessName || ''}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                    {/* Featured Badge */}
                    {post.isFeatured && (
                      <div className="absolute top-3 left-3 bg-primary text-bg-dark px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg">
                        ⭐ Featured
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CategoryIcon className="w-3 h-3" />
                      {post.category || 'Business'}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      {/* Location */}
                      {(post.city || post.governorate) && (
                        <div className="flex items-center gap-1 text-white/80 text-[10px] font-bold uppercase tracking-wider mb-2">
                          <MapPin className="w-3 h-3" />
                          {post.city || post.governorate}
                          {post.neighborhood && ` • ${post.neighborhood}`}
                        </div>
                      )}

                      {/* Business Name */}
                      <h3 className="text-white font-black text-lg leading-tight mb-2 line-clamp-1">
                        {post.businessName || 'Business'}
                      </h3>

                      {/* Arabic Caption */}
                      <p className="text-white/90 text-[11px] leading-relaxed line-clamp-2 mb-3 font-medium" dir="rtl">
                        {displayCaption}
                      </p>

                      {/* Stats & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white/70 text-[10px] font-bold">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likes + (isLiked ? 1 : 0)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                          className={`p-2 rounded-full transition-all ${
                            isLiked 
                              ? 'bg-red-500 text-white scale-110' 
                              : 'bg-white/20 text-white hover:bg-white/40'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Load More Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              {translations.loading[language]}
            </div>
          )}
        </div>
      )}

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <PostDetailModal 
            post={selectedPost} 
            onClose={() => setSelectedPost(null)} 
            onLike={handleLike}
            isLiked={likedPosts.has(selectedPost.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Post Detail Modal Component
function PostDetailModal({ 
  post, 
  onClose, 
  onLike,
  isLiked 
}: { 
  post: ShakumakuPost; 
  onClose: () => void;
  onLike: (id: string) => void;
  isLiked: boolean;
}) {
  const { language } = useHomeStore();
  const CategoryIcon = CATEGORIES.find(c => c.id === post.category)?.icon || Building2;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const translations = {
    viewOnMap: {
      en: 'View on Map',
      ar: 'عرض على الخريطة',
      ku: 'لە نەخشەدا ببینە'
    },
    callNow: {
      en: 'Call Now',
      ar: 'اتصل الآن',
      ku: 'ئێستا پەیوەندی بکە'
    },
    close: {
      en: 'Close',
      ar: 'إغلاق',
      ku: 'داخستن'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative aspect-square">
          <img
            src={post.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
            alt={post.businessName || ''}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            ✕
          </button>

          {/* Category Badge */}
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CategoryIcon className="w-3.5 h-3.5" />
            {post.category || 'Business'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Location */}
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-primary" />
            {post.city || post.governorate || 'Iraq'}
            {post.neighborhood && ` • ${post.neighborhood}`}
          </div>

          {/* Business Name */}
          <h2 className="text-2xl font-black text-bg-dark leading-tight">
            {post.businessName || 'Business'}
          </h2>

          {/* Arabic Caption */}
          <p className="text-slate-600 text-base leading-relaxed" dir="rtl">
            {post.captionAr || post.caption}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 py-4 border-y border-slate-100">
            <div className="flex items-center gap-2 text-slate-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-bold">{post.views || 0} views</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-bold">{post.likes + (isLiked ? 1 : 0)} likes</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onLike(post.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </button>

            {post.phone && (
              <a
                href={`tel:${post.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-bg-dark text-white rounded-xl font-bold text-sm hover:bg-primary hover:text-bg-dark transition-all"
              >
                {translations.callNow[language]}
              </a>
            )}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
          >
            {translations.close[language]}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
