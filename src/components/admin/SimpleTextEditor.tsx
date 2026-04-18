import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SimpleTextEditorProps {
  title: string;
  fields: Array<{
    key: string;
    label: string;
    type?: 'text' | 'textarea' | 'number' | 'checkbox';
    placeholder?: string;
    rows?: number;
  }>;
  values: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SimpleTextEditor({
  title,
  fields,
  values,
  onSave,
  onCancel,
  isLoading = false,
}: SimpleTextEditorProps) {
  const [formData, setFormData] = useState(values);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">{title}</h3>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-bold mb-1">
              {field.label}
            </label>
            {field.type === 'checkbox' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[field.key] || false}
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">{field.label}</span>
              </label>
            ) : field.type === 'textarea' ? (
              <textarea
                value={formData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : field.type === 'number' ? (
              <input
                type="number"
                value={formData[field.key] || 0}
                onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={formData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-bold hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
}
