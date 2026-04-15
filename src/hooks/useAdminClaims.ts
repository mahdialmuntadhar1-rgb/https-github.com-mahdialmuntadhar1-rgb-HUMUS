import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';

export interface ClaimRequest {
  id: string;
  businessId: string;
  userId: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  business?: {
    id: string;
    name: string;
    nameAr?: string;
    phone: string;
    city: string;
    governorate: string;
    category: string;
  };
  user?: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export function useAdminClaims() {
  const { user, profile } = useAuthStore();
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  /**
   * Fetch all claim requests with business and user details
   */
  const fetchClaims = async () => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('claim_requests')
        .select(`
          *,
          business:businesses(id, name, name_ar, phone, city, governorate, category),
          user:profiles(id, email, full_name)
        `)
        .order('submitted_at', { ascending: false });

      if (fetchError) {
        console.error('[Admin Claims] Fetch error:', fetchError);
        setError(`Failed to fetch claims: ${fetchError.message}`);
        return;
      }

      console.log('[Admin Claims] Fetched', data?.length, 'claims');
      setClaims(data || []);
    } catch (err) {
      console.error('[Admin Claims] Exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch claims';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Approve a claim request
   * Calls the secure database function approve_claim_request
   */
  const approveClaim = async (claimId: string): Promise<boolean> => {
    if (!isAdmin) {
      setError('Admin access required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Admin Claims] Approving claim:', claimId);

      // Call the secure database function
      const { data, error: approveError } = await supabase.rpc('approve_claim_request', {
        claim_request_id: claimId
      });

      if (approveError) {
        console.error('[Admin Claims] Approve error:', approveError);
        setError(`Failed to approve claim: ${approveError.message}`);
        return false;
      }

      console.log('[Admin Claims] ✓ Claim approved successfully');
      
      // Refresh claims list
      await fetchClaims();
      return true;
    } catch (err) {
      console.error('[Admin Claims] Exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to approve claim';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reject a claim request
   */
  const rejectClaim = async (claimId: string, reason?: string): Promise<boolean> => {
    if (!isAdmin) {
      setError('Admin access required');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[Admin Claims] Rejecting claim:', claimId);

      const { error: rejectError } = await supabase
        .from('claim_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: reason || null
        })
        .eq('id', claimId);

      if (rejectError) {
        console.error('[Admin Claims] Reject error:', rejectError);
        setError(`Failed to reject claim: ${rejectError.message}`);
        return false;
      }

      console.log('[Admin Claims] ✓ Claim rejected successfully');
      
      // Refresh claims list
      await fetchClaims();
      return true;
    } catch (err) {
      console.error('[Admin Claims] Exception:', err);
      const message = err instanceof Error ? err.message : 'Failed to reject claim';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch claims on mount if admin
  useEffect(() => {
    if (isAdmin) {
      fetchClaims();
    }
  }, [isAdmin]);

  return {
    claims,
    loading,
    error,
    isAdmin,
    fetchClaims,
    approveClaim,
    rejectClaim
  };
}
