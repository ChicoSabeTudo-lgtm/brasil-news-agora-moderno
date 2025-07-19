import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NewsCard } from "@/components/NewsCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Filter, SortAsc, SortDesc } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewsItem {
  id: string;
  title: string;
  subtitle?: string;
  meta_description: string;
  published_at: string;
  slug?: string;
  categories: {
    name: string;
    slug: string;
  };
  news_images: {
    image_url: string;
    is_featured: boolean;
  }[];
  views: number;
  is_breaking: boolean;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortOrder, setSortOrder] = useState("newest");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { categories } = useCategories();

  const categoriesWithAll = ["Todas", ...categories.map(cat => cat.name)];

  // Buscar notícias quando o termo de pesquisa mudar
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchTerm(query);
      fetchNews(query);
    } else {
      fetchAllNews();
    }
  }, [searchParams]);

  const fetchNews = async (query: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          id,
          title,
          subtitle,
          meta_description,
          published_at,
          views,
          is_breaking,
          slug,
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
        .or(`title.ilike.%${query}%,meta_description.ilike.%${query}%,subtitle.ilike.%${query}%`)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllNews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          id,
          title,
          subtitle,
          meta_description,
          published_at,
          views,
          is_breaking,
          slug,
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
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
    }
  };

  const getImageUrl = (newsItem: NewsItem) => {
    if (!newsItem.news_images?.length) return null;
    
    const featuredImage = newsItem.news_images.find(img => img.is_featured) || newsItem.news_images[0];
    if (!featuredImage?.image_url) return null;
    
    if (featuredImage.image_url.startsWith('http')) {
      return featuredImage.image_url;
    }
    return `https://spgusjrjrhfychhdwixn.supabase.co/storage/v1/object/public/${featuredImage.image_url}`;
  };

  const filteredNews = news.filter(newsItem => {
    const matchesCategory = selectedCategory === "Todas" || newsItem.categories.name === selectedCategory;
    return matchesCategory;
  });

  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    }
    return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
  });

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {searchParams.get("q") ? `Resultados para "${searchParams.get("q")}"` : "Buscar Notícias"}
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Digite sua pesquisa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg"
              />
              <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Buscar
              </Button>
            </div>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriesWithAll.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <SortDesc className="w-4 h-4" />
                    Mais recentes
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <SortAsc className="w-4 h-4" />
                    Mais antigas
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? "Buscando..." : `${sortedNews.length} resultado${sortedNews.length !== 1 ? 's' : ''} encontrado${sortedNews.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden border animate-pulse">
                <div className="h-48 bg-muted"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNews.map((newsItem) => (
              <Link key={newsItem.id} to={`/noticia/${newsItem.slug || newsItem.id}`}>
                <NewsCard
                  title={newsItem.title}
                  metaDescription={newsItem.subtitle || newsItem.meta_description}
                  imageUrl={getImageUrl(newsItem)}
                  category={newsItem.categories.name}
                  author="Portal ChicoSabeTudo"
                  publishedAt={format(new Date(newsItem.published_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  isBreaking={newsItem.is_breaking}
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma notícia encontrada
            </h3>
            <p className="text-muted-foreground">
              Tente usar palavras-chave diferentes ou remover alguns filtros.
            </p>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default Search;