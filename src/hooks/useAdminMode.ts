import { useAuth } from './useAuth';
import { useMemo, useState } from 'react';

/**
 * useAdminMode - Role-based admin access hook
 * Only users with profile.role === 'admin' can edit
 */
export function useAdminMode() {
  const { profile } = useAuth();
  const [isEditModeOn, setIsEditModeOn] = useState(false);

  const canEditContent = useMemo(() => {
    return profile?.role === 'admin';
  }, [profile?.role]);

  const isAdminEditModeActive = canEditContent && isEditModeOn;

  return {
    canEditContent,
    isAdminEditModeActive,
    isEditModeOn,
    setIsEditModeOn,
  };
}
