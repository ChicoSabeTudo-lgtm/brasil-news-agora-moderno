import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration: string;
  views: number;
  category_id?: string;
  is_published: boolean;
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;

      setVideos(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Erro ao carregar vídeos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const getPublishedVideos = (limit?: number) => {
    const publishedVideos = videos.filter(video => video.is_published);
    return limit ? publishedVideos.slice(0, limit) : publishedVideos;
  };

  const getVideosByCategory = (categorySlug: string, limit?: number) => {
    const categoryVideos = videos.filter(video => 
      video.categories?.slug === categorySlug && video.is_published
    );
    return limit ? categoryVideos.slice(0, limit) : categoryVideos;
  };

  const updateViews = async (videoId: string) => {
    try {
      const { error } = await supabase.rpc('increment_video_views', {
        video_id: videoId
      });

      if (error) throw error;
      
      // Atualizar estado local
      setVideos(prev => 
        prev.map(video => 
          video.id === videoId 
            ? { ...video, views: video.views + 1 }
            : video
        )
      );
    } catch (error) {
      console.error('Error updating video views:', error);
    }
  };

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos,
    getPublishedVideos,
    getVideosByCategory,
    updateViews
  };
};