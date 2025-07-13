import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NewsCard } from "@/components/NewsCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Filter, SortAsc, SortDesc } from "lucide-react";

// Import news images
import politicsImage from "@/assets/politics-news.jpg";
import economyImage from "@/assets/economy-news.jpg";
import sportsImage from "@/assets/sports-news.jpg";
import techImage from "@/assets/tech-news.jpg";
import internationalImage from "@/assets/international-news.jpg";
import breakingImage from "@/assets/breaking-news-hero.jpg";

const mockNews = [
  {
    id: "1",
    title: "Congresso Nacional aprova reforma tributária em votação histórica",
    metaDescription: "Decisão marca mudança estrutural no sistema brasileiro de impostos e promete simplificar a cobrança para empresas e cidadãos.",
    imageUrl: politicsImage,
    category: "Política",
    author: "Ana Silva",
    publishedAt: "2 horas atrás",
    isBreaking: true
  },
  {
    id: "2", 
    title: "Banco Central mantém taxa de juros em 10,75% ao ano",
    metaDescription: "Decisão do Copom foi unânime e mantém a Selic no mesmo patamar pelo terceiro mês consecutivo.",
    imageUrl: economyImage,
    category: "Economia",
    author: "Carlos Santos",
    publishedAt: "4 horas atrás"
  },
  {
    id: "3",
    title: "Brasil conquista ouro no Pan-Americano de atletismo",
    metaDescription: "Equipe brasileira brilha em Santiago e conquista primeira posição no quadro de medalhas da competição.",
    imageUrl: sportsImage,
    category: "Esportes", 
    author: "Marina Costa",
    publishedAt: "6 horas atrás"
  },
  {
    id: "4",
    title: "Startup brasileira desenvolve IA para diagnóstico médico",
    metaDescription: "Tecnologia promete revolucionar a medicina preventiva com precisão de 95% em exames de imagem.",
    imageUrl: techImage,
    category: "Tecnologia",
    author: "João Oliveira",
    publishedAt: "8 horas atrás"
  },
  {
    id: "5",
    title: "ONU aprova nova resolução sobre mudanças climáticas",
    metaDescription: "Decisão histórica estabelece metas mais rígidas para redução de emissões de carbono até 2030.",
    imageUrl: internationalImage,
    category: "Internacional",
    author: "Fernanda Lima",
    publishedAt: "10 horas atrás"
  }
];

const categories = ["Todas", "Política", "Economia", "Esportes", "Tecnologia", "Internacional", "Nacional", "Entretenimento", "Saúde"];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortOrder, setSortOrder] = useState("newest");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
    }
  };

  const filteredNews = mockNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.metaDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
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
                {categories.map((category) => (
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
            {sortedNews.length} resultado{sortedNews.length !== 1 ? 's' : ''} encontrado{sortedNews.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* News Grid */}
        {sortedNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNews.map((news) => (
              <Link key={news.id} to={`/noticia/${news.id}`}>
                <NewsCard
                  title={news.title}
                  metaDescription={news.metaDescription}
                  imageUrl={news.imageUrl}
                  category={news.category}
                  author={news.author}
                  publishedAt={news.publishedAt}
                  isBreaking={news.isBreaking}
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