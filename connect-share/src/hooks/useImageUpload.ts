import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useImageUpload(bucket: 'posts' | 'avatars') {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const upload = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}
