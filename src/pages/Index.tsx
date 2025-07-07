import { Header } from "@/components/Header";
import { NewsTicker } from "@/components/NewsTicker";
import { NewsCard } from "@/components/NewsCard";
import { LiveVideo } from "@/components/LiveVideo";
import { Advertisement } from "@/components/Advertisement";
import { Link } from "react-router-dom";
import { useNews } from "@/hooks/useNews";
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
      return featuredImage?.image_url || newsItem.news_images[0]?.image_url;
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
    size
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <NewsTicker />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-muted-foreground">Carregando notícias...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <NewsTicker />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-muted-foreground">
              {error || 'Nenhuma notícia encontrada. Publique algumas notícias para vê-las aqui.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const featuredNews = getFeaturedNews();
  const mainNews = featuredNews[0] ? transformNewsItem(featuredNews[0], "large") : null;
  const secondaryNews = featuredNews.slice(1, 3).map(item => transformNewsItem(item, "medium"));
  const otherNews = featuredNews.slice(3).map(item => transformNewsItem(item, "small"));

  const politicsNews = getNewsByCategory('politica').slice(0, 3).map(item => transformNewsItem(item, "medium"));
  const economyNews = getNewsByCategory('economia').slice(0, 3).map(item => transformNewsItem(item, "medium"));
  const sportsNews = getNewsByCategory('esportes').slice(0, 3).map(item => transformNewsItem(item, "medium"));
  const techNews = getNewsByCategory('tecnologia').slice(0, 3).map(item => transformNewsItem(item, "medium"));
  const internationalNews = getNewsByCategory('internacional').slice(0, 3).map(item => transformNewsItem(item, "medium"));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewsTicker />
      
      {/* Advertisement Space - Header */}
      <Advertisement position="header" />
      
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

        {/* Advertisement Space - Politics */}
        <Advertisement position="politics" />

        {/* Política Section */}
        {politicsNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                  Política
                </span>
              </h2>
              <Link to="/politica" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {politicsNews.map((news) => (
                <NewsCard key={news.id} {...news} />
              ))}
            </div>
          </section>
        )}

        {/* Economia Section - Featured + Sidebar Layout */}
        {economyNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                  Economia
                </span>
              </h2>
              <Link to="/economia" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured Story */}
              {economyNews[0] && (
                <div className="lg:col-span-2">
                  <NewsCard {...economyNews[0]} size="large" />
                </div>
              )}
              {/* Sidebar Stories */}
              {economyNews.length > 1 && (
                <div className="lg:col-span-1 space-y-4">
                  {economyNews.slice(1).map((news) => (
                    <div key={news.id} className="flex gap-4 p-4 bg-card rounded-lg hover:shadow-card transition-shadow cursor-pointer group">
                      <img 
                        src={news.imageUrl} 
                        alt={news.title}
                        className="w-20 h-20 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {news.title}
                        </h3>
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
        )}

        {/* Advertisement Space - Sports */}
        <Advertisement position="sports" />

        {/* Esportes Section - Horizontal Scroll Layout */}
        {sportsNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                  Esportes
                </span>
              </h2>
              <Link to="/esportes" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
                Ver todas →
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {sportsNews.map((news) => (
                <div key={news.id} className="flex-shrink-0 w-80">
                  <NewsCard {...news} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tecnologia Section - Mosaic Layout */}
        {techNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                  Tecnologia
                </span>
              </h2>
              <Link to="/tecnologia" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {techNews[0] && (
                <div className="md:col-span-2 md:row-span-2">
                  <NewsCard {...techNews[0]} size="large" />
                </div>
              )}
              {techNews.length > 1 && (
                <div className="md:col-span-2 grid grid-cols-1 gap-4">
                  {techNews.slice(1).map((news) => (
                    <NewsCard key={news.id} {...news} size="small" />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Advertisement Space - International */}
        <Advertisement position="international" />

        {/* Internacional Section - List + Featured Layout */}
        {internationalNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                  Internacional
                </span>
              </h2>
              <Link to="/internacional" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Featured International News */}
              {internationalNews[0] && (
                <div>
                  <NewsCard {...internationalNews[0]} size="medium" />
                </div>
              )}
              {/* News List */}
              {internationalNews.length > 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground border-l-4 border-primary pl-4">
                    Destaques Internacionais
                  </h3>
                  {internationalNews.slice(1).map((news, index) => (
                    <div key={news.id} className="flex gap-4 p-4 bg-card rounded-lg hover:shadow-card transition-shadow cursor-pointer group border-l-2 border-transparent hover:border-primary">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {index + 2}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {news.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
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
              )}
            </div>
          </section>
        )}

        {/* Other News Grid */}
        {otherNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2">
                Outras Notícias
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherNews.map((news) => (
                <NewsCard key={news.id} {...news} />
              ))}
            </div>
          </section>
        )}

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
            <a href="#" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
              Ver todos →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Análise completa da reforma tributária aprovada no Congresso",
                duration: "8:45",
                views: "156k",
                thumbnail: breakingImage,
                category: "Política"
              },
              {
                title: "Mercado financeiro reage à decisão do Banco Central sobre a Selic",
                duration: "5:32",
                views: "89k",
                thumbnail: economyImage,
                category: "Economia"
              },
              {
                title: "Convocação da Seleção: análise dos escolhidos para a Copa América",
                duration: "12:18",
                views: "234k",
                thumbnail: sportsImage,
                category: "Esportes"
              },
              {
                title: "Nova tecnologia de IA revoluciona diagnósticos médicos no Brasil",
                duration: "6:55",
                views: "67k",
                thumbnail: techImage,
                category: "Tecnologia"
              },
              {
                title: "Cúpula do G20: principais decisões sobre mudanças climáticas",
                duration: "9:21",
                views: "112k",
                thumbnail: internationalImage,
                category: "Internacional"
              },
              {
                title: "Descoberta arqueológica muda história pré-colombiana do Brasil",
                duration: "7:03",
                views: "78k",
                thumbnail: politicsImage,
                category: "Nacional"
              }
            ].map((video, index) => (
              <div key={index} className="bg-card rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
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
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary text-primary-foreground px-2 py-1 text-xs font-bold uppercase tracking-wide rounded">
                      {video.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center text-xs text-muted-foreground justify-between">
                    <span>{video.views} visualizações</span>
                    <span>há {Math.floor(Math.random() * 12) + 1} horas</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

      {/* Footer */}
      <footer className="bg-news-header text-news-header-foreground py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-primary mb-4">
                NEWS<span className="text-news-header-foreground">BRASIL</span>
              </div>
              <p className="text-sm text-gray-400">
                Seu portal de notícias confiável, trazendo informações precisas e atualizadas 24 horas por dia.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Editorias</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Política</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Economia</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Esportes</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Internacional</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Institucional</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Equipe</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Anuncie</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Siga-nos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2024 News Brasil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
