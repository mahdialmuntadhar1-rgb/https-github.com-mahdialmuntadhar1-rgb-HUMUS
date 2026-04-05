import { useState, useCallback, useEffect } from 'react';

interface FilterState {
  selectedGovernorate: string | null;
  selectedCategory: string | null;
  selectedCity: string | null;
}

const STORAGE_KEY = 'belive-filters';

export function useFilterState() {
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedGovernorate) setSelectedGovernorate(parsed.selectedGovernorate);
        if (parsed.selectedCategory) setSelectedCategory(parsed.selectedCategory);
        if (parsed.selectedCity) setSelectedCity(parsed.selectedCity);
      }
    } catch (error) {
      console.warn('Failed to load filters from localStorage:', error);
    }
  }, []);

  // Save to localStorage when filters change
  useEffect(() => {
    try {
      const state: FilterState = {
        selectedGovernorate,
        selectedCategory,
        selectedCity
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save filters to localStorage:', error);
    }
  }, [selectedGovernorate, selectedCategory, selectedCity]);

  const setGovernorate = useCallback((governorate: string | null) => {
    setSelectedGovernorate(governorate);
    // Reset city when governorate changes
    setSelectedCity(null);
    setPage(1); // Reset to first page
  }, []);

  const setCategory = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page
  }, []);

  const setCity = useCallback((city: string | null) => {
    setSelectedCity(city);
    setPage(1); // Reset to first page
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedGovernorate(null);
    setSelectedCategory(null);
    setSelectedCity(null);
    setPage(1);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  return {
    selectedGovernorate,
    selectedCategory,
    selectedCity,
    page,
    setGovernorate,
    setCategory,
    setCity,
    resetFilters,
    nextPage
  };
}
