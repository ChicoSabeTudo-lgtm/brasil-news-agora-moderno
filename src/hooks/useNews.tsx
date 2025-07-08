import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  id: string;
  title: string;
  subtitle?: string;
  meta_description: string;
  content: string;
  category_id: string;
  author_id: string;
  is_breaking: boolean;
  is_published: boolean;
  published_at: string;
  views: number;
  tags: string[];
  slug: string;
  created_at: string;
  updated_at: string;
  categories: {
    name: string;
    slug: string;
  } | null;
  news_images: {
    image_url: string;
    is_featured: boolean;
    caption: string;
  }[];
  profiles: {
    full_name: string;
  } | null;
}

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      
      // Buscar as notícias publicadas
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select(`
          *,
          categories!inner (
            name,
            slug
          ),
          news_images (
            image_url,
            is_featured,
            caption
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(50);

      if (newsError) throw newsError;

      // Buscar perfis dos autores separadamente
      const userIds = newsData?.map(news => news.author_id).filter(Boolean) || [];
      let profilesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        profilesData = profiles || [];
      }

      // Combinar dados
      const newsWithProfiles = newsData?.map(news => ({
        ...news,
        profiles: profilesData.find(p => p.user_id === news.author_id) || null
      })) || [];

      setNews(newsWithProfiles);
      setError(null);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Erro ao carregar notícias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getNewsByCategory = (categorySlug: string, excludeIds: string[] = []) => {
    return news.filter(item => 
      item.categories?.slug === categorySlug && !excludeIds.includes(item.id)
    );
  };

  const getBreakingNews = () => {
    return news.filter(item => item.is_breaking);
  };

  const getFeaturedNews = () => {
    return news.slice(0, 3);
  };

  return {
    news,
    loading,
    error,
    refetch: fetchNews,
    getNewsByCategory,
    getBreakingNews,
    getFeaturedNews
  };
};