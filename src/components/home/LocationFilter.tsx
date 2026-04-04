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
];

export default function LocationFilter() {
  const { selectedGovernorate, setGovernorate } = useHomeStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 mb-8">
      <div className="flex items-center gap-3 py-4 border-y border-[#E5E7EB]">
        <div className="flex items-center gap-2 text-[#2B2F33] font-bold">
          <MapPin className="w-5 h-5 text-[#2CA6A4]" />
          <span className="text-sm uppercase tracking-wider">Choose your governor first</span>
        </div>
        
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#F5F7F9] hover:bg-[#E5E7EB] rounded-full transition-all border border-[#E5E7EB] text-[#2CA6A4] font-bold text-sm"
        >
          {selectedGovernorate || "Select Governorate"}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {selectedGovernorate && (
          <button 
            onClick={() => setGovernorate(null)}
            className="text-xs font-bold text-[#6B7280] hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            Clear
          </button>
        )}
      </div>

      {/* Governorate Selection Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#2B2F33]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold">Select Governorate</h2>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-[#F5F7F9] transition-colors"
                  >
                    <X className="w-6 h-6 text-[#6B7280]" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {GOVERNORATES.map((gov) => (
                    <button
                      key={gov.name}
                      onClick={() => {
                        setGovernorate(gov.name);
                        setIsOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all border-2 ${
                        selectedGovernorate === gov.name
                          ? "bg-[#2CA6A4] text-white border-[#2CA6A4] shadow-lg"
                          : "bg-[#F5F7F9] text-[#2B2F33] border-transparent hover:border-[#2CA6A4]/30"
                      }`}
                    >
                      <span className="text-sm font-bold">{gov.name}</span>
                      <span className="text-xs opacity-60">{gov.nameAr}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
