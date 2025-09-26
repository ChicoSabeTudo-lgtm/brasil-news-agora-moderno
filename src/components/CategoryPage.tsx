import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NewsCard } from "@/components/NewsCard";
import { SeoMeta } from "@/components/SeoMeta";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useNews } from "@/hooks/useNews";
import { useCategories } from "@/hooks/useCategories";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

// Import news images
import politicsImage from "@/assets/politics-news.jpg";
import economyImage from "@/assets/economy-news.jpg";
import sportsImage from "@/assets/sports-news.jpg";
import techImage from "@/assets/tech-news.jpg";
import internationalImage from "@/assets/international-news.jpg";
import breakingImage from "@/assets/breaking-news-hero.jpg";

const imageMap = {
  "Política": politicsImage,
  "Polícia": politicsImage,
  "Economia": economyImage,
  "Esportes": sportsImage,
  "Tecnologia": techImage,
  "Internacional": internationalImage,
  "Nacional": breakingImage,
  "Entretenimento": breakingImage,
  "Saúde": techImage
};

// Mapeamento de nomes de categoria para slugs
const categorySlugMap: Record<string, string> = {
  "Política": "politica",
  "Polícia": "policia",
  "Economia": "economia", 
  "Esportes": "esportes",
  "Tecnologia": "tecnologia",
  "Internacional": "internacional",
  "Nacional": "nacional",
  "Entretenimento": "entretenimento",
  "Saúde": "saude"
};

interface CategoryPageProps {
  category: string;
  categoryColor?: string;
  description?: string;
}

export const CategoryPage = ({ category, categoryColor = "#0066cc", description }: CategoryPageProps) => {
  const { news, loading, error, getNewsByCategory } = useNews();
  const { categories } = useCategories();
  
  // Obter slug da categoria
  const categorySlug = categorySlugMap[category];
  
  // Filtrar notícias por categoria
  const categoryNews = getNewsByCategory(categorySlug);

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
    return imageMap[category] || breakingImage;
  };

  // Transform news data for NewsCard component
  const transformNewsItem = (newsItem: any, size: "small" | "medium" | "large" = "medium") => ({
    id: newsItem.id,
    title: newsItem.title,
    metaDescription: newsItem.meta_description,
    imageUrl: getImageUrl(newsItem),
    category: newsItem.categories?.name || category,
    author: newsItem.profiles?.full_name || 'Redação',
    publishedAt: formatPublishedAt(newsItem.published_at),
    isBreaking: newsItem.is_breaking,
    size,
    slug: newsItem.slug,
    categorySlug: newsItem.categories?.slug
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-muted-foreground">Carregando notícias...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-lg text-destructive">Erro ao carregar notícias: {error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (categoryNews.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4" style={{ color: categoryColor }}>
              {category}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                {description}
              </p>
            )}
            <p className="text-lg text-muted-foreground">
              Ainda não há notícias publicadas nesta categoria.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Separar notícias por tipo
  const featuredNews = transformNewsItem(categoryNews[0], "large");
  const breakingNews = categoryNews.filter(news => news.is_breaking).slice(0, 3);
  const secondaryNews = categoryNews.slice(1, 7).map(news => transformNewsItem(news, "medium"));
  const otherNews = categoryNews.slice(7).map(news => transformNewsItem(news, "small"));

  // Schema.org data for category page
  const categoryStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category} - ChicoSabeTudo`,
    "description": description || `Notícias sobre ${category} no ChicoSabeTudo`,
    "url": `https://chicosabetudo.sigametech.com.br/${categorySlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": categoryNews.length,
      "itemListElement": categoryNews.slice(0, 10).map((news, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": news.title,
          "description": news.meta_description,
          "url": `https://chicosabetudo.sigametech.com.br/${news.categories?.slug}/${news.slug}`,
          "datePublished": news.published_at,
          "author": {
            "@type": "Person",
            "name": news.profiles?.full_name || "Redação ChicoSabeTudo"
          },
          "publisher": {
            "@type": "NewsMediaOrganization",
            "name": "ChicoSabeTudo",
            "logo": {
              "@type": "ImageObject",
              "url": "https://chicosabetudo.sigametech.com.br/lovable-uploads/aac6981c-a63e-4b99-a9d1-5be26ea5ad4a.png"
            }
          }
        }
      }))
    }
  };

  return (
    <>
      <SeoMeta 
        title={`Últimas notícias em ${category} | ChicoSabeTudo`}
        description={description || `Cobertura completa de ${category.toLowerCase()} na Bahia. Acompanhe tudo no ChicoSabeTudo!`}
        keywords={`${category.toLowerCase()}, notícias ${category.toLowerCase()}, bahia, chicosabetudo, portal de notícias`}
        canonical={`https://chicosabetudo.sigametech.com.br/${categorySlug}`}
        ogImage={`https://chicosabetudo.sigametech.com.br/images/${categorySlug}-og.jpg`}
        ogUrl={`https://chicosabetudo.sigametech.com.br/${categorySlug}`}
        ogSiteName="ChicoSabeTudo"
        ogLocale="pt_BR"
        twitterCard="summary_large_image"
        twitterSite="@chicosabetudo"
        structuredData={categoryStructuredData}
      />
    <AnalyticsTracker>
      <Layout>
      <main className="container mx-auto px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: category }
          ]}
        />
        
        {/* Category Header */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-foreground">
              {category}
            </h1>
            <span className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-full">
              {categoryNews.length} notícias
            </span>
          </div>
          {description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {description}
            </p>
          )}
        </section>

        {/* Featured Story */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Story */}
            <div className="lg:col-span-2">
              <NewsCard {...featuredNews} />
            </div>
            
            {/* Breaking News Sidebar */}
            <div className="lg:col-span-1">
              {breakingNews.length > 0 && (
                <div className="bg-card rounded-lg p-6 shadow-card">
                  <h3 className="font-bold text-lg mb-4 border-l-4 border-destructive pl-4">
                    Notícias Urgentes
                  </h3>
                  <div className="space-y-4">
                    {breakingNews.slice(0, 3).map((news) => (
                      <Link 
                        key={news.id}
                        to={news.slug && news.categories?.slug ? `/${news.categories?.slug}/${news.slug}` : `/noticia/${news.id}`}
                        className="block p-3 hover:bg-muted rounded-lg transition-colors"
                      >
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {news.title}
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          {formatPublishedAt(news.published_at)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Secondary News */}
        {secondaryNews.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">
              Principais Notícias
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {secondaryNews.map((news) => (
                <NewsCard key={news.id} {...news} />
              ))}
            </div>
          </section>
        )}

        {/* Other News */}
        {otherNews.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">
              Todas as Notícias de {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherNews.map((news) => (
                <NewsCard key={news.id} {...news} />
              ))}
            </div>
          </section>
        )}

        {/* Related Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">
            Outras Categorias
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories
              .filter(cat => cat.name !== category)
              .map((cat) => (
                <Link
                  key={cat.id}
                  to={`/${cat.slug}`}
                  className="bg-card hover:bg-muted p-4 rounded-lg text-center cursor-pointer transition-colors group border shadow-sm hover:shadow-card"
                >
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              ))}
          </div>
        </section>
      </main>
    </Layout>
    </AnalyticsTracker>
    </>
  );
};
