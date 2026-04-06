import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { ChevronDown, MapPin, LayoutGrid, Check } from 'lucide-react';
import { CATEGORIES, GOVERNORATES } from '@/constants';

export default function LocationFilter() {
  const { selectedGovernorate, setGovernorate, selectedCategory, setCategory, language } = useHomeStore();
  const [activeDropdown, setActiveDropdown] = useState<'gov' | 'cat' | null>(null);

  const translations = {
    selectGov: { en: "Governorate", ar: "المحافظة", ku: "پارێزگا" },
    selectCat: { en: "Category", ar: "التصنيف", ku: "پۆلێن" },
    allGovs: { en: "All Iraq", ar: "كل العراق", ku: "هەموو عێراق" },
    allCats: { en: "All Categories", ar: "كل التصنيفات", ku: "هەموو پۆلەکان" }
  };

  const getGovName = (govName: string | null) => {
    if (!govName) return translations.allGovs[language];
    const gov = GOVERNORATES.find(g => g.id === govName || g.name.en === govName);
    if (!gov) return govName;
    return language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en;
  };

  const getCatName = (catId: string | null) => {
    if (!catId) return translations.allCats[language];
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return catId;
    return cat.name[language];
  };

  return (
    <div className="w-full px-4 mb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Governorate Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {translations.selectGov[language]}
            </label>
            <button 
              onClick={() => setGovernorate(null)}
              className="text-[9px] font-bold text-primary uppercase tracking-tight hover:underline"
            >
              {translations.allGovs[language]}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setGovernorate(null)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 ${
                !selectedGovernorate 
                  ? "bg-primary border-primary text-bg-dark shadow-[0_0_15px_rgba(255,159,28,0.4)]" 
                  : "bg-white/5 border-white/10 text-white hover:border-white/30"
              }`}
            >
              {translations.allGovs[language]}
            </button>
            {GOVERNORATES.map((gov) => (
              <button
                key={gov.id}
                onClick={() => setGovernorate(gov.name.en)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 ${
                  selectedGovernorate === gov.name.en 
                    ? "bg-primary border-primary text-bg-dark shadow-[0_0_15px_rgba(255,159,28,0.4)]" 
                    : "bg-white/5 border-white/10 text-white hover:border-white/30"
                }`}
              >
                {language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en}
              </button>
            ))}
          </div>
        </div>

        {/* Category Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {translations.selectCat[language]}
            </label>
            <button 
              onClick={() => setCategory(null)}
              className="text-[9px] font-bold text-primary uppercase tracking-tight hover:underline"
            >
              {translations.allCats[language]}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setCategory(null)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 ${
                !selectedCategory 
                  ? "bg-primary border-primary text-bg-dark shadow-[0_0_15px_rgba(255,159,28,0.4)]" 
                  : "bg-white/5 border-white/10 text-white hover:border-white/30"
              }`}
            >
              {translations.allCats[language]}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border-2 ${
                  selectedCategory === cat.id 
                    ? "bg-primary border-primary text-bg-dark shadow-[0_0_15px_rgba(255,159,28,0.4)]" 
                    : "bg-white/5 border-white/10 text-white hover:border-white/30"
                }`}
              >
                {cat.name[language]}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns for more precise selection */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Governorate Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'gov' ? null : 'gov')}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-300 shadow-xl ${
                activeDropdown === 'gov' ? "border-primary bg-[#1E293B] ring-4 ring-primary/10" : "border-white/10 bg-[#1E293B]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <MapPin className={`w-5 h-5 flex-shrink-0 ${selectedGovernorate ? 'text-primary' : 'text-slate-400'}`} />
                <span className={`text-xs font-black uppercase tracking-widest truncate ${selectedGovernorate ? 'text-white' : 'text-slate-400'}`}>
                  {getGovName(selectedGovernorate)}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'gov' ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'gov' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-50 left-0 right-0 mt-3 bg-[#1E293B] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto no-scrollbar p-2"
                >
                  <button
                    onClick={() => { setGovernorate(null); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/5 text-white"
                  >
                    {translations.allGovs[language]}
                    {!selectedGovernorate && <Check className="w-3 h-3 text-primary" />}
                  </button>
                  {GOVERNORATES.map((gov) => (
                    <button
                      key={gov.id}
                      onClick={() => { setGovernorate(gov.name.en); setActiveDropdown(null); }}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                        selectedGovernorate === gov.name.en ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-white"
                      }`}
                    >
                      {language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en}
                      {selectedGovernorate === gov.name.en && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'cat' ? null : 'cat')}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-300 shadow-xl ${
                activeDropdown === 'cat' ? "border-primary bg-[#1E293B] ring-4 ring-primary/10" : "border-white/10 bg-[#1E293B]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <LayoutGrid className={`w-5 h-5 flex-shrink-0 ${selectedCategory ? 'text-primary' : 'text-slate-400'}`} />
                <span className={`text-xs font-black uppercase tracking-widest truncate ${selectedCategory ? 'text-white' : 'text-slate-400'}`}>
                  {getCatName(selectedCategory)}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'cat' ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'cat' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-50 left-0 right-0 mt-3 bg-[#1E293B] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto no-scrollbar p-2"
                >
                  <button
                    onClick={() => { setCategory(null); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/5 text-white"
                  >
                    {translations.allCats[language]}
                    {!selectedCategory && <Check className="w-3 h-3 text-primary" />}
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategory(cat.id); setActiveDropdown(null); }}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                        selectedCategory === cat.id ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-white"
                      }`}
                    >
                      {cat.name[language]}
                      {selectedCategory === cat.id && <Check className="w-3 h-3 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
