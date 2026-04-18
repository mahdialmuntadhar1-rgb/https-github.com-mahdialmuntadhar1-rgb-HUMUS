import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface UploadOptions {
  bucket: string;
  folder: string;
  onProgress?: (progress: number) => void;
}

export function useAdminStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    options: UploadOptions
  ): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${options.folder}/${timestamp}-${randomStr}-${file.name}`;

      const { error: uploadErr } = await supabase.storage
        .from(options.bucket)
        .upload(fileName, file);

      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      const { data } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    uploadError,
    setUploadError,
  };
}
