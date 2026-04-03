import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Business } from '@/lib/supabase';

const HERO_SLOGANS = [
  {
    en: "Celebrate Iraqi Business",
    ar: "احتفل بالأعمال العراقية",
    ku: "Karsaziya Iraqê pîroz bikin",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop"
  },
  {
    en: "Offers & Events",
    ar: "عروض وفعاليات",
    ku: "Pêşniyar û rûdawên nû",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop"
  },
  {
    en: "Discover Local Gems",
    ar: "اكتشف الجواهر المحلية",
    ku: "Cewherên herêmî kifş bikin",
    image: "https://images.unsplash.com/photo-1504674900759-b58551b1efc8?w=1200&h=600&fit=crop"
  }
];

interface HeroSectionProps {
  businesses?: Business[];
}

export default function HeroSection({ businesses }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLOGANS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLOGANS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLOGANS.length) % HERO_SLOGANS.length);

  return (
    <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden mb-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-[#8B1A1A] flex items-center justify-center overflow-hidden">
            {/* Abstract background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6 inline-block p-4 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20"
              >
                <span className="text-4xl md:text-5xl">🎉</span>
              </motion.div>

              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-7xl font-bold mb-8 poppins-bold tracking-tight"
              >
                {HERO_SLOGANS[currentSlide].en}
              </motion.h1>
              
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { text: HERO_SLOGANS[currentSlide].en, lang: 'en' },
                  { text: HERO_SLOGANS[currentSlide].ar, lang: 'ar' },
                  { text: HERO_SLOGANS[currentSlide].ku, lang: 'ku' }
                ].map((btn, i) => (
                  <motion.button
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-sm font-bold transition-all"
                    dir={btn.lang === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {btn.text}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {HERO_SLOGANS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === currentSlide ? 'bg-white w-10' : 'bg-white/30 w-4 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
