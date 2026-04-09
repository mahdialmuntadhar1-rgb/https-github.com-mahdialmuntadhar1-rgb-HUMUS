import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useAuthStore } from '@/stores/authStore';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SLOGANS = [
  {
    en: "The first Iraqi business directory",
    ar: "أول دليل أعمال عراقي",
    ku: "یەکەمین ڕێبەری کارەکانی عێراق"
  },
  {
    en: "All businesses organized by city and category",
    ar: "جميع الأعمال منظمة حسب المدينة والفئة",
    ku: "هەموو کارەکان بەپێی شار و پۆل ڕێکخراون"
  },
  {
    en: "Trilingual Iraqi business platform",
    ar: "منصة أعمال عراقية بثلاث لغات",
    ku: "پلاتفۆرمی کارەکانی عێراق بە سێ زمان"
  }
];

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const { language } = useHomeStore();
  const { profile } = useAuthStore();

  const isRTL = language === 'ar' || language === 'ku';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="w-full px-4 mb-12">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden bg-bg-dark rounded-[32px] shadow-2xl border border-white/5">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop" 
              alt="Iraq Business"
              className="w-full h-full object-cover opacity-20 scale-105 blur-[1px]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-bg-dark/95 via-bg-dark/80 to-bg-dark/90" />
            
            {/* Animated Glows */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-[80px] animate-pulse delay-1000" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.2em]">
                {language === 'ar' ? 'دليل العراق الموثوق' : language === 'ku' ? 'ڕێبەری باوەڕپێکراوی عێراق' : 'Iraq\'s Trusted Directory'}
              </span>
            </motion.div>

            {/* Slogan with Animation */}
            <div className="h-20 sm:h-24 flex flex-col items-center justify-center w-full mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlogan}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight poppins-bold leading-tight uppercase">
                    {SLOGANS[currentSlogan][language]}
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-2xl relative group"
            >
              <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden p-1.5 border border-white/20">
                <div className={`flex items-center flex-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="px-4 text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث عن أي شيء...' : language === 'ku' ? 'بگەڕێ بۆ هەر شتێک...' : 'Search for anything...'}
                    className={`flex-1 py-3 text-sm font-bold text-bg-dark focus:outline-none bg-transparent placeholder:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                </div>
                <button className="px-6 py-3 bg-primary text-bg-dark font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-accent transition-all active:scale-95">
                  {language === 'ar' ? 'بحث' : language === 'ku' ? 'گەڕان' : 'Search'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
