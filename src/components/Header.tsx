import { Search, Menu, Play, User, LogOut, X, Settings, PlusCircle } from "lucide-react";
import { useSiteLogo } from "@/hooks/useSiteLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const {
    user,
    signOut,
    userRole
  } = useAuth();
  const {
    categories
  } = useCategories();
  const {
    logoUrl
  } = useSiteLogo();

  // Static navigation items
  const staticItems = [{
    name: "Ao Vivo",
    href: "/ao-vivo",
    isLive: true
  }, {
    name: "Vídeos",
    href: "/videos"
  }];

  // Dynamic category navigation items
  const categoryItems = categories.map(category => ({
    name: category.name,
    href: `/${category.slug}`,
    isLive: false
  }));

  // Combine all navigation items
  const navigationItems = [...staticItems, ...categoryItems];
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setIsSearchModalOpen(false);
    }
  };
  const handleMobileSearch = () => {
    setIsSearchModalOpen(true);
  };
  return <>
      {/* Fixed Top Bar - Logo and Search */}
      <div className="fixed top-0 left-0 right-0 z-50 text-foreground shadow-sm border-b border-gray-800 bg-slate-950">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between w-full">
            <div className="flex-1"></div>
            <Link to="/" className="flex items-center">
              <img src={logoUrl} alt="CHICOSABETUDO" className="h-14 w-auto object-contain" style={{
              imageRendering: 'crisp-edges'
            }} onError={e => {
              // Fallback para logo padrão apenas se não for do Supabase
              const target = e.currentTarget as HTMLImageElement;
              if (target.src.includes('supabase.co')) {
                import('@/assets/chicosabetudo-logo.png').then(logo => {
                  target.src = logo.default;
                });
              }
            }} />
            </Link>
            <div className="flex-1 flex justify-end items-center space-x-4">
              <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <Search className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder="Buscar notícias..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-secondary border-gray-600" autoFocus />
                      </form>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center">
              <img src={logoUrl} alt="CHICOSABETUDO" className="h-16 w-auto object-contain" style={{
              imageRendering: 'crisp-edges'
            }} onError={e => {
              // Fallback para logo padrão apenas se não for do Supabase
              const target = e.currentTarget as HTMLImageElement;
              if (target.src.includes('supabase.co')) {
                import('@/assets/chicosabetudo-logo.png').then(logo => {
                  target.src = logo.default;
                });
              }
            }} />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Buscar notícias..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-80 bg-muted border-border text-foreground placeholder:text-muted-foreground focus:bg-accent" />
            </form>
            
            {user && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    {user.user_metadata?.full_name || user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Acessar Painel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin?tab=news')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Notícia
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}
          </div>
        </div>
      </div>

      {/* Spacer to push content below fixed header */}
      <div className="h-20"></div>

      {/* Main Navigation */}
      <header className="text-gray-900 border-b border-gray-800 bg-slate-950">
        <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900">
              <Menu className="w-6 h-6" />
            </Button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map(item => item.isLive ? <Link key={item.name} to={item.href} className={`flex items-center space-x-1 px-3 py-2 text-sm font-semibold transition-colors hover:text-primary text-primary`}>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <Play className="w-3 h-3" />
                  </div>
                  <span>{item.name}</span>
                </Link> : <Link key={item.name} to={item.href} className="flex items-center space-x-1 px-3 py-2 text-sm font-semibold transition-colors hover:text-primary text-gray-900">
                  <span className="text-slate-50">{item.name}</span>
                </Link>)}
          </div>

          <div className="text-xs text-white font-medium uppercase tracking-wide">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map(item => item.isLive ? <Link key={item.name} to={item.href} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary text-primary">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <Play className="w-3 h-3" />
                    </div>
                    <span>{item.name}</span>
                  </Link> : <Link key={item.name} to={item.href} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary text-gray-900">
                    <span>{item.name}</span>
                  </Link>)}
            </div>
          </div>}
        </nav>
      </header>
    </>;
};