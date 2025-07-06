import { Header } from "@/components/Header";
import { NewsTicker } from "@/components/NewsTicker";
import { NewsCard } from "@/components/NewsCard";
import { LiveVideo } from "@/components/LiveVideo";

// Import news images
import politicsImage from "@/assets/politics-news.jpg";
import economyImage from "@/assets/economy-news.jpg";
import sportsImage from "@/assets/sports-news.jpg";
import techImage from "@/assets/tech-news.jpg";
import internationalImage from "@/assets/international-news.jpg";
import breakingImage from "@/assets/breaking-news-hero.jpg";

const newsData = [
  {
    id: 1,
    title: "Congresso Nacional aprova reforma tributária em votação histórica",
    summary: "Em sessão que durou mais de 12 horas, deputados e senadores aprovaram por ampla maioria a proposta de reforma do sistema tributário brasileiro, prometendo simplificar impostos e reduzir a burocracia.",
    imageUrl: politicsImage,
    category: "Política",
    author: "Ana Silva",
    publishedAt: "2 horas atrás",
    isBreaking: true,
    size: "large" as const
  },
  {
    id: 2,
    title: "Banco Central mantém Selic em 10,75% e sinaliza cautela para 2024",
    summary: "Em decisão unânime, o Comitê de Política Monetária optou por manter a taxa básica de juros, citando cenário inflacionário ainda desafiador e necessidade de monitoramento contínuo.",
    imageUrl: economyImage,
    category: "Economia",
    author: "Carlos Santos",
    publishedAt: "4 horas atrás",
    size: "medium" as const
  },
  {
    id: 3,
    title: "Brasil conquista ouro inédito no Mundial de Atletismo em Budapeste",
    summary: "Atleta brasileira faz história ao conquistar a primeira medalha de ouro do país na competição, quebrando recorde sul-americano na prova dos 400m com barreiras.",
    imageUrl: sportsImage,
    category: "Esportes",
    author: "Pedro Lima",
    publishedAt: "6 horas atrás",
    size: "medium" as const
  },
  {
    id: 4,
    title: "Nova lei de inteligência artificial entra em vigor no país",
    summary: "Regulamentação estabelece diretrizes para uso ético de IA, proteção de dados pessoais e responsabilidade de empresas de tecnologia no desenvolvimento de sistemas automatizados.",
    imageUrl: techImage,
    category: "Tecnologia",
    author: "Marina Costa",
    publishedAt: "8 horas atrás",
    size: "small" as const
  },
  {
    id: 5,
    title: "Cúpula do G20 define compromissos climáticos ambiciosos",
    summary: "Líderes mundiais chegam a acordo sobre metas de redução de emissões e financiamento para países em desenvolvimento enfrentarem mudanças climáticas.",
    imageUrl: internationalImage,
    category: "Internacional",
    author: "Roberto Fernandes",
    publishedAt: "10 horas atrás",
    size: "small" as const
  },
  {
    id: 6,
    title: "Descoberta arqueológica revela civilização pré-colombiana",
    summary: "Pesquisadores encontram sítio arqueológico no interior do Brasil com evidências de ocupação humana anterior às estimativas conhecidas, reescrevendo história regional.",
    imageUrl: breakingImage,
    category: "Nacional",
    author: "Laura Oliveira",
    publishedAt: "12 horas atrás",
    size: "small" as const
  }
];

const Index = () => {
  const mainNews = newsData[0];
  const secondaryNews = newsData.slice(1, 3);
  const otherNews = newsData.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewsTicker />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section with Main News */}
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

        {/* Secondary News */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryNews.map((news) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </section>

        {/* Other News Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">
            Outras Notícias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherNews.map((news) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">
            Por Categoria
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Política", "Economia", "Esportes", "Tecnologia", 
              "Internacional", "Nacional", "Entretenimento", "Saúde"
            ].map((category) => (
              <div
                key={category}
                className="bg-card hover:bg-muted p-4 rounded-lg text-center cursor-pointer transition-colors group border"
              >
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {category}
                </h3>
              </div>
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
