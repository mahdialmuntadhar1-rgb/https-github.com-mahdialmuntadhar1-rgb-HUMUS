import React from 'react';
import { motion } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';

interface MainTabSwitcherProps {
  activeTab: 'guide' | 'social';
  onTabChange: (tab: 'guide' | 'social') => void;
}

export default function MainTabSwitcher({ activeTab, onTabChange }: MainTabSwitcherProps) {
  const { language } = useHomeStore();

  return (
    <div className="sticky top-[60px] sm:top-[73px] z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-premium">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-center items-center h-20 sm:h-28 gap-4 sm:gap-12">
          {/* My City / Directory Tab */}
          <button 
            onClick={() => onTabChange('guide')}
            className={`group relative flex items-center gap-3 sm:gap-5 px-6 sm:px-10 py-4 sm:py-6 rounded-2xl sm:rounded-[32px] transition-all duration-500 border-2 ${
              activeTab === 'guide' 
                ? 'bg-primary border-primary text-white shadow-premium scale-105 z-10' 
                : 'bg-slate-50 border-transparent text-slate-400 hover:text-primary hover:bg-white hover:border-primary/30'
            }`}
          >
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl transition-all duration-500 ${activeTab === 'guide' ? 'bg-white/20 text-white -rotate-6' : 'bg-slate-200 group-hover:bg-primary/20 group-hover:text-primary'}`}>
              🏙️
            </div>
            <div className="flex flex-col items-start text-left">
              <span className={`text-[8px] sm:text-[12px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 ${activeTab === 'guide' ? 'text-accent' : 'text-slate-400'}`}>
                {language === 'ar' ? 'الدليل' : language === 'ku' ? 'ڕێبەر' : 'Directory'}
              </span>
              <span className="text-base sm:text-2xl font-black uppercase tracking-tight poppins-bold leading-none">
                {language === 'ar' ? 'مدينتي' : language === 'ku' ? 'شارەکەم' : 'My City'}
              </span>
            </div>
            {activeTab === 'guide' && (
              <motion.div 
                layoutId="activeTabUnderline"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent rounded-full"
              />
            )}
          </button>

          {/* Shaku Maku / Social Tab */}
          <button 
            onClick={() => onTabChange('social')}
            className={`group relative flex items-center gap-3 sm:gap-5 px-6 sm:px-10 py-4 sm:py-6 rounded-2xl sm:rounded-[32px] transition-all duration-500 border-2 ${
              activeTab === 'social' 
                ? 'bg-accent border-accent text-bg-dark shadow-gold scale-110 z-20' 
                : 'bg-slate-50 border-transparent text-slate-400 hover:text-accent hover:bg-white hover:border-accent/30'
            }`}
          >
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl transition-all duration-500 ${activeTab === 'social' ? 'bg-white/40 text-bg-dark rotate-12 scale-110' : 'bg-slate-200 group-hover:bg-accent/20 group-hover:text-accent'}`}>
              📱
            </div>
            <div className="flex flex-col items-start text-left">
              <span className={`text-[8px] sm:text-[12px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5 sm:mb-1 ${activeTab === 'social' ? 'text-primary' : 'text-slate-400'}`}>
                {language === 'ar' ? 'آخر الأخبار' : language === 'ku' ? 'دوایین هەواڵ' : 'Social Feed'}
              </span>
              <span className="text-base sm:text-2xl font-black uppercase tracking-tight poppins-bold leading-none">
                {language === 'ar' ? 'شكو ماكو' : language === 'ku' ? 'چی هەیە چی نیە' : 'Shaku Maku'}
              </span>
            </div>
            {activeTab === 'social' && (
              <motion.div 
                layoutId="activeTabUnderline"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
