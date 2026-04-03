import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin } from 'lucide-react';
import { Business } from '@/lib/supabase';

interface BusinessGridProps {
  businesses: Business[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onBusinessClick?: (business: Business) => void;
}

export default function BusinessGrid({ businesses, loading, hasMore, onLoadMore, onBusinessClick }: BusinessGridProps) {
  if (loading && businesses.length === 0) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-2xl" />
      ))}
    </div>
  );

  if (!loading && businesses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-[#F5F7F9] rounded-full flex items-center justify-center mb-4">
        <MapPin className="w-8 h-8 text-[#6B7280]" />
      </div>
      <h3 className="text-lg font-bold text-[#2B2F33] mb-2">No businesses found</h3>
      <p className="text-sm text-[#6B7280] max-w-xs">
        Try adjusting your filters or search query to find what you're looking for.
      </p>
    </div>
  );

  return (
    <div id="explore-section" className="px-4 mb-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {businesses.map((biz) => (
          <motion.div
            key={biz.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => onBusinessClick?.(biz)}
            className="bg-white rounded-[16px] overflow-hidden shadow-[0_6px_18px_rgba(0,0,0,0.08)] border border-[#E5E7EB] flex flex-col group cursor-pointer"
          >
            {/* Image Section (60%) */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={biz.image} 
                alt={biz.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlays */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 bg-[#2CA6A4] text-white text-[8px] font-bold rounded-md shadow-sm uppercase tracking-wider">
                  {biz.category.split('_')[0]}
                </span>
              </div>
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-0.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm">
                  <Star className="w-2.5 h-2.5 text-[#E87A41] fill-[#E87A41]" />
                  <span className="text-[9px] font-bold text-[#2B2F33]">{biz.rating}</span>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-3 flex flex-col justify-between flex-1">
              <h3 className="text-sm font-bold text-[#2B2F33] mb-1 line-clamp-1 poppins-semibold">
                {biz.name}
              </h3>
              <div className="flex items-center gap-1 text-[#6B7280] text-[10px]">
                <MapPin className="w-2.5 h-2.5" />
                <span className="line-clamp-1">{biz.city}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 bg-white border border-[#E5E7EB] text-[#2CA6A4] font-bold rounded-full hover:bg-[#2CA6A4] hover:text-white transition-all duration-300 shadow-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
