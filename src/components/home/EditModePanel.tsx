import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { useAdminDB, HeroSlide } from '@/hooks/useAdminDB';
import HeroEditor from '@/components/admin/HeroEditor';

interface EditModePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditModePanel({ isOpen, onClose }: EditModePanelProps) {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchHeroSlides } = useAdminDB();

  // Load hero slides when panel opens
  useEffect(() => {
    if (isOpen) {
      loadSlides();
    }
  }, [isOpen]);

  const loadSlides = async () => {
    setIsLoading(true);
    try {
      const slides = await fetchHeroSlides();
      setHeroSlides(slides);
    } catch (err) {
      console.error('Failed to load hero slides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-[70] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#2B2F33]">Edit Mode</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0F7B6C]" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Hero Editor */}
                  {heroSlides.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-[#2B2F33] uppercase tracking-wider">
                        Hero Slides
                      </h3>
                      <HeroEditor
                        slides={heroSlides}
                        onUpdate={(updatedSlides) => {
                          setHeroSlides(updatedSlides);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700">
                        No hero slides found. Add slides from the admin panel.
                      </p>
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-6">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong>Edit Mode:</strong> Upload new hero images, manage content, and customize the homepage.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
