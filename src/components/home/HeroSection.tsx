import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { heroContent } from '@/data/heroContent';
import { heroService, HeroSlide } from '@/lib/heroService';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const content = heroContent[language] || heroContent['ar'];
  const isRTL = language === 'ar' || language === 'ku';
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoadingSlides, setIsLoadingSlides] = useState(true);

  // Load hero slides from database
  useEffect(() => {
    const loadSlides = async () => {
      try {
        const slides = await heroService.getActiveSlides();
        if (slides && slides.length > 0) {
          setHeroSlides(slides);
        }
      } catch (err) {
        console.error('Failed to load hero slides:', err);
      } finally {
        setIsLoadingSlides(false);
      }
    };
    loadSlides();
  }, []);

  // Show database hero slides if available, otherwise fallback to static
  const hasSlides = heroSlides && heroSlides.length > 0;
  const currentSlide = hasSlides ? heroSlides[currentSlideIndex] : null;

  const handleNextSlide = () => {
    if (hasSlides) {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }
  };

  const handlePrevSlide = () => {
    if (hasSlides) {
      setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }
  };

  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[48px] aspect-square">
          {/* Database hero slides if available */}
          {hasSlides && currentSlide ? (
            <>
              <motion.img
                key={currentSlide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={currentSlide.image_url}
                alt="Hero slide"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Slide navigation */}
              {heroSlides.length > 1 && (
                <>
                  <button
                    onClick={handlePrevSlide}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              {/* Search overlay */}
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-8 sm:p-16">
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <input
                    type="text"
                    placeholder={content.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="px-8 py-4 bg-[#C8A96A] text-[#0F7B6C] rounded-full font-black hover:bg-[#b89a5a] transition-colors">
                    {content.searchButton}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Fallback to static content */
            <div className="relative overflow-hidden rounded-[48px] aspect-square bg-gradient-to-br from-[#0F7B6C] to-[#0d6857]">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 sm:p-16">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 poppins-bold tracking-tighter">
                  {content.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
                  {content.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <input
                    type="text"
                    placeholder={content.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="px-8 py-4 bg-[#C8A96A] text-[#0F7B6C] rounded-full font-black hover:bg-[#b89a5a] transition-colors">
                    {content.searchButton}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
