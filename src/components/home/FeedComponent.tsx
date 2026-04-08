import { useMemo, useState } from "react";
import { Heart, MessageCircle, Share2, Clock, Phone, MessageSquareText } from "lucide-react";
import { motion } from "motion/react";
import type { Business } from "@/lib/supabase";
import { usePosts } from "@/hooks/usePosts";
import { useAuthStore } from "@/stores/authStore";
import { useHomeStore } from "@/stores/homeStore";
import { CATEGORIES } from "@/constants";

interface FeedComponentProps {
  businesses: Business[];
  loading: boolean;
}

const ARABIC_COMMENTS = [
  'الله يوفقكم، خدمة ممتازة 👏',
  'موقعكم قريب منا؟ نحتاج التفاصيل.',
  'تعامل راقي وأسعار مناسبة 🌟',
  'متى أوقات الدوام اليوم؟',
  'جربنا المكان وكان مرتب جداً.',
  'عاشت الأيادي، جودة واضحة.',
];

const getCategoryName = (category: string, language: 'en' | 'ar' | 'ku') => {
  return CATEGORIES.find((c) => c.id === category)?.name[language] || category || 'General';
};

const getFallbackImage = (category?: string) => {
  const fallback = CATEGORIES.find((c) => c.id === category)?.image;
  return fallback || 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&q=80';
};

const deriveCaption = (biz: Business, language: 'en' | 'ar' | 'ku') => {
  const category = biz.category || 'general';
  const city = biz.city || biz.governorate || 'العراق';

  if (language === 'ar') {
    return `📍 ${biz.name} في ${city} — ${getCategoryName(category, language)}. متوفر اليوم مع خدمة سريعة وتعامل محترم. تواصلوا مباشرة للحجز أو الاستفسار.`;
  }

  return `${biz.name} in ${city} is active today in ${getCategoryName(category, language)}. Reach out directly for details and offers.`;
};

export default function FeedComponent({ businesses, loading: businessesLoading }: FeedComponentProps) {
  const { posts, loading: postsLoading, likePost } = usePosts();
  const { user } = useAuthStore();
  const { language } = useHomeStore();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return language === 'ar' ? 'الآن' : 'Just now';
    if (hours < 24) return language === 'ar' ? `قبل ${hours} س` : `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const derivedPosts = useMemo(() => {
    const shuffled = [...businesses]
      .filter((b) => b.name)
      .sort((a, b) => `${a.governorate}${a.city}`.localeCompare(`${b.governorate}${b.city}`));

    return shuffled.slice(0, 18).map((biz, index) => ({
      id: `derived-${biz.id}-${index}`,
      businessId: biz.id,
      content: deriveCaption(biz, language),
      image: biz.image || getFallbackImage(biz.category),
      createdAt: new Date(Date.now() - index * 60 * 60 * 1000),
      likes: 8 + ((index * 7) % 33),
      comments: 2 + (index % 4),
      shares: 1 + (index % 6),
      authorName: biz.name,
      authorAvatar: biz.image,
      businessCity: biz.city,
      businessCategory: biz.category,
      businessPhone: biz.phone,
      businessWhatsapp: biz.socialLinks?.whatsapp,
      postComments: ARABIC_COMMENTS.slice(0, 2 + (index % 2)).map((text, i) => ({
        id: `${biz.id}-comment-${i}`,
        postId: `derived-${biz.id}-${index}`,
        authorName: ['علي', 'زهراء', 'أحمد', 'مريم', 'حيدر', 'سارة'][i],
        commentText: text,
        createdAt: new Date(),
      })),
    }));
  }, [businesses, language]);

  const displayPosts = posts.length > 0 ? posts : derivedPosts;

  const handleLike = async (postId: string) => {
    if (!user) return;
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    if (!postId.startsWith('derived-')) await likePost(postId);
  };

  if (businessesLoading || postsLoading) {
    return <div className="py-12 text-center text-slate-500">{language === 'ar' ? 'جاري تحميل المنشورات...' : 'Loading feed...'}</div>;
  }

  if (!displayPosts.length) {
    return <div className="py-12 text-center text-slate-500">{language === 'ar' ? 'لا توجد منشورات حالياً' : 'No feed items yet'}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-8 pb-32">
      <div className="space-y-5">
        {displayPosts.map((post, idx) => {
          const business = businesses.find((b) => b.id === post.businessId);
          const phone = post.businessPhone || business?.phone;
          const whatsapp = post.businessWhatsapp || business?.socialLinks?.whatsapp;
          const category = getCategoryName(post.businessCategory || business?.category || 'general', language);

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <img src={post.authorAvatar || getFallbackImage(business?.category)} className="h-11 w-11 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-slate-900">{post.authorName || business?.name || 'Business'}</h3>
                    <p className="text-xs text-slate-500">{category} • {post.businessCity || business?.city || business?.governorate || 'Iraq'}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" />{formatTimestamp(post.createdAt)}</div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-700">{post.content}</p>
              </div>

              <img src={post.image || getFallbackImage(business?.category)} className="h-52 w-full object-cover" referrerPolicy="no-referrer" />

              <div className="p-4 sm:p-5 border-t border-slate-100">
                <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold">
                  <button onClick={() => handleLike(post.id)} className="inline-flex items-center gap-1 hover:text-rose-600"><Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-rose-500 text-rose-500' : ''}`} />{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</button>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post.comments}</span>
                  <span className="inline-flex items-center gap-1"><Share2 className="w-4 h-4" />{post.shares}</span>
                </div>

                {(post.postComments || []).length > 0 && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                    {(post.postComments || []).slice(0, 2).map((comment, cidx) => (
                      <p key={comment.id || cidx} className="mb-1 text-slate-700"><span className="font-bold">{comment.authorName}:</span> {comment.commentText}</p>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  {phone && <a href={`tel:${phone}`} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"><Phone className="w-3.5 h-3.5" />Call</a>}
                  {whatsapp && <a href={`https://wa.me/${String(whatsapp).replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><MessageSquareText className="w-3.5 h-3.5" />WhatsApp</a>}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
