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
    <div className="bg-white border-b border-gray-200 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-humus-dark flex items-center gap-2 poppins-bold">
            <span>🔥</span> Trending Now
          </h2>
          <button className="px-4 py-2 bg-humus-coral hover:bg-humus-coral-light text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
            Get Featured
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-humus-deep-blue p-2 rounded-full shadow-lg transition-all duration-200 border border-gray-100"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-humus-deep-blue p-2 rounded-full shadow-lg transition-all duration-200 border border-gray-100"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Carousel */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-4 pb-4 px-8 sm:px-0 scroll-smooth scrollbar-hide"
            style={{ scrollBehavior: "smooth" }}
          >
            {businesses.map((business) => (
              <div
                key={business.id}
                className="flex-shrink-0 w-80 bg-white border-2 border-humus-deep-blue rounded-lg overflow-hidden hover:shadow-xl hover:border-humus-coral transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img
                    src={business.image || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"}
                    alt={business.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Trending Badge */}
                  <div className="absolute top-3 right-3 badge-trending flex items-center gap-1 shadow-md">
                    <span>⭐</span> TRENDING
                  </div>

                  {/* Featured Badge */}
                  {business.isFeatured && (
                    <div className="absolute top-3 left-3 badge-featured shadow-md">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Name & Category */}
                  <h3 className="font-bold text-humus-dark text-lg mb-1 truncate poppins-semibold">
                    {business.name}
                  </h3>
                  <p className="text-xs text-humus-gray-500 mb-3 font-bold uppercase tracking-wider">{business.category.replace('_', ' ')}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i < Math.round(business.rating || 0)
                              ? "fill-humus-coral text-humus-coral"
                              : "text-humus-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-humus-dark">
                      {business.rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="text-xs text-humus-gray-500">
                      ({business.reviewCount || 0})
                    </span>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-humus-gray-600 mb-4 truncate">
                    📍 {business.address}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-humus-cyan hover:bg-humus-cyan-dark text-humus-deep-blue text-sm font-bold rounded transition-all duration-200">
                      View Profile
                    </button>
                    <button className="flex-1 px-3 py-2 bg-humus-deep-blue hover:bg-humus-blue-dark text-white text-sm font-bold rounded transition-all duration-200">
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
