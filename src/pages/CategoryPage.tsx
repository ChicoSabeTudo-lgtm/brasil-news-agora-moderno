import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useNews } from "@/hooks/useNews";
import { useCategories } from "@/hooks/useCategories";
import { NewsCard } from "@/components/NewsCard";
import { Advertisement } from "@/components/Advertisement";
import { Header } from "@/components/Header";
import { NewsTicker } from "@/components/NewsTicker";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const CategoryPage = () => {
  const { categorySlug } = useParams();
  const { getNewsByCategory } = useNews();
  const { categories } = useCategories();
  
  const category = categories.find(cat => cat.slug === categorySlug);
  const categoryNews = getNewsByCategory(categorySlug || '');

  // Configure SEO for category pages
  useEffect(() => {
    if (category) {
      document.title = `${category.name} - Portal de Notícias`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          category.description || `Últimas notícias de ${category.name} - Portal de Notícias`
        );
      }

      // Add canonical link
      const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', `${window.location.origin}/${category.slug}`);
      if (!document.querySelector('link[rel="canonical"]')) {
        document.head.appendChild(canonicalLink);
      }
    }
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <NewsTicker />
        <Advertisement position="header" />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[{ label: "Categoria não encontrada" }]} />
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
            <p className="text-muted-foreground">A categoria solicitada não existe.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewsTicker />
      <Advertisement position="header" />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: category.name }]} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: category.color || '#0066cc' }}>
            {category.name}
          </h1>
          {category.description && (
            <p className="text-muted-foreground text-lg">{category.description}</p>
          )}
        </div>

        <Advertisement position="header" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryNews.map((article) => (
            <NewsCard 
              key={article.id}
              title={article.title}
              metaDescription={article.meta_description}
              imageUrl={article.news_images?.[0]?.image_url || ""}
              category={article.categories?.name || ""}
              categorySlug={article.categories?.slug || ""}
              slug={article.slug || ""}
              author={article.profiles?.full_name || ""}
              publishedAt={article.published_at || ""}
              isBreaking={article.is_breaking || false}
            />
          ))}
        </div>

        {categoryNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhuma notícia encontrada nesta categoria.
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};