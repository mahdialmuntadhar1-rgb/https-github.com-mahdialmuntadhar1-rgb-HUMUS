import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Business } from "@/lib/supabase";

interface TrendingSectionProps {
  businesses: Business[];
}

export default function TrendingSection({ businesses }: TrendingSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 350;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (businesses.length === 0) return null;

  return (
    <div className="bg-[#F5F7F9] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#2B2F33] flex items-center gap-3 poppins-bold">
              <span className="w-10 h-10 bg-[#8B1A1A]/10 flex items-center justify-center rounded-xl text-xl">🔥</span> 
              Trending Now
            </h2>
            <p className="text-sm text-[#8B1A1A]/60 mt-1 ml-13">Most visited businesses this week</p>
          </div>
          <button className="btn-premium bg-[#8B1A1A] hover:bg-[#6b1414] text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#8B1A1A]/30">
            Get Featured
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white text-[#8B1A1A] p-3 rounded-full shadow-xl border border-[#f5dada] hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white text-[#8B1A1A] p-3 rounded-full shadow-xl border border-[#f5dada] hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Carousel */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-6 pb-8 px-2 sm:px-0 scroll-smooth scrollbar-hide"
          >
            {businesses.map((business) => (
              <div
                key={business.id}
                className="flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group/card"
              >
                {/* Image Container */}
                <div className="relative h-52 overflow-hidden bg-gray-200">
                  <img
                    src={business.image || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"}
                    alt={business.name}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />

                  {/* Trending Badge */}
                  <div className="absolute top-4 right-4 bg-[#8B1A1A] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm bg-opacity-90">
                    <span>⭐</span> TRENDING
                  </div>

                  {/* Featured Badge */}
                  {business.isFeatured && (
                    <div className="absolute top-4 left-4 bg-[#8B1A1A] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg backdrop-blur-sm bg-opacity-90">
                      Featured
                    </div>
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Name & Category */}
                  <h3 className="font-bold text-[#2B2F33] text-lg mb-1 truncate poppins-semibold group-hover/card:text-[#8B1A1A] transition-colors">
                    {business.name}
                  </h3>
                  <p className="text-[10px] text-[#8B1A1A]/60 mb-4 font-bold uppercase tracking-widest">{business.category.replace('_', ' ')}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i < Math.round(business.rating || 0)
                              ? "fill-[#8B1A1A] text-[#8B1A1A]"
                              : "text-[#cbd5e1]"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#2B2F33]">
                        {business.rating?.toFixed(1) || "N/A"}
                      </span>
                      <span className="text-[10px] text-[#64748b] font-medium">
                        ({business.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-[#64748b] mb-6 flex items-center gap-2">
                    <span className="text-[#8B1A1A]">📍</span> {business.address}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-2.5 bg-[#FDECEC] hover:bg-[#8B1A1A] hover:text-white text-[#8B1A1A] text-xs font-bold rounded-xl transition-all duration-300 border border-transparent hover:border-[#8B1A1A]">
                      View Profile
                    </button>
                    <button className="flex-1 px-4 py-2.5 bg-[#2B2F33] hover:bg-black text-white text-xs font-bold rounded-xl transition-all duration-300 shadow-md">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
