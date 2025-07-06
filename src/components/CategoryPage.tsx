import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsTicker } from "@/components/NewsTicker";
import { NewsCard } from "@/components/NewsCard";

// Import news images
import politicsImage from "@/assets/politics-news.jpg";
import economyImage from "@/assets/economy-news.jpg";
import sportsImage from "@/assets/sports-news.jpg";
import techImage from "@/assets/tech-news.jpg";
import internationalImage from "@/assets/international-news.jpg";
import breakingImage from "@/assets/breaking-news-hero.jpg";

const imageMap = {
  "Política": politicsImage,
  "Economia": economyImage,
  "Esportes": sportsImage,
  "Tecnologia": techImage,
  "Internacional": internationalImage,
  "Nacional": breakingImage,
  "Entretenimento": breakingImage,
  "Saúde": techImage
};

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  imageUrl: string;
  category: string;
  author: string;
  publishedAt: string;
  isBreaking?: boolean;
  size: "small" | "medium" | "large";
}

interface CategoryPageProps {
  category: string;
  categoryColor?: string;
  description?: string;
}

// Mock data generator for category news
const generateCategoryNews = (category: string, count: number = 12): NewsItem[] => {
  const baseNews = [
    {
      title: `${category}: Decisão histórica marca mudança no setor`,
      summary: `Autoridades anunciam nova regulamentação que promete transformar o cenário atual de ${category.toLowerCase()}, impactando milhões de brasileiros.`,
      author: "Redação NewsPortal"
    },
    {
      title: `Especialistas analisam cenário atual de ${category.toLowerCase()}`,
      summary: `Análise detalhada revela tendências importantes e projeções para os próximos meses no setor de ${category.toLowerCase()}.`,
      author: "Equipe de Análise"
    },
    {
      title: `${category}: Novos investimentos chegam ao Brasil`,
      summary: `Setor recebe aporte milionário que deve gerar empregos e movimentar a economia nacional nos próximos anos.`,
      author: "Correspondente Econômico"
    },
    {
      title: `Mudanças estruturais em ${category.toLowerCase()} geram debate`,
      summary: `Proposta divide opiniões entre especialistas e promete alterar significativamente o panorama atual do setor.`,
      author: "Redação Especializada"
    }
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: baseNews[index % baseNews.length].title,
    summary: baseNews[index % baseNews.length].summary,
    imageUrl: imageMap[category as keyof typeof imageMap] || breakingImage,
    category,
    author: baseNews[index % baseNews.length].author,
    publishedAt: `${Math.floor(Math.random() * 24) + 1} horas atrás`,
    isBreaking: index === 0,
    size: index === 0 ? "large" as const : (index < 3 ? "medium" as const : "small" as const)
  }));
};

export const CategoryPage = ({ category, categoryColor = "primary", description }: CategoryPageProps) => {
  const news = generateCategoryNews(category);
  const featuredNews = news[0];
  const secondaryNews = news.slice(1, 4);
  const otherNews = news.slice(4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewsTicker />
      
      <main className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-foreground">
              {category}
            </h1>
            <span className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-full">
              {news.length} notícias
            </span>
          </div>
          {description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {description}
            </p>
          )}
        </section>

        {/* Featured News */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Story */}
            <div className="lg:col-span-2">
              <NewsCard {...featuredNews} />
            </div>
            
            {/* Breaking News Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 shadow-card">
                <h2 className="font-bold text-lg text-foreground border-l-4 border-primary pl-4 mb-4">
                  Últimas de {category}
                </h2>
                <div className="space-y-4">
                  {secondaryNews.slice(0, 4).map((item, index) => (
                    <div key={item.id} className="flex gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer group transition-colors">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{item.author}</span>
                          <span className="mx-1">•</span>
                          <span>{item.publishedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary News Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 mb-6">
            Principais Notícias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondaryNews.map((news) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </section>

        {/* All News List */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 mb-6">
            Todas as Notícias de {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherNews.map((news) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </section>

        {/* Related Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">
            Outras Categorias
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Política", "Economia", "Esportes", "Tecnologia", 
              "Internacional", "Nacional", "Entretenimento", "Saúde"
            ].filter(cat => cat !== category).map((cat) => (
              <Link
                key={cat}
                to={`/${cat.toLowerCase()}`}
                className="bg-card hover:bg-muted p-4 rounded-lg text-center cursor-pointer transition-colors group border shadow-sm hover:shadow-card"
              >
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {cat}
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
                <li><Link to="/politica" className="hover:text-primary transition-colors">Política</Link></li>
                <li><Link to="/economia" className="hover:text-primary transition-colors">Economia</Link></li>
                <li><Link to="/esportes" className="hover:text-primary transition-colors">Esportes</Link></li>
                <li><Link to="/internacional" className="hover:text-primary transition-colors">Internacional</Link></li>
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