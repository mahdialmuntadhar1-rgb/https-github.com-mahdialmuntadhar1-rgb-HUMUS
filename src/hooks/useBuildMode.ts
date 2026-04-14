/**
 * // BUILD MODE ONLY
 * State management for Build Mode using Zustand and localStorage.
 * Phase 1: Hero Section Only.
 */

import { create } from 'zustand';
import { HeroSlide, Direction } from '@/types/buildMode';
import { heroContent } from '@/data/heroContent';

interface BuildModeState {
  buildModeEnabled: boolean;
  heroSlides: HeroSlide[];
  activeSlideId: string | null;
  lastSaved: string | null;
  isSaving: boolean;
  
  // Actions
  toggleBuildMode: () => void;
  setActiveSlideId: (id: string | null) => void;
  addSlide: (slide: HeroSlide) => void;
  deleteSlide: (slideId: string) => void;
  updateSlide: (slideId: string, updates: Partial<HeroSlide>) => void;
  reorderSlides: (slideId: string, direction: Direction) => void;
  resetToOriginal: () => void;
  saveToRepo: () => Promise<void>;
}

export const useBuildMode = create<BuildModeState>()((set, get) => ({
  buildModeEnabled: false,
  heroSlides: heroContent,
  activeSlideId: null,
  lastSaved: null,
  isSaving: false,

  toggleBuildMode: () => set((state) => ({ buildModeEnabled: !state.buildModeEnabled })),

  setActiveSlideId: (id) => set({ activeSlideId: id }),

  addSlide: (slide) => set((state) => ({
    heroSlides: [...state.heroSlides, slide],
    activeSlideId: slide.id,
    lastSaved: new Date().toISOString()
  })),

  deleteSlide: (slideId) => set((state) => ({
    heroSlides: state.heroSlides.filter((s) => s.id !== slideId),
    activeSlideId: state.activeSlideId === slideId ? null : state.activeSlideId,
    lastSaved: new Date().toISOString()
  })),

  updateSlide: (slideId, updates) => set((state) => ({
    heroSlides: state.heroSlides.map((s) => s.id === slideId ? { ...s, ...updates } : s),
    lastSaved: new Date().toISOString()
  })),

  reorderSlides: (slideId, direction) => set((state) => {
    const index = state.heroSlides.findIndex(s => s.id === slideId);
    if (index === -1) return state;
    
    const newSlides = [...state.heroSlides];
    if (direction === 'up' && index > 0) {
      [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
    } else if (direction === 'down' && index < newSlides.length - 1) {
      [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    }
    
    return { 
      heroSlides: newSlides,
      lastSaved: new Date().toISOString()
    };
  }),

  resetToOriginal: () => set({ 
    heroSlides: heroContent,
    lastSaved: new Date().toISOString()
  }),

  saveToRepo: async () => {
    set({ isSaving: true });
    try {
      const response = await fetch('/api/build-mode/save-hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: get().heroSlides }),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      const data = await response.json();
      set({ 
        heroSlides: data.slides,
        lastSaved: new Date().toISOString(),
        isSaving: false 
      });
      alert('Changes saved to repository successfully! You can now push to GitHub.');
    } catch (error) {
      console.error('Error saving to repo:', error);
      alert('Failed to save to repository.');
      set({ isSaving: false });
    }
  }
}));
