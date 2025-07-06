import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsTicker } from "@/components/NewsTicker";
import { ArrowLeft, Calendar, User, Share2, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import news images
import politicsImage from "@/assets/politics-news.jpg";
import economyImage from "@/assets/economy-news.jpg";
import sportsImage from "@/assets/sports-news.jpg";
import techImage from "@/assets/tech-news.jpg";
import internationalImage from "@/assets/international-news.jpg";
import breakingImage from "@/assets/breaking-news-hero.jpg";

const NewsArticle = () => {
  const { id } = useParams();
  
  // Mock article data - in real app would fetch based on ID
  const article = {
    id: id || "1",
    title: "Congresso Nacional aprova reforma tributária em votação histórica",
    subtitle: "Decisão marca mudança estrutural no sistema brasileiro de impostos",
    content: `
      <p>Em uma sessão que durou mais de 12 horas, deputados e senadores aprovaram por ampla maioria a proposta de reforma do sistema tributário brasileiro, prometendo simplificar impostos e reduzir a burocracia para empresas e cidadãos.</p>
      
      <p>A aprovação da reforma tributária representa um marco histórico na política econômica brasileira. O texto final, que foi resultado de intensas negociações entre governo e oposição, promete revolucionar a forma como os impostos são cobrados no país.</p>
      
      <h3>Principais mudanças aprovadas</h3>
      <p>Entre as principais alterações está a unificação de tributos estaduais e municipais, criando um sistema mais transparente e eficiente. A medida deve reduzir significativamente os custos de conformidade fiscal para as empresas.</p>
      
      <p>O relator da proposta, deputado federal João Silva, destacou que "esta reforma vai beneficiar diretamente o consumidor final, com a redução da carga tributária embutida nos produtos". A expectativa é que os preços ao consumidor tenham uma redução média de 3% a 5%.</p>
      
      <h3>Impacto econômico esperado</h3>
      <p>Segundo estudos do Ministério da Economia, a reforma deve gerar um impacto positivo no PIB de aproximadamente 1,5% nos próximos cinco anos. O sistema simplificado também deve atrair mais investimentos estrangeiros para o país.</p>
      
      <p>A implementação será gradual, com início previsto para 2025, permitindo que empresas e órgãos governamentais se adaptem às novas regras. Um período de transição de três anos foi estabelecido para garantir a migração suave do sistema atual.</p>
      
      <h3>Reações políticas</h3>
      <p>A aprovação recebeu elogios de diferentes setores da sociedade. O presidente da Confederação Nacional da Indústria (CNI) afirmou que "este é um passo fundamental para modernizar o Brasil e torná-lo mais competitivo no cenário internacional".</p>
      
      <p>No entanto, alguns governadores estaduais manifestaram preocupações sobre a transição e os impactos nas receitas locais durante o período de adaptação. O governo federal garantiu que mecanismos de compensação serão implementados para evitar perdas significativas.</p>
    `,
    imageUrl: politicsImage,
    category: "Política",
    author: "Ana Silva",
    publishedAt: "2 horas atrás",
    readTime: "8 min de leitura",
    isBreaking: true
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewsTicker />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/${article.category.toLowerCase()}`} className="hover:text-primary transition-colors">
            {article.category}
          </Link>
          <span>/</span>
          <span>Notícia</span>
        </div>

        {/* Back Button */}
        <Button variant="ghost" className="mb-6 -ml-3" asChild>
          <Link to={`/${article.category.toLowerCase()}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para {article.category}
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article */}
          <article className="lg:col-span-3">
            {/* Category Badge */}
            {article.isBreaking && (
              <div className="mb-4 flex items-center gap-2">
                <span className="bg-news-breaking text-white px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                  Breaking News
                </span>
                <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wide rounded">
                  {article.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {article.subtitle}
            </h2>

            {/* Article Meta */}
            <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{article.publishedAt}</span>
              </div>
              <span>{article.readTime}</span>
            </div>

            {/* Article Actions */}
            <div className="flex items-center gap-3 mb-8">
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button size="sm" variant="outline">
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>

            {/* Featured Image */}
            <div className="mb-8">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Article Tags */}
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="font-semibold mb-3">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {["reforma-tributaria", "politica", "economia", "impostos", "congresso"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg p-6 shadow-card sticky top-8">
              <h3 className="font-bold text-lg mb-4 border-l-4 border-primary pl-4">
                Notícias Relacionadas
              </h3>
              <div className="space-y-4">
                {[
                  "STF julga caso histórico sobre direitos digitais",
                  "Senado debate PEC da transição energética", 
                  "Governadores se reúnem para discutir segurança pública"
                ].map((title, index) => (
                  <div key={index} className="flex gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer group transition-colors">
                    <img 
                      src={politicsImage} 
                      alt={title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                        {title}
                      </h4>
                      <div className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 5) + 1} horas atrás
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default NewsArticle;