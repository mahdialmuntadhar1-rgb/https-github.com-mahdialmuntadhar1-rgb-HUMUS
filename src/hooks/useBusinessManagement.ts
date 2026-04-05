import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { Business } from '@/lib/supabase';

export function useBusinessManagement() {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimBusiness = async (businessId: string) => {
    if (!user || profile?.role !== 'business_owner') {
      throw new Error('Only business owners can claim businesses.');
    }

    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ ownerId: user.id })
        .eq('id', businessId)
        .is('ownerId', null); // Only allow claiming if it has no owner

      if (updateError) throw updateError;
      
      return true;
    } catch (err) {
      console.error('Error claiming business:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim business');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessProfile = async (businessId: string, updates: Partial<Business>) => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);
    try {
      // businesses table uses camelCase column names
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          name: updates.name,
          nameAr: updates.nameAr,
          nameKu: updates.nameKu,
          description: updates.description,
          descriptionAr: updates.descriptionAr,
          phone: updates.phone,
          website: updates.website,
          address: updates.address,
          imageUrl: updates.image,
          openHours: updates.openingHours,
        })
        .eq('id', businessId)
        .eq('ownerId', user.id);

      if (updateError) throw updateError;
      
      return true;
    } catch (err) {
      console.error('Error updating business profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update business profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOwnedBusinesses = async () => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id);

      if (fetchError) throw fetchError;
      
      // businesses table uses camelCase — handle both for safety
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        nameAr: item.nameAr || item.name_ar,
        nameKu: item.nameKu || item.name_ku,
        category: item.category,
        governorate: item.governorate,
        city: item.city,
        address: item.address,
        phone: item.phone,
        rating: item.rating || 0,
        reviewCount: item.reviewCount || item.review_count || 0,
        isFeatured: item.isFeatured ?? item.is_featured ?? false,
        isVerified: item.isVerified ?? item.is_verified ?? false,
        image: item.imageUrl || item.image_url || item.image,
        website: item.website,
        socialLinks: item.socialLinks || item.social_links || {},
        description: item.description,
        descriptionAr: item.descriptionAr || item.description_ar,
        openingHours: item.openHours || item.opening_hours,
        ownerId: item.ownerId || item.owner_id,
        createdAt: new Date(item.createdAt || item.created_at),
        updatedAt: new Date(item.createdAt || item.created_at),
      })) as Business[];
    } catch (err) {
      console.error('Error fetching owned businesses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { claimBusiness, updateBusinessProfile, getOwnedBusinesses, loading, error };
}
