import { useAuth } from './useAuth';
import { useMemo } from 'react';

const OWNER_EMAIL = 'mahdialmuntadhar1@gmail.com';

export function useBuildMode() {
  const { user } = useAuth();

  const isBuildModeEnabled = useMemo(() => {
    return user?.email === OWNER_EMAIL;
  }, [user?.email]);

  return {
    isBuildModeEnabled,
  };
}
