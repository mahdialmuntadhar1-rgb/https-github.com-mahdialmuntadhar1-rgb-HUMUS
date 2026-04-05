import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { supabase } from '@/lib/supabaseClient';
import { ChevronDown, MapPin, X } from 'lucide-react';

interface Governorate {
  name: string;
  nameAr: string;
  count: number;
}

interface City {
  name: string;
  count: number;
}

export default function LocationFilterDynamic() {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedGovernorate, selectedCity, setGovernorate, setCity } = useHomeStore();

  const fetchGovernorates = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('governorate')
        .not('governorate', 'is', null);

      if (error) throw error;

      // Arabic names mapping
      const arabicNames: Record<string, string> = {
        "Baghdad": "بغداد",
        "Basra": "البصرة",
        "Anbar": "الأنبار",
        "Kirkuk": "كركوك",
        "Najaf": "النجف",
        "Karbala": "كربلاء",
        "Nasiriyah": "الناصرية",
        "Amarah": "العمارة",
        "Hilla": "الحلة",
        "Kut": "الكوت",
        "Diwaniyah": "الديوانية",
        "Ramadi": "الرمادي",
        "Baqubah": "بعقوبة",
        "Samawah": "السماوة",
        "Tikrit": "تكريت",
        "Halabja": "حلبجة",
        "Duhok": "دهوك",
        "Erbil": "أربيل",
        "Sulaymaniyah": "السليمانية",
        "Nineveh": "نينوى",
        "Babylon": "بابل",
        "Wasit": "واسط",
        "Dhi Qar": "ذي قار",
        "Maysan": "ميسان",
        "Muthanna": "المثنى",
        "Qadisiyyah": "القادسية",
        "Diyala": "ديالى"
      };

      // Count businesses per governorate
      const governorateCount: Record<string, number> = {};
      data.forEach(business => {
        if (business.governorate) {
          governorateCount[business.governorate] = (governorateCount[business.governorate] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const governorateArray = Object.entries(governorateCount)
        .map(([name, count]) => ({ 
          name, 
          nameAr: arabicNames[name] || name, 
          count 
        }))
        .sort((a, b) => b.count - a.count);

      setGovernorates(governorateArray);
    } catch (error) {
      console.error('Error fetching governorates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    if (!selectedGovernorate) {
      setCities([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('city')
        .eq('governorate', selectedGovernorate)
        .not('city', 'is', null);

      if (error) throw error;

      // Count businesses per city
      const cityCount: Record<string, number> = {};
      data.forEach(business => {
        if (business.city) {
          cityCount[business.city] = (cityCount[business.city] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const cityArray = Object.entries(cityCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setCities(cityArray);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  useEffect(() => {
    fetchGovernorates();
  }, []);

  useEffect(() => {
    if (selectedGovernorate) {
      fetchCities();
    }
  }, [selectedGovernorate]);

  if (loading) {
    return (
      <div className="w-full mb-10">
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <h3 className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Select Location</h3>
        </div>
        <div className="w-full overflow-hidden relative group">
          <div className="flex gap-2 py-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="mx-2 px-6 py-2.5 rounded-2xl bg-gray-300 h-8 w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          {governorates.map((gov, idx) => (
            <button
              key={`${gov.name}-${idx}`}
              onClick={() => {
                setGovernorate(gov.name);
                setCity(null);
              }}
              className={`mx-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 pointer-events-auto relative z-10 ${
                selectedGovernorate === gov.name
                  ? "bg-[#2CA6A4] text-white border-[#2CA6A4] shadow-lg shadow-[#2CA6A4]/20"
                  : "bg-white text-[#2B2F33] border-[#E5E7EB] hover:border-[#2CA6A4]/30"
              }`}
            >
              {gov.name}
              <span className="text-[9px] bg-[#E5E7EB] text-[#6B7280] px-1.5 py-0.5 rounded-full">
                {gov.count}
              </span>
            </button>
          ))}
        </div>

        <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-2">
          {governorates.map((gov, idx) => (
            <button
              key={`${gov.name}-loop-${idx}`}
              onClick={() => {
                setGovernorate(gov.name);
                setCity(null);
              }}
              className={`mx-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 pointer-events-auto relative z-10 ${
                selectedGovernorate === gov.name
                  ? "bg-[#2CA6A4] text-white border-[#2CA6A4] shadow-lg shadow-[#2CA6A4]/20"
                  : "bg-white text-[#2B2F33] border-[#E5E7EB] hover:border-[#2CA6A4]/30"
              }`}
            >
              {gov.name}
              <span className="text-[9px] bg-[#E5E7EB] text-[#6B7280] px-1.5 py-0.5 rounded-full">
                {gov.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cities Dropdown */}
      <AnimatePresence>
        {selectedGovernorate && cities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-6xl mx-auto px-4 mt-6"
          >
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#2CA6A4]" />
                <span className="text-xs font-black text-[#6B7280] uppercase tracking-wider">
                  Cities in {selectedGovernorate}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {cities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => setCity(city.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                      selectedCity === city.name
                        ? "bg-[#2CA6A4] text-white border-[#2CA6A4]"
                        : "bg-[#F5F7F9] text-[#2B2F33] border-[#E5E7EB] hover:border-[#2CA6A4]/30"
                    }`}
                  >
                    {city.name}
                    <span className="ml-1 text-[9px] opacity-60">({city.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
