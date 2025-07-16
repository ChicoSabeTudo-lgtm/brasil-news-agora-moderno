import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewsDownload {
  id: string;
  filename: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  description: string | null;
  sort_order: number;
}

export const useNewsDownloads = (newsId: string | null) => {
  const [downloads, setDownloads] = useState<NewsDownload[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (newsId) {
      fetchDownloads();
    } else {
      setDownloads([]);
    }
  }, [newsId]);

  const fetchDownloads = async () => {
    if (!newsId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_downloads')
        .select('*')
        .eq('news_id', newsId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setDownloads(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast.error('Erro ao carregar downloads');
    } finally {
      setIsLoading(false);
    }
  };

  const addDownload = async (file: File, description?: string) => {
    if (!newsId) return false;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${newsId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('news-downloads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('news-downloads')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('news_downloads')
        .insert({
          news_id: newsId,
          filename: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          description: description || null,
          sort_order: downloads.length
        });

      if (insertError) throw insertError;

      toast.success('Arquivo adicionado com sucesso');
      fetchDownloads();
      return true;
    } catch (error) {
      console.error('Error adding download:', error);
      toast.error('Erro ao adicionar arquivo');
      return false;
    }
  };

  const removeDownload = async (downloadId: string, fileUrl: string) => {
    try {
      // Delete from database
      const { error: deleteError } = await supabase
        .from('news_downloads')
        .delete()
        .eq('id', downloadId);

      if (deleteError) throw deleteError;

      // Delete from storage
      const fileName = fileUrl.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('news-downloads')
          .remove([`${newsId}/${fileName}`]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      toast.success('Download removido com sucesso');
      fetchDownloads();
      return true;
    } catch (error) {
      console.error('Error removing download:', error);
      toast.error('Erro ao remover download');
      return false;
    }
  };

  const updateDownloadOrder = async (downloadId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('news_downloads')
        .update({ sort_order: newOrder })
        .eq('id', downloadId);

      if (error) throw error;

      fetchDownloads();
      return true;
    } catch (error) {
      console.error('Error updating download order:', error);
      toast.error('Erro ao atualizar ordem do download');
      return false;
    }
  };

  return {
    downloads,
    isLoading,
    addDownload,
    removeDownload,
    updateDownloadOrder,
    refetch: fetchDownloads
  };
};