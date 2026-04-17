import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useBuildMode } from '@/hooks/useBuildMode';
import { useAdminDB } from '@/hooks/useAdminDB';
import { useAuthStore } from '@/stores/authStore';
import { EditableImage } from '../BuildModeEditor/EditableImage';
import { heroContent } from '@/data/heroContent';
import { Upload } from 'lucide-react';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const { profile } = useAuthStore();
  const { heroSlides: slides, buildModeEnabled, updateSlide } = useBuildMode();
  const { updateHeroSlide } = useAdminDB();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const isAdmin = profile?.role === 'admin';
  const isRTL = language === 'ar' || language === 'ku';

  const nextSlide = () => {
    if (slides.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Fallback if no slides
  if (!slides || slides.length === 0) {
    return (
      <div className="w-full px-4 mb-12 sm:mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[48px] aspect-video bg-slate-100 flex items-center justify-center">
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Hero Content Available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex] || slides[0];
  if (!currentSlide) return null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[48px] aspect-square">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div 
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 }
              }}
              className="absolute inset-0"
            >
              <EditableImage
                src={currentSlide.image}
                alt="Hero Image"
                className="w-full h-full object-cover"
                folder="hero"
                isAdmin={isAdmin}
                onSave={(newUrl) => {
                  updateSlide(currentSlide.id, { image: newUrl });
                  updateHeroSlide(currentSlide.id, { image_url: newUrl });
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
