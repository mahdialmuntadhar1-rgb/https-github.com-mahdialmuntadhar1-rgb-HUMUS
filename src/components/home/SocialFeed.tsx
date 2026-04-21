import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  ImagePlus, 
  Trash2, 
  Edit3, 
  Send,
  Camera,
  Smartphone
} from 'lucide-react';
import { useLocalBuildStore, MockPost } from '@/stores/localBuildStore';
import { useHomeStore } from '@/stores/homeStore';

export default function SocialFeed() {
  const { language } = useHomeStore();
  const { posts, isBuildMode, addPost, updatePost, deletePost } = useLocalBuildStore();
  
  const [newCaption, setNewCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleCreatePost = () => {
    if (!newCaption) return;
    addPost({
      caption_ar: newCaption,
      image_url: selectedImage || 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1200&auto=format&fit=crop',
      business_name: 'Shaku Maku User'
    });
    setNewCaption('');
    setSelectedImage(null);
  };

  const handleImageUpload = (id: string | null = null) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        if (id) {
          updatePost(id, { image_url: url });
        } else {
          setSelectedImage(url);
        }
      }
    };
    input.click();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-12">
      {/* Post Creator Box */}
      <div className="bg-white rounded-[40px] p-6 shadow-2xl border border-slate-100 mb-12">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder={language === 'ar' ? 'ماذا يدور في ذهنك؟' : 'What is on your mind?'}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 resize-none h-24 transition-all"
            />
            
            {selectedImage && (
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <img src={selectedImage} className="w-full h-full object-cover" alt="Draft" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => handleImageUpload()}
                className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold"
              >
                <ImagePlus className="w-5 h-5" />
                {language === 'ar' ? 'إضافة صورة' : 'Add Image'}
              </button>
              
              <button
                onClick={handleCreatePost}
                disabled={!newCaption}
                className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {language === 'ar' ? 'نشر' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-12">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden group/post relative"
            >
              {/* Build Mode Overlays */}
              {isBuildMode && (
                <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover/post:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleImageUpload(post.id)}
                    className="p-2.5 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-600 hover:text-primary hover:scale-110 transition-all"
                    title="Replace Image"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      const newCap = prompt('Edit Caption:', post.caption_ar);
                      if (newCap) updatePost(post.id, { caption_ar: newCap });
                    }}
                    className="p-2.5 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-600 hover:text-primary hover:scale-110 transition-all"
                    title="Edit Caption"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deletePost(post.id)}
                    className="p-2.5 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-600 hover:text-red-500 hover:scale-110 transition-all"
                    title="Delete Post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Post Header */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-bg-dark font-black text-lg">
                    {post.business_name?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="font-black text-[#111827] poppins-bold uppercase tracking-tight leading-none mb-1">
                      {post.business_name || 'Shaku Maku User'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-[#111827] transition-colors">
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>

              {/* Post Image */}
              <div className="aspect-square bg-slate-50 relative overflow-hidden">
                <img
                  src={post.image_url}
                  alt="Post"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover/post:scale-105"
                />
              </div>

              {/* Post Content */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <Heart className="w-7 h-7 text-[#111827] hover:text-red-500 hover:fill-red-500 transition-all cursor-pointer" />
                    <MessageCircle className="w-7 h-7 text-[#111827] hover:text-primary transition-all cursor-pointer" />
                    <Share2 className="w-7 h-7 text-[#111827] hover:text-primary transition-all cursor-pointer" />
                  </div>
                  <Bookmark className="w-7 h-7 text-slate-300 hover:text-accent transition-all cursor-pointer" />
                </div>

                <p className="text-lg text-[#111827] leading-relaxed font-medium">
                  {post.caption_ar}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
