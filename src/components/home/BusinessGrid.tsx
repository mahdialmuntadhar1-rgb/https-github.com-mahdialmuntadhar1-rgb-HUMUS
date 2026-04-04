import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Loader2, SearchX, CheckCircle2 } from 'lucide-react';
import { Business } from '@/lib/supabase';

interface BusinessGridProps {
  businesses: Business[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onBusinessClick?: (business: Business) => void;
}

export default function BusinessGrid({ businesses, loading, hasMore, onLoadMore, onBusinessClick }: BusinessGridProps) {
  // Initial loading state (skeleton)
  if (loading && businesses.length === 0) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 mb-12">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
          <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  if (!loading && businesses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-24 h-24 bg-[#F5F7F9] rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-[#6B7280]" />
      </div>
      <h3 className="text-xl font-bold text-[#2B2F33] mb-3 poppins-bold">No results found</h3>
      <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">
        We couldn't find any businesses matching your current filters or search query. Try broadening your search.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-2.5 bg-[#2CA6A4] text-white font-bold rounded-full text-sm shadow-lg shadow-[#2CA6A4]/20 hover:bg-[#1e7a78] transition-all"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div id="explore-section" className="px-4 mb-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {businesses.map((biz) => (
          <motion.div
            key={biz.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            onClick={() => onBusinessClick?.(biz)}
            className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#E5E7EB] flex flex-col group cursor-pointer transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
          >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={biz.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'} 
                alt={biz.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-[#2CA6A4]/90 backdrop-blur-md text-white text-[9px] font-black rounded-lg shadow-lg uppercase tracking-widest border border-white/20">
                  {biz.category.replace('_', ' ')}
                </span>
              </div>

              {/* Verification Badge */}
              {biz.isVerified && (
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-md border border-[#2CA6A4]/20">
                    <CheckCircle2 className="w-3 h-3 text-[#2CA6A4] fill-[#2CA6A4]/10" />
                    <span className="text-[8px] font-black text-[#2CA6A4] uppercase tracking-tighter">Verified</span>
                  </div>
                </div>
              )}

              {/* Rating Badge */}
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg border border-[#E5E7EB]">
                  <Star className="w-3 h-3 text-[#E87A41] fill-[#E87A41]" />
                  <span className="text-[10px] font-black text-[#2B2F33]">{biz.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-sm font-bold text-[#2B2F33] mb-1.5 line-clamp-1 poppins-bold group-hover:text-[#2CA6A4] transition-colors">
                  {biz.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[#6B7280] text-[11px] font-medium">
                  <MapPin className="w-3 h-3 text-[#2CA6A4]" />
                  <span className="line-clamp-1">{biz.city}, {biz.governorate}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-[#F5F7F9] flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                  {biz.reviewCount || 0} Reviews
                </span>
                <span className="text-[10px] font-black text-[#2CA6A4] uppercase tracking-tighter group-hover:translate-x-1 transition-transform">
                  View Details →
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Section */}
      {(hasMore || loading) && (
        <div className="mt-16 flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-3 text-[#2CA6A4] font-bold text-sm animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more places...</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="group relative px-10 py-4 bg-white border-2 border-[#E5E7EB] text-[#2CA6A4] font-black rounded-2xl hover:border-[#2CA6A4] hover:bg-[#2CA6A4] hover:text-white transition-all duration-500 shadow-xl shadow-black/5 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#2CA6A4] to-[#1e7a78] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 uppercase tracking-[0.2em] text-xs">Load More Results</span>
              <div className="relative z-10 w-6 h-6 bg-[#F5F7F9] group-hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <Loader2 className="w-3.5 h-3.5 group-hover:animate-spin" />
              </div>
            </button>
          )}
          
          {!hasMore && !loading && businesses.length > 0 && (
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mt-4">
              You've reached the end of the directory
            </p>
          )}
        </div>
      )}
    </div>
  );
}
