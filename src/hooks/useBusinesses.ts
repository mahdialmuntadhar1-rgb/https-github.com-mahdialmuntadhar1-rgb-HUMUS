import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, Business } from "@/lib/supabase";

interface UseBusinessesOptions {
  governorate?: string | null;
  city?: string | null;
  category?: string | null;
  searchQuery?: string;
}

interface UseBusinessesReturn {
  businesses: Business[];
  totalCount: number;
  loadedCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

const PAGE_SIZE = 100;

export function useBusinesses(options: UseBusinessesOptions = {}): UseBusinessesReturn {
  const { governorate, city, category, searchQuery } = options;

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Track current filter state to detect changes
  const filterRef = useRef({ governorate, city, category, searchQuery });

  // Reset when filters change
  useEffect(() => {
    const prevFilters = filterRef.current;
    const filtersChanged =
      prevFilters.governorate !== governorate ||
      prevFilters.city !== city ||
      prevFilters.category !== category ||
      prevFilters.searchQuery !== searchQuery;

    if (filtersChanged) {
      filterRef.current = { governorate, city, category, searchQuery };
      setBusinesses([]);
      setPage(0);
      setHasMore(true);
      setError(null);
    }
  }, [governorate, city, category, searchQuery]);

  const fetchBusinesses = useCallback(async (pageNum: number, isReset: boolean = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("businesses")
        .select("*", { count: "exact" })
        .order("id", { ascending: true })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      // Apply filters
      if (governorate) {
        query = query.eq("governorate", governorate);
      }
      if (city) {
        query = query.eq("city", city);
      }
      if (category) {
        query = query.eq("category", category);
      }
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
      }

      const { data, error: supabaseError, count } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const newBusinesses = (data as Business[]) || [];
      const exactCount = count || 0;

      setTotalCount(exactCount);

      setBusinesses((prev) => {
        if (isReset) {
          return newBusinesses;
        }
        // Deduplicate by id when appending
        const existingIds = new Set(prev.map((b) => b.id));
        const uniqueNew = newBusinesses.filter((b) => !existingIds.has(b.id));
        return [...prev, ...uniqueNew];
      });

      const newLoadedCount = isReset
        ? newBusinesses.length
        : businesses.length + newBusinesses.length;

      setHasMore(newLoadedCount < exactCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch businesses");
    } finally {
      setLoading(false);
    }
  }, [governorate, city, category, searchQuery, loading, businesses.length]);

  // Initial fetch and filter reset fetch
  useEffect(() => {
    fetchBusinesses(0, true);
  }, [governorate, city, category, searchQuery]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBusinesses(nextPage, false);
    }
  }, [loading, hasMore, page, fetchBusinesses]);

  const refresh = useCallback(() => {
    setBusinesses([]);
    setPage(0);
    setHasMore(true);
    fetchBusinesses(0, true);
  }, [fetchBusinesses]);

  return {
    businesses,
    totalCount,
    loadedCount: businesses.length,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
