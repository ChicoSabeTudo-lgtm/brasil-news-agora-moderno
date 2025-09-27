import { useState } from "react";
import { Layout } from "@/components/Layout";
import { NewsCard } from "@/components/NewsCard";
import { DynamicContentBlock } from "@/components/DynamicContentBlock";
import { Advertisement } from "@/components/Advertisement";
import { VideoModal } from "@/components/VideoModal";
import { SeoMeta } from "@/components/SeoMeta";
import { Link } from "react-router-dom";
import { useNews } from "@/hooks/useNews";
import { useCategories } from "@/hooks/useCategories";
import { useVideos } from "@/hooks/useVideos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBestVideoThumbnail } from "@/utils/videoUtils";
import { publicStorageUrl } from "@/utils/imageUtils";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

// Import default images
import politicsImage from "@/assets/politics-news.jpg";
import economyImage from "@/assets/economy-news.jpg";
import sportsImage from "@/assets/sports-news.jpg";
import techImage from "@/assets/tech-news.jpg";
import internationalImage from "@/assets/international-news.jpg";
import breakingImage from "@/assets/breaking-news-hero.jpg";

// Mapeamento de categorias para imagens padrão
const categoryImages: Record<string, string> = {
  'politica': politicsImage,
  'economia': economyImage,
  'esportes': sportsImage,
  'tecnologia': techImage,
  'internacional': internationalImage,
  'nacional': breakingImage,
  'entretenimento': breakingImage,
  'saude': breakingImage
};
const Index = () => {
  const {
    news,
    loading,
    error,
    getNewsByCategory,
    getBreakingNews,
    getFeaturedNews
  } = useNews();
  const {
    categories,
    loading: categoriesLoading
  } = useCategories();
  const {
    videos,
    loading: videosLoading,
    updateViews
  } = useVideos();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const handleVideoClick = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
      setIsVideoModalOpen(true);
      updateViews(videoId);
    }
  };

  // Helper function to format date
  const formatPublishedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) {
      return "Agora há pouco";
    } else if (diffInHours < 24) {
      return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else {
      return format(date, "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR
      });
    }
  };

  // Helper function to get image URL using utility
  const getImageUrl = (newsItem: any) => {
    if (newsItem.news_images && newsItem.news_images.length > 0) {
      const coverImage = newsItem.news_images.find((img: any) => img.is_cover);
      const firstImage = coverImage || newsItem.news_images[0];
      
      // Use image utility function
      const imageUrl = firstImage.public_url || firstImage.image_url;
      if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
        return imageUrl;
      }
      
      // Fallback to path construction
      if (firstImage.path) {
        return publicStorageUrl(`news-images/${firstImage.path}`);
      }
      
      return imageUrl;
    }
    return categoryImages[newsItem.categories?.slug] || breakingImage;
  };

  // Transform news data for NewsCard component
  const transformNewsItem = (newsItem: any, size: "small" | "medium" | "large" = "medium") => ({
    id: newsItem.id,
    title: newsItem.title,
    metaDescription: newsItem.meta_description,
    imageUrl: getImageUrl(newsItem),
    category: newsItem.categories?.name || 'Geral',
    author: newsItem.profiles?.full_name || 'Redação',
    publishedAt: formatPublishedAt(newsItem.published_at),
    isBreaking: newsItem.is_breaking,
    size,
    slug: newsItem.slug,
    categorySlug: newsItem.categories?.slug
  });
  if (loading || categoriesLoading) {
    return <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="sr-only">Carregando...</span>
          </div>
        </div>
      </div>;
  }
  if (error || news.length === 0) {
    return <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground">
            {error || 'Nenhuma notícia encontrada. Publique algumas notícias para vê-las aqui.'}
          </p>
        </div>
      </div>;
  }
  const featuredNews = getFeaturedNews(5);
  const mainNews = featuredNews[0] ? transformNewsItem(featuredNews[0], "large") : null;
  const secondaryNews = featuredNews.slice(1, 5).map(item => transformNewsItem(item, "medium"));
  const otherNews = featuredNews.slice(5).map(item => transformNewsItem(item, "small"));

  // IDs das notícias em destaque para excluir das seções
  const featuredNewsIds = featuredNews.map(item => item.id);

  // Schema.org data for homepage
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@graph": [{
      "@type": "NewsMediaOrganization",
      "@id": "https://chicosabetudo.sigametech.com.br/#organization",
      "name": "ChicoSabeTudo",
      "alternateName": "Portal ChicoSabeTudo",
      "url": "https://chicosabetudo.sigametech.com.br",
      "logo": {
        "@type": "ImageObject",
        "url": "https://chicosabetudo.sigametech.com.br/lovable-uploads/aac6981c-a63e-4b99-a9d1-5be26ea5ad4a.png"
      },
      "sameAs": ["https://facebook.com/chicosabetudo", "https://instagram.com/chicosabetudo"],
      "description": "Portal de notícias da Bahia com cobertura completa de política, economia, esportes e entretenimento"
    }, {
      "@type": "WebSite",
      "@id": "https://chicosabetudo.sigametech.com.br/#website",
      "url": "https://chicosabetudo.sigametech.com.br",
      "name": "ChicoSabeTudo",
      "publisher": {
        "@id": "https://chicosabetudo.sigametech.com.br/#organization"
      },
      "inLanguage": "pt-BR",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://chicosabetudo.sigametech.com.br/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }]
  };

  // Função para renderizar template 'standard' - Grid padrão
  const renderStandardTemplate = (category: any, newsItems: any[]) => <section key={category.slug} className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground border-b-2 pb-2 flex items-center gap-2" style={{
        borderColor: category.color
      }}>
          <span className="text-white px-3 py-1 text-sm font-bold uppercase tracking-wide" style={{
          backgroundColor: category.color
        }}>
            {category.name}
          </span>
        </h2>
        <Link to={`/${category.slug}`} className="hover:text-primary-darker font-semibold text-sm transition-colors" style={{
        color: category.color
      }}>
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {newsItems.map(news => <NewsCard key={news.id} {...news} size="small" categoryColor={category.color} />)}
      </div>
    </section>;

  // Função para renderizar template 'grid' - Grade compacta
  const renderGridTemplate = (category: any, newsItems: any[]) => <section key={category.slug} className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground border-b-2 pb-2 flex items-center gap-2" style={{
        borderColor: category.color
      }}>
          <span className="text-white px-3 py-1 text-sm font-bold uppercase tracking-wide" style={{
          backgroundColor: category.color
        }}>
            {category.name}
          </span>
        </h2>
        <Link to={`/${category.slug}`} className="hover:text-primary-darker font-semibold text-sm transition-colors" style={{
        color: category.color
      }}>
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map(news => <NewsCard key={news.id} {...news} size="medium" categoryColor={category.color} />)}
      </div>
    </section>;

  // Função para renderizar template 'list' - Lista simples
  const renderListTemplate = (category: any, newsItems: any[]) => <section key={category.slug} className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground border-b-2 pb-2 flex items-center gap-2" style={{
        borderColor: category.color
      }}>
          <span className="text-white px-3 py-1 text-sm font-bold uppercase tracking-wide" style={{
          backgroundColor: category.color
        }}>
            {category.name}
          </span>
        </h2>
        <Link to={`/${category.slug}`} className="hover:text-primary-darker font-semibold text-sm transition-colors" style={{
        color: category.color
      }}>
          Ver todas →
        </Link>
      </div>
      <div className="space-y-4">
        {newsItems.map(news => <div key={news.id} className="flex gap-4 p-4 bg-card rounded-lg hover:shadow-card transition-shadow cursor-pointer group">
            <img src={news.imageUrl} alt={news.title} className="w-24 h-24 object-cover rounded flex-shrink-0" />
            <div className="flex-1">
              <Link to={news.slug && news.categorySlug ? `/${news.categorySlug}/${news.slug}` : `/noticia/${news.id}`}>
                <h3 className="font-semibold text-lg line-clamp-2 transition-colors mb-2 hover:opacity-80" style={{
              "--hover-color": category.color
            } as any} onMouseEnter={e => e.currentTarget.style.color = category.color} onMouseLeave={e => e.currentTarget.style.color = ''}>
                  {news.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {news.metaDescription}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{news.author}</span>
                <span className="mx-1">•</span>
                <span>{news.publishedAt}</span>
              </div>
            </div>
          </div>)}
      </div>
    </section>;

  // Função para renderizar template 'magazine' - Destaque + Lista lateral
  const renderMagazineTemplate = (category: any, newsItems: any[]) => <section key={category.slug} className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground border-b-2 pb-2 flex items-center gap-2" style={{
        borderColor: category.color
      }}>
          <span className="text-white px-3 py-1 text-sm font-bold uppercase tracking-wide" style={{
          backgroundColor: category.color
        }}>
            {category.name}
          </span>
        </h2>
        <Link to={`/${category.slug}`} className="hover:text-primary-darker font-semibold text-sm transition-colors" style={{
        color: category.color
      }}>
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notícia em destaque */}
        {newsItems[0] && <div className="lg:col-span-2">
            <NewsCard {...newsItems[0]} size="large" categoryColor={category.color} />
          </div>}
        {/* Lista lateral */}
        {newsItems.length > 1 && <div className="lg:col-span-1 space-y-4">
            {newsItems.slice(1).map(news => <div key={news.id} className="flex gap-4 p-4 bg-card rounded-lg hover:shadow-card transition-shadow cursor-pointer group">
                <img src={news.imageUrl} alt={news.title} className="w-20 h-20 object-cover rounded flex-shrink-0" />
                <div className="flex-1">
                  <Link to={news.slug && news.categorySlug ? `/${news.categorySlug}/${news.slug}` : `/noticia/${news.id}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 transition-colors mb-1" onMouseEnter={e => e.currentTarget.style.color = category.color} onMouseLeave={e => e.currentTarget.style.color = ''}>
                      {news.title}
                    </h3>
                  </Link>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{news.author}</span>
                    <span className="mx-1">•</span>
                    <span>{news.publishedAt}</span>
                  </div>
                </div>
              </div>)}
          </div>}
      </div>
    </section>;
  return <>
      <SeoMeta title="Portal ChicoSabeTudo - Notícias da Bahia" description="Portal de notícias da Bahia com cobertura completa de política, economia, esportes e entretenimento. Informação confiável e atualizada 24h." keywords="notícias bahia, portal de notícias, bahia notícias, política bahia, esportes bahia" canonical="https://chicosabetudo.sigametech.com.br" ogImage="https://chicosabetudo.sigametech.com.br/lovable-uploads/aac6981c-a63e-4b99-a9d1-5be26ea5ad4a.png" ogUrl="https://chicosabetudo.sigametech.com.br" structuredData={homepageStructuredData} />
      <AnalyticsTracker>
        <Layout>
      <main className="container mx-auto px-4 py-8">
        {/* SEO H1 Header - Hidden */}
        <header className="mb-8 sr-only">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Portal ChicoSabeTudo - Notícias da Bahia
          </h1>
          <p className="text-lg text-muted-foreground">
            Informação confiável e atualizada 24h sobre política, economia, esportes e entretenimento
          </p>
        </header>

        {/* Hero Section with Main News */}
        {mainNews && <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Story */}
              <div className="lg:col-span-2">
                <NewsCard {...mainNews} />
              </div>
              
              {/* Dynamic Content Block Sidebar */}
              <div className="lg:col-span-1">
                <DynamicContentBlock />
              </div>
            </div>
          </section>}

        {/* Secondary News */}
        {secondaryNews.length > 0 && <section className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {secondaryNews.map(news => <NewsCard key={news.id} {...news} />)}
            </div>
          </section>}

        {/* Advertisement Space - Sections */}
        <Advertisement position="politics" />

        {/* Seções de Categorias com Templates Dinâmicos */}
        {categories.map(category => {
            // Determinar quantas notícias buscar baseado no template
            const templateType = category.template_type || 'standard';
            let newsCount = 4; // padrão

            if (templateType === 'grid') newsCount = 6;else if (templateType === 'magazine') newsCount = 5;
            const categoryNews = getNewsByCategory(category.slug, featuredNewsIds).slice(0, newsCount).map(item => transformNewsItem(item, "medium"));
            if (categoryNews.length === 0) return null;
            // Render section based on template
            let section: JSX.Element;
            switch (templateType) {
              case 'grid':
                section = renderGridTemplate(category, categoryNews);
                break;
              case 'list':
                section = renderListTemplate(category, categoryNews);
                break;
              case 'magazine':
                section = renderMagazineTemplate(category, categoryNews);
                break;
              case 'standard':
              default:
                section = renderStandardTemplate(category, categoryNews);
                break;
            }

            // Special background band for Polícia block
            if (category.slug === 'policia') {
              return (
                <div key={`policia-band-${category.slug}`} className="-mx-4 rounded-lg bg-red-700/90 py-8 px-4 text-white">
                  {section}
                </div>
              );
            }

            return section;
          })}

        {/* Advertisement Space - Bottom */}
        <Advertisement position="sports" />

        {/* Mais Lidas Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
        <span className="bg-slate-950 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide">
          Mais Lidas
        </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lista Mais Lidas */}
            <div className="bg-card rounded-lg p-6 shadow-card">
              <div className="space-y-4">
                {news.slice(0, 5).map((newsItem, index) => {
                  const link = newsItem.slug && newsItem.categories?.slug 
                    ? `/${newsItem.categories.slug}/${newsItem.slug}`
                    : `/noticia/${newsItem.id}`;
                  const thumb = getImageUrl(newsItem);
                  return (
                    <Link 
                      key={newsItem.id} 
                      to={link}
                      className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg cursor-pointer group transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm bg-slate-950">
                        {index + 1}
                      </div>
                      {thumb && (
                        <img 
                          src={thumb}
                          alt={newsItem.title}
                          className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {newsItem.title}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-card rounded-lg p-6 shadow-card">
              <h3 className="font-bold text-lg text-foreground border-l-4 border-primary pl-4 mb-4">
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // Gerar trending topics baseados nas notícias mais visualizadas e tags mais utilizadas
                  const topNews = [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 20);
                  const allTags = topNews.flatMap(item => item.tags || []);
                  const recentCategories = news.slice(0, 10).map(item => item.categories?.name).filter(Boolean);
                  
                  // Contar frequência das tags
                  const tagFrequency: Record<string, number> = {};
                  allTags.forEach(tag => {
                    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
                  });
                  
                  // Pegar as tags mais frequentes
                  const trendingTags = Object.entries(tagFrequency)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 4)
                    .map(([tag]) => tag);
                  
                  // Combinar tags frequentes com categorias recentes
                  const allTopics = [...trendingTags, ...recentCategories];
                  const uniqueTopics = [...new Set(allTopics)].slice(0, 8);
                  
                  // Se não há dados suficientes, usar tópicos atuais relevantes
                  const fallbackTopics = [
                    "Política Bahia", "Economia", "Tecnologia", "Esportes", 
                    "Municípios", "Saúde", "Entretenimento", "Polícia"
                  ];
                  
                  const finalTopics = uniqueTopics.length >= 6 
                    ? uniqueTopics 
                    : [...uniqueTopics, ...fallbackTopics].slice(0, 8);
                    
                  return finalTopics.map((tag, index) => (
                    <Link 
                      key={index}
                      to={`/search?q=${encodeURIComponent(tag)}`}
                      className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
                    >
                      #{tag}
                    </Link>
                  ));
                })()}
              </div>
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-foreground">Assuntos em Alta</h4>
                {(() => {
                  // Gerar assuntos em alta baseados nas categorias com mais notícias e visualizações
                  const categoryStats = categories.map(cat => {
                    const categoryNews = getNewsByCategory(cat.slug);
                    const totalViews = categoryNews.reduce((sum, item) => sum + (item.views || 0), 0);
                    const recentNews = categoryNews.filter(item => {
                      const publishedDate = new Date(item.published_at);
                      const daysDiff = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
                      return daysDiff <= 7; // Notícias dos últimos 7 dias
                    });
                    
                    return {
                      name: cat.name,
                      slug: cat.slug,
                      count: categoryNews.length,
                      recentCount: recentNews.length,
                      totalViews,
                      color: cat.color,
                      // Score baseado em número de notícias recentes + visualizações
                      hotScore: (recentNews.length * 10) + (totalViews / 100)
                    };
                  }).sort((a, b) => b.hotScore - a.hotScore).slice(0, 5);
                  
                  return categoryStats.map((item, index) => (
                    <Link 
                      key={index}
                      to={`/${item.slug}`}
                      className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer transition-colors group"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors" style={{ '--hover-color': item.color } as any}>
                          {item.name}
                        </span>
                        {item.recentCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full animate-pulse">
                              {item.recentCount} nova{item.recentCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">
                          {item.count} notícias
                        </span>
                      </div>
                    </Link>
                  ));
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* Vídeos Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
        <span className="bg-slate-950 text-white px-3 py-1 text-sm font-bold uppercase tracking-wide">
          Vídeos
        </span>
            </h2>
            <Link to="/videos" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
              Ver todos →
            </Link>
          </div>
          
          {videosLoading ? <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Carregando vídeos...</p>
            </div> : videos.length === 0 ? <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Nenhum vídeo disponível.</p>
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.slice(0, 6).map(video => <div key={video.id} className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleVideoClick(video.id)}>
                  <div className="relative">
                    <img src={getBestVideoThumbnail(video.thumbnail_url, video.video_url, breakingImage)} alt={video.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                      {video.duration}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                        <div className="w-0 h-0 border-l-6 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
                      </div>
                    </div>
                    {video.categories && <div className="absolute top-2 left-2">
                        <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                          {video.categories.name}
                        </span>
                      </div>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground justify-between">
                      <span>{video.views.toLocaleString()} visualizações</span>
                      <span>{formatPublishedAt(video.published_at || video.created_at)}</span>
                    </div>
                  </div>
                </div>)}
            </div>}
        </section>

      </main>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} video={selectedVideo} />
      </Layout>
      </AnalyticsTracker>
    </>;
};
export default Index;
