import { useState } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface BusinessSubmission {
  name: string;
  phone: string;
  category: string;
  governorate: string;
  city: string;
  address?: string;
  whatsapp?: string;
  website?: string;
  description?: string;
}

export function useBusinessSubmission() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitBusiness = async (data: BusinessSubmission) => {
    if (!user) {
      setError('You must be logged in to submit a business');
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Client-side validation
      if (!data.name.trim()) {
        throw new Error('Business name is required');
      }
      if (!data.phone.trim()) {
        throw new Error('Phone number is required');
      }
      if (!data.category.trim()) {
        throw new Error('Category is required');
      }
      if (!data.governorate.trim()) {
        throw new Error('Governorate is required');
      }
      if (!data.city.trim()) {
        throw new Error('City is required');
      }

      // Prepare submission data
      const submissionData = {
        name: data.name.trim(),
        phone: data.phone.replace(/[^\d+]/g, ''), // Clean phone number
        category: data.category.trim(),
        governorate: data.governorate.trim(),
        city: data.city.trim(),
        address: data.address?.trim() || null,
        whatsapp: data.whatsapp?.replace(/[^\d+]/g, '') || null,
        website: data.website?.trim() || null,
        description: data.description?.trim() || null,
        submitted_by: user.id,
        moderation_status: 'pending',
        source: 'web_form'
      };

      // Insert via Supabase
      const { data: result, error: insertError } = await supabase
        .from('businesses')
        .insert([submissionData])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit business');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const claimBusiness = async (businessId: string) => {
    if (!user) {
      setError('You must be logged in to claim a business');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the claim function
      const { data, error } = await supabase.rpc('claim_business', {
        business_id: businessId,
        claimant_user_id: user.id
      });

      if (error) throw error;

      return data.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim business');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getMySubmissions = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
      return [];
    }
  };

  const updateSubmission = async (businessId: string, data: Partial<BusinessSubmission>) => {
    if (!user) {
      setError('You must be logged in to update a business');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: any = {};
      
      if (data.name) updateData.name = data.name.trim();
      if (data.phone) updateData.phone = data.phone.replace(/[^\d+]/g, '');
      if (data.category) updateData.category = data.category.trim();
      if (data.governorate) updateData.governorate = data.governorate.trim();
      if (data.city) updateData.city = data.city.trim();
      if (data.address !== undefined) updateData.address = data.address?.trim() || null;
      if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp?.replace(/[^\d+]/g, '') || null;
      if (data.website !== undefined) updateData.website = data.website?.trim() || null;
      if (data.description !== undefined) updateData.description = data.description?.trim() || null;

      const { data: result, error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessId)
        .eq('submitted_by', user.id)
        .select()
        .single();

      if (error) throw error;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (businessId: string) => {
    if (!user) {
      setError('You must be logged in to delete a business');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId)
        .eq('submitted_by', user.id)
        .eq('moderation_status', 'pending'); // Only allow deletion of pending submissions

      if (error) throw error;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete business');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitBusiness,
    claimBusiness,
    getMySubmissions,
    updateSubmission,
    deleteSubmission,
    loading,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false)
  };
}
