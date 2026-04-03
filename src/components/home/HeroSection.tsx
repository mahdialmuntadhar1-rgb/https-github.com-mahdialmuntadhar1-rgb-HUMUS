import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Business } from '@/lib/supabase';

const HERO_SLOGANS = [
  {
    en: "Discover Iraq's Best Businesses",
    ar: "اكتشف أفضل الشركات في العراق",
    ku: "Baştirîn karsaziyên Iraqê kifş bikin",
    image: "https://picsum.photos/seed/iraq1/1200/600"
  },
  {
    en: "Connect with Local Services",
    ar: "تواصل مع الخدمات المحلية",
    ku: "Bi xizmetên herêmî re têkilî daynin",
    image: "https://picsum.photos/seed/iraq2/1200/600"
  },
  {
    en: "Grow Your Business with HUMUS",
    ar: "نمِ عملك مع هوموس",
    ku: "Karsaziya xwe bi HUMUS re mezin bikin",
    image: "https://picsum.photos/seed/iraq3/1200/600"
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
    <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_SLOGANS[currentSlide].image})` }}
          >
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white px-4 text-center">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl md:text-5xl font-bold mb-4 font-poppins"
              >
                {HERO_SLOGANS[currentSlide].en}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl mb-2 font-arabic"
                dir="rtl"
              >
                {HERO_SLOGANS[currentSlide].ar}
              </motion.p>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl mb-8"
              >
                {HERO_SLOGANS[currentSlide].ku}
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-lg px-8 py-3"
              >
                Explore Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
      >
        <ChevronRight size={32} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {HERO_SLOGANS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
}
