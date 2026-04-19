import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit3 } from 'lucide-react';
import { useBuildMode } from '@/hooks/useBuildMode';

interface OwnerEditFABProps {
  onEditClick: () => void;
}

export default function OwnerEditFAB({ onEditClick }: OwnerEditFABProps) {
  const { isBuildModeEnabled } = useBuildMode();

  // Only show if owner is logged in
  if (!isBuildModeEnabled) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={onEditClick}
        className="fixed bottom-8 right-8 z-[50] w-14 h-14 bg-[#0F7B6C] hover:bg-[#0d6b5e] text-white rounded-full shadow-lg shadow-[#0F7B6C]/40 flex items-center justify-center transition-all hover:scale-110 group"
        title="Edit Mode"
      >
        <Edit3 className="w-6 h-6" />
        <div className="absolute right-full mr-4 px-3 py-2 bg-white text-[#0F7B6C] text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100 pointer-events-none">
          Edit Mode
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
