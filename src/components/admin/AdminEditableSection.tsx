import React, { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { useAdminMode } from '@/hooks/useAdminMode';

interface AdminEditableSectionProps {
  id: string;
  children: React.ReactNode;
  editor: React.ReactNode;
  onEdit?: () => void;
}

/**
 * AdminEditableSection
 * Wraps editable sections with hover UI and editor access
 * Shows edit button only when admin edit mode is active
 */
export default function AdminEditableSection({
  id,
  children,
  editor,
  onEdit,
}: AdminEditableSectionProps) {
  const { isAdminEditModeActive } = useAdminMode();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  if (!isAdminEditModeActive) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {/* Content */}
      <div className="transition-all">
        {children}
      </div>

      {/* Hover overlay with edit button */}
      {isAdminEditModeActive && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
          <div className="absolute inset-0 rounded-lg bg-blue-500/10 border-2 border-blue-500/30 flex items-start justify-end p-2 gap-2">
            <button
              onClick={() => {
                setIsEditorOpen(true);
                onEdit?.();
              }}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg flex items-center gap-2"
              title="Edit this section"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Edit Section</h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6">
              {editor}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
