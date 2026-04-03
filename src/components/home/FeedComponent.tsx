import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Clock } from "lucide-react";
import type { Business } from "@/lib/supabase";

interface FeedComponentProps {
  businesses: Business[];
  loading: boolean;
}

interface FeedPost {
  id: string;
  type: "announcement" | "listing";
  business: Business;
  content?: string;
  timestamp?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
}

export default function FeedComponent({ businesses, loading }: FeedComponentProps) {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Generate feed posts from businesses (alternating between announcements and listings)
    const posts: FeedPost[] = [];

    businesses.forEach((business, index) => {
      const postType = index % 2 === 0 ? "announcement" : "listing";

      posts.push({
        id: `${business.id}-${postType}`,
        type: postType,
        business,
        content:
          postType === "announcement"
            ? `Check out our latest updates! Visit ${business.name} today.`
            : undefined,
        timestamp: `${Math.floor(Math.random() * 24)} hours ago`,
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 100),
      });
    });

    setFeedPosts(posts);
  }, [businesses]);

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-12 bg-gray-200 rounded-full w-32 mb-4" />
              <div className="h-24 bg-gray-200 rounded mb-4" />
              <div className="h-8 bg-gray-200 rounded w-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
      {feedPosts.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-humus-gray-300 p-12 text-center">
          <p className="text-humus-gray-600 font-bold mb-2 poppins-semibold">No businesses found</p>
          <p className="text-sm text-humus-gray-500">
            Try selecting a different location or category
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border-2 border-humus-deep-blue/10 hover:border-humus-coral/30 overflow-hidden transition-all duration-300 hover:shadow-xl group"
            >
              {/* Post Header */}
              <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-humus-deep-blue/10 flex items-center justify-center text-humus-deep-blue font-bold border border-humus-deep-blue/5">
                    {post.business.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-humus-dark text-base poppins-semibold group-hover:text-humus-deep-blue transition-colors">
                      {post.business.name}
                    </h3>
                    <p className="text-[10px] text-humus-gray-500 flex items-center gap-1 mt-0.5 font-bold uppercase tracking-tighter">
                      <Clock size={10} /> {post.timestamp}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  post.type === "announcement" 
                    ? "bg-humus-coral/10 text-humus-coral" 
                    : "bg-humus-cyan/10 text-humus-deep-blue"
                }`}>
                  {post.type === "announcement" ? "📢 Update" : "📍 Listing"}
                </span>
              </div>

              {/* Post Content */}
              {post.type === "announcement" && post.content && (
                <div className="px-4 pt-4">
                  <p className="text-humus-dark text-sm leading-relaxed mb-3">
                    {post.content}
                  </p>
                </div>
              )}

              {/* Image */}
              <div className="w-full h-72 bg-gray-100 overflow-hidden relative">
                <img
                  src={
                    post.business.image ||
                    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
                  }
                  alt={post.business.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Post Info - Listings */}
              {post.type === "listing" && (
                <div className="px-4 pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-humus-off-white p-2 rounded-lg">
                      <p className="text-[10px] text-humus-gray-500 font-bold uppercase">Category</p>
                      <p className="text-xs font-bold text-humus-deep-blue">
                        {post.business.category.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="bg-humus-off-white p-2 rounded-lg">
                      <p className="text-[10px] text-humus-gray-500 font-bold uppercase">Rating</p>
                      <p className="text-xs font-bold text-humus-coral">
                        ⭐ {post.business.rating?.toFixed(1) || "N/A"}
                        <span className="text-humus-gray-500 text-[10px] ml-1">
                          ({post.business.reviewCount})
                        </span>
                      </p>
                    </div>
                    <div className="col-span-2 bg-humus-off-white p-2 rounded-lg">
                      <p className="text-[10px] text-humus-gray-500 font-bold uppercase">Location</p>
                      <p className="text-xs font-bold text-humus-dark">
                        📍 {post.business.city}, {post.business.governorate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Engagement Section */}
              <div className="px-4 py-3 border-t border-gray-50">
                {/* Stats */}
                <div className="flex justify-between text-[10px] text-humus-gray-500 font-bold uppercase tracking-wider mb-3 pb-3 border-b border-gray-50">
                  <span className="flex items-center gap-1">❤️ {post.likes} <span className="hidden sm:inline">Likes</span></span>
                  <span className="flex items-center gap-1">💬 {post.comments} <span className="hidden sm:inline">Comments</span></span>
                  <span className="flex items-center gap-1">📤 {post.shares} <span className="hidden sm:inline">Shares</span></span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs transition-all duration-200 ${
                      likedPosts.has(post.id)
                        ? "bg-humus-coral text-white shadow-md"
                        : "bg-humus-off-white text-humus-gray-700 hover:bg-humus-coral/10 hover:text-humus-coral"
                    }`}
                  >
                    <Heart
                      size={14}
                      className={likedPosts.has(post.id) ? "fill-current" : ""}
                    />
                    Like
                  </button>

                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-humus-off-white hover:bg-humus-cyan/10 hover:text-humus-cyan text-humus-gray-700 rounded-lg font-bold text-xs transition-all duration-200">
                    <MessageCircle size={14} />
                    Comment
                  </button>

                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-humus-off-white hover:bg-humus-deep-blue/10 hover:text-humus-deep-blue text-humus-gray-700 rounded-lg font-bold text-xs transition-all duration-200">
                    <Share2 size={14} />
                    Share
                  </button>
                </div>
              </div>

              {/* Contact Button */}
              {post.type === "listing" && (
                <div className="px-4 py-3 bg-humus-off-white border-t border-gray-50 flex gap-2">
                  {post.business.phone && (
                    <a
                      href={`tel:${post.business.phone}`}
                      className="flex-1 py-2.5 bg-humus-deep-blue hover:bg-humus-blue-dark text-white text-xs font-bold rounded-lg transition-all duration-200 text-center shadow-sm"
                    >
                      📞 Call
                    </a>
                  )}
                  <button className="flex-1 py-2.5 bg-humus-cyan hover:bg-humus-cyan-dark text-humus-deep-blue text-xs font-bold rounded-lg transition-all duration-200 shadow-sm">
                    📱 WhatsApp
                  </button>
                  <button className="flex-1 py-2.5 bg-humus-coral hover:bg-humus-coral-light text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-sm">
                    👁️ Profile
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Load More Button */}
          <div className="text-center pt-6">
            <button className="btn-secondary px-12 py-3 rounded-xl shadow-lg hover:shadow-humus-deep-blue/20">
              Load More Businesses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
