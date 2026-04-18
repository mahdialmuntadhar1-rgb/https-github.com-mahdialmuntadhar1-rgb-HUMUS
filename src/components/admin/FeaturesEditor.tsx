import React, { useState } from 'react';
import { Loader2, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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
  created_at?: string;
  updated_at?: string;
}

interface FeaturesEditorProps {
  features: Feature[];
  onUpdate: (features: Feature[]) => void;
}

export default function FeaturesEditor({ features, onUpdate }: FeaturesEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Feature> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ICONS = ['🚀', '⭐', '🎯', '💡', '🔒', '📱', '🌍', '⚡', '👥', '💼'];

  const startEdit = (feature: Feature) => {
    setEditingId(feature.id);
    setFormData({ ...feature });
  };

  const startNew = () => {
    const newId = `temp-${Date.now()}`;
    setEditingId(newId);
    setFormData({
      id: newId,
      sort_order: features.length,
      is_active: true,
    });
  };

  const saveFeature = async () => {
    if (!formData || !editingId) return;
    setIsLoading(true);
    setError(null);

    try {
      if (editingId.startsWith('temp-')) {
        // New feature
        const { data, error: insertErr } = await supabase
          .from('features')
          .insert([
            {
              title_ar: formData.title_ar,
              title_ku: formData.title_ku,
              title_en: formData.title_en,
              description_ar: formData.description_ar,
              description_ku: formData.description_ku,
              description_en: formData.description_en,
              icon: formData.icon,
              sort_order: formData.sort_order || 0,
              is_active: formData.is_active ?? true,
            },
          ])
          .select()
          .single();

        if (insertErr) throw insertErr;
        onUpdate([...features, data]);
      } else {
        // Update existing
        const { error: updateErr } = await supabase
          .from('features')
          .update({
            title_ar: formData.title_ar,
            title_ku: formData.title_ku,
            title_en: formData.title_en,
            description_ar: formData.description_ar,
            description_ku: formData.description_ku,
            description_en: formData.description_en,
            icon: formData.icon,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (updateErr) throw updateErr;

        const updated = features.map(f =>
          f.id === editingId ? { ...f, ...formData } as Feature : f
        );
        onUpdate(updated);
      }

      setEditingId(null);
      setFormData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFeature = async (featureId: string) => {
    if (!confirm('Delete this feature?')) return;
    setIsLoading(true);

    try {
      const { error: deleteErr } = await supabase
        .from('features')
        .delete()
        .eq('id', featureId);

      if (deleteErr) throw deleteErr;

      onUpdate(features.filter(f => f.id !== featureId));
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
          <label className="block text-sm font-bold mb-2">Icon (Emoji)</label>
          <div className="flex gap-2 flex-wrap">
            {ICONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setFormData({ ...formData, icon: emoji })}
                className={`text-2xl p-2 rounded-lg transition-colors ${
                  formData.icon === emoji
                    ? 'bg-blue-500 scale-110'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {emoji}
              </button>
            ))}
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
            <label className="block text-sm font-bold mb-1">Description (Arabic)</label>
            <textarea
              value={formData.description_ar || ''}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description (Kurdish)</label>
            <textarea
              value={formData.description_ku || ''}
              onChange={(e) => setFormData({ ...formData, description_ku: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description (English)</label>
            <textarea
              value={formData.description_en || ''}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Sort Order</label>
            <input
              type="number"
              value={formData.sort_order || 0}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-bold">Active</span>
            </label>
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
            onClick={saveFeature}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Feature'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Features ({features.length})</h3>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              feature.is_active
                ? 'bg-slate-50 border-slate-200 hover:border-blue-300'
                : 'bg-slate-100 border-slate-300 opacity-60'
            }`}
          >
            <div className="text-2xl">{feature.icon || '•'}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{feature.title_en || feature.title_ar || 'Untitled'}</p>
              <p className="text-xs text-slate-600">Order: {feature.sort_order || 0}</p>
            </div>
            <button
              onClick={() => startEdit(feature)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => deleteFeature(feature.id)}
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
