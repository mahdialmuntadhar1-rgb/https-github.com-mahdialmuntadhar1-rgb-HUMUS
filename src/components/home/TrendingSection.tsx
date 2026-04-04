import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, ArrowRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Business } from '@/lib/supabase';

interface TrendingSectionProps {
  businesses: Business[];
  loading?: boolean;
  onBusinessClick?: (business: Business) => void;
}

export default function TrendingSection({ businesses, loading, onBusinessClick }: TrendingSectionProps) {
  const featured = businesses.filter(b => b.isFeatured).slice(0, 6);

  if (loading && businesses.length === 0) return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between px-4 mb-6">
        <div className="h-6 bg-gray-100 animate-pulse rounded w-48" />
        <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar pb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[260px] h-[340px] bg-white rounded-[24px] border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="h-[60%] bg-gray-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-100 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!loading && featured.length === 0) return null;

  return (
    <div className="w-full mb-16">
      <div className="flex items-center justify-between px-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold tracking-tight">Featured Businesses</h2>
          <p className="text-sm text-[#6B7280]">Handpicked premium places for you</p>
        </div>
        <button 
          onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex items-center gap-2 px-4 py-2 bg-[#2CA6A4]/10 text-[#2CA6A4] text-xs font-black rounded-full hover:bg-[#2CA6A4] hover:text-white transition-all duration-500 uppercase tracking-widest"
        >
          See All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto px-4 no-scrollbar pb-8 snap-x snap-mandatory">
        {featured.map((biz) => (
          <motion.div
            key={biz.id}
            whileHover={{ y: -8 }}
            onClick={() => onBusinessClick?.(biz)}
            className="flex-shrink-0 w-[280px] h-[360px] bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#E5E7EB] flex flex-col group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] snap-start"
          >
            {/* Image Section */}
            <div className="relative h-[65%] overflow-hidden">
              <img 
                src={biz.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'} 
                alt={biz.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-[#2CA6A4] text-white text-[10px] font-black rounded-xl shadow-xl uppercase tracking-widest border border-white/20">
                  {biz.category.replace('_', ' ')}
                </span>
              </div>

              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-xl border border-[#E5E7EB]">
                  <Star className="w-3.5 h-3.5 text-[#E87A41] fill-[#E87A41]" />
                  <span className="text-[11px] font-black text-[#2B2F33]">{biz.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>

              {biz.isVerified && (
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1.5 bg-[#2CA6A4] text-white px-3 py-1.5 rounded-xl shadow-xl border border-white/20">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-white/20" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="p-5 flex flex-col flex-1 justify-between bg-white">
              <div>
                <h3 className="text-lg font-bold text-[#2B2F33] mb-1.5 line-clamp-1 poppins-bold group-hover:text-[#2CA6A4] transition-colors">
                  {biz.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[#6B7280] text-[12px] font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#2CA6A4]" />
                  <span className="line-clamp-1">{biz.city}, {biz.governorate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${biz.id}${i}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F5F7F9] flex items-center justify-center text-[8px] font-bold text-[#6B7280]">
                    +{biz.reviewCount || 0}
                  </div>
                </div>
                <span className="text-[10px] font-black text-[#2CA6A4] uppercase tracking-tighter group-hover:translate-x-1 transition-transform">
                  Explore Now →
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {/* Peek Effect Spacer */}
        <div className="flex-shrink-0 w-4" />
      </div>
    </div>
  );
}
