import { useState, useEffect, useCallback } from 'react';
import type { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/services/supabase';

interface UseBusinessesResult {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
}

const ITEMS_PER_PAGE = 100;

// LAUNCH MODE: Category filtering disabled - visual only
// All businesses shown by default, governorate-only filtering

export function useBusinesses(searchQuery: string): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const { selectedGovernorate, selectedCity } = useHomeStore();

  const fetchBusinesses = useCallback(async (isRefresh = false) => {
    setLoading(true);
    setError(null);
    
    const currentPage = isRefresh ? 1 : page;
    
    // DEBUG: Log query inputs
    console.log('[useBusinesses] Query inputs:', {
      selectedGovernorate,
      selectedCity,
      searchQuery,
      currentPage,
      rangeStart: (currentPage - 1) * ITEMS_PER_PAGE,
      rangeEnd: currentPage * ITEMS_PER_PAGE - 1
    });
    
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please check your environment variables.');
      }
      
      // Start query from businesses table
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' });

      // Apply governorate filter ONLY if not "all"
      if (selectedGovernorate && selectedGovernorate !== 'all') {
        console.log('[useBusinesses] Applying governorate filter:', selectedGovernorate);
        query = query.eq('governorate', selectedGovernorate);
      } else {
        console.log('[useBusinesses] No governorate filter (showing all)');
      }
      
      // Apply city filter if present
      if (selectedCity) {
        console.log('[useBusinesses] Applying city filter:', selectedCity);
        query = query.eq('city', selectedCity);
      }
      
      // LAUNCH MODE: Category filtering disabled - visual only
      
      // Apply search filter if present
      if (searchQuery) {
        console.log('[useBusinesses] Applying search filter:', searchQuery);
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      // Apply pagination range
      query = query.range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      console.log('[useBusinesses] Executing query...');
      const { data, count, error: fetchError } = await query;
      
      console.log('[useBusinesses] Query results:', { 
        dataLength: data?.length || 0, 
        count, 
        error: fetchError?.message 
      });
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Map database columns to frontend interface if they differ
        const mappedBusinesses: Business[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          nameAr: item.name_ar,
          nameKu: item.name_ku,
          category: item.category,
          governorate: item.governorate,
          city: item.city,
          address: item.address,
          phone: item.phone,
          whatsapp: item.whatsapp,
          rating: item.rating || 0,
          reviewCount: item.review_count || 0,
          isFeatured: item.is_featured || false,
          isVerified: item.is_verified || false,
          image: item.image_url || item.image || `https://picsum.photos/seed/${item.id}/600/400`,
          website: item.website,
          socialLinks: item.social_links || {},
          description: item.description,
          descriptionAr: item.description_ar,
          openingHours: item.opening_hours,
          ownerId: item.owner_id,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at || item.created_at)
        }));

        setBusinesses(prev => {
          const newBusinesses = isRefresh ? mappedBusinesses : [...prev, ...mappedBusinesses];
          const countVal = count || 0;
          setTotalCount(countVal);
          setHasMore(newBusinesses.length < countVal);
          return newBusinesses;
        });
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  }, [page, selectedGovernorate, selectedCity, searchQuery]);

  useEffect(() => {
    setPage(1);
    fetchBusinesses(true);
  }, [selectedGovernorate, selectedCity, searchQuery]);

  useEffect(() => {
    if (page > 1) {
      fetchBusinesses(false);
    }
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    fetchBusinesses(true);
  };

  return { businesses, loading, error, hasMore, totalCount, loadMore, refresh };
}
