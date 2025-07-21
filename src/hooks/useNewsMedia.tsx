import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsMedia {
  id: string;
  news_id: string;
  file_url: string;
  file_name: string;
  file_type: 'video' | 'audio';
  mime_type: string;
  file_size: number;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export const useNewsMedia = (newsId?: string) => {
  const [mediaFiles, setMediaFiles] = useState<NewsMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMediaFiles = async () => {
    if (!newsId) {
      setMediaFiles([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_media')
        .select('*')
        .eq('news_id', newsId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaFiles((data || []) as NewsMedia[]);
    } catch (error: any) {
      console.error('Error fetching media files:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os arquivos de mídia.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMediaFile = async (mediaId: string) => {
    try {
      const { error } = await supabase
        .from('news_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      setMediaFiles(prev => prev.filter(m => m.id !== mediaId));
      
      toast({
        title: "Arquivo removido",
        description: "O arquivo de mídia foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error('Error deleting media file:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o arquivo de mídia.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMediaFiles();
  }, [newsId]);

  return {
    mediaFiles,
    loading,
    refetch: fetchMediaFiles,
    deleteMediaFile
  };
};