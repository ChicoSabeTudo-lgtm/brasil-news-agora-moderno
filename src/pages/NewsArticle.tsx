import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Advertisement } from "@/components/Advertisement";
import { InContentAd } from "@/components/InContentAd";
import { SimpleImageGallery } from "@/components/SimpleImageGallery";
import { ShareButtons } from "@/components/ShareButtons";
import { NewsDownloads } from "@/components/NewsDownloads";
import { useBacklinks } from "@/hooks/useBacklinks";
import { insertInContentAds } from "@/utils/contentUtils";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Clock, User, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SafeHtmlRenderer, sanitizeEmbedCode } from '@/utils/contentSanitizer';

import { VideoPlayer } from '@/components/VideoPlayer';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useNewsMedia } from '@/hooks/useNewsMedia';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { useCategories } from '@/hooks/useCategories';

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
    public_url?: string;
    path?: string;
    is_cover: boolean;
    caption: string;
    sort_order: number;
  }[];
}

const NewsArticle = () => {
  const { categorySlug, slug, id } = useParams();
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedNews, setRelatedNews] = useState<any[]>([]);
  const [processedContent, setProcessedContent] = useState<string>('');
  const [contentWithAds, setContentWithAds] = useState<string>('');
  const { generateBacklinks, isProcessing } = useBacklinks();
  const { mediaFiles } = useNewsMedia(news?.id);
  const { categories } = useCategories();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 NewsArticle Debug:', { 
          slug, 
          id, 
          categorySlug, 
          currentUrl: window.location.href,
          pathname: window.location.pathname 
        });
        
        const selectClause = `
          *,
          categories (
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
        `;

        let query = supabase
          .from('news')
          .select(selectClause)
          .eq('is_published', true);

        // Buscar por slug ou por ID (compatibilidade com rotas antigas)
        if (slug) {
          console.log('🔍 Buscando por slug:', slug);
          query = query.eq('slug', slug);
        } else if (id) {
          console.log('🔍 Buscando por ID:', id);
          query = query.eq('id', id);
        } else {
          console.error('❌ Parâmetros inválidos:', { slug, id, categorySlug });
          throw new Error('Parâmetros inválidos');
        }

        let { data: newsData, error: newsError } = await query.single();

        // Fallback: if not found by slug (e.g., missing slug), try by id if available
        if ((newsError || !newsData) && slug && id) {
          const { data: byId, error: byIdErr } = await supabase
            .from('news')
            .select(selectClause)
            .eq('is_published', true)
            .eq('id', id)
            .single();
          if (!byIdErr && byId) {
            newsData = byId;
            newsError = null as any;
          }
        }

        console.log('🔍 Resultado da consulta:', { newsData, newsError });

        if (newsError) {
          console.error('❌ Erro na consulta:', newsError);
          throw newsError;
        }

        // Buscar perfil do autor via RPC (para contornar RLS)
        let profileData = null;
        if (newsData.author_id) {
          const { data: profilesRpc, error: profilesError } = await supabase
            .rpc('get_public_profiles', { p_user_ids: [newsData.author_id] });
          if (!profilesError && profilesRpc && profilesRpc.length > 0) {
            profileData = profilesRpc[0];
          }
        }

        const newsWithProfile = {
          ...newsData,
          profiles: profileData
        };

        setNews(newsWithProfile);

        // Debug: Log do conteúdo bruto para verificar bullets
        if (process.env.NODE_ENV === 'development' && newsWithProfile.content.includes('<li>')) {
          console.log('Conteúdo bruto do banco:', newsWithProfile.content.substring(0, 1000));
        }

        // Configurar SEO e meta tags para social sharing
        configureSEO(newsWithProfile);

        // Gerar backlinks automáticos
        try {
          const backlinksResult = await generateBacklinks(
            newsWithProfile.content,
            newsWithProfile.id,
            newsWithProfile.categories.slug
          );
          setProcessedContent(backlinksResult.processedContent);
          
          // Inserir placeholders para anúncios in-content
          const contentWithAdPlaceholders = insertInContentAds(backlinksResult.processedContent, newsWithProfile.id);
          setContentWithAds(contentWithAdPlaceholders);
          
          // Reprocessar widgets do Twitter após carregar o conteúdo
          setTimeout(reprocessTwitterWidgets, 100);
          if (backlinksResult.backlinksAdded > 0) {
            console.log(`Added ${backlinksResult.backlinksAdded} backlinks:`, backlinksResult.backlinks);
          }
        } catch (error) {
          console.error('Error generating backlinks:', error);
          setProcessedContent(newsWithProfile.content);
          
          // Inserir placeholders para anúncios in-content mesmo sem backlinks
          const contentWithAdPlaceholders = insertInContentAds(newsWithProfile.content, newsWithProfile.id);
          setContentWithAds(contentWithAdPlaceholders);
          
          // Reprocessar widgets do Twitter após carregar o conteúdo
          setTimeout(reprocessTwitterWidgets, 100);
        }

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
              is_cover
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

  // Função para reprocessar widgets do Twitter com retry e targeting específico
  const reprocessTwitterWidgets = () => {
    const processTwitter = (retryCount = 0) => {
      if (typeof window === 'undefined') return;

      console.log(`Tentativa ${retryCount + 1} de processar Twitter widgets`);
      
      // Verificar se o script do Twitter está carregado
      if (!(window as any).twttr?.widgets) {
        console.log('Script do Twitter não carregado ainda');
        if (retryCount < 5) {
          setTimeout(() => processTwitter(retryCount + 1), 500 * (retryCount + 1));
        }
        return;
      }

      try {
        // Processar apenas o container do conteúdo
        const contentContainer = document.querySelector('.rich-text-content, .news-content, [data-content="article"]');
        
        if (contentContainer) {
          console.log('Processando Twitter widgets no container específico');
          (window as any).twttr.widgets.load(contentContainer);
        } else {
          console.log('Processando Twitter widgets globalmente');
          (window as any).twttr.widgets.load();
        }
        
        // Verificar se há blockquotes do Twitter
        const twitterBlocks = document.querySelectorAll('.twitter-tweet');
        console.log(`Encontrados ${twitterBlocks.length} blockquotes do Twitter`);
        
      } catch (error) {
        console.error('Erro ao processar widgets do Twitter:', error);
        if (retryCount < 3) {
          setTimeout(() => processTwitter(retryCount + 1), 1000);
        }
      }
    };

    processTwitter();
  };

  const getImageUrl = (imageItem: any) => {
    if (!imageItem?.image_url) return null;
    if (imageItem.image_url.startsWith('http')) return imageItem.image_url;
    const base = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    return `${base}/storage/v1/object/public/${imageItem.image_url}`;
  };

  const getFeaturedImage = () => {
    if (!news?.news_images?.length) return null;
    return news.news_images.find(img => img.is_cover) || news.news_images[0];
  };

  const configureSEO = (newsData: NewsData) => {
    const currentUrl = window.location.href;
    const featuredImage = newsData.news_images?.find(img => img.is_cover) || newsData.news_images?.[0];
    const imageUrl = featuredImage ? getImageUrl(featuredImage) : null;
    const siteName = "ChicoSabeTudo";
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
    createOrUpdateMetaTag('meta[name="twitter:site"]', '@chicosabetudo', { name: 'twitter:site' });
    
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
      document.title = "Portal ChicoSabeTudo";
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
      return format(updated, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
    
    return format(published, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  // Enhanced content structure processor
  const enhanceContentStructure = (content: string): string => {
    let enhanced = content;
    
    // Lead formatting removed - keeping original paragraph styling
    
    // Convert strong emphasis patterns to highlight boxes
    enhanced = enhanced.replace(
      /<p[^>]*><strong>([^<]+):<\/strong>\s*(.*?)<\/p>/gi,
      '<div class="highlight-box"><h4>🔍 $1</h4><p>$2</p></div>'
    );
    
    // Convert note patterns to info boxes
    enhanced = enhanced.replace(
      /<p[^>]*>(?:Nota|Observação|Importante|Atenção):\s*(.*?)<\/p>/gi,
      '<div class="info-box"><h4>ℹ️ Informação Importante</h4><p>$1</p></div>'
    );
    
    // Enhance blockquotes with proper cite structure
    enhanced = enhanced.replace(
      /<blockquote[^>]*>(.*?)<\/blockquote>/gi,
      (match, content) => {
        // Check if there's already a cite element
        if (content.includes('<cite>')) {
          return `<blockquote>${content}</blockquote>`;
        }
        // Look for attribution patterns
        const citeMatch = content.match(/(.*?)(?:—|–|-)\s*([^<]+)$/);
        if (citeMatch) {
          return `<blockquote><p>"${citeMatch[1].trim()}"</p><cite>— ${citeMatch[2].trim()}</cite></blockquote>`;
        }
        return `<blockquote><p>"${content.trim()}"</p></blockquote>`;
      }
    );
    
    
    // Enhanced Action Buttons with Context Detection
    
    // Primary video buttons (YouTube, Vimeo)
    enhanced = enhanced.replace(
      /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+))/gi,
      '<div class="action-container"><button class="action-button" onclick="window.open(\'$1\', \'_blank\')" aria-label="Assistir vídeo no YouTube">📺 Assista ao vídeo</button></div>'
    );
    
    enhanced = enhanced.replace(
      /(https?:\/\/(?:www\.)?vimeo\.com\/(\d+))/gi,
      '<div class="action-container"><button class="action-button" onclick="window.open(\'$1\', \'_blank\')" aria-label="Assistir vídeo no Vimeo">📺 Assista ao vídeo</button></div>'
    );
    
    // Secondary buttons for documents and external links
    enhanced = enhanced.replace(
      /(https?:\/\/[^\s]+\.pdf)/gi,
      '<div class="action-container"><button class="action-button secondary" onclick="window.open(\'$1\', \'_blank\')" aria-label="Baixar documento PDF">📄 Baixe o documento</button></div>'
    );
    
    // Social media buttons
    enhanced = enhanced.replace(
      /(https?:\/\/(?:www\.)?instagram\.com\/p\/[\w-]+)/gi,
      '<div class="action-container"><button class="action-button secondary" onclick="window.open(\'$1\', \'_blank\')" aria-label="Ver no Instagram">📱 Ver no Instagram</button></div>'
    );
    
    enhanced = enhanced.replace(
      /(https?:\/\/(?:www\.)?twitter\.com\/[\w-]+\/status\/\d+)/gi,
      '<div class="action-container"><button class="action-button secondary" onclick="window.open(\'$1\', \'_blank\')" aria-label="Ver no Twitter">📱 Ver no Twitter</button></div>'
    );
    
    // Contextual action phrases
    enhanced = enhanced.replace(
      /<p[^>]*>(.*?)(?:Leia mais|Saiba mais|Veja também).*?<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>(.*?)<\/p>/gi,
      '<p>$1$4</p><div class="action-container"><button class="action-button secondary" onclick="window.open(\'$2\', \'_blank\')" aria-label="Leia mais informações">📄 Leia mais</button></div>'
    );
    
    enhanced = enhanced.replace(
      /<p[^>]*>(.*?)(?:Assista|Veja o vídeo).*?<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>(.*?)<\/p>/gi,
      '<p>$1$4</p><div class="action-container"><button class="action-button" onclick="window.open(\'$2\', \'_blank\')" aria-label="Assistir vídeo">📺 Assista ao vídeo</button></div>'
    );
    
    // Data and report buttons
    enhanced = enhanced.replace(
      /(https?:\/\/[^\s]+\.(?:xls|xlsx|csv))/gi,
      '<div class="action-container"><button class="action-button secondary" onclick="window.open(\'$1\', \'_blank\')" aria-label="Baixar planilha">📊 Baixe os dados</button></div>'
    );
    
    // Generic external links with context
    enhanced = enhanced.replace(
      /<p[^>]*>(.*?)(?:Acesse|Visite|Confira).*?<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>(.*?)<\/a>(.*?)<\/p>/gi,
      '<p>$1$4</p><div class="action-container"><button class="action-button secondary" onclick="window.open(\'$2\', \'_blank\')" aria-label="Acessar link externo">🔗 Acesse aqui</button></div>'
    );
    
    // Convert legal references to info boxes
    enhanced = enhanced.replace(
      /<p[^>]*>(?:Segundo|De acordo com|Conforme)\s+(?:a\s+)?(?:lei|artigo|código|constituição)[^.]*\.(.*?)<\/p>/gi,
      '<div class="info-box"><h4>⚖️ Aspectos Legais</h4><p>$&</p></div>'
    );
    
    return enhanced;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-muted-foreground">Carregando notícia...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !news) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  const featuredImage = getFeaturedImage();

  const getBreadcrumbItems = () => {
    if (!news) return [];
    
    const items = [];
    
    if (news.categories?.name) {
      items.push({
        label: news.categories.name,
        href: `/${news.categories.slug}`
      });
    }
    
    items.push({
      label: news.title
    });
    
    return items;
  };

  const getCategoryColor = () => {
    if (!news?.categories?.slug) return '#0066cc';
    const category = categories.find(cat => cat.slug === news.categories.slug);
    return category?.color || '#0066cc';
  };

  return (
    <AnalyticsTracker articleId={news?.id}>
      <Layout>
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={getBreadcrumbItems()} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article */}
            <article 
              className="lg:col-span-3 news-content"
              style={{ '--category-color': getCategoryColor() } as React.CSSProperties}
            >

            {/* Category and Breaking Badge */}
            <div className="mb-4 flex items-center gap-2">
              {news.is_breaking && (
                <span className="bg-news-breaking text-white px-3 py-1 text-sm font-bold uppercase tracking-wide animate-pulse">
                  URGENTE
                </span>
              )}
              <span 
                className="text-white px-3 py-1 text-sm font-bold uppercase tracking-wide"
                style={{ backgroundColor: getCategoryColor() }}
              >
                {news.categories.name}
              </span>
            </div>

            {/* Title */}
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
              style={{ color: getCategoryColor() }}
            >
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
                <div className="hidden md:flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Portal ChicoSabeTudo</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatUpdatedAt(news.published_at, news.updated_at)}</span>
                </div>
              </div>
              
              <ShareButtons
                title={news.title}
                description={news.meta_description}
                url={window.location.href}
              />
            </div>

            {/* Image Gallery */}
            <SimpleImageGallery 
              images={news.news_images || []}
              newsTitle={news.title}
            />

            {/* Advertisement */}
            <div className="no-print">
              <Advertisement position="international" />
            </div>

            {/* Enhanced Content with Professional Formatting */}
            <div className="processed-content">
              {contentWithAds ? (
                <SafeHtmlRenderer 
                  content={enhanceContentStructure(contentWithAds.replace(
                    /<div data-in-content-ad="([^"]+)" data-paragraph="(\d+)"><\/div>/g,
                    (match, newsId, paragraphPos) => 
                      `<div id="in-content-ad-${paragraphPos}"></div>`
                  ))}
                  className="news-article-content"
                />
              ) : (
                <SafeHtmlRenderer 
                  content={enhanceContentStructure(processedContent || news.content)}
                  className="news-article-content"
                />
              )}
              
              {/* Render in-content ads after content is loaded */}
              {contentWithAds && news && (
                <>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(paragraphPos => (
                    <InContentAd 
                      key={`ad-${paragraphPos}`} 
                      newsId={news.id} 
                      paragraphPosition={paragraphPos} 
                    />
                  ))}
                </>
              )}
            </div>


            {/* Media Files */}
            {mediaFiles.length > 0 && (
              <div className="mb-8 space-y-4">
                {mediaFiles.map((media) => (
                  <div key={media.id} className="mb-6">
                    <h3 className="font-semibold text-lg mb-4">
                      {media.file_type === 'video' ? 'Veja o vídeo:' : 'Ouça o áudio:'}
                    </h3>
                    {media.file_type === 'video' ? (
                      <VideoPlayer 
                        src={media.file_url}
                        className="w-full max-h-96"
                      />
                    ) : (
                      <AudioPlayer
                        src={media.file_url}
                        title={media.file_name}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Downloads */}
            <NewsDownloads newsId={news.id} />

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
              <h3 
                className="font-bold text-lg mb-4 pl-4"
                style={{ borderLeft: `4px solid ${getCategoryColor()}` }}
              >
                Notícias Relacionadas
              </h3>
              <div className="space-y-4">
                {relatedNews.length > 0 ? (
                  relatedNews.map((relatedItem) => (
                  <Link 
                      key={relatedItem.id}
                      to={relatedItem.slug && relatedItem.categories?.slug ? `/${relatedItem.categories.slug}/${relatedItem.slug}` : `/noticia/${relatedItem.id}`}
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
    </Layout>
    </AnalyticsTracker>
  );
};

export default NewsArticle;
