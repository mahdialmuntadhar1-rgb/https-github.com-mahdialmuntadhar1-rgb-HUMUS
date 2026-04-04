import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { ChevronDown, MapPin, X } from 'lucide-react';

const GOVERNORATES = [
  { name: "Baghdad", nameAr: "بغداد" },
  { name: "Erbil", nameAr: "أربيل" },
  { name: "Basra", nameAr: "البصرة" },
  { name: "Mosul", nameAr: "الموصل" },
  { name: "Sulaymaniyah", nameAr: "السليمانية" },
  { name: "Duhok", nameAr: "دهوك" },
  { name: "Kirkuk", nameAr: "كركوك" },
  { name: "Najaf", nameAr: "النجف" },
  { name: "Karbala", nameAr: "كربلاء" },
  { name: "Nasiriyah", nameAr: "الناصرية" },
  { name: "Amarah", nameAr: "العمارة" },
  { name: "Hilla", nameAr: "الحلة" },
  { name: "Kut", nameAr: "الكوت" },
  { name: "Diwaniyah", nameAr: "الديوانية" },
  { name: "Ramadi", nameAr: "الرمادي" },
  { name: "Baqubah", nameAr: "بعقوبة" },
  { name: "Samawah", nameAr: "السماوة" },
  { name: "Tikrit", nameAr: "تكريت" },
  { name: "Halabja", nameAr: "حلبجة" },
];

const CITIES: Record<string, string[]> = {
  Baghdad: ["Mansour", "Karrada", "Adhamiyah", "Yarmouk", "Zayouna"],
  Erbil: ["Center", "Ankawa", "Bakhtiari", "Empire", "Dream City"],
  Basra: ["Ashar", "Jaza'ir", "Abul Khasib", "Zubair"],
  Mosul: ["Zuhour", "Muthanna", "Sukkar", "Hadba"],
  Sulaymaniyah: ["Center", "Bakhtiari", "Sarchinar", "Raperin"],
};

export default function LocationFilter() {
  const { selectedGovernorate, setGovernorate, selectedCity, setCity } = useHomeStore();

  // Duplicate the list for seamless looping
  const duplicatedGovernorates = [...GOVERNORATES, ...GOVERNORATES];

  return (
    <div className="w-full mb-10">
      {/* All Iraq / Reset Header */}
      <div className="max-w-6xl mx-auto px-4 mb-4 flex items-center justify-between">
        <h3 className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Select Location</h3>
        {selectedGovernorate && (
          <button 
            onClick={() => {
              setGovernorate(null);
              setCity(null);
            }}
            className="text-[10px] font-black text-[#2CA6A4] uppercase tracking-widest flex items-center gap-1 hover:underline"
          >
            <X className="w-3 h-3" /> Clear Filters
          </button>
        )}
      </div>

      {/* Governorate Marquee */}
      <div className="w-full overflow-hidden relative group">
        <div className="flex animate-marquee whitespace-nowrap py-2">
          {duplicatedGovernorates.map((gov, idx) => (
            <button
              key={`${gov.name}-${idx}`}
              onClick={() => {
                setGovernorate(gov.name);
                setCity(null);
              }}
              className={`mx-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                selectedGovernorate === gov.name
                  ? "bg-[#2CA6A4] text-white border-[#2CA6A4] shadow-lg shadow-[#2CA6A4]/20"
                  : "bg-white text-[#2B2F33] border-[#E5E7EB] hover:border-[#2CA6A4]/30"
              }`}
            >
              {gov.name}
            </button>
          ))}
        </div>

        <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-2">
          {duplicatedGovernorates.map((gov, idx) => (
            <button
              key={`${gov.name}-loop-${idx}`}
              onClick={() => {
                setGovernorate(gov.name);
                setCity(null);
              }}
              className={`mx-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                selectedGovernorate === gov.name
                  ? "bg-[#2CA6A4] text-white border-[#2CA6A4] shadow-lg shadow-[#2CA6A4]/20"
                  : "bg-white text-[#2B2F33] border-[#E5E7EB] hover:border-[#2CA6A4]/30"
              }`}
            >
              {gov.name}
            </button>
          ))}
        </div>
      </div>

      {/* City Selection (Conditional) */}
      <AnimatePresence>
        {selectedGovernorate && CITIES[selectedGovernorate] && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-6xl mx-auto px-4 mt-6"
          >
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => setCity(null)}
                className={`flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  selectedCity === null
                    ? "bg-[#2B2F33] text-white"
                    : "bg-[#F5F7F9] text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
              >
                All {selectedGovernorate}
              </button>
              {CITIES[selectedGovernorate].map((city) => (
                <button
                  key={city}
                  onClick={() => setCity(city)}
                  className={`flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    selectedCity === city
                      ? "bg-[#2B2F33] text-white"
                      : "bg-[#F5F7F9] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 60s linear infinite;
        }
        .group:hover .animate-marquee, .group:hover .animate-marquee2 {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}
