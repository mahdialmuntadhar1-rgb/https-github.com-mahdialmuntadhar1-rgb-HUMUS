import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Edit2, Trash2, Plus, Eye, EyeOff, Star, Search, 
  Save, X, Image as ImageIcon, ChevronLeft, Check 
} from 'lucide-react';
import { useShakumakuAdmin, type ShakumakuPost } from '@/hooks/useShakumaku';
import { useHomeStore } from '@/stores/homeStore';

interface ShakumakuAdminProps {
  onClose?: () => void;
}

export default function ShakumakuAdmin({ onClose }: ShakumakuAdminProps) {
  const { posts, loading, fetchAllPosts, updatePost, deletePost, createPost } = useShakumakuAdmin();
  const { language } = useHomeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPost, setEditingPost] = useState<ShakumakuPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? post.isActive :
      filter === 'inactive' ? !post.isActive :
      filter === 'featured' ? post.isFeatured : true;
    
    return matchesSearch && matchesFilter;
  });

  const handleSave = async (postId: string, updates: Partial<ShakumakuPost>) => {
    const result = await updatePost(postId, updates);
    if (result.success) {
      setEditingPost(null);
    } else {
      alert('Failed to update: ' + result.error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    const result = await deletePost(postId);
    if (!result.success) {
      alert('Failed to delete: ' + result.error);
    }
  };

  const handleToggleActive = async (post: ShakumakuPost) => {
    await handleSave(post.id, { isActive: !post.isActive });
  };

  const handleToggleFeatured = async (post: ShakumakuPost) => {
    await handleSave(post.id, { isFeatured: !post.isFeatured });
  };

  const translations = {
    title: {
      en: 'Shakumaku Admin',
      ar: 'إدارة شاكو ماكو',
      ku: 'بەرێوەبردنی شاکۆ ماکۆ'
    },
    search: {
      en: 'Search posts...',
      ar: 'البحث في المنشورات...',
      ku: 'گەڕانی پۆستەکان...'
    },
    all: {
      en: 'All',
      ar: 'الكل',
      ku: 'هەموو'
    },
    active: {
      en: 'Active',
      ar: 'نشط',
      ku: 'چالاک'
    },
    inactive: {
      en: 'Inactive',
      ar: 'غير نشط',
      ku: 'ناچالاک'
    },
    featured: {
      en: 'Featured',
      ar: 'مميز',
      ku: 'تایبەت'
    },
    edit: {
      en: 'Edit Post',
      ar: 'تعديل المنشور',
      ku: 'دەستکاری پۆست'
    },
    save: {
      en: 'Save Changes',
      ar: 'حفظ التغييرات',
      ku: 'پاشەکەوتکردن'
    },
    cancel: {
      en: 'Cancel',
      ar: 'إلغاء',
      ku: 'هەڵوەشاندنەوە'
    },
    delete: {
      en: 'Delete',
      ar: 'حذف',
      ku: 'سڕینەوە'
    },
    arabicCaption: {
      en: 'Arabic Caption',
      ar: 'النص بالعربية',
      ku: 'نوسینی عەرەبی'
    },
    englishCaption: {
      en: 'English Caption',
      ar: 'النص بالإنجليزية',
      ku: 'نوسینی ئینگلیزی'
    },
    imageUrl: {
      en: 'Image URL',
      ar: 'رابط الصورة',
      ku: 'لینکی وێنە'
    },
    preview: {
      en: 'Preview',
      ar: 'معاينة',
      ku: 'پێشبینین'
    },
    noPosts: {
      en: 'No posts found',
      ar: 'لم يتم العثور على منشورات',
      ku: 'هیچ پۆستێک نەدۆزرایەوە'
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-xl font-black text-bg-dark uppercase tracking-tight">
                {translations.title[language]}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-bg-dark rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                {language === 'ar' ? 'إضافة جديد' : language === 'ku' ? 'زیادکردن' : 'Add New'}
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={translations.search[language]}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-0 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-2">
              {(['all', 'active', 'inactive', 'featured'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    filter === f
                      ? 'bg-bg-dark text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {translations[f][language]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 font-bold">
              {translations.noPosts[language]}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden ${
                    !post.isActive ? 'opacity-50' : ''
                  } ${post.isFeatured ? 'ring-2 ring-primary' : ''}`}
                >
                  {/* Image */}
                  <div className="relative aspect-video">
                    <img
                      src={post.image}
                      alt={post.businessName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                      }}
                    />
                    
                    {/* Status Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {post.isFeatured && (
                        <span className="bg-primary text-bg-dark px-2 py-1 rounded-lg text-[9px] font-black uppercase">
                          ⭐
                        </span>
                      )}
                      {!post.isActive && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase">
                          Hidden
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          post.isFeatured ? 'bg-primary text-bg-dark' : 'bg-black/50 text-white hover:bg-black/70'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(post)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          post.isActive 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {post.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-bg-dark line-clamp-1">
                          {post.businessName || 'Unknown Business'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {post.city || post.governorate || 'Iraq'} • {post.category || 'Business'}
                        </p>
                      </div>
                    </div>

                    {/* Caption Preview */}
                    <p className="text-sm text-slate-600 line-clamp-2" dir="rtl">
                      {post.captionAr || post.caption}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>❤️ {post.likes}</span>
                      <span>👁️ {post.views}</span>
                    </div>

                    {/* Edit/Delete Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setEditingPost(post)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {translations.edit[language]}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPost && (
          <EditModal
            post={editingPost}
            onClose={() => setEditingPost(null)}
            onSave={handleSave}
            translations={translations}
            language={language}
          />
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreating && (
          <CreateModal
            onClose={() => setIsCreating(false)}
            onCreate={createPost}
            translations={translations}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Edit Modal Component
function EditModal({ 
  post, 
  onClose, 
  onSave, 
  translations, 
  language 
}: { 
  post: ShakumakuPost;
  onClose: () => void;
  onSave: (id: string, updates: Partial<ShakumakuPost>) => void;
  translations: Record<string, Record<string, string>>;
  language: string;
}) {
  const [captionAr, setCaptionAr] = useState(post.captionAr || '');
  const [captionEn, setCaptionEn] = useState(post.captionEn || '');
  const [imageUrl, setImageUrl] = useState(post.image || '');
  const [isFeatured, setIsFeatured] = useState(post.isFeatured);
  const [isActive, setIsActive] = useState(post.isActive);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-bg-dark">
            {translations.edit[language]}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Preview */}
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <img
              src={imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {translations.imageUrl[language]}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Arabic Caption */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {translations.arabicCaption[language]} *
            </label>
            <textarea
              value={captionAr}
              onChange={(e) => setCaptionAr(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary resize-none"
              dir="rtl"
              placeholder="اكتب النص بالعربية..."
            />
          </div>

          {/* English Caption */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {translations.englishCaption[language]}
            </label>
            <textarea
              value={captionEn}
              onChange={(e) => setCaptionEn(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary resize-none"
              placeholder="English caption (optional)..."
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">⭐ Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">👁️ Active</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-700"
          >
            {translations.cancel[language]}
          </button>
          <button
            onClick={() => onSave(post.id, {
              captionAr,
              captionEn,
              image: imageUrl,
              isFeatured,
              isActive
            })}
            disabled={!captionAr.trim()}
            className="flex-1 py-2.5 bg-primary text-bg-dark rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {translations.save[language]}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Create Modal Component
function CreateModal({ 
  onClose, 
  onCreate,
  translations, 
  language 
}: { 
  onClose: () => void;
  onCreate: (post: any) => Promise<{ success: boolean; error?: string }>;
  translations: Record<string, Record<string, string>>;
  language: string;
}) {
  const [businessId, setBusinessId] = useState('');
  const [captionAr, setCaptionAr] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async () => {
    if (!captionAr.trim()) return;
    
    setIsSubmitting(true);
    const result = await onCreate({
      businessId: businessId || 'manual-entry',
      captionAr,
      captionEn: '',
      image: imageUrl,
      isFeatured: false
    });
    setIsSubmitting(false);
    
    if (result.success) {
      onClose();
    } else {
      alert('Failed to create: ' + result.error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-black text-bg-dark mb-4">
            {language === 'ar' ? 'منشور جديد' : language === 'ku' ? 'پۆستی نوێ' : 'New Post'}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {translations.arabicCaption[language]} *
            </label>
            <textarea
              value={captionAr}
              onChange={(e) => setCaptionAr(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary resize-none"
              dir="rtl"
              placeholder="اكتب النص بالعربية..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {translations.imageUrl[language]}
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-slate-500 font-bold text-sm"
          >
            {translations.cancel[language]}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!captionAr.trim() || isSubmitting}
            className="flex-1 py-2.5 bg-primary text-bg-dark rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {language === 'ar' ? 'إنشاء' : language === 'ku' ? 'دروستکردن' : 'Create'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
