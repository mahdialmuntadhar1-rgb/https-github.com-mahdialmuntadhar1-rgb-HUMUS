import { Wand2 } from 'lucide-react';
import { useBuildMode } from '@/hooks/useBuildMode';

export default function BuildModeToggle() {
  const { canEditContent, isEditModeOn, setIsEditModeOn } = useBuildMode();

  if (!canEditContent) return null;

  return (
    <button
      onClick={() => setIsEditModeOn(!isEditModeOn)}
      className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full shadow-lg transition-all flex items-center justify-center text-white font-black text-xs uppercase tracking-wider ${
        isEditModeOn
          ? 'bg-[#FF6B6B] hover:bg-[#FF5252]'
          : 'bg-[#0F7B6C] hover:bg-[#0d6857]'
      }`}
      title={isEditModeOn ? 'Turn off edit mode' : 'Turn on edit mode'}
    >
      <Wand2 className="w-6 h-6" />
    </button>
  );
}
