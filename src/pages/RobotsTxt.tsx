import { useEffect } from 'react';

const RobotsTxt = () => {
  useEffect(() => {
    // Set content type to text/plain
    document.title = 'robots.txt';
  }, []);

  const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://chicosabetudo.sigametech.com.br/sitemap.xml

# Crawl-delay para bots mais agressivos
User-agent: Bingbot
Crawl-delay: 1

User-agent: Slurp
Crawl-delay: 1

# Bloquear arquivos desnecessários
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid*`;

  return (
    <pre style={{ 
      fontFamily: 'monospace', 
      whiteSpace: 'pre-wrap',
      margin: 0,
      padding: 0
    }}>
      {robotsContent}
    </pre>
  );
};

export default RobotsTxt;