import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useBuildMode } from '@/hooks/useBuildMode';
import { heroContent } from '@/data/heroContent';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const { buildModeEnabled, heroSlides: playgroundSlides, activeSlideId } = useBuildMode();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isRTL = language === 'ar' || language === 'ku';

  // Single Source of Truth: Use playground slides in Build Mode, otherwise use heroContent.ts
  const slidesToUse = buildModeEnabled && playgroundSlides.length > 0
    ? playgroundSlides
    : heroContent;

  // Sync currentIndex with activeSlideId in Build Mode
  useEffect(() => {
    if (buildModeEnabled && activeSlideId) {
      const index = slidesToUse.findIndex(s => s.id === activeSlideId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [activeSlideId, buildModeEnabled, slidesToUse.length]);

  useEffect(() => {
    if (slidesToUse.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slidesToUse.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slidesToUse.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slidesToUse.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slidesToUse.length) % slidesToUse.length);

  // Fallback if no slides
  if (slidesToUse.length === 0) {
    return null;
  }

  const currentSlide = slidesToUse[currentIndex];
  
  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[48px] aspect-square sm:aspect-[16/9] lg:aspect-[21/9] flex items-end group">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0"
            >
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10 }}
                src={currentSlide.image} 
                alt="Hero Image"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {slidesToUse.length > 1 && (
            <>
              <div className={`absolute bottom-6 sm:bottom-10 ${isRTL ? 'left-6 sm:left-10' : 'right-6 sm:right-10'} flex items-center gap-2 sm:gap-4 z-20`}>
                <button 
                  onClick={prevSlide}
                  className="p-2 sm:p-4 border border-white/20 rounded-xl sm:rounded-2xl text-white hover:bg-white hover:text-[#0F7B6C] transition-all"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="p-2 sm:p-4 border border-white/20 rounded-xl sm:rounded-2xl text-white hover:bg-white hover:text-[#0F7B6C] transition-all"
                >
                  <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Indicators */}
              <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-20">
                {slidesToUse.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-6 sm:w-10 bg-[#C8A96A]' : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
