import React from 'react';
import { Wand2 } from 'lucide-react';
import { useAdminMode } from '@/hooks/useAdminMode';

interface AdminEditToggleProps {
  onOpenPanel?: () => void;
}

/**
 * AdminEditToggle
 * Floating toggle button for admin edit mode
 * Only visible to users with admin role
 */
export default function AdminEditToggle({ onOpenPanel }: AdminEditToggleProps) {
  const { canEditContent, isEditModeOn, setIsEditModeOn } = useAdminMode();

  if (!canEditContent) return null;

  return (
    <button
      onClick={() => {
        setIsEditModeOn(!isEditModeOn);
        if (!isEditModeOn && onOpenPanel) {
          setTimeout(onOpenPanel, 100);
        }
      }}
      className={`fixed top-4 right-4 z-40 px-4 py-2 rounded-full shadow-lg transition-all flex items-center gap-2 font-bold text-sm uppercase tracking-wider ${
        isEditModeOn
          ? 'bg-blue-500 hover:bg-blue-600 text-white'
          : 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-200'
      }`}
      title={isEditModeOn ? 'Exit edit mode' : 'Enter edit mode'}
    >
      <Wand2 className="w-4 h-4" />
      {isEditModeOn ? 'Editing' : 'Edit'}
    </button>
  );
}
