/**
 * // BUILD MODE ONLY
 * Helper for controlling access to Build Mode in production.
 */

const ACCESS_KEY = 'belive_builder_access';

export const canAccessBuildMode = (): boolean => {
  // Always allow in development
  if (import.meta.env.DEV) return true;

  // Check URL for ?builder=1
  const params = new URLSearchParams(window.location.search);
  if (params.get('builder') === '1') {
    enableBuildModeAccess();
    return true;
  }

  // Check localStorage for persisted access
  return localStorage.getItem(ACCESS_KEY) === '1';
};

export const enableBuildModeAccess = () => {
  localStorage.setItem(ACCESS_KEY, '1');
};

export const disableBuildModeAccess = () => {
  localStorage.removeItem(ACCESS_KEY);
};
