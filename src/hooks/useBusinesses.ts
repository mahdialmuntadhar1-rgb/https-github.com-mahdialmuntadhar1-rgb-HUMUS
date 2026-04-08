import { useState, useEffect, useCallback } from 'react';
import type { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';

interface UseBusinessesResult {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
}

const FETCH_LIMIT = 1000;

const normalizeBusiness = (item: any): Business => {
  const name = item.business_name || item.english_name || item.name || item.name_ar || 'Business';
  const primaryPhone = item.phone_1 || item.whatsapp || item.phone_2 || item.phone || '';

  return {
    id: item.id,
    name,
    nameAr: item.name_ar || item.arabic_name,
    nameKu: item.name_ku,
    category: item.category || item.subcategory || 'uncategorized',
    governorate: item.governorate || 'Unknown',
    city: item.city || 'Unknown',
    neighborhood: item.neighborhood,
    address: item.address || item.location || '',
    phone: primaryPhone,
    rating: item.rating || 0,
    reviewCount: item.review_count || 0,
    isFeatured: item.is_featured || false,
    isVerified: item.is_verified || false,
    image: item.image_url || item.logo_url || item.image || '',
    website: item.website,
    socialLinks: {
      ...(item.social_links || {}),
      whatsapp: item.whatsapp || item.social_links?.whatsapp,
    },
    description: item.description || item.bio,
    descriptionAr: item.description_ar,
    openingHours: item.opening_hours,
    ownerId: item.owner_id,
    createdAt: new Date(item.created_at || Date.now()),
    updatedAt: new Date(item.updated_at || item.created_at || Date.now())
  };
};

export function useBusinesses(searchQuery: string): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const { selectedGovernorate, selectedCategory, selectedCity } = useHomeStore();

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(FETCH_LIMIT);

      if (selectedGovernorate) query = query.eq('governorate', selectedGovernorate);
      if (selectedCity) query = query.eq('city', selectedCity);
      if (selectedCategory) query = query.eq('category', selectedCategory);

      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        query = query.or(`name.ilike.%${q}%,business_name.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%,governorate.ilike.%${q}%`);
      }

      const { data, count, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const mappedBusinesses: Business[] = (data || []).map(normalizeBusiness);
      setBusinesses(mappedBusinesses);
      setTotalCount(count || mappedBusinesses.length);
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
      setBusinesses([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedGovernorate, selectedCity, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return {
    businesses,
    loading,
    error,
    hasMore: false,
    totalCount,
    loadMore: () => undefined,
    refresh: fetchBusinesses,
  };
}
