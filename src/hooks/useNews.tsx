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
  is_featured: boolean;
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
    public_url?: string;
    path?: string;
    is_cover: boolean;
    caption: string;
    sort_order: number;
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
            public_url,
            path,
            is_cover,
            caption,
            sort_order
          )
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(50);

      if (newsError) throw newsError;

      // Buscar perfis dos autores via RPC (bypass RLS de leitura limitada)
      const userIds = newsData?.map(news => news.author_id).filter(Boolean) || [];
      let profilesData: any[] = [];

      if (userIds.length > 0) {
        const { data: profilesRpc, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        if (!profilesError) {
          profilesData = profilesRpc || [];
        } else {
          console.warn('Falha ao buscar perfis:', profilesError);
        }
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

  const getFeaturedNews = (count: number = 5) => {
    // Notícias já chegam ordenadas por published_at desc
    const featured = news.filter(item => item.is_featured);
    if (featured.length >= count) return featured.slice(0, count);

    const remaining = count - featured.length;
    const nonFeatured = news.filter(item => !item.is_featured);
    const fillers = nonFeatured.slice(0, remaining);
    return [...featured, ...fillers].slice(0, count);
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
