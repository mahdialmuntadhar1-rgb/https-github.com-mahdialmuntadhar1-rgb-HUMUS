import { useState, useEffect, useCallback } from 'react';
import type { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';

interface UseBusinessesResult {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

const ITEMS_PER_PAGE = 8;

export function useBusinesses(searchQuery: string): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { selectedGovernorate, selectedCategory, selectedCity } = useHomeStore();

  const fetchBusinesses = useCallback(async (isRefresh = false) => {
    setLoading(true);
    setError(null);
    
    const currentPage = isRefresh ? 1 : page;
    
    try {
      // In a real app, you would fetch from Supabase here:
      /*
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (selectedGovernorate) query = query.eq('governorate', selectedGovernorate);
      if (selectedCity) query = query.eq('city', selectedCity);
      if (selectedCategory) query = query.eq('category', selectedCategory);
      if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);

      const { data, count, error } = await query;
      if (error) throw error;
      
      const newBusinesses = data as Business[];
      setBusinesses(prev => isRefresh ? newBusinesses : [...prev, ...newBusinesses]);
      setHasMore(count ? (isRefresh ? newBusinesses.length : businesses.length + newBusinesses.length) < count : false);
      */

      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      const allMockData = generateMockBusinesses();
      
      let filtered = allMockData;
      if (selectedGovernorate) filtered = filtered.filter(b => b.governorate === selectedGovernorate);
      if (selectedCity) filtered = filtered.filter(b => b.city === selectedCity);
      if (selectedCategory) filtered = filtered.filter(b => b.category === selectedCategory);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(b => 
          b.name.toLowerCase().includes(q) || 
          b.category.toLowerCase().includes(q)
        );
      }

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const paginated = filtered.slice(start, end);

      setBusinesses(prev => isRefresh ? paginated : [...prev, ...paginated]);
      setHasMore(end < filtered.length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  }, [page, selectedGovernorate, selectedCity, selectedCategory, searchQuery]);

  useEffect(() => {
    setPage(1);
    fetchBusinesses(true);
  }, [selectedGovernorate, selectedCity, selectedCategory, searchQuery]);

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

  return { businesses, loading, error, hasMore, loadMore, refresh };
}

// Mock data generator (moved from HomePage)
function generateMockBusinesses(): Business[] {
  const categories = [
    'dining', 'cafe', 'hotels', 'shopping', 'banks', 
    'education', 'entertainment', 'tourism', 'doctors', 'lawyers',
    'hospitals', 'clinics', 'realestate', 'events', 'others',
    'pharmacy', 'gym', 'beauty', 'supermarkets', 'furniture'
  ];
  
  const governorates = ["Baghdad", "Erbil", "Basra", "Mosul", "Sulaymaniyah"];
  const cities: Record<string, string[]> = {
    Baghdad: ["Central", "Kadhimiya", "Adhamiyah"],
    Erbil: ["Erbil Center", "Ankawa", "Shaqlawa"],
    Basra: ["Basra City", "Zubair"],
    Mosul: ["Mosul Center", "Hamdaniya"],
    Sulaymaniyah: ["Suli Center", "Halabja"]
  };

  return Array.from({ length: 48 }, (_, i) => {
    const gov = governorates[i % governorates.length];
    const cityList = cities[gov];
    const city = cityList[i % cityList.length];
    
    return {
      id: `biz-${i}`,
      name: `${['Al-Mansour', 'Babylon', 'Tigris', 'Euphrates', 'Mesopotamia'][i % 5]} ${['Plaza', 'Garden', 'Center', 'Hub', 'Lounge'][i % 5]}`,
      category: categories[i % categories.length],
      rating: 4 + (i % 10) / 10,
      reviewCount: 10 + i * 5,
      governorate: gov,
      city: city,
      address: `${city}, Iraq`,
      image: `https://picsum.photos/seed/biz${i}/600/400`,
      isFeatured: i < 8,
      isVerified: i % 3 === 0,
      phone: "+964 770 123 4567",
      description: "A premier destination for quality service and authentic Iraqi hospitality. Experience the best of local culture and modern convenience.",
      socialLinks: {
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        whatsapp: "+9647701234567"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
}
