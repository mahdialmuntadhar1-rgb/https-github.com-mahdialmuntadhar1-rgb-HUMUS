import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion } from 'motion/react';

const CATEGORIES = [
  { id: 'dining_cuisine', name: 'Dining & Cuisine', icon: '🍽️', color: 'bg-orange-100' },
  { id: 'cafe_coffee', name: 'Cafe & Coffee', icon: '☕', color: 'bg-amber-100' },
  { id: 'shopping_retail', name: 'Shopping & Retail', icon: '🛍️', color: 'bg-blue-100' },
  { id: 'entertainment_events', name: 'Entertainment & Events', icon: '🎬', color: 'bg-purple-100' },
  { id: 'accommodation_stays', name: 'Accommodation & Stays', icon: '🏨', color: 'bg-indigo-100' },
  { id: 'culture_heritage', name: 'Culture & Heritage', icon: '🏛️', color: 'bg-rose-100' },
  { id: 'business_services', name: 'Business & Services', icon: '💼', color: 'bg-slate-100' },
  { id: 'health_wellness', name: 'Health & Wellness', icon: '⚕️', color: 'bg-emerald-100' },
  { id: 'doctors', name: 'Doctors', icon: '👨‍⚕️', color: 'bg-teal-100' },
  { id: 'hospitals', name: 'Hospitals', icon: '🏥', color: 'bg-red-100' },
  { id: 'clinics', name: 'Clinics', icon: '🏥', color: 'bg-pink-100' },
  { id: 'transport_mobility', name: 'Transport & Mobility', icon: '🚗', color: 'bg-gray-100' },
  { id: 'public_essential', name: 'Public & Essential', icon: '🏛️', color: 'bg-cyan-100' },
  { id: 'lawyers', name: 'Lawyers', icon: '⚖️', color: 'bg-blue-200' },
  { id: 'education', name: 'Education', icon: '🎓', color: 'bg-yellow-100' }
];

export default function CategoryGrid() {
  const { selectedCategory, setCategory } = useHomeStore();

  return (
    <div className="py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-1">
            Explore Categories
          </h2>
          <p className="text-sm text-[#64748b]">
            Find the best local businesses across Iraq
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-5">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ y: -6, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`category-card flex flex-col items-center p-2 sm:p-6 transition-all border-2 ${
              selectedCategory === cat.id 
                ? 'border-[#8B1A1A] bg-[#FDECEC]/30 shadow-lg scale-105 z-10' 
                : 'border-transparent bg-white hover:border-[#8B1A1A]/20'
            }`}
          >
            {/* Soft Gradient Background for Icon */}
            <div className={`w-10 h-10 sm:w-16 sm:h-16 ${cat.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-3xl mb-2 sm:mb-4 shadow-inner relative overflow-hidden group border border-black/5`}>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {cat.icon}
            </div>
            
            <span className={`text-[8px] sm:text-[10px] md:text-xs font-bold text-center leading-tight uppercase tracking-[0.05em] sm:tracking-widest poppins-bold ${
              selectedCategory === cat.id ? 'text-[#8B1A1A]' : 'text-[#2B2F33]'
            }`}>
              {cat.name}
            </span>

            {/* Subtle 3D Edge Reflection */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/60" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
