export const toast = {
  success: (message: string, options?: { description?: string }) => {
    console.log('[toast:success]', message, options?.description || '');
  },
  error: (message: string, options?: { description?: string }) => {
    console.error('[toast:error]', message, options?.description || '');
  },
  warning: (message: string, options?: { description?: string }) => {
    console.warn('[toast:warning]', message, options?.description || '');
  },
};
