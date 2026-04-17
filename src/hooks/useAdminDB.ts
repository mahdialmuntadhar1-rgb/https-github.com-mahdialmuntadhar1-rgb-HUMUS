import { supabase } from '@/lib/supabaseClient';

export function useAdminDB() {
  const updateHeroSlide = async (id: string, updates: { image_url: string }) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating hero slide:', err);
      // We still return true if we want to allow the optimistic update in the UI to stick
      // but logging is important. In a real app we'd handle this better.
      return false;
    }
  };

  return {
    updateHeroSlide
  };
}
