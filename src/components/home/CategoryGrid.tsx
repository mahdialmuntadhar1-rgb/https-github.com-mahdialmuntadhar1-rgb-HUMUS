import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion } from 'motion/react';

const CATEGORIES = [
  { id: 'food_drink', name: 'Food & Drink', icon: '🍔', color: 'bg-orange-100' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'bg-blue-100' },
  { id: 'health', name: 'Health', icon: '🏥', color: 'bg-red-100' },
  { id: 'beauty', name: 'Beauty', icon: '💅', color: 'bg-pink-100' },
  { id: 'automotive', name: 'Automotive', icon: '🚗', color: 'bg-gray-100' },
  { id: 'services', name: 'Services', icon: '🛠️', color: 'bg-green-100' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'bg-purple-100' },
  { id: 'hotels', name: 'Hotels', icon: '🏨', color: 'bg-indigo-100' },
  { id: 'education', name: 'Education', icon: '🎓', color: 'bg-yellow-100' },
  { id: 'real_estate', name: 'Real Estate', icon: '🏠', color: 'bg-cyan-100' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: 'bg-sky-100' },
  { id: 'tech', name: 'Technology', icon: '💻', color: 'bg-slate-100' }
];

export default function CategoryGrid() {
  const { selectedCategory, setCategory } = useHomeStore();
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll ? CATEGORIES : CATEGORIES.slice(0, 8);

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#1A1A1A] font-poppins">Categories</h2>
        <button 
          onClick={() => setShowAll(!showAll)}
          className="text-sm font-semibold text-[#FF6B35] hover:underline"
        >
          {showAll ? 'Show Less' : 'Show All'}
        </button>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {visibleCategories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all border-2 ${
              selectedCategory === cat.id 
                ? 'border-[#FF6B35] bg-white shadow-md' 
                : 'border-transparent bg-white hover:border-gray-200'
            }`}
          >
            <div className={`w-12 h-12 ${cat.color} rounded-full flex items-center justify-center text-2xl mb-2`}>
              {cat.icon}
            </div>
            <span className="text-[10px] md:text-xs font-bold text-center leading-tight">
              {cat.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
