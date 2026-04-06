import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion, AnimatePresence } from 'motion/react';
import { useMetadata } from '@/hooks/useMetadata';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ICON_MAP } from '@/constants';

export default function CategoryGrid() {
  const { selectedCategory, setCategory, language } = useHomeStore();
  const { categories, loading } = useMetadata();
  const [isExpanded, setIsExpanded] = useState(false);

  const INITIAL_COUNT = 6;
  const visibleCategories = isExpanded ? categories : categories.slice(0, INITIAL_COUNT);

  if (loading && categories.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-slate-800 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full mb-12 bg-[#0F172A] p-4 sm:p-6 rounded-[32px] border border-white/5 shadow-2xl">
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
          <div className="w-2.5 h-2.5 border-2 border-white rotate-45" />
        </div>
        <h2 className="text-base font-black text-white poppins-bold uppercase tracking-tight">
          {language === 'ar' ? 'التصنيفات' : language === 'ku' ? 'پۆلەکان' : 'Categories'}
          {selectedCategory && (
            <span className="ml-2 text-primary text-xs font-bold normal-case">
              ({categories.filter(c => c.id === selectedCategory).length} selected)
            </span>
          )}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <AnimatePresence mode="popLayout">
          {visibleCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const Icon = ICON_MAP[cat.icon_name || 'Store'] || ICON_MAP['Store'];
            
            return (
              <motion.button
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(isActive ? null : cat.id)}
                className={`group relative flex flex-col items-center justify-center p-3 sm:p-6 rounded-[20px] sm:rounded-[24px] border-2 transition-all duration-500 ${
                  isActive 
                    ? 'bg-[#2D364D] border-primary shadow-[0_0_30px_rgba(0,191,165,0.3)] scale-105 z-10' 
                    : 'bg-[#1E293B] border-white/5 hover:border-white/20'
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white stroke-[4]" />
                  </div>
                )}

                {cat.isHot && (
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-orange-500 text-white text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                    Hot
                  </div>
                )}

                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 transition-all duration-500 ${
                  isActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:scale-110'
                }`}>
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
                </div>

                <div className="text-center w-full">
                  <h3 className={`text-[8px] sm:text-[11px] font-black uppercase tracking-widest mb-0.5 sm:mb-1 transition-colors duration-300 line-clamp-1 ${
                    isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {cat.name[language]}
                  </h3>
                  <p className={`text-[7px] sm:text-[9px] font-bold uppercase tracking-tighter transition-colors duration-300 ${
                    isActive ? 'text-primary' : 'text-slate-500'
                  }`}>
                    {cat.types || 3} Types
                  </p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {categories.length > INITIAL_COUNT && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-primary hover:border-primary transition-all shadow-xl"
          >
            {isExpanded ? (
              <>
                {language === 'ar' ? 'عرض أقل' : language === 'ku' ? 'بینینی کەمتر' : 'Show Less'}
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                {language === 'ar' ? 'عرض المزيد' : language === 'ku' ? 'بینینی زیاتر' : 'Load More'}
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
