import React from 'react';
import { motion } from 'motion/react';

const STORIES = [
  { id: 1, name: 'Offers', icon: '🏷️', color: '#2CA6A4', gradient: 'from-[#2CA6A4] to-[#1d7a78]' },
  { id: 2, name: 'Events', icon: '📅', color: '#E87A41', gradient: 'from-[#E87A41] to-[#c65e2b]' },
  { id: 3, name: 'New Jobs', icon: '💼', color: '#2B2F33', gradient: 'from-[#2B2F33] to-[#1a1d21]' },
  { id: 4, name: 'Trending', icon: '🔥', color: '#2CA6A4', gradient: 'from-[#2CA6A4] to-[#1d7a78]' },
  { id: 5, name: 'Top Rated', icon: '⭐', color: '#E87A41', gradient: 'from-[#E87A41] to-[#c65e2b]' },
  { id: 6, name: 'Food', icon: '🍽️', color: '#2CA6A4', gradient: 'from-[#2CA6A4] to-[#1d7a78]' },
  { id: 7, name: 'Fashion', icon: '👗', color: '#E87A41', gradient: 'from-[#E87A41] to-[#c65e2b]' },
  { id: 8, name: 'Tech', icon: '💻', color: '#2B2F33', gradient: 'from-[#2B2F33] to-[#1a1d21]' },
];

export default function StoryRow() {
  const handleStoryClick = (name: string) => {
    // For now, just scroll to the explore section
    const element = document.getElementById('explore-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
          {STORIES.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStoryClick(story.name)}
              className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer group"
            >
              <div className="relative p-1 rounded-[24px] bg-gradient-to-tr from-[#2CA6A4] to-[#E87A41] shadow-lg shadow-[#2CA6A4]/10 group-hover:shadow-[#2CA6A4]/20 transition-all duration-500">
                <div className={`w-20 h-20 rounded-[20px] overflow-hidden border-[3px] border-white bg-gradient-to-br ${story.gradient} flex items-center justify-center`}>
                  <span className="text-3xl">{story.icon}</span>
                </div>
                <div 
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-[3px] border-white flex items-center justify-center text-[12px] text-white font-black shadow-md"
                  style={{ backgroundColor: story.color }}
                >
                  +
                </div>
              </div>
              <span className="text-[11px] font-black text-[#2B2F33] uppercase tracking-[0.2em] group-hover:text-[#2CA6A4] transition-colors">
                {story.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
