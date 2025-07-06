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

// Notícias por categoria
const politicsNews = [
  {
    id: 7,
    title: "STF julga caso histórico sobre direitos digitais",
    summary: "Supremo Tribunal Federal analisa marco regulatório das redes sociais e proteção de dados pessoais em ambiente digital.",
    imageUrl: politicsImage,
    category: "Política",
    author: "Ricardo Alves",
    publishedAt: "3 horas atrás",
    size: "medium" as const
  },
  {
    id: 8,
    title: "Senado debate PEC da transição energética",
    summary: "Proposta prevê incentivos para energia renovável e criação de empregos verdes em todo o território nacional.",
    imageUrl: politicsImage,
    category: "Política",
    author: "Fernanda Castro",
    publishedAt: "5 horas atrás",
    size: "medium" as const
  },
  {
    id: 9,
    title: "Governadores se reúnem para discutir segurança pública",
    summary: "Encontro busca alinhamento de estratégias entre estados para combate ao crime organizado e narcotráfico.",
    imageUrl: politicsImage,
    category: "Política",
    author: "João Santos",
    publishedAt: "7 horas atrás",
    size: "medium" as const
  }
];

const economyNews = [
  {
    id: 10,
    title: "PIB brasileiro cresce acima do esperado no trimestre",
    summary: "Economia registra alta de 2,1% impulsionada pelo setor de serviços e investimentos em infraestrutura.",
    imageUrl: economyImage,
    category: "Economia",
    author: "Márcia Souza",
    publishedAt: "1 hora atrás",
    size: "medium" as const
  },
  {
    id: 11,
    title: "Inflação recua pelo terceiro mês consecutivo",
    summary: "IPCA registra 0,15% em dezembro, menor índice dos últimos 18 meses, sinalizando estabilização dos preços.",
    imageUrl: economyImage,
    category: "Economia",
    author: "Paulo Mendes",
    publishedAt: "3 horas atrás",
    size: "medium" as const
  },
  {
    id: 12,
    title: "Bolsa brasileira atinge novo recorde histórico",
    summary: "Ibovespa fecha em alta de 1,8% puxado por ações do setor bancário e commodities.",
    imageUrl: economyImage,
    category: "Economia",
    author: "Luciana Lima",
    publishedAt: "6 horas atrás",
    size: "medium" as const
  }
];

const sportsNews = [
  {
    id: 13,
    title: "Seleção brasileira convocada para Copa América",
    summary: "Técnico anuncia lista com 26 jogadores, incluindo três estreantes que se destacaram no campeonato nacional.",
    imageUrl: sportsImage,
    category: "Esportes",
    author: "Carlos Rodrigues",
    publishedAt: "2 horas atrás",
    size: "medium" as const
  },
  {
    id: 14,
    title: "Flamengo contrata atacante europeu por R$ 40 milhões",
    summary: "Clube carioca anuncia chegada de jogador da Liga dos Campeões em negócio que pode chegar a R$ 60 milhões.",
    imageUrl: sportsImage,
    category: "Esportes",
    author: "Rafael Costa",
    publishedAt: "4 horas atrás",
    size: "medium" as const
  },
  {
    id: 15,
    title: "Brasil garante vaga nas Olimpíadas de Paris no vôlei",
    summary: "Equipe feminina conquista classificação após vitória por 3 sets a 1 contra a Argentina no torneio sul-americano.",
    imageUrl: sportsImage,
    category: "Esportes",
    author: "Beatriz Santos",
    publishedAt: "8 horas atrás",
    size: "medium" as const
  }
];

const techNews = [
  {
    id: 16,
    title: "Startup brasileira desenvolve IA para diagnóstico médico",
    summary: "Empresa de São Paulo cria sistema que detecta doenças raras em exames de imagem com 95% de precisão.",
    imageUrl: techImage,
    category: "Tecnologia",
    author: "Thiago Oliveira",
    publishedAt: "1 hora atrás",
    size: "medium" as const
  },
  {
    id: 17,
    title: "5G chega a mais 50 cidades brasileiras",
    summary: "Anatel autoriza expansão da rede de quinta geração, beneficiando 12 milhões de habitantes em todo país.",
    imageUrl: techImage,
    category: "Tecnologia",
    author: "Amanda Silva",
    publishedAt: "5 horas atrás",
    size: "medium" as const
  },
  {
    id: 18,
    title: "Brasil lidera investimentos em fintech na América Latina",
    summary: "Setor de tecnologia financeira recebe US$ 2,1 bilhões em 2024, crescimento de 45% em relação ao ano anterior.",
    imageUrl: techImage,
    category: "Tecnologia",
    author: "Bruno Pereira",
    publishedAt: "9 horas atrás",
    size: "medium" as const
  }
];

const internationalNews = [
  {
    id: 19,
    title: "União Europeia anuncia novo pacote de sanções",
    summary: "Bloco econômico expande medidas restritivas e busca maior coordenação na política externa global.",
    imageUrl: internationalImage,
    category: "Internacional",
    author: "Carla Mendonça",
    publishedAt: "2 horas atrás",
    size: "medium" as const
  },
  {
    id: 20,
    title: "China e Estados Unidos retomam diálogo comercial",
    summary: "Países marcam reunião bilateral para discutir tarifas e acordos de cooperação tecnológica.",
    imageUrl: internationalImage,
    category: "Internacional",
    author: "Diego Fernandes",
    publishedAt: "6 horas atrás",
    size: "medium" as const
  },
  {
    id: 21,
    title: "ONU aprova resolução sobre mudanças climáticas",
    summary: "Assembleia Geral adota medidas para acelerar transição energética e proteção de ecossistemas vulneráveis.",
    imageUrl: internationalImage,
    category: "Internacional",
    author: "Elena Rodriguez",
    publishedAt: "11 horas atrás",
    size: "medium" as const
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

        {/* Política Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                Política
              </span>
            </h2>
            <a href="#" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
              Ver todas →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {politicsNews.map((news) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </section>

        {/* Economia Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                Economia
              </span>
            </h2>
            <a href="#" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
              Ver todas →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {economyNews.map((news) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </section>

        {/* Esportes Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                Esportes
              </span>
            </h2>
            <a href="#" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
              Ver todas →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sportsNews.map((news) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </section>

        {/* Tecnologia Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                Tecnologia
              </span>
            </h2>
            <a href="#" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
              Ver todas →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techNews.map((news) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </section>

        {/* Internacional Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide">
                Internacional
              </span>
            </h2>
            <a href="#" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
              Ver todas →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internationalNews.map((news) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        </section>

        {/* Other News Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2">
              Outras Notícias
            </h2>
            <a href="#" className="text-primary hover:text-primary-darker font-semibold text-sm transition-colors">
              Ver todas →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherNews.map((news) => (
              <NewsCard key={news.id} {...news} />
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
              "Política", "Economia", "Esportes", "Tecnologia", 
              "Internacional", "Nacional", "Entretenimento", "Saúde"
            ].map((category) => (
              <div
                key={category}
                className="bg-card hover:bg-muted p-4 rounded-lg text-center cursor-pointer transition-colors group border shadow-sm hover:shadow-card"
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
