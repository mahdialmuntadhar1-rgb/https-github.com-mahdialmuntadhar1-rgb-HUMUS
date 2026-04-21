import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ImagePlus, Trash2 } from 'lucide-react';
import { useLocalBuildStore } from '@/stores/localBuildStore';

export default function HeroSection() {
  const { heroSlides, updateHeroImage, isBuildMode } = useLocalBuildStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleImageUpload = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        updateHeroImage(index, url);
      }
    };
    input.click();
  };

  if (heroSlides.length === 0) return null;

  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[48px] aspect-[4/5] sm:aspect-video shadow-2xl bg-slate-100 group/hero">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroSlides[currentIndex].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img
                src={heroSlides[currentIndex].image_url}
                alt="Hero Slide"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              
              {isBuildMode && (
                <div className="absolute inset-0 bg-black/0 group-hover/hero:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover/hero:opacity-100">
                  <button
                    onClick={() => handleImageUpload(currentIndex)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transform scale-90 group-hover/hero:scale-100 transition-all hover:bg-primary hover:text-white"
                  >
                    <ImagePlus className="w-4 h-4" />
                    Replace Image
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white text-white hover:text-primary backdrop-blur-md rounded-full flex items-center justify-center transition-all z-20 opacity-0 group-hover/hero:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white text-white hover:text-primary backdrop-blur-md rounded-full flex items-center justify-center transition-all z-20 opacity-0 group-hover/hero:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
