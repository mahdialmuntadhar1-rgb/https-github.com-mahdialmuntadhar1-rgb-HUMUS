import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Store, Users, Sparkles } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SLOGANS = [
  {
    en: 'Find trusted Iraqi businesses near you',
    ar: 'اكتشف أفضل المشاريع العراقية من حولك',
    ku: 'باشترین بزنسە عێراقییەکان لە نزیکت بدۆزەوە',
  },
  {
    en: 'Support local shops and services',
    ar: 'ادعم المحلات والخدمات المحلية',
    ku: 'پاڵپشتی دووکان و خزمەتگوزاری ناوخۆیی بکە',
  },
  {
    en: 'شكو ماكو — your city, your guide',
    ar: 'شكو ماكو — دليلك المحلي في مدينتك',
    ku: 'شەکو ماکو — ڕێنمای ناوخۆی شارەکەت',
  },
];

export default function HeroSection({ businesses, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const isRTL = language !== 'en';
  const [currentSlogan, setCurrentSlogan] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const governorateCount = new Set(businesses.map((b) => b.governorate).filter(Boolean)).size;

  return (
    <section className="w-full px-4 sm:px-6 pt-5 pb-5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-white/40 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] shadow-[0_30px_70px_-22px_rgba(15,23,42,0.6)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.26),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.2),transparent_40%)]" />
          <div className="relative z-10 p-5 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {language === 'ar' ? 'دليل العراق المحلي' : language === 'ku' ? 'دایرێکتۆری ناوخۆیی عێراق' : 'Iraq Local Directory'}
            </div>

            <div className="mt-4 h-20 sm:h-24">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentSlogan}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-2xl sm:text-4xl font-black text-white leading-tight"
                >
                  {SLOGANS[currentSlogan][language]}
                </motion.h1>
              </AnimatePresence>
            </div>

            <p className="mt-2 text-sm text-slate-200 max-w-2xl">
              {language === 'ar'
                ? 'للمستخدمين: اكتشف الأماكن المميزة بسهولة. لأصحاب الأعمال: زِد ظهور مشروعك أمام زبائن حقيقيين.'
                : language === 'ku'
                  ? 'بۆ بەکارهێنەران: شوێنە تایبەتەکان بە ئاسانی بدۆزەوە. بۆ خاوەن کار: دەرکەوتنی بزنسەکەت زیاد بکە.'
                  : 'For users: discover trusted places fast. For business owners: reach nearby customers with better visibility.'}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-white">
                <p className="text-xs text-white/75">{language === 'ar' ? 'الأعمال' : 'Businesses'}</p>
                <p className="text-lg sm:text-xl font-extrabold">{businesses.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-white">
                <p className="text-xs text-white/75">{language === 'ar' ? 'المحافظات' : 'Governorates'}</p>
                <p className="text-lg sm:text-xl font-extrabold">{governorateCount || '--'}</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-white">
                <p className="text-xs text-white/75">{language === 'ar' ? 'العلامة' : 'Brand'}</p>
                <p className="text-sm sm:text-base font-extrabold">شكو ماكو</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/15 bg-white/95 p-2 shadow-xl">
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                <div className="px-3 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث بالاسم أو المدينة أو الفئة...' : 'Search by business, city, or category...'}
                  className={`flex-1 bg-transparent py-3 text-sm sm:text-base font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white"><MapPin className="w-3 h-3"/> العراق</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white"><Store className="w-3 h-3"/> My City</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white"><Users className="w-3 h-3"/> Shakumaku / شكو ماكو</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
