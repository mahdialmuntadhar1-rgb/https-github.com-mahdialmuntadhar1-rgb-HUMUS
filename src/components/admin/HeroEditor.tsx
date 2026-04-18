import React, { useState } from 'react';
import { Loader2, Upload, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminStorage } from '@/hooks/useAdminStorage';
import { useHomeStore } from '@/stores/homeStore';

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

interface HeroEditorProps {
  slides: HeroSlide[];
  onUpdate: (slides: HeroSlide[]) => void;
}

export default function HeroEditor({ slides, onUpdate }: HeroEditorProps) {
  const { language } = useHomeStore();
  const { uploadImage, isUploading } = useAdminStorage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HeroSlide> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setFormData({ ...slide });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const publicUrl = await uploadImage(file, {
      bucket: 'assets',
      folder: 'hero',
    });

    if (publicUrl) {
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    }
  };

  const saveSlide = async () => {
    if (!formData || !editingId) return;
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateErr } = await supabase
        .from('hero_slides')
        .update({
          image_url: formData.image_url,
          title_ar: formData.title_ar,
          title_ku: formData.title_ku,
          title_en: formData.title_en,
          subtitle_ar: formData.subtitle_ar,
          subtitle_ku: formData.subtitle_ku,
          subtitle_en: formData.subtitle_en,
          cta_text: formData.cta_text,
          cta_link: formData.cta_link,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (updateErr) throw updateErr;

      const updated = slides.map(s =>
        s.id === editingId ? { ...s, ...formData } as HeroSlide : s
      );
      onUpdate(updated);
      setEditingId(null);
      setFormData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSlide = async (slideId: string) => {
    if (!confirm('Delete this slide?')) return;
    setIsLoading(true);

    try {
      const { error: deleteErr } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', slideId);

      if (deleteErr) throw deleteErr;

      onUpdate(slides.filter(s => s.id !== slideId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (editingId && formData) {
    return (
      <div className="space-y-4">
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <div>
          <label className="block text-sm font-bold mb-2">Slide Image</label>
          <div className="relative">
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg mb-2"
              />
            )}
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="w-5 h-5" />
              <span className="text-sm font-bold">Replace Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, editingId)}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Title (Arabic)</label>
            <input
              type="text"
              value={formData.title_ar || ''}
              onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Title (Kurdish)</label>
            <input
              type="text"
              value={formData.title_ku || ''}
              onChange={(e) => setFormData({ ...formData, title_ku: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Title (English)</label>
            <input
              type="text"
              value={formData.title_en || ''}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Subtitle (Arabic)</label>
            <textarea
              value={formData.subtitle_ar || ''}
              onChange={(e) => setFormData({ ...formData, subtitle_ar: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Subtitle (Kurdish)</label>
            <textarea
              value={formData.subtitle_ku || ''}
              onChange={(e) => setFormData({ ...formData, subtitle_ku: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Subtitle (English)</label>
            <textarea
              value={formData.subtitle_en || ''}
              onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">CTA Text</label>
            <input
              type="text"
              value={formData.cta_text || ''}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">CTA Link</label>
            <input
              type="text"
              value={formData.cta_link || ''}
              onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData(null);
            }}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-bold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={saveSlide}
            disabled={isLoading || isUploading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading || isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Slide'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Hero Slides ({slides.length})</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
          >
            <img
              src={slide.image_url}
              alt="Slide"
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{slide.title_ar || slide.title_en || 'Untitled'}</p>
              <p className="text-xs text-slate-600">Order: {slide.sort_order || 0}</p>
            </div>
            <button
              onClick={() => startEdit(slide)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => deleteSlide(slide.id)}
              disabled={isLoading}
              className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
