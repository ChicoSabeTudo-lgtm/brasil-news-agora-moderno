import { useEffect, useState } from 'react';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
      const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
      const response = await fetch(`${base}/functions/v1/sitemap`);
        const content = await response.text();
        setSitemapContent(content);
      } catch (error) {
        console.error('Error fetching sitemap:', error);
        setSitemapContent('<?xml version="1.0" encoding="UTF-8"?><error>Unable to load sitemap</error>');
      } finally {
        setLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando sitemap...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
      {sitemapContent}
    </div>
  );
};

export default Sitemap;
