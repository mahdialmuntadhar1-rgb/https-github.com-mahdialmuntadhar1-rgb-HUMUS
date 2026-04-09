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
        <div className="flex justify-center items-center h-16 sm:h-24 gap-2 sm:gap-16">
          <button 
            onClick={() => onTabChange('social')}
            className={`group relative flex items-center gap-2 sm:gap-6 px-3 sm:px-12 py-2 sm:py-6 rounded-xl sm:rounded-[32px] transition-all duration-700 ${
              activeTab === 'social' 
                ? 'bg-primary text-white shadow-md sm:shadow-[0_25px_50px_-12px_rgba(255,159,28,0.5)] scale-105 sm:scale-110 z-10' 
                : 'text-slate-400 hover:text-primary hover:bg-slate-50 scale-95'
            }`}
          >
            <div className={`w-7 h-7 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center text-lg sm:text-3xl transition-all duration-700 ${activeTab === 'social' ? 'bg-white/20 rotate-[15deg] scale-110' : 'bg-slate-100 group-hover:rotate-12'}`}>
              📱
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[7px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em] opacity-60 leading-none mb-0.5 sm:mb-1">Social Feed</span>
              <div className="flex flex-col items-start">
                <span className="text-xs sm:text-2xl font-black uppercase tracking-tight poppins-bold leading-tight">شكو ماكو</span>
                <span className="text-[6px] sm:text-sm font-bold opacity-80 leading-none hidden xs:block">چی هەیە چی نیە • Shaku Maku</span>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onTabChange('guide')}
            className={`group relative flex items-center gap-2 sm:gap-6 px-3 sm:px-12 py-2 sm:py-6 rounded-xl sm:rounded-[32px] transition-all duration-700 ${
              activeTab === 'guide' 
                ? 'bg-accent text-bg-dark shadow-md sm:shadow-[0_25px_50px_-12px_rgba(245,158,11,0.5)] scale-105 sm:scale-110 z-10' 
                : 'text-slate-400 hover:text-accent hover:bg-slate-50 scale-95'
            }`}
          >
            <div className={`w-7 h-7 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center text-lg sm:text-3xl transition-all duration-700 ${activeTab === 'guide' ? 'bg-white/20 -rotate-[15deg] scale-110' : 'bg-slate-100 group-hover:-rotate-12'}`}>
              🏙️
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[7px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em] opacity-60 leading-none mb-0.5 sm:mb-1">Directory</span>
              <div className="flex flex-col items-start">
                <span className="text-xs sm:text-2xl font-black uppercase tracking-tight poppins-bold leading-tight">مدينتي</span>
                <span className="text-[6px] sm:text-sm font-bold opacity-80 leading-none hidden xs:block">شارەکەم • My City</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
