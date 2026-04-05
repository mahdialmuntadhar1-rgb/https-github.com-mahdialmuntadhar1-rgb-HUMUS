import { useState, useEffect, useCallback } from 'react';
import { supabase, Business, FilterState, QueryResult } from '@/lib/supabaseClient';

const ITEMS_PER_PAGE = 24;

export function useBusinesses(filters: FilterState, page: number = 1): QueryResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableGovernortes, setAvailableGovernortes] = useState<string[]>([]);

  // Fetch businesses with applied filters
  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' });

      // Apply governorate filter
      if (filters.governorate && filters.governorate !== 'All') {
        query = query.eq('governorate', filters.governorate);
      }

      // Apply category filter
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      // Apply pagination
      const offset = (page - 1) * ITEMS_PER_PAGE;
      query = query
        .range(offset, offset + ITEMS_PER_PAGE - 1)
        .order('createdAt', { ascending: false });

      // Execute query
      const { data, count, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      console.log(`Business Query:`, {
        governorate: filters.governorate,
        category: filters.category,
        page,
        offset,
        returned: data?.length || 0,
        total: count,
      });

      setBusinesses(data || []);
      setTotal(count || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch businesses';
      setError(errorMessage);
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.governorate, filters.category, page]);

  // Fetch available governorates
  const fetchGovernortes = useCallback(async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('businesses')
        .select('governorate', { count: 'exact' })
        .not('governorate', 'is', null);

      if (queryError) throw queryError;

      // Extract unique governorates
      const govs = Array.from(new Set(
        (data || [])
          .map(b => b.governorate)
          .filter((g): g is string => Boolean(g))
          .map(g => g.trim())
      )).sort();

      setAvailableGovernortes(govs);
    } catch (err) {
      console.error('Error fetching governorates:', err);
    }
  }, []);

  // Fetch available categories (scoped to selected governorate)
  const fetchCategories = useCallback(async () => {
    try {
      let query = supabase
        .from('businesses')
        .select('category', { count: 'exact' })
        .not('category', 'is', null);

      // If governorate is selected, filter by it
      if (filters.governorate && filters.governorate !== 'All') {
        query = query.eq('governorate', filters.governorate);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Extract unique categories
      const cats = Array.from(new Set(
        (data || [])
          .map(b => b.category)
          .filter((c): c is string => Boolean(c))
          .map(c => c.trim())
      )).sort();

      setAvailableCategories(cats);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [filters.governorate]);

  // Fetch data when filters or page changes
  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Fetch governorates once
  useEffect(() => {
    fetchGovernortes();
  }, [fetchGovernortes]);

  // Fetch categories when governorate changes
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    businesses,
    total,
    loading,
    error,
    availableCategories,
    availableGovernortes,
    hasMore: (page - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE < total,
  };
}
