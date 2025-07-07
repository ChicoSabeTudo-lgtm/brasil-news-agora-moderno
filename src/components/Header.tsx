import { Search, Menu, Play, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { name: "Ao Vivo", href: "/ao-vivo", isLive: true },
  { name: "Política", href: "/politica" },
  { name: "Economia", href: "/economia" },
  { name: "Nacional", href: "/nacional" },
  { name: "Internacional", href: "/internacional" },
  { name: "Esportes", href: "/esportes" },
  { name: "Entretenimento", href: "/entretenimento" },
  { name: "Tecnologia", href: "/tecnologia" },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user, signOut, userRole } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <header className="bg-news-header text-news-header-foreground">
      {/* Top Bar */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold text-primary">
              NEWS<span className="text-news-header-foreground">BRASIL</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar notícias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 bg-secondary border-gray-600"
              />
            </form>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-news-header-foreground">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    {userRole === 'admin' ? 'Administrador' : 'Redator'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="text-news-header-foreground">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-news-header-foreground"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              item.isLive ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary text-primary`}
                >
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <Play className="w-3 h-3" />
                  </div>
                  <span>{item.name}</span>
                </Link>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors hover:text-primary text-news-header-foreground"
                >
                  <span>{item.name}</span>
                </Link>
              )
            ))}
          </div>

          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-700 mt-2 pt-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                item.isLive ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary text-primary"
                  >
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <Play className="w-3 h-3" />
                    </div>
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary text-news-header-foreground"
                  >
                    <span>{item.name}</span>
                  </Link>
                )
              ))}
            </div>
            <div className="mt-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary border-gray-600"
                />
              </form>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};