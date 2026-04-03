import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MapPin, Phone, Globe, Share2, Heart, Clock } from 'lucide-react';
import { Business } from '@/lib/supabase';

interface BusinessDetailModalProps {
  business: Business | null;
  onClose: () => void;
}

export default function BusinessDetailModal({ business, onClose }: BusinessDetailModalProps) {
  if (!business) return null;

  return (
    <AnimatePresence>
      {business && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2B2F33]/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Close Button (Mobile) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Image */}
            <div className="relative h-64 sm:h-80 flex-shrink-0">
              <img 
                src={business.image} 
                alt={business.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Desktop Close */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 hidden sm:flex p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-[#2CA6A4] text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {business.category.replace('_', ' & ')}
                  </span>
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md">
                    <Star className="w-3 h-3 text-[#E87A41] fill-[#E87A41]" />
                    <span className="text-[10px] font-bold">{business.rating}</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold poppins-bold">{business.name}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#2B2F33] mb-3 poppins-semibold">About</h3>
                    <p className="text-[#6B7280] leading-relaxed">
                      Experience the best of {business.category.replace('_', ' ')} at {business.name}. 
                      Located in the heart of {business.city}, {business.governorate}, we offer premium services 
                      and a unique atmosphere that reflects the vibrant culture of Iraq.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F7F9] rounded-xl text-sm font-bold text-[#2B2F33]">
                      <Clock className="w-4 h-4 text-[#2CA6A4]" />
                      Open Now
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F7F9] rounded-xl text-sm font-bold text-[#2B2F33]">
                      <MapPin className="w-4 h-4 text-[#2CA6A4]" />
                      {business.city}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full py-3 bg-[#2CA6A4] text-white font-bold rounded-2xl shadow-lg shadow-[#2CA6A4]/20 hover:bg-[#1e7a78] transition-all flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Call Now
                  </button>
                  <button className="w-full py-3 border border-[#E5E7EB] text-[#2B2F33] font-bold rounded-2xl hover:bg-[#F5F7F9] transition-all flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 py-3 border border-[#E5E7EB] text-[#2B2F33] font-bold rounded-2xl hover:bg-[#F5F7F9] transition-all flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button className="p-3 border border-[#E5E7EB] text-[#2B2F33] font-bold rounded-2xl hover:bg-[#F5F7F9] transition-all flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reviews Preview */}
              <div className="mt-10 pt-10 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#2B2F33] poppins-semibold">Reviews ({business.reviewCount})</h3>
                  <button className="text-sm font-bold text-[#2CA6A4] hover:underline">Write a Review</button>
                </div>
                
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 bg-[#F5F7F9] rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#2CA6A4] flex items-center justify-center text-white text-xs font-bold">
                            U{i}
                          </div>
                          <span className="text-sm font-bold text-[#2B2F33]">User {i}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-3 h-3 ${j < 4 ? 'text-[#E87A41] fill-[#E87A41]' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        Amazing experience! The service was top-notch and the atmosphere was very welcoming. Highly recommend visiting if you're in {business.city}.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
