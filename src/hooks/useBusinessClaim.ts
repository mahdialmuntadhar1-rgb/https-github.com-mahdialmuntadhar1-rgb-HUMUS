import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import { normalizePhoneForDb } from '@/lib/phoneNormalization';
import type { Business } from '@/lib/supabase';

export interface BusinessMatch {
  id: string;
  name: string;
  nameAr?: string;
  phone: string;
  city: string;
  governorate: string;
  address: string;
  category: string;
  ownerId: string | null;
}

export function useBusinessClaim() {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<BusinessMatch[]>([]);
  const [lastSearchedPhone, setLastSearchedPhone] = useState<string | null>(null);

  /**
   * Search for businesses by phone number
   * Uses Iraqi phone normalization to match against database
   */
  const searchBusinessesByPhone = async (phoneInput: string): Promise<BusinessMatch[]> => {
    console.log('[Business Claim] Searching for businesses with phone:', phoneInput);

    if (!phoneInput || phoneInput.trim().length < 10) {
      setError('Please enter a valid phone number');
      return [];
    }

    setLoading(true);
    setError(null);
    setMatches([]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      console.log('[Business Claim] Using Supabase URL:', supabaseUrl);

      // Normalize the input phone
      const normalized = normalizePhoneForDb(phoneInput);
      console.log('[Business Claim] Normalized phone input:', normalized);

      if (!normalized) {
        setError('Invalid phone number format. Expected Iraqi format (e.g., 07508891221)');
        return [];
      }

      // Query the public.businesses table (phone-only matching, no governorate filter)
      console.log('[Business Claim] Querying table: public.businesses');
      const { data, error: queryError } = await supabase
        .from('businesses')
        .select('id, name, name_ar, phone, phone_1, phone_2, city, governorate, address, category, owner_id');

      console.log('[Business Claim] Query result - Error:', queryError, 'Total rows checked:', data?.length);

      if (queryError) {
        console.error('[Business Claim] Query error:', queryError);
        setError('Database error: Unable to search businesses. Please try again.');
        return [];
      }

      if (!data || data.length === 0) {
        console.log('[Business Claim] No businesses found in database');
        setError('No businesses found in database. Please contact support.');
        return [];
      }

      console.log('[Business Claim] Processing', data.length, 'businesses for phone match');

      // Map and filter for phone matches (check phone, phone_1, and phone_2)
      const matchedBusinesses: BusinessMatch[] = [];

      for (const business of data) {
        const phoneFields = [business.phone, business.phone_1, business.phone_2];
        let matched = false;
        let matchedField = '';

        for (const phoneField of phoneFields) {
          if (phoneField) {
            const businessPhone = normalizePhoneForDb(phoneField);
            console.log('[Business Claim] Comparing:', normalized, 'vs', businessPhone, 'for', business.name);

            if (businessPhone === normalized) {
              console.log('[Business Claim] ✓ MATCH:', business.name, 'in field:', matchedField || 'phone');
              matched = true;
              matchedField = phoneField === business.phone ? 'phone' : phoneField === business.phone_1 ? 'phone_1' : 'phone_2';
              break;
            }
          }
        }

        if (matched) {
          matchedBusinesses.push({
            id: business.id,
            name: business.name,
            nameAr: business.name_ar,
            phone: business.phone,
            city: business.city,
            governorate: business.governorate,
            address: business.address,
            category: business.category,
            ownerId: business.owner_id,
          });
        }
      }

      console.log('[Business Claim] Found', matchedBusinesses.length, 'matching businesses');

      if (matchedBusinesses.length === 0) {
        setError('No businesses found with that phone number. Please verify the number is correct.');
        return [];
      }

      setMatches(matchedBusinesses);
      setLastSearchedPhone(phoneInput);
      return matchedBusinesses;
    } catch (err) {
      console.error('[Business Claim] Exception:', err);
      const message = err instanceof Error ? err.message : 'An error occurred while searching for businesses';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Claim a business after finding it
   */
  const claimBusiness = async (businessId: string): Promise<boolean> => {
    console.log('[Business Claim] Claiming business:', businessId);

    if (!user) {
      const errorMsg = 'You must be logged in to claim a business. Please sign in or create an account.';
      console.error('[Business Claim]', errorMsg);
      setError(errorMsg);
      return false;
    }

    if (profile?.role !== 'business_owner') {
      const errorMsg = 'Your account is not set up as a business owner. Please contact support to upgrade your account.';
      console.error('[Business Claim]', errorMsg);
      setError(errorMsg);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Business Claim] Updating business owner_id to:', user.id);
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ owner_id: user.id })
        .eq('id', businessId)
        .is('owner_id', null); // Only allow if no owner

      if (updateError) {
        console.error('[Business Claim] Update error:', updateError);
        if (updateError.message.includes('owner_id')) {
          setError('This business is already claimed by another owner. Please contact support if you believe this is an error.');
        } else {
          setError(`Failed to claim business: ${updateError.message}. Please try again or contact support.`);
        }
        return false;
      }

      console.log('[Business Claim] ✓ Successfully claimed business');
      setMatches([]); // Clear matches after successful claim
      setLastSearchedPhone(null);
      return true;
    } catch (err) {
      console.error('[Business Claim] Exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to claim business. Please try again.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear search results and error
   */
  const clearSearch = () => {
    setMatches([]);
    setError(null);
    setLastSearchedPhone(null);
  };

  return {
    searchBusinessesByPhone,
    claimBusiness,
    clearSearch,
    loading,
    error,
    matches,
    lastSearchedPhone,
  };
}
