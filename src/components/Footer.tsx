import { Link } from "react-router-dom";
import { useSiteLogo } from "@/hooks/useSiteLogo";
export const Footer = () => {
  const {
    logoUrl
  } = useSiteLogo();
  return <footer className="bg-background text-foreground py-8 mt-16 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img src={logoUrl} alt="CHICOSABETUDO" className="h-8" />
            </div>
            <p className="text-sm text-gray-400">
              Seu portal de notícias confiável, trazendo informações precisas e atualizadas 24 horas por dia.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Editorias</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/politica" className="hover:text-foreground transition-colors">Política</Link></li>
              <li><Link to="/economia" className="hover:text-foreground transition-colors">Economia</Link></li>
              <li><Link to="/esportes" className="hover:text-foreground transition-colors">Esportes</Link></li>
              <li><Link to="/internacional" className="hover:text-foreground transition-colors">Internacional</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Institucional</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-foreground transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Equipe</a></li>
              <li><Link to="/contato" className="hover:text-foreground transition-colors">Contato</Link></li>
              <li><Link to="/anuncie" className="hover:text-foreground transition-colors">Anuncie</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Siga-nos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-foreground transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>© 2025 CHICOSABETUDO. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>;
};