import { useState } from "react";
import { Layout } from "@/components/Layout";
import { NewsCard } from "@/components/NewsCard";
import { LiveVideo } from "@/components/LiveVideo";
import { Advertisement } from "@/components/Advertisement";
import { VideoModal } from "@/components/VideoModal";
import { Link } from "react-router-dom";
import { useNews } from "@/hooks/useNews";
import { useCategories } from "@/hooks/useCategories";
import { useVideos } from "@/hooks/useVideos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  'saude': breakingImage,
};

const Index = () => {
  const { news, loading, error, getNewsByCategory, getBreakingNews, getFeaturedNews } = useNews();
  const { categories, loading: categoriesLoading } = useCategories();
  const { videos, loading: videosLoading, updateViews } = useVideos();
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
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    }
  };

  // Helper function to get image URL
  const getImageUrl = (newsItem: any) => {
    if (newsItem.news_images && newsItem.news_images.length > 0) {
      const featuredImage = newsItem.news_images.find((img: any) => img.is_featured);
      const imageUrl = featuredImage?.image_url || newsItem.news_images[0]?.image_url;
      
      // Se a URL já é completa (começa com http), usar como está
      if (imageUrl && imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Se é uma URL do Supabase Storage, construir a URL completa
      if (imageUrl && imageUrl.startsWith('news-images/')) {
        return `https://spgusjrjrhfychhdwixn.supabase.co/storage/v1/object/public/${imageUrl}`;
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-muted-foreground">
            {error || 'Nenhuma notícia encontrada. Publique algumas notícias para vê-las aqui.'}
          </p>
        </div>
      </div>
    );
  }

  const featuredNews = getFeaturedNews();
  const mainNews = featuredNews[0] ? transformNewsItem(featuredNews[0], "large") : null;
  const secondaryNews = featuredNews.slice(1, 3).map(item => transformNewsItem(item, "medium"));
  const otherNews = featuredNews.slice(3).map(item => transformNewsItem(item, "small"));

  // IDs das notícias em destaque para excluir das seções
  const featuredNewsIds = featuredNews.map(item => item.id);

  // Função para renderizar template 'standard' - Grid padrão
  const renderStandardTemplate = (category: any, newsItems: any[]) => (
    <section key={category.slug} className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
            {category.name}
          </span>
        </h2>
        <Link to={`/${category.slug}`} className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {newsItems.map((news) => (
          <NewsCard key={news.id} {...news} size="small" />
        ))}
      </div>
    </section>
  );

  // Função para renderizar template 'grid' - Grade compacta
  const renderGridTemplate = (category: any, newsItems: any[]) => (
    <section key={category.slug} className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
            {category.name}
          </span>
        </h2>
        <Link to={`/${category.slug}`} className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((news) => (
          <NewsCard key={news.id} {...news} size="medium" />
        ))}
      </div>
    </section>
  );

  // Função para renderizar template 'list' - Lista simples
  const renderListTemplate = (category: any, newsItems: any[]) => (
    <section key={category.slug} className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
            {category.name}
          </span>
        </h2>
        <Link to={`/${category.slug}`} className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
          Ver todas →
        </Link>
      </div>
      <div className="space-y-4">
        {newsItems.map((news) => (
          <div key={news.id} className="flex gap-4 p-4 bg-card rounded-lg hover:shadow-card transition-shadow cursor-pointer group">
            <img 
              src={news.imageUrl} 
              alt={news.title}
              className="w-24 h-24 object-cover rounded flex-shrink-0"
            />
            <div className="flex-1">
              <Link to={`/${news.categorySlug}/${news.slug}`}>
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
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
          </div>
        ))}
      </div>
    </section>
  );

  // Função para renderizar template 'magazine' - Destaque + Lista lateral
  const renderMagazineTemplate = (category: any, newsItems: any[]) => (
    <section key={category.slug} className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
            {category.name}
          </span>
        </h2>
        <Link to={`/${category.slug}`} className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
          Ver todas →
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notícia em destaque */}
        {newsItems[0] && (
          <div className="lg:col-span-2">
            <NewsCard {...newsItems[0]} size="large" />
          </div>
        )}
        {/* Lista lateral */}
        {newsItems.length > 1 && (
          <div className="lg:col-span-1 space-y-4">
            {newsItems.slice(1).map((news) => (
              <div key={news.id} className="flex gap-4 p-4 bg-card rounded-lg hover:shadow-card transition-shadow cursor-pointer group">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="w-20 h-20 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1">
                  <Link to={`/${news.categorySlug}/${news.slug}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                      {news.title}
                    </h3>
                  </Link>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{news.author}</span>
                    <span className="mx-1">•</span>
                    <span>{news.publishedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section with Main News */}
        {mainNews && (
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Story */}
              <div className="lg:col-span-2">
                <NewsCard {...mainNews} />
              </div>
              
              {/* Live Video Sidebar */}
              <div className="lg:col-span-1">
                <LiveVideo />
              </div>
            </div>
          </section>
        )}

        {/* Secondary News */}
        {secondaryNews.length > 0 && (
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {secondaryNews.map((news) => (
                <NewsCard key={news.id} {...news} />
              ))}
            </div>
          </section>
        )}

        {/* Advertisement Space - Sections */}
        <Advertisement position="politics" />

        {/* Seções de Categorias com Templates Dinâmicos */}
        {categories.map((category) => {
          // Determinar quantas notícias buscar baseado no template
          const templateType = category.template_type || 'standard';
          let newsCount = 4; // padrão
          
          if (templateType === 'grid') newsCount = 6;
          else if (templateType === 'magazine') newsCount = 5;
          
          const categoryNews = getNewsByCategory(category.slug, featuredNewsIds)
            .slice(0, newsCount)
            .map(item => transformNewsItem(item, "medium"));
          
          if (categoryNews.length === 0) return null;
          
          switch (templateType) {
            case 'grid':
              return renderGridTemplate(category, categoryNews);
            case 'list':
              return renderListTemplate(category, categoryNews);
            case 'magazine':
              return renderMagazineTemplate(category, categoryNews);
            case 'standard':
            default:
              return renderStandardTemplate(category, categoryNews);
          }
        })}

        {/* Advertisement Space - Bottom */}
        <Advertisement position="sports" />

        {/* Mais Lidas Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                Mais Lidas
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lista Mais Lidas */}
            <div className="bg-card rounded-lg p-6 shadow-card">
              <div className="space-y-4">
                {news.slice(0, 5).map((newsItem, index) => (
                  <div key={newsItem.id} className="flex items-start gap-4 p-3 hover:bg-muted rounded-lg cursor-pointer group transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {newsItem.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {newsItem.views}k visualizações
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-card rounded-lg p-6 shadow-card">
              <h3 className="font-bold text-lg text-foreground border-l-4 border-primary pl-4 mb-4">
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "#ReformaTributária", "#Copa2024", "#InteligênciaArtificial", 
                  "#Economia", "#PIB", "#Eleições2024", "#Tecnologia", "#Esportes"
                ].map((tag, index) => (
                  <span
                    key={index}
                    className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-foreground">Assuntos em Alta</h4>
                {[
                  { topic: "Reforma Tributária", posts: "2.5k posts" },
                  { topic: "Copa América", posts: "1.8k posts" },
                  { topic: "Inteligência Artificial", posts: "1.2k posts" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer transition-colors">
                    <span className="text-sm font-medium">{item.topic}</span>
                    <span className="text-xs text-muted-foreground">{item.posts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vídeos Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                Vídeos
              </span>
            </h2>
            <Link to="/videos" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
              Ver todos →
            </Link>
          </div>
          
          {videosLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Carregando vídeos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Nenhum vídeo disponível.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.slice(0, 6).map((video) => (
                <div 
                  key={video.id} 
                  className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleVideoClick(video.id)}
                >
                  <div className="relative">
                    <img 
                      src={video.thumbnail_url || breakingImage} 
                      alt={video.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                      {video.duration}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                        <div className="w-0 h-0 border-l-6 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
                      </div>
                    </div>
                    {video.categories && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                          {video.categories.name}
                        </span>
                      </div>
                    )}
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
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Categories Navigation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">
            Navegar por Categoria
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Política", path: "/politica" },
              { name: "Economia", path: "/economia" },
              { name: "Esportes", path: "/esportes" },
              { name: "Tecnologia", path: "/tecnologia" },
              { name: "Internacional", path: "/internacional" },
              { name: "Nacional", path: "/nacional" },
              { name: "Entretenimento", path: "/entretenimento" },
              { name: "Saúde", path: "/saude" }
            ].map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="bg-card hover:bg-muted p-4 rounded-lg text-center cursor-pointer transition-colors group border shadow-sm hover:shadow-card block"
            >
              <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {category.name}
              </h3>
            </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Video Modal */}
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
        video={selectedVideo} 
      />
    </Layout>
  );
};

export default Index;
