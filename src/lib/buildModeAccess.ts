/**
 * // BUILD MODE ONLY
 * Helper for controlling access to Build Mode in production.
 * Requirement: URL ?builder=1 AND localStorage owner_builder_access="true"
 */

const ACCESS_KEY = 'owner_builder_access';

export const canAccessBuildMode = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check URL for ?builder=1
  const params = new URLSearchParams(window.location.search);
  const hasUrlParam = params.get('builder') === '1';

  // Check localStorage for persisted access
  const hasStorageFlag = localStorage.getItem(ACCESS_KEY) === 'true';

  // Dual requirement: Both must be true simultaneously
  // This ensures Build Mode is isolated and only accessible to owners with the secret URL
  return hasUrlParam && hasStorageFlag;
};

export const enableBuildModeAccess = () => {
  localStorage.setItem(ACCESS_KEY, 'true');
};

export const disableBuildModeAccess = () => {
  localStorage.removeItem(ACCESS_KEY);
};
