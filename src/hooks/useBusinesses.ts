import { useState, useEffect, useCallback, useRef } from 'react';
import type { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';
import { getCategoryFilterValues, normalizeBusiness, normalizeGovernorate } from '@/lib/businessNormalization';

interface UseBusinessesResult {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
}

const ITEMS_PER_PAGE = 48;

export function useBusinesses(searchQuery: string): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const requestVersionRef = useRef(0);

  const { selectedGovernorate, selectedCategory, selectedCity } = useHomeStore();

  const fetchBusinesses = useCallback(
    async (targetPage: number, replaceData: boolean) => {
      const requestVersion = ++requestVersionRef.current;
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('businesses')
          .select('*', { count: 'exact' })
          .order('id', { ascending: true })
          .range((targetPage - 1) * ITEMS_PER_PAGE, targetPage * ITEMS_PER_PAGE - 1);

        const normalizedGov = selectedGovernorate ? normalizeGovernorate(selectedGovernorate) : '';
        if (normalizedGov) {
          query = query.eq('governorate', normalizedGov);
        }

        if (selectedCity) {
          query = query.eq('city', selectedCity);
        }

        const categoryFilterValues = getCategoryFilterValues(selectedCategory);
        if (categoryFilterValues && categoryFilterValues.length > 0) {
          query = query.in('category', categoryFilterValues);
        }

        if (searchQuery.trim()) {
          const escaped = searchQuery.trim().replace(/[,%]/g, '');
          query = query.or(`name.ilike.%${escaped}%,business_name.ilike.%${escaped}%,description.ilike.%${escaped}%`);
        }

        const { data, count, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        if (requestVersion !== requestVersionRef.current) return;

        const mappedBusinesses: Business[] = (data || []).map((item: any) => normalizeBusiness(item));

        setBusinesses((prev) => {
          const next = replaceData ? mappedBusinesses : [...prev, ...mappedBusinesses];
          const deduped = Array.from(new Map(next.map((biz) => [biz.id, biz])).values());
          const countVal = count ?? deduped.length;
          setTotalCount(countVal);
          setHasMore(deduped.length < countVal);
          return deduped;
        });
      } catch (err) {
        console.error('Error fetching businesses:', err);
        if (requestVersion === requestVersionRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setLoading(false);
        }
      }
    },
    [selectedGovernorate, selectedCity, selectedCategory, searchQuery]
  );

  useEffect(() => {
    setPage(1);
    void fetchBusinesses(1, true);
  }, [fetchBusinesses]);

  useEffect(() => {
    if (page > 1) {
      void fetchBusinesses(page, false);
    }
  }, [page, fetchBusinesses]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  const refresh = useCallback(() => {
    setPage(1);
    void fetchBusinesses(1, true);
  }, [fetchBusinesses]);

  return { businesses, loading, error, hasMore, totalCount, loadMore, refresh };
}
