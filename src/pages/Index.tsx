import { Header } from "@/components/Header";
import { NewsTicker } from "@/components/NewsTicker";
import { NewsCard } from "@/components/NewsCard";
import { LiveVideo } from "@/components/LiveVideo";
import { Advertisement } from "@/components/Advertisement";
import { Link } from "react-router-dom";

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
      
      {/* Advertisement Space - Header */}
      <Advertisement position="header" />
      
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

        {/* Advertisement Space - Politics */}
        <Advertisement position="politics" />

        {/* Política Section */}
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

        {/* Economia Section - Featured + Sidebar Layout */}
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
            <div className="lg:col-span-2">
              <NewsCard {...economyNews[0]} size="large" />
            </div>
            {/* Sidebar Stories */}
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
          </div>
        </section>

        {/* Advertisement Space - Sports */}
        <Advertisement position="sports" />

        {/* Esportes Section - Horizontal Scroll Layout */}
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

        {/* Tecnologia Section - Mosaic Layout */}
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
            <div className="md:col-span-2 md:row-span-2">
              <NewsCard {...techNews[0]} size="large" />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-4">
              {techNews.slice(1).map((news) => (
                <NewsCard key={news.id} {...news} size="small" />
              ))}
            </div>
          </div>
        </section>

        {/* Advertisement Space - International */}
        <Advertisement position="international" />

        {/* Internacional Section - List + Featured Layout */}
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
            <div>
              <NewsCard {...internationalNews[0]} size="medium" />
            </div>
            {/* News List */}
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
                      {news.summary}
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
                {[
                  "Congresso Nacional aprova reforma tributária em votação histórica",
                  "PIB brasileiro cresce acima do esperado no trimestre", 
                  "Seleção brasileira convocada para Copa América",
                  "Startup brasileira desenvolve IA para diagnóstico médico",
                  "União Europeia anuncia novo pacote de sanções"
                ].map((title, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 hover:bg-muted rounded-lg cursor-pointer group transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.floor(Math.random() * 50) + 10}k visualizações
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
