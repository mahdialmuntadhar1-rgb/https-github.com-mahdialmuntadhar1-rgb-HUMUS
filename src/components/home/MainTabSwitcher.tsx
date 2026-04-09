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
    <div className="sticky top-[73px] z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-premium">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center h-24 gap-6 sm:gap-16">
          <button 
            onClick={() => onTabChange('social')}
            className={`group relative flex items-center gap-4 px-10 py-5 rounded-[24px] transition-all duration-700 ${
              activeTab === 'social' 
                ? 'bg-primary text-white shadow-[0_20px_40px_-10px_rgba(255,159,28,0.4)] scale-110 z-10' 
                : 'text-slate-400 hover:text-primary hover:bg-slate-50 scale-95'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-700 ${activeTab === 'social' ? 'bg-white/20 rotate-[15deg] scale-110' : 'bg-slate-100 group-hover:rotate-12'}`}>
              📱
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1">Social Feed</span>
              <span className="text-base font-black uppercase tracking-tight poppins-bold leading-none">
                {language === 'ar' ? 'شكو ماكو' : language === 'ku' ? 'شکو ماکۆ' : 'Shakumaku'}
              </span>
            </div>
          </button>

          <button 
            onClick={() => onTabChange('guide')}
            className={`group relative flex items-center gap-4 px-10 py-5 rounded-[24px] transition-all duration-700 ${
              activeTab === 'guide' 
                ? 'bg-accent text-bg-dark shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] scale-110 z-10' 
                : 'text-slate-400 hover:text-accent hover:bg-slate-50 scale-95'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-700 ${activeTab === 'guide' ? 'bg-white/20 -rotate-[15deg] scale-110' : 'bg-slate-100 group-hover:-rotate-12'}`}>
              🏙️
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1">Directory</span>
              <span className="text-base font-black uppercase tracking-tight poppins-bold leading-none">
                {language === 'ar' ? 'مدينتي' : language === 'ku' ? 'شارەکەم' : 'My City'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
