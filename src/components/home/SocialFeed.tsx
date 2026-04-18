import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Heart, MessageCircle, Share2, MapPin, MoreHorizontal, Bookmark, ArrowRight, Loader2, Eye, Star, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';
import { usePosts } from '@/hooks/usePosts';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useBuildMode } from '@/hooks/useBuildMode';
import { Business, Post } from '@/lib/supabase';
import EditablePost from '@/components/buildMode/EditablePost';

import { useAuth } from '@/hooks/useAuth';
import { useBuildMode } from '@/hooks/useBuildMode';

const formatMetric = (num: number) => {
  return num.toString();
};

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface SocialFeedProps {
  onBusinessClick?: (business: Business) => void;
}

// Fake post templates removed - use only real posts from Supabase

export default function SocialFeed({ onBusinessClick }: SocialFeedProps) {
  const { language } = useHomeStore();
  const { user } = useAuth();
  const { isBuildModeEnabled } = useBuildMode();
  const { posts: realPosts, loading: postsLoading, error, hasMore, loadMore, likePost, createPost, addComment, fetchComments, refresh: fetchPosts } = usePosts();
  const { businesses, featuredBusinesses, loading: bizLoading } = useBusinesses("");
  const [feedType, setFeedType] = React.useState<'recent' | 'trending'>('recent');
  const [activeComments, setActiveComments] = React.useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});
  const [showComments, setShowComments] = React.useState<Record<string, boolean>>({});
  const [displayPosts, setDisplayPosts] = React.useState<Post[]>([]);

  const isRTL = language === 'ar' || language === 'ku';

  // Update display posts when real posts change
  React.useEffect(() => {
    setDisplayPosts(realPosts);
  }, [realPosts]);

  const handleLike = async (postId: string) => {
    if (postId.length > 20) return; // Skip for build mode items
    await likePost(postId, user?.id);
  };

  const handleComment = async (postId: string) => {
    if (!user) {
      alert(language === 'ar' ? 'يرجى تسجيل الدخول للتعليق' : 'Please login to comment');
      return;
    }
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      await addComment(postId, user.id, content);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      // Refresh comments
      const comments = await fetchComments(postId);
      setActiveComments(prev => ({ ...prev, [postId]: comments }));
    } catch (err) {
      // Failed to add comment - handled silently
    }
  };

  const toggleComments = async (postId: string) => {
    const isShowing = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: isShowing }));
    
    if (isShowing && !activeComments[postId]) {
      try {
        const comments = await fetchComments(postId);
        setActiveComments(prev => ({ ...prev, [postId]: comments }));
      } catch (err) {
        // Failed to fetch comments - handled silently
      }
    }
  };

  React.useEffect(() => {
    const refresh = async () => {
      await fetchPosts(false, feedType === 'trending');
    };
    refresh();
  }, [feedType, fetchPosts]);

  // Fake post auto-seeding removed - use only real posts from Supabase

  const handlePostUpdate = (updatedPost: Post) => {
    if (updatedPost.id === '') {
      // Post was deleted
      setDisplayPosts(prev => prev.filter(p => p.id !== updatedPost.id));
    } else {
      // Post was updated
      setDisplayPosts(prev =>
        prev.map(p => p.id === updatedPost.id ? updatedPost : p)
      );
    }
  };

  const isLoading = postsLoading || (realPosts.length === 0 && bizLoading);

  if (isLoading && displayPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          {language === 'ar' ? 'جاري تحميل المنشورات...' : 'Loading posts...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest"
        >
          {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  if (displayPosts.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100">
          <MessageCircle className="w-10 h-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-black text-bg-dark mb-2">
          {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
        </h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          {language === 'ar' ? 'كن أول من يشارك تحديثات أعماله هنا.' : 'Be the first to share business updates here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-12">
      {/* Feed Header & Toggle */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-20 h-20 bg-[#C8A96A]/10 rounded-[40px] flex items-center justify-center text-[#C8A96A] mb-6 shadow-inner border border-[#C8A96A]/20">
          <Smartphone className="w-10 h-10" />
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-[#111827] poppins-bold uppercase tracking-tighter">
          {language === 'ar' ? 'شكو ماكو' : 'Shaku Maku'}
        </h2>
        
        <div className="flex bg-white p-1 rounded-2xl mt-8 border border-slate-200 shadow-sm">
          <button
            onClick={() => setFeedType('recent')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              feedType === 'recent' ? 'bg-[#0F7B6C] text-white shadow-md' : 'text-slate-400 hover:text-[#0F7B6C]'
            }`}
          >
            {language === 'ar' ? 'الأحدث' : 'Recent'}
          </button>
          <button
            onClick={() => setFeedType('trending')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              feedType === 'trending' ? 'bg-[#0F7B6C] text-white shadow-md' : 'text-slate-400 hover:text-[#0F7B6C]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {language === 'ar' ? 'الرائج' : 'Trending'}
          </button>
        </div>
      </div>

      {displayPosts.map((post) => (
        <EditablePost
          post={post}
          onUpdate={handlePostUpdate}
        >
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden group"
          >
          {/* Post Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onBusinessClick?.({ id: post.businessId, name: post.authorName } as any)}
                className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shadow-inner hover:rotate-6 transition-all"
              >
                {post.authorAvatar ? (
                  <img 
                    src={post.authorAvatar} 
                    alt={post.authorName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#0F7B6C] text-white font-black text-lg">
                    {post.authorName?.charAt(0) || 'B'}
                  </div>
                )}
              </button>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onBusinessClick?.({ id: post.businessId, name: post.authorName } as any)}
                    className="text-lg font-black text-[#111827] poppins-bold leading-none hover:text-[#0F7B6C] transition-colors"
                  >
                    {post.authorName}
                  </button>
                  {((post as any).isVerified || (post as any).isHotel) && (
                    <ShieldCheck className="w-4 h-4 text-[#0F7B6C]" />
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                  {new Date(post.createdAt).toLocaleDateString(language === 'ar' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <button className="p-2 text-slate-300 hover:text-[#111827] transition-colors">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          {/* Post Image */}
          {post.image && (
            <div className="aspect-square bg-slate-50 relative overflow-hidden">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          )}

          {/* Post Actions */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2.5 group/btn"
                >
                  <Heart className={`w-7 h-7 transition-all ${post.likes > 500 ? 'fill-red-500 text-red-500' : 'text-[#111827] group-hover/btn:text-red-500'}`} />
                  <span className="text-sm font-black text-[#111827]">{formatMetric(post.likes)}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2.5 group/btn"
                >
                  <MessageCircle className="w-7 h-7 text-[#111827] group-hover/btn:text-[#0F7B6C] transition-colors" />
                  <span className="text-sm font-black text-[#111827]">12</span>
                </button>
                <button className="group/btn">
                  <Share2 className="w-7 h-7 text-[#111827] group-hover/btn:text-[#0F7B6C] transition-colors" />
                </button>
              </div>
              <Bookmark className="w-7 h-7 text-slate-300 hover:text-[#C8A96A] transition-colors cursor-pointer" />
            </div>

            {/* Caption */}
            <div className="space-y-3 mb-10">
              <p className="text-base sm:text-lg text-[#111827] leading-relaxed font-medium">
                <span className="font-black mr-2">{post.authorName}</span>
                {post.content}
              </p>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => onBusinessClick?.({ id: post.businessId, name: post.authorName } as any)}
              className="w-full py-5 bg-slate-50 text-[#0F7B6C] border border-slate-100 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-[#0F7B6C] hover:text-white transition-all shadow-sm"
            >
              <span>{language === 'ar' ? 'زيارة الملف الشخصي' : 'Visit Profile'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          </motion.div>
        </EditablePost>
      ))}

      {/* End of Feed */}
      {hasMore && realPosts.length > 0 ? (
        <div className="flex justify-center pt-8 pb-12">
          <button 
            onClick={loadMore}
            disabled={postsLoading}
            className="px-12 py-5 bg-white border-2 border-slate-100 text-bg-dark font-black rounded-2xl hover:border-accent hover:text-bg-dark transition-all shadow-premium uppercase tracking-[0.2em] text-[12px] flex items-center gap-4 group disabled:opacity-50"
          >
            {postsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
            {language === 'en' ? 'Load More Posts' : 'تحميل المزيد من المنشورات'}
          </button>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            {language === 'ar' ? 'لقد شاهدت كل شيء' : language === 'ku' ? 'هەموو پۆستەکانت بینی' : 'You\'re all caught up'}
          </p>
        </div>
      )}

      {/* Testimony Section */}
      <div className="space-y-8 mt-20">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-black text-primary poppins-bold uppercase tracking-tighter">
            {language === 'ar' ? 'ماذا يقول مستخدمونا' : language === 'ku' ? 'بەکارهێنەرانمان چی دەڵێن' : 'What Our Users Say'}
          </h3>
          <div className="w-12 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary text-white p-10 rounded-[40px] shadow-premium relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-bg-dark text-2xl font-black poppins-bold">“</span>
              </div>
              <p className="text-base font-medium leading-relaxed mb-8 italic poppins-medium opacity-90">
                {language === 'ar' 
                  ? '"شكو ماكو هو التطبيق الوحيد اللي خلاني أكتشف أماكن في بلدي ما كنت أعرفها. التصميم والسهولة في الاستخدام يخليه التطبيق المفضل عندي يومياً."'
                  : language === 'ku'
                  ? '"چی هەیە چی نیە تەنها ئەپڵیکەیشنە کە وای لێکردم شوێنەکان لە وڵاتەکەمدا بدۆزمەوە کە نەمدەزانی. ديزاين و ئاسانی بەکارهێنان وای لێدەکات ببێتة ئەپڵیکەيشني دڵخوازی من ڕۆژانە."'
                  : '"Shaku Maku is the only app that made me discover places in my country I never knew existed. The design and ease of use make it my favorite daily app."'}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-accent overflow-hidden shadow-md">
                  <img src="https://picsum.photos/seed/user1/100/100" alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-black text-accent uppercase tracking-widest text-[10px]">
                    {language === 'ar' ? 'أحمد الجبوري' : language === 'ku' ? 'ئەحمەد جەبوری' : 'Ahmed Al-Jubouri'}
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {language === 'ar' ? 'مستخدم مخلص من بغداد' : language === 'ku' ? 'بەکارهێنەرێکی دڵسۆز لە بەغداوە' : 'Loyal User from Baghdad'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-slate-100 p-10 rounded-[40px] shadow-premium relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <span className="text-primary text-2xl font-black poppins-bold">“</span>
              </div>
              <p className="text-base font-medium leading-relaxed mb-8 italic poppins-medium text-slate-600">
                {language === 'ar' 
                  ? '"أفضل دليل سياحي وتجاري في العراق. ساعدني هواية في ترتيب رحلتي لأربيل ولقيت أحلى الفنادق والمطاعم بكل سهولة."'
                  : language === 'ku'
                  ? '"باشترین ڕێبەری گەشتیاری و بازرگانی لە عێراق. زۆر يارمەتیدەرم بوو لە ڕێکخستنی گەشتەکەم بۆ هەولێر و باشترین هۆتێل و چێشتخانەکانم بە ئاسانی دۆزییەوە."'
                  : '"The best travel and business guide in Iraq. It helped me a lot in organizing my trip to Erbil and I found the best hotels and restaurants with ease."'}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-accent overflow-hidden shadow-md">
                  <img src="https://picsum.photos/seed/user2/100/100" alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-black text-primary uppercase tracking-widest text-[10px]">
                    {language === 'ar' ? 'سارة الكردي' : language === 'ku' ? 'سارە کوردی' : 'Sara Al-Kurdi'}
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {language === 'ar' ? 'مسافرة من البصرة' : language === 'ku' ? 'گەشتیار لە بەسرەوە' : 'Traveler from Basra'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
