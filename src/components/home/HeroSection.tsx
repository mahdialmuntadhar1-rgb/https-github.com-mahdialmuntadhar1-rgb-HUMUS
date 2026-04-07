import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight } from 'lucide-react';
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
    en: "Discover Iraq's hidden gems",
    ar: "اكتشف جواهر العراق الخفية",
    ku: "گەوهەرە شاراوەکانی عێراق بدۆزەرەوە"
  },
  {
    en: "Grow your business with us",
    ar: "نمِّ عملك التجاري معنا",
    ku: "کارەکەت لەگەڵ ئێمە گەشە پێ بدە"
  },
  {
    en: "Verified reviews you can trust",
    ar: "مراجعات موثوقة يمكنك الاعتماد عليها",
    ku: "پێداچوونەوەی ڕاست و باوەڕپێکراو"
  }
];

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const featured = businesses.filter(b => b.isFeatured).slice(0, 5);
  const [currentSlogan, setCurrentSlogan] = React.useState(0);
  const { language } = useHomeStore();
  const { profile } = useAuthStore();

  const isRTL = language === 'ar' || language === 'ku';

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <section className="w-full relative overflow-hidden bg-bg-dark pt-12 pb-20 sm:pt-20 sm:pb-32 border-b border-white/5">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop" 
          alt="Iraq Business"
          className="w-full h-full object-cover opacity-20 scale-105 blur-[2px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/95 via-bg-dark/80 to-bg-dark" />
        
        {/* Animated Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 px-4 py-1.5 glass rounded-full border border-white/10 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-bg-dark bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              {language === 'ar' ? 'أكثر من ١٠ آلاف مستخدم نشط' : language === 'ku' ? 'زیاتر لە ١٠ هەزار بەکارهێنەری چالاک' : '10k+ active users in Iraq'}
            </span>
          </motion.div>

          {/* Slogan with Animation */}
          <div className="h-24 sm:h-32 flex flex-col items-center justify-center w-full mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlogan}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tighter poppins-bold leading-[1.1] drop-shadow-2xl max-w-3xl">
                  {SLOGANS[currentSlogan][language]}
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Search Bar - Centralized */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-[28px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200" />
            <div className="relative flex items-center bg-white rounded-[24px] shadow-2xl overflow-hidden p-1.5">
              <div className={`flex items-center flex-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="px-5 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث عن مطاعم، فنادق، خدمات...' : language === 'ku' ? 'بگەڕێ بۆ چێشتخانە، هوتێل، خزمەتگوزاری...' : 'Search for restaurants, hotels, services...'}
                  className={`flex-1 py-4 text-sm font-bold text-bg-dark focus:outline-none bg-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                />
              </div>
              <button className="hidden sm:flex items-center gap-2 px-8 py-4 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-[18px] hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20">
                {language === 'ar' ? 'بحث' : language === 'ku' ? 'گەڕان' : 'Search'}
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </motion.div>

          {/* Popular Searches / Tags */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {['Restaurants', 'Hotels', 'Cafes', 'Shopping'].map((tag) => (
              <button 
                key={tag}
                className="px-4 py-1.5 glass rounded-full border border-white/5 text-[10px] font-bold text-white/60 hover:text-white hover:border-white/20 transition-all"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
