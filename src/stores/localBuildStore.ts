import { create } from 'zustand';

export interface MockHeroSlide {
  id: string;
  image_url: string;
}

export interface MockPost {
  id: string;
  image_url: string;
  caption_ar: string;
  business_name?: string;
  created_at: string;
}

interface LocalBuildModeState {
  isBuildMode: boolean;
  heroSlides: MockHeroSlide[];
  posts: MockPost[];
  setBuildMode: (enabled: boolean) => void;
  updateHeroImage: (index: number, newUrl: string) => void;
  addPost: (post: Omit<MockPost, 'id' | 'created_at'>) => void;
  updatePost: (id: string, updates: Partial<MockPost>) => void;
  deletePost: (id: string) => void;
}

const INITIAL_HEROES: MockHeroSlide[] = [
  { id: '1', image_url: 'https://images.unsplash.com/photo-1541812322-959c9a8dbf03?q=80&w=1920&auto=format&fit=crop' }, // Modern Baghdad
  { id: '2', image_url: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e84?q=80&w=1920&auto=format&fit=crop' }, // Lifestyle/Cafe
  { id: '3', image_url: 'https://images.unsplash.com/photo-1555397322-b170303ec170?q=80&w=1920&auto=format&fit=crop' }, // Local Market/Food
];

const INITIAL_POSTS: MockPost[] = [
  { 
    id: 'p1', 
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
    caption_ar: 'الجمعة في شارع المتنبي.. روح بغداد لا تنام ❤️',
    business_name: 'قهوة الشابندر',
    created_at: new Date().toISOString()
  },
  { 
    id: 'p2', 
    image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
    caption_ar: 'أطيب كليجة عراقية وصلت! متوفرة الآن بجميع الفروع 🇮🇶',
    business_name: 'أفران بابل',
    created_at: new Date().toISOString()
  },
  { 
    id: 'p3', 
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
    caption_ar: 'قريباً.. المنيو الجديد من مطعمنا المميز 🥘 #أكل_عراقي',
    business_name: 'مطعم القصر',
    created_at: new Date().toISOString()
  }
];

export const useLocalBuildStore = create<LocalBuildModeState>((set) => ({
  isBuildMode: true, // Defaulting to true for now as requested
  heroSlides: INITIAL_HEROES,
  posts: INITIAL_POSTS,
  setBuildMode: (enabled) => set({ isBuildMode: enabled }),
  updateHeroImage: (index, newUrl) => set((state) => {
    const newSlides = [...state.heroSlides];
    newSlides[index] = { ...newSlides[index], image_url: newUrl };
    return { heroSlides: newSlides };
  }),
  addPost: (post) => set((state) => ({
    posts: [
      { 
        ...post, 
        id: Math.random().toString(36).substr(2, 9), 
        created_at: new Date().toISOString() 
      }, 
      ...state.posts
    ]
  })),
  updatePost: (id, updates) => set((state) => ({
    posts: state.posts.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deletePost: (id) => set((state) => ({
    posts: state.posts.filter(p => p.id !== id)
  }))
}));
