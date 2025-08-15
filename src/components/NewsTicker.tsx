import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BreakingNewsItem {
  id: string;
  title: string;
  slug: string;
  categories: {
    slug: string;
  };
}

export const NewsTicker = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('news').select(`
            id,
            title,
            slug,
            categories!inner (
              slug
            )
          `).eq('is_breaking', true).eq('is_published', true).order('published_at', {
          ascending: false
        }).limit(5);
        if (error) throw error;
        setBreakingNews(data || []);
      } catch (error) {
        console.error('Error fetching breaking news:', error);
        setBreakingNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();

    // Atualizar breaking news a cada 30 segundos
    const newsInterval = setInterval(fetchBreakingNews, 30000);
    
    return () => {
      clearInterval(newsInterval);
    };
  }, []);
  return (
    <>
      {/* Breaking News Ticker */}
      {!loading && breakingNews.length > 0 && (
        <div className="text-white py-2 bg-slate-500">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="bg-white text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide mr-4 rounded">
                URGENTE
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap">
                  {breakingNews.map(news => (
                    <a 
                      key={news.id} 
                      href={`/${news.categories.slug}/${news.slug}`} 
                      className="text-sm mr-8 text-white hover:text-red-200 transition-colors cursor-pointer"
                    >
                      {news.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};