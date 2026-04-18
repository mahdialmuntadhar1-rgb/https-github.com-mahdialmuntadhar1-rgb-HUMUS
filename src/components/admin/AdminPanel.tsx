import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminMode } from '@/hooks/useAdminMode';
import HeroEditor from './HeroEditor';
import FeaturesEditor from './FeaturesEditor';
import PostsEditor from './PostsEditor';

interface HeroSlide {
  id: string;
  image_url: string;
  title_ar?: string;
  title_ku?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_ku?: string;
  subtitle_en?: string;
  cta_text?: string;
  cta_link?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

interface Feature {
  id: string;
  title_ar?: string;
  title_ku?: string;
  title_en?: string;
  description_ar?: string;
  description_ku?: string;
  description_en?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { canEditContent } = useAdminMode();
  const [activeTab, setActiveTab] = useState('hero');
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && canEditContent) {
      loadData();
    }
  }, [isOpen, canEditContent]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [heroRes, featuresRes, postsRes] = await Promise.all([
        supabase.from('hero_slides').select('*').order('sort_order', { ascending: true }),
        supabase.from('features').select('*').order('sort_order', { ascending: true }),
        supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (heroRes.data) setHeroSlides(heroRes.data);
      if (featuresRes.data) setFeatures(featuresRes.data);
      if (postsRes.data) setPosts(postsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canEditContent) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-sm text-slate-600">Edit homepage content directly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="sticky top-[68px] bg-slate-50 border-b border-slate-200 flex overflow-x-auto">
          {[
            { id: 'hero', label: 'Hero Slides' },
            { id: 'features', label: 'Features' },
            { id: 'posts', label: 'Feed Posts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-bold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {activeTab === 'hero' && (
                <HeroEditor slides={heroSlides} onUpdate={setHeroSlides} />
              )}
              {activeTab === 'features' && (
                <FeaturesEditor features={features} onUpdate={setFeatures} />
              )}
              {activeTab === 'posts' && (
                <PostsEditor posts={posts} onUpdate={setPosts} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
