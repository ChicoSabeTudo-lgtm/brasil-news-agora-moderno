import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { NewsTicker } from "@/components/NewsTicker";
import { Advertisement } from "@/components/Advertisement";
import { NewsImageGallery } from "@/components/NewsImageGallery";
import { ShareButtons } from "@/components/ShareButtons";
import { Clock, User, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewsData {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  meta_description: string;
  published_at: string;
  updated_at: string;
  views: number;
  tags: string[];
  is_breaking: boolean;
  categories: {
    name: string;
    slug: string;
  };
  profiles: {
    full_name: string;
  };
  news_images: {
    image_url: string;
    is_featured: boolean;
    caption: string;
  }[];
}

const NewsArticle = () => {
  const { categorySlug, slug, id } = useParams();
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedNews, setRelatedNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        let query = supabase
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
          .eq('is_published', true);

        // Buscar por slug ou por ID (compatibilidade com rotas antigas)
        if (slug) {
          query = query.eq('slug', slug);
        } else if (id) {
          query = query.eq('id', id);
        } else {
          throw new Error('Parâmetros inválidos');
        }

        const { data: newsData, error: newsError } = await query.single();

        if (newsError) throw newsError;

        // Buscar perfil do autor
        let profileData = null;
        if (newsData.author_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', newsData.author_id)
            .single();
          profileData = profile;
        }

        const newsWithProfile = {
          ...newsData,
          profiles: profileData
        };

        setNews(newsWithProfile);

        // Configurar SEO e meta tags para social sharing
        configureSEO(newsWithProfile);

        // Buscar notícias relacionadas da mesma categoria
        const { data: related } = await supabase
          .from('news')
          .select(`
            id,
            title,
            slug,
            published_at,
            categories!inner (
              name,
              slug
            ),
            news_images (
              image_url,
              is_featured
            )
          `)
          .eq('is_published', true)
          .eq('categories.slug', newsData.categories.slug)
          .neq('id', newsData.id)
          .order('published_at', { ascending: false })
          .limit(3);

        setRelatedNews(related || []);

        // Incrementar visualizações
        await supabase
          .from('news')
          .update({ views: (newsData.views || 0) + 1 })
          .eq('id', newsData.id);

      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Notícia não encontrada');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [slug, id]);

  const getImageUrl = (imageItem: any) => {
    if (!imageItem?.image_url) return null;
    
    if (imageItem.image_url.startsWith('http')) {
      return imageItem.image_url;
    }
    return `https://spgusjrjrhfychhdwixn.supabase.co/storage/v1/object/public/${imageItem.image_url}`;
  };

  const getFeaturedImage = () => {
    if (!news?.news_images?.length) return null;
    return news.news_images.find(img => img.is_featured) || news.news_images[0];
  };

  const configureSEO = (newsData: NewsData) => {
    const currentUrl = window.location.href;
    const featuredImage = newsData.news_images?.find(img => img.is_featured) || newsData.news_images?.[0];
    const imageUrl = featuredImage ? getImageUrl(featuredImage) : null;
    const siteName = "News Brasil";
    const excerpt = newsData.subtitle || newsData.meta_description;
    
    // Limpar meta tags existentes
    const existingMetas = document.querySelectorAll('meta[data-dynamic-seo]');
    existingMetas.forEach(meta => meta.remove());

    // Função para criar ou atualizar meta tag
    const createOrUpdateMetaTag = (selector: string, content: string, attributes: Record<string, string>) => {
      // Remover meta tag existente se houver
      const existing = document.querySelector(selector);
      if (existing) existing.remove();
      
      const meta = document.createElement('meta');
      Object.entries(attributes).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      meta.setAttribute('content', content);
      meta.setAttribute('data-dynamic-seo', 'true');
      document.head.appendChild(meta);
    };

    // Atualizar título da página
    document.title = `${newsData.title} | ${siteName}`;

    // Meta tags básicas
    createOrUpdateMetaTag('meta[name="description"]', excerpt, { name: 'description' });
    createOrUpdateMetaTag('meta[name="keywords"]', newsData.tags?.join(', ') || '', { name: 'keywords' });
    createOrUpdateMetaTag('meta[name="author"]', newsData.profiles?.full_name || 'Redação', { name: 'author' });
    createOrUpdateMetaTag('meta[name="robots"]', 'index, follow', { name: 'robots' });
    
    // Open Graph tags (Facebook, LinkedIn, etc.)
    createOrUpdateMetaTag('meta[property="og:type"]', 'article', { property: 'og:type' });
    createOrUpdateMetaTag('meta[property="og:title"]', newsData.title, { property: 'og:title' });
    createOrUpdateMetaTag('meta[property="og:description"]', excerpt, { property: 'og:description' });
    createOrUpdateMetaTag('meta[property="og:url"]', currentUrl, { property: 'og:url' });
    createOrUpdateMetaTag('meta[property="og:site_name"]', siteName, { property: 'og:site_name' });
    createOrUpdateMetaTag('meta[property="og:locale"]', 'pt_BR', { property: 'og:locale' });
    
    if (imageUrl) {
      createOrUpdateMetaTag('meta[property="og:image"]', imageUrl, { property: 'og:image' });
      createOrUpdateMetaTag('meta[property="og:image:width"]', '1200', { property: 'og:image:width' });
      createOrUpdateMetaTag('meta[property="og:image:height"]', '630', { property: 'og:image:height' });
      createOrUpdateMetaTag('meta[property="og:image:alt"]', newsData.title, { property: 'og:image:alt' });
      createOrUpdateMetaTag('meta[property="og:image:type"]', 'image/jpeg', { property: 'og:image:type' });
      createOrUpdateMetaTag('meta[property="og:image:secure_url"]', imageUrl, { property: 'og:image:secure_url' });
    }

    // Dados específicos para artigos
    createOrUpdateMetaTag('meta[property="article:author"]', newsData.profiles?.full_name || 'Redação', { property: 'article:author' });
    createOrUpdateMetaTag('meta[property="article:published_time"]', newsData.published_at, { property: 'article:published_time' });
    createOrUpdateMetaTag('meta[property="article:modified_time"]', newsData.updated_at, { property: 'article:modified_time' });
    createOrUpdateMetaTag('meta[property="article:section"]', newsData.categories.name, { property: 'article:section' });
    
    if (newsData.tags) {
      newsData.tags.forEach(tag => {
        createOrUpdateMetaTag(`meta[property="article:tag"][content="${tag}"]`, tag, { property: 'article:tag' });
      });
    }

    // Twitter Cards
    createOrUpdateMetaTag('meta[name="twitter:card"]', 'summary_large_image', { name: 'twitter:card' });
    createOrUpdateMetaTag('meta[name="twitter:title"]', newsData.title, { name: 'twitter:title' });
    createOrUpdateMetaTag('meta[name="twitter:description"]', excerpt, { name: 'twitter:description' });
    createOrUpdateMetaTag('meta[name="twitter:url"]', currentUrl, { name: 'twitter:url' });
    createOrUpdateMetaTag('meta[name="twitter:site"]', '@newsbrasil', { name: 'twitter:site' });
    
    if (imageUrl) {
      createOrUpdateMetaTag('meta[name="twitter:image"]', imageUrl, { name: 'twitter:image' });
      createOrUpdateMetaTag('meta[name="twitter:image:alt"]', newsData.title, { name: 'twitter:image:alt' });
    }

    // Schema.org JSON-LD
    const existingJsonLd = document.querySelector('script[data-dynamic-seo]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": newsData.title,
      "description": excerpt,
      "image": imageUrl ? [imageUrl] : [],
      "datePublished": newsData.published_at,
      "dateModified": newsData.updated_at,
      "author": {
        "@type": "Person",
        "name": newsData.profiles?.full_name || "Redação"
      },
      "publisher": {
        "@type": "Organization",
        "name": siteName,
        "url": window.location.origin
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": currentUrl
      },
      "articleSection": newsData.categories.name,
      "keywords": newsData.tags?.join(', ') || '',
      "url": currentUrl
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-dynamic-seo', 'true');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Forçar atualização do cache do Facebook (apenas para desenvolvimento)
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('lovable')) {
      console.log('Meta tags configuradas para:', {
        title: newsData.title,
        description: excerpt,
        image: imageUrl,
        url: currentUrl
      });
    }
  };

  // Limpar meta tags ao desmontar o componente
  useEffect(() => {
    return () => {
      // Limpar meta tags dinâmicas ao sair da página
      const dynamicMetas = document.querySelectorAll('[data-dynamic-seo]');
      dynamicMetas.forEach(meta => meta.remove());
      
      // Restaurar título padrão
      document.title = "Portal de Notícias";
    };
  }, []);

  const formatPublishedAt = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatUpdatedAt = (publishedDate: string, updatedDate: string) => {
    const published = new Date(publishedDate);
    const updated = new Date(updatedDate);
    
    // Se a diferença for maior que 1 minuto, considerar como atualizada
    const diffInMinutes = Math.abs(updated.getTime() - published.getTime()) / (1000 * 60);
    
    if (diffInMinutes > 1) {
      return `Atualizada em ${format(updated, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;
    }
    
    return `Publicada em ${format(published, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <NewsTicker />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-muted-foreground">Carregando notícia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <NewsTicker />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Notícia não encontrada</h1>
              <p className="text-muted-foreground mb-6">
                A notícia que você está procurando não existe ou foi removida.
              </p>
              <Link to="/">
                <Button>Voltar à página inicial</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const featuredImage = getFeaturedImage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewsTicker />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span className="mx-2">›</span>
          <Link to={`/${news.categories.slug}`} className="hover:text-primary">
            {news.categories.name}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">{news.title}</span>
        </nav>

        {/* Back Button */}
        <div className="no-print">
          <Button variant="ghost" className="mb-6 -ml-3" asChild>
            <Link to={`/${news.categories.slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para {news.categories.name}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article */}
          <article className="lg:col-span-3">
            {/* Category and Breaking Badge */}
            <div className="mb-4 flex items-center gap-2">
              {news.is_breaking && (
                <span className="bg-news-breaking text-white px-3 py-1 text-sm font-bold uppercase tracking-wide animate-pulse">
                  URGENTE
                </span>
              )}
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                {news.categories.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              {news.title}
            </h1>

            {/* Subtitle */}
            {news.subtitle && (
              <h2 className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {news.subtitle}
              </h2>
            )}

            {/* Article Meta */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Portal ChicoSabeTudo</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatUpdatedAt(news.published_at, news.updated_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{news.views} visualizações</span>
                </div>
              </div>
              
              <ShareButtons
                title={news.title}
                description={news.meta_description}
                url={window.location.href}
              />
            </div>

            {/* Image Gallery */}
            <NewsImageGallery 
              images={news.news_images || []}
              newsTitle={news.title}
              getImageUrl={getImageUrl}
            />

            {/* Advertisement */}
            <div className="no-print">
              <Advertisement position="international" />
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none text-foreground mb-8"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />


            {/* Tags */}
            {news.tags && news.tags.length > 0 && (
              <div className="mb-8 pt-6 border-t border-border">
                <h4 className="font-semibold mb-3">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Advertisement */}
            <div className="no-print">
              <Advertisement position="sports" />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 no-print">
            <div className="bg-card rounded-lg p-6 shadow-card sticky top-8">
              <h3 className="font-bold text-lg mb-4 border-l-4 border-primary pl-4">
                Notícias Relacionadas
              </h3>
              <div className="space-y-4">
                {relatedNews.length > 0 ? (
                  relatedNews.map((relatedItem) => (
                    <Link 
                      key={relatedItem.id}
                      to={`/${relatedItem.categories.slug}/${relatedItem.slug}`}
                      className="flex gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer group transition-colors"
                    >
                      {relatedItem.news_images?.[0] && (
                        <img 
                          src={getImageUrl(relatedItem.news_images[0])} 
                          alt={relatedItem.title}
                          className="w-16 h-16 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {relatedItem.title}
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          {formatPublishedAt(relatedItem.published_at)}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notícia relacionada encontrada.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default NewsArticle;