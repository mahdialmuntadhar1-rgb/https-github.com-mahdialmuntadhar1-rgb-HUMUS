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
    ar: "أول دليل أعمال عراقي شامل — كل شيء بمكان واحد",
    ku: "یەکەم ڕێبەری بازرگانی عێراقی — هەموو شت لە یەک شوێن",
    en: "The first Iraqi business directory — everything in one place"
  },
  {
    ar: "لا تبحث في كل إنستغرام — كل المطاعم والكافيهات هنا",
    ku: "لە هەموو ئینستاگرام مەگەڕێ — هەموو شوێنەکان لێرەن",
    en: "Stop searching everywhere — restaurants & cafés are all here"
  },
  {
    ar: "خلّي الزبون يوصلك — عرّف مشروعك بسهولة وبدون تعقيد",
    ku: "کڕیار بێت بۆت — کاروبارت بە ئاسانی پیشان بدە",
    en: "Let customers come to you — showcase your business effortlessly"
  },
  {
    ar: "كل أعمال العراق مرتبة حسب المدينة — اعثر على الأفضل حولك",
    ku: "هەموو بازرگانییەکان بە شار ڕێکخراون — باشترینەکان بدۆزەوە",
    en: "All Iraqi businesses organized by city — find the best near you"
  },
  {
    ar: "أول منصة بثلاث لغات في العراق — عربي، كوردی، English",
    ku: "یەکەم پلاتفۆرمی سێ زمانە — عەرەبی، کوردی، English",
    en: "The first trilingual platform in Iraq — Arabic, Kurdish, English"
  },
  {
    ar: "تواجدك مجاني — وانتشر في كل العراق",
    ku: "بەخۆڕایی تۆماربە — لە هەموو عێراق بڵاو ببە",
    en: "List your business for free — reach all of Iraq"
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

          <div className="relative z-10 p-4 sm:p-12 flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 px-3 py-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 sm:gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span className="text-[7px] sm:text-[9px] font-black text-white/80 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                {language === 'ar' ? 'دليل العراق الموثوق' : language === 'ku' ? 'ڕێبەری باوەڕپێکراوی عێراق' : 'Iraq\'s Trusted Directory'}
              </span>
            </motion.div>

            {/* Slogans with Animation - Showing 3 languages at once */}
            <div className="min-h-[120px] sm:min-h-[200px] flex flex-col items-center justify-center w-full mb-2 sm:mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlogan}
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center gap-2 sm:gap-6"
                >
                  <h1 className="text-sm sm:text-3xl font-black text-white tracking-tight poppins-bold leading-tight uppercase text-center max-w-4xl">
                    {SLOGANS[currentSlogan].ar}
                  </h1>
                  <h1 className="text-sm sm:text-3xl font-black text-white tracking-tight poppins-bold leading-tight uppercase text-center max-w-4xl">
                    {SLOGANS[currentSlogan].ku}
                  </h1>
                  <h1 className="text-xs sm:text-2xl font-bold text-white/80 tracking-tight poppins-bold leading-tight uppercase text-center max-w-4xl">
                    {SLOGANS[currentSlogan].en}
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
