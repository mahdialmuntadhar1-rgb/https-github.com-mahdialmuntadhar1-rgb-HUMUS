import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HomeState {
  selectedGovernorate: string;
  selectedCity: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  sortBy: "trending" | "recent" | "rating";
  language: "en" | "ar" | "ku";
  activeTab: "mycity" | "shakumaku";
  expandedCategories: string[];

  // Actions
  setGovernorate: (governorate: string) => void;
  setCity: (city: string | null) => void;
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: "trending" | "recent" | "rating") => void;
  setLanguage: (lang: "en" | "ar" | "ku") => void;
  setActiveTab: (tab: "mycity" | "shakumaku") => void;
  toggleCategoryExpansion: (categoryId: string) => void;
  reset: () => void;
}

const DEFAULT_GOVERNORATE = "Baghdad";

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      selectedGovernorate: DEFAULT_GOVERNORATE,
      selectedCity: null,
      selectedCategory: null,
      searchQuery: "",
      sortBy: "trending",
      language: "en",
      activeTab: "mycity",
      expandedCategories: [],

      setGovernorate: (governorate) =>
        set({ selectedGovernorate: governorate, selectedCity: null }),

      setCity: (city) =>
        set({ selectedCity: city }),

      setCategory: (category) =>
        set({ selectedCategory: category }),

      setSearchQuery: (query) =>
        set({ searchQuery: query }),

      setSortBy: (sort) =>
        set({ sortBy: sort }),

      setLanguage: (lang) =>
        set({ language: lang }),

      setActiveTab: (tab) =>
        set({ activeTab: tab }),

      toggleCategoryExpansion: (categoryId) =>
        set((state) => ({
          expandedCategories: state.expandedCategories.includes(categoryId)
            ? state.expandedCategories.filter(id => id !== categoryId)
            : [...state.expandedCategories, categoryId]
        })),

      reset: () =>
        set({
          selectedGovernorate: DEFAULT_GOVERNORATE,
          selectedCity: null,
          selectedCategory: null,
          searchQuery: "",
          sortBy: "trending",
          language: "en",
          activeTab: "mycity",
          expandedCategories: [],
        }),
    }),
    {
      name: "home-store",
    }
  )
);
