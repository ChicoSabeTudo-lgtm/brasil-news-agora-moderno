import { Link } from "react-router-dom";

export const Footer = () => {
  return (
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
              <li><Link to="/contato" className="hover:text-primary transition-colors">Contato</Link></li>
              <li><Link to="/anuncie" className="hover:text-primary transition-colors">Anuncie</Link></li>
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
  );
};