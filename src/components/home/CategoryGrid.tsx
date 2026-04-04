import { useHomeStore } from '@/stores/homeStore';
import { motion } from 'motion/react';
import { 
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, MoreHorizontal, 
  Pill, Dumbbell, Sparkles, Store, Armchair, Check, Tag
} from 'lucide-react';

const CATEGORIES = [
  { id: 'dining', name: 'RESTAURANTS & DINING', icon: Utensils, types: 4 },
  { id: 'cafe', name: 'CAFES & COFFEE', icon: Coffee, types: 3 },
  { id: 'hotels', name: 'HOTELS & STAYS', icon: Hotel, types: 3 },
  { id: 'shopping', name: 'SHOPPING & RETAIL', icon: ShoppingBag, types: 3 },
  { id: 'banks', name: 'BANKS & FINANCE', icon: Landmark, types: 3 },
  { id: 'education', name: 'EDUCATION', icon: GraduationCap, types: 3 },
  { id: 'entertainment', name: 'ENTERTAINMENT', icon: Clapperboard, types: 3 },
  { id: 'tourism', name: 'TOURISM & TRAVEL', icon: Plane, types: 3, hasDot: true },
  { id: 'doctors', name: 'DOCTORS & PHYSICIANS', icon: Stethoscope, types: 6 },
  { id: 'lawyers', name: 'LAWYERS & LEGAL', icon: Scale, types: 3 },
  { id: 'hospitals', name: 'HOSPITALS & CLINICS', icon: Hospital, types: 4 },
  { id: 'clinics', name: 'MEDICAL CLINICS', icon: HeartPulse, types: 5 },
  { id: 'realestate', name: 'REAL ESTATE', icon: Home, types: 4 },
  { id: 'events', name: 'EVENTS & VENUES', icon: PartyPopper, types: 4, isHot: true },
  { id: 'others', name: 'OTHERS & GENERAL', icon: MoreHorizontal, types: 4 },
  { id: 'pharmacy', name: 'PHARMACY & DRUGS', icon: Pill, types: 3 },
  { id: 'gym', name: 'GYM & FITNESS', icon: Dumbbell, types: 4 },
  { id: 'beauty', name: 'BEAUTY & SALONS', icon: Sparkles, types: 4 },
  { id: 'supermarkets', name: 'SUPERMARKETS', icon: Store, types: 4 },
  { id: 'furniture', name: 'FURNITURE & HOME', icon: Armchair, types: 4 },
];

export default function CategoryGrid() {
  const { selectedCategory, setCategory } = useHomeStore();

  return (
    <div className="w-full bg-[#1A222E] p-6 sm:p-8 rounded-[32px] mb-12 shadow-2xl border border-[#2D3748]">
      <div className="flex items-center gap-3 mb-10">
        <Tag className="w-6 h-6 text-amber-500 fill-amber-500/20" />
        <h2 className="text-white font-bold text-xl poppins-bold">
          Categories ({selectedCategory ? '1' : '0'} selected)
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const Icon = cat.icon;
          
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.03, backgroundColor: '#242F3E' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCategory(isActive ? null : cat.id)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-[24px] transition-all duration-300 border-2 aspect-[1.4/1] ${
                isActive
                  ? "bg-[#242F3E] border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
                  : "bg-[#1F2937]/50 border-[#2D3748] hover:border-[#4B5563]"
              }`}
            >
              {/* Hot Badge */}
              {cat.isHot && (
                <div className="absolute -top-2.5 -left-1 bg-amber-500 text-[#111827] text-[9px] font-black px-2.5 py-1 rounded-lg z-10 shadow-lg uppercase tracking-tighter">
                  HOT
                </div>
              )}

              {/* Red Dot */}
              {cat.hasDot && (
                <div className="absolute top-5 right-5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              )}

              {/* Selected Checkmark */}
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1A222E]">
                  <Check className="w-3.5 h-3.5 text-[#111827] stroke-[4]" />
                </div>
              )}

              <div className={`mb-4 p-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-[#1A222E]'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-[#111827]' : 'text-amber-500'}`} />
              </div>

              <div className="text-center">
                <h3 className={`text-[10px] font-black tracking-widest mb-1.5 uppercase leading-tight ${isActive ? 'text-white' : 'text-gray-200'}`}>
                  {cat.name}
                </h3>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                  {cat.types} TYPES
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
