import { useState, useCallback } from 'react';
import { FilterState } from '@/lib/supabaseClient';

const DEFAULT_FILTERS: FilterState = {
  governorate: 'All',
  category: 'All',
};

export function useFilterState() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const updateGovernorate = useCallback((governorate: string) => {
    setFilters(prev => ({
      ...prev,
      governorate,
    }));
    setPage(1); // Reset to first page
  }, []);

  const updateCategory = useCallback((category: string) => {
    setFilters(prev => ({
      ...prev,
      category,
    }));
    setPage(1); // Reset to first page
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  return {
    filters,
    page,
    updateGovernorate,
    updateCategory,
    resetFilters,
    nextPage,
  };
}
