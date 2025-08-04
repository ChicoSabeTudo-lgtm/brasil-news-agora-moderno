import { useEffect, useState } from 'react';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/sitemap');
        const content = await response.text();
        setSitemapContent(content);
        
        // Set the content-type to XML
        document.querySelector('meta[http-equiv="Content-Type"]')?.remove();
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Type';
        meta.content = 'application/xml; charset=utf-8';
        document.head.appendChild(meta);
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