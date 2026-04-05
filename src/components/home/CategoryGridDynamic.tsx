import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';
import { 
  Utensils, Coffee, ShoppingBag, Building, Heart, Briefcase, 
  Music, Car, Package, Landmark 
} from 'lucide-react';

interface Category {
  name: string;
  count: number;
  icon: React.ComponentType<any>;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'Restaurants & Dining': Utensils,
  'Cafés & Coffee': Coffee,
  'Shopping & Retail': ShoppingBag,
  'Hotels & Stays': Building,
  'Health & Wellness': Heart,
  'Business Services': Briefcase,
  'Entertainment & Events': Music,
  'Transport & Mobility': Car,
  'Essential Services': Package,
  'Culture & Heritage': Landmark,
};

export default function CategoryGridDynamic() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCategory, setCategory } = useHomeStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('category')
          .not('category', 'is', null);

        if (error) throw error;

        // Count businesses per category
        const categoryCount: Record<string, number> = {};
        data.forEach(business => {
          if (business.category) {
            categoryCount[business.category] = (categoryCount[business.category] || 0) + 1;
          }
        });

        // Convert to array and sort by count
        const categoryArray = Object.entries(categoryCount)
          .map(([name, count]) => ({ 
            name, 
            count,
            icon: ICON_MAP[name] || Package
          }))
          .sort((a, b) => b.count - a.count);

        setCategories(categoryArray);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-300 rounded-2xl h-20 w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {categories.map((category, index) => {
        const Icon = category.icon;
        return (
          <motion.button
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(category.name)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all border-2 ${
              selectedCategory === category.name
                ? "bg-[#2CA6A4] text-white border-[#2CA6A4] shadow-lg shadow-[#2CA6A4]/20"
                : "bg-white text-[#2B2F33] border-[#E5E7EB] hover:border-[#2CA6A4]/30"
            }`}
          >
            <Icon className="w-8 h-8 mb-3" />
            <span className="text-xs font-bold text-center uppercase tracking-wider">
              {category.name}
            </span>
            <span className={`text-xs mt-1 font-black ${
              selectedCategory === category.name ? "text-white/80" : "text-[#6B7280]"
            }`}>
              {category.count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
