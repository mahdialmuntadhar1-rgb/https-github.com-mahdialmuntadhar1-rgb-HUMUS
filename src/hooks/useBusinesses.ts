import { useState, useEffect, useCallback } from 'react';
import type { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';

interface UseBusinessesResult {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

const ITEMS_PER_PAGE = 12;

export function useBusinesses(searchQuery: string): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { selectedGovernorate, selectedCategory, selectedCity } = useHomeStore();

  const fetchBusinesses = useCallback(async (isRefresh = false) => {
    console.log(' [FRONTEND] Starting business fetch...');
    console.log(' [FRONTEND] Query parameters:', {
      page: isRefresh ? 1 : page,
      selectedGovernorate,
      selectedCategory,
      selectedCity,
      searchQuery,
      isRefresh
    });
    
    setLoading(true);
    setError(null);
    
    const currentPage = isRefresh ? 1 : page;
    
    try {
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (selectedGovernorate) {
        query = query.eq('governorate', selectedGovernorate);
        console.log(` [FRONTEND] Filtering by governorate: ${selectedGovernorate}`);
      }
      if (selectedCity) {
        query = query.eq('city', selectedCity);
        console.log(` [FRONTEND] Filtering by city: ${selectedCity}`);
      }
      if (selectedCategory) {
        // Map frontend categories to database values if needed
        query = query.eq('category', selectedCategory);
        console.log(` [FRONTEND] Filtering by category: ${selectedCategory}`);
      }
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        console.log(` [FRONTEND] Searching for: ${searchQuery}`);
      }

      console.log(` [FRONTEND] Fetching page ${currentPage} (${ITEMS_PER_PAGE} items)...`);
      const { data, count, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      console.log(` [FRONTEND] Raw rows fetched from Supabase: ${data?.length || 0}`);
      console.log(` [FRONTEND] Total count from Supabase: ${count}`);
      
      if (data) {
        console.log(' [FRONTEND] Sample raw data:', data[0]);
        
        // Map database columns to frontend interface using actual schema
        const mappedBusinesses: Business[] = data.map((item: any) => {
          const mapped = {
            id: item.id,
            name: item.name,
            nameAr: item.nameAr,
            nameKu: item.nameKu,
            category: item.category,
            governorate: item.governorate,
            city: item.city,
            address: item.address,
            phone: item.phone,
            rating: item.rating || 0,
            reviewCount: item.reviewCount || 0,
            isFeatured: item.isFeatured || false,
            isVerified: item.isVerified || false,
            image: item.imageUrl || item.image || `https://picsum.photos/seed/${item.id}/600/400`,
            website: item.website,
            socialLinks: {
              facebook: item.facebook,
              instagram: item.instagram,
              twitter: item.twitter,
              whatsapp: item.whatsapp
            },
            description: item.description,
            descriptionAr: item.descriptionAr,
            openingHours: item.openHours,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.createdAt)
          };
          
          // Log any potential issues with mapping
          if (!mapped.name) console.warn(' [FRONTEND] Business missing name:', item.id);
          if (!mapped.nameAr) console.log(' [FRONTEND] Business missing Arabic name:', item.id);
          if (!mapped.phone) console.log(' [FRONTEND] Business missing phone:', item.id);
          if (!mapped.rating) console.log(' [FRONTEND] Business missing rating:', item.id);
          if (!mapped.isVerified) console.log(' [FRONTEND] Business not verified:', item.id);
          
          return mapped;
        });

        console.log(` [FRONTEND] Rows after mapping: ${mappedBusinesses.length}`);
        console.log(' [FRONTEND] Sample mapped business:', mappedBusinesses[0]);

        // Apply any additional filtering logic
        const filteredBusinesses = mappedBusinesses.filter(biz => {
          // No additional filtering needed - all businesses should be shown
          return true;
        });

        console.log(` [FRONTEND] Rows after filtering: ${filteredBusinesses.length}`);

        setBusinesses(prev => {
          const newBusinesses = isRefresh ? filteredBusinesses : [...prev, ...filteredBusinesses];
          console.log(` [FRONTEND] Total businesses in state: ${newBusinesses.length}`);
          return newBusinesses;
        });
        
        const totalCount = count || 0;
        const currentTotal = isRefresh ? filteredBusinesses.length : businesses.length + filteredBusinesses.length;
        setHasMore(currentTotal < totalCount);
        
        console.log(` [FRONTEND] Pagination status: ${currentTotal}/${totalCount} (hasMore: ${currentTotal < totalCount})`);
      }
    } catch (err) {
      console.error(' [FRONTEND] Error fetching businesses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
    } finally {
      setLoading(false);
      console.log(' [FRONTEND] Business fetch completed');
    }
  }, [page, selectedGovernorate, selectedCity, selectedCategory, searchQuery, businesses.length]);

  useEffect(() => {
    console.log(' [FRONTEND] Resetting page and fetching businesses...');
    setPage(1);
    fetchBusinesses(true);
  }, [selectedGovernorate, selectedCity, selectedCategory, searchQuery]);

  useEffect(() => {
    if (page > 1) {
      console.log(` [FRONTEND] Loading page ${page}...`);
      fetchBusinesses(false);
    }
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      console.log(' [FRONTEND] Loading more businesses...');
      setPage(prev => prev + 1);
    } else {
      console.log(' [FRONTEND] Cannot load more:', { loading, hasMore });
    }
  };

  const refresh = () => {
    console.log(' [FRONTEND] Refreshing businesses...');
    setPage(1);
    fetchBusinesses(true);
  };

  return { businesses, loading, error, hasMore, loadMore, refresh };
}
