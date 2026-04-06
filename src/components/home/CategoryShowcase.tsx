import { useHomeStore } from '@/stores/homeStore';
import { motion } from 'motion/react';
import { useMetadata } from '@/hooks/useMetadata';
import { LayoutGrid } from 'lucide-react';
import { ICON_MAP } from '@/constants';

const CATEGORY_IMAGES: Record<string, string> = {
  'RESTAURANTS & DINING': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop',
  'CAFES & COFFEE': 'https://images.unsplash.com/photo-1501339819398-ed495197ff21?q=80&w=300&auto=format&fit=crop',
  'BEAUTY & SALONS': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300&auto=format&fit=crop',
  'MEDICAL CLINICS': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=300&auto=format&fit=crop',
  'HOSPITALS & CLINICS': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=300&auto=format&fit=crop',
  'PHARMACY & DRUGS': 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=300&auto=format&fit=crop',
  'SUPERMARKETS': 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=300&auto=format&fit=crop',
  'HOTELS & STAYS': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300&auto=format&fit=crop',
  'GYM & FITNESS': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop',
  'FURNITURE & HOME': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300&auto=format&fit=crop',
  'ELECTRONICS': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=300&auto=format&fit=crop',
  'FASHION & APPAREL': 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=300&auto=format&fit=crop',
  'CARS & VEHICLES': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=300&auto=format&fit=crop',
  'REAL ESTATE': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=300&auto=format&fit=crop',
  'EDUCATION': 'https://images.unsplash.com/photo-1523050335392-9bc567597f81?q=80&w=300&auto=format&fit=crop',
  'SERVICES': 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?q=80&w=300&auto=format&fit=crop',
};

export default function CategoryShowcase() {
  const { selectedCategory, setCategory, language } = useHomeStore();
  const { categories, loading } = useMetadata();

  if (loading && categories.length === 0) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex-shrink-0 w-28 h-28 bg-slate-100 animate-pulse rounded-[24px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full py-6 bg-white/50 backdrop-blur-sm border-y border-slate-100 mb-8">
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 snap-x">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setCategory(null)}
          className={`flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-[24px] border-2 transition-all duration-500 snap-start relative overflow-hidden group ${
            !selectedCategory 
              ? 'border-primary shadow-xl shadow-primary/20 scale-105' 
              : 'border-slate-200 hover:border-primary/50'
          }`}
        >
          <div className={`absolute inset-0 transition-opacity duration-500 ${!selectedCategory ? 'bg-primary opacity-100' : 'bg-white opacity-100'}`} />
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-2">
            <LayoutGrid size={24} className={`mb-2 ${!selectedCategory ? 'text-white' : 'text-text-muted'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${!selectedCategory ? 'text-white' : 'text-text-muted'}`}>
              {language === 'ar' ? 'الكل' : language === 'ku' ? 'هەموو' : 'All'}
            </span>
          </div>
        </motion.button>

        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const Icon = ICON_MAP[cat.icon_name || 'Store'] || ICON_MAP['Store'];
          const imageUrl = CATEGORY_IMAGES[cat.name.en] || `https://picsum.photos/seed/${cat.id}/300/300`;
          
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(isActive ? null : cat.id)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-[24px] border-2 transition-all duration-500 snap-start relative overflow-hidden group ${
                isActive 
                  ? 'border-primary shadow-xl shadow-primary/20 scale-105' 
                  : 'border-slate-200 hover:border-primary/50 hover:shadow-lg hover:shadow-black/5'
              }`}
            >
              {/* Background Image with Blur */}
              <div className="absolute inset-0">
                <img 
                  src={imageUrl} 
                  alt="" 
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 blur-[2px] brightness-[0.4] ${
                    isActive ? 'brightness-[0.6] blur-none' : ''
                  }`}
                />
                <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-primary/40' : 'bg-black/20'}`} />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center px-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-500 ${
                  isActive ? 'bg-white text-primary' : 'bg-white/10 text-white group-hover:bg-white/20'
                }`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
                  {cat.name[language]}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
