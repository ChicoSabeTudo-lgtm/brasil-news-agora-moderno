import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePendingCounts } from '@/hooks/usePendingCounts';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Radio,
  Vote,
  Monitor,
  Share2,
  Tag,
  Megaphone,
  Mail,
  Building,
  Users,
  TrendingUp,
  LogOut,
  Settings,
  UserCircle,
  Menu,
  Building2,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  DollarSign,
  CreditCard,
  Receipt,
  ShoppingCart,
  Calculator,
  Scale,
} from 'lucide-react';

const adminMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin?tab=dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Notícias',
    url: '/admin?tab=news',
    icon: FileText,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Compartilhamento',
    url: '/admin?tab=post-sharing',
    icon: PlusCircle,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Posts Sociais',
    url: '/admin?tab=social-posts',
    icon: Share2,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Ao Vivo',
    url: '/admin?tab=live',
    icon: Radio,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Enquetes',
    url: '/admin?tab=polls',
    icon: Vote,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Blocos',
    url: '/admin?tab=blocks-config',
    icon: Monitor,
    roles: ['admin', 'redator'],
  },
];

const adminOnlyItems = [
  {
    title: 'Categorias',
    url: '/admin?tab=categories',
    icon: Tag,
    roles: ['admin'],
  },
  {
    title: 'Propagandas',
    url: '/admin?tab=advertisements',
    icon: Megaphone,
    roles: ['admin'],
  },
  {
    title: 'In-Content',
    url: '/admin?tab=in-content-ads',
    icon: FileText,
    roles: ['admin'],
  },
  {
    title: 'Usuários',
    url: '/admin?tab=users',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Análises',
    url: '/admin?tab=analytics',
    icon: TrendingUp,
    roles: ['admin'],
  },
];

const generalItems = [
  {
    title: 'Contato',
    url: '/admin?tab=contact',
    icon: Mail,
    roles: ['admin'],
    badgeType: 'contact',
  },
  {
    title: 'Anunciantes',
    url: '/admin?tab=advertising',
    icon: Building,
    roles: ['admin'],
    badgeType: 'advertising',
  },
];

const financialItems = [
  {
    title: 'Lançamentos',
    url: '/admin?tab=finance',
    icon: DollarSign,
    roles: ['admin'],
  },
  {
    title: 'Clientes/Receita',
    url: '/admin?tab=clients',
    icon: ShoppingCart,
    roles: ['admin'],
  },
  {
    title: 'Fornecedores/Despesa',
    url: '/admin?tab=suppliers',
    icon: Receipt,
    roles: ['admin'],
  },
  {
    title: 'Propagandas',
    url: '/admin?tab=ads-finance',
    icon: Megaphone,
    roles: ['admin'],
  },
  {
    title: 'Gestão de PIs',
    url: '/admin?tab=insertion-orders',
    icon: CreditCard,
    roles: ['admin'],
  },
  {
    title: 'Calculadora RH',
    url: '/admin?tab=hr-calculator',
    icon: Calculator,
    roles: ['admin'],
  },
];

const companyItems = [
  {
    title: 'Dados da Empresa',
    url: '/admin?tab=company-data',
    icon: Building2,
    roles: ['admin'],
  },
  {
    title: 'Documentos',
    url: '/admin?tab=company-documents',
    icon: FileText,
    roles: ['admin'],
  },
  {
    title: 'Certidões',
    url: '/admin?tab=company-certifications',
    icon: Shield,
    roles: ['admin'],
  },
  {
    title: 'Notas Fiscais',
    url: '/admin?tab=invoices',
    icon: Receipt,
    roles: ['admin'],
  },
  {
    title: 'Pagamentos DAS',
    url: '/admin?tab=das-payments',
    icon: FileText,
    roles: ['admin'],
  },
  {
    title: 'Pagamentos INSS',
    url: '/admin?tab=inss-payments',
    icon: Receipt,
    roles: ['admin'],
  },
  {
    title: 'Processos Judiciais',
    url: '/admin?tab=legal-cases',
    icon: Scale,
    roles: ['admin'],
  },
];

export const AdminSidebar = () => {
  const { userRole, signOut, user } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { data: pendingCounts } = usePendingCounts();
  
  // Estado para controlar seções abertas/fechadas
  const [openSections, setOpenSections] = useState({
    redacao: true,
    administracao: false,
    financeiro: false,
    geral: false,
    empresa: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const currentPath = location.pathname + location.search;
  
  const isActive = (url: string) => {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const currentParams = new URLSearchParams(location.search);
    const urlTab = urlParams.get('tab') || 'dashboard';
    const currentTab = currentParams.get('tab') || 'dashboard';
    return urlTab === currentTab;
  };

  const getNavClassName = (url: string) => {
    const active = isActive(url);
    return active 
      ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold border-l-3 border-primary shadow-sm shadow-primary/10 translate-x-1' 
      : 'hover:bg-gradient-to-r hover:from-sidebar-accent/60 hover:to-transparent hover:text-sidebar-accent-foreground hover:translate-x-1 transition-all duration-200';
  };

  const handleLogout = async () => {
    await signOut();
  };

  const canAccess = (roles: string[]) => roles.includes(userRole || '');

  const getBadgeCount = (badgeType: string) => {
    if (!pendingCounts) return 0;
    switch (badgeType) {
      case 'contact':
        return pendingCounts.contactMessages;
      case 'advertising':
        return pendingCounts.advertisingRequests;
      default:
        return 0;
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border/50 bg-gradient-to-b from-sidebar to-sidebar/95 shadow-xl backdrop-blur-sm">
      <SidebarHeader className="border-b border-sidebar-border/50 p-4 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform hover:scale-105">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <h2 className="font-bold text-lg text-sidebar-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Admin Panel</h2>
              <p className="text-xs text-sidebar-foreground/60 font-medium">ChicoSabeTudo</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Collapsible open={openSections.redacao} onOpenChange={() => toggleSection('redacao')}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <button className="w-full group">
                <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent rounded-lg px-3 py-2 transition-all duration-200 group-hover:translate-x-1">
                  <span className="font-semibold text-sm tracking-wide">Redação</span>
                  {!collapsed && (
                    openSections.redacao ? 
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 text-primary" /> : 
                      <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:text-primary" />
                  )}
                </SidebarGroupLabel>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.filter(item => canAccess(item.roles)).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavClassName(item.url)}>
                          <item.icon className="w-4 h-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {userRole === 'admin' && (
          <Collapsible open={openSections.administracao} onOpenChange={() => toggleSection('administracao')}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <button className="w-full group">
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent rounded-lg px-3 py-2 transition-all duration-200 group-hover:translate-x-1">
                    <span className="font-semibold text-sm tracking-wide">Administração</span>
                    {!collapsed && (
                      openSections.administracao ? 
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 text-primary" /> : 
                        <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:text-primary" />
                    )}
                  </SidebarGroupLabel>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminOnlyItems.filter(item => canAccess(item.roles)).map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavClassName(item.url)}>
                            <item.icon className="w-4 h-4" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {userRole === 'admin' && (
          <Collapsible open={openSections.financeiro} onOpenChange={() => toggleSection('financeiro')}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <button className="w-full group">
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent rounded-lg px-3 py-2 transition-all duration-200 group-hover:translate-x-1">
                    <span className="font-semibold text-sm tracking-wide">Financeiro</span>
                    {!collapsed && (
                      openSections.financeiro ? 
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 text-primary" /> : 
                        <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:text-primary" />
                    )}
                  </SidebarGroupLabel>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {financialItems.filter(item => canAccess(item.roles)).map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavClassName(item.url)}>
                            <item.icon className="w-4 h-4" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {userRole === 'admin' && (
          <Collapsible open={openSections.geral} onOpenChange={() => toggleSection('geral')}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <button className="w-full group">
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent rounded-lg px-3 py-2 transition-all duration-200 group-hover:translate-x-1">
                    <span className="font-semibold text-sm tracking-wide">Geral</span>
                    {!collapsed && (
                      openSections.geral ? 
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 text-primary" /> : 
                        <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:text-primary" />
                    )}
                  </SidebarGroupLabel>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {generalItems.filter(item => canAccess(item.roles)).map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavClassName(item.url)}>
                            <item.icon className="w-4 h-4" />
                             {!collapsed && (
                               <div className="flex items-center justify-between flex-1">
                                 <span>{item.title}</span>
                                 {item.badgeType && getBadgeCount(item.badgeType) > 0 && (
                                   <Badge variant="secondary" className="text-xs admin-badge-pulse">
                                     {getBadgeCount(item.badgeType)}
                                   </Badge>
                                 )}
                               </div>
                             )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {userRole === 'admin' && (
          <Collapsible open={openSections.empresa} onOpenChange={() => toggleSection('empresa')}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <button className="w-full group">
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent rounded-lg px-3 py-2 transition-all duration-200 group-hover:translate-x-1">
                    <span className="font-semibold text-sm tracking-wide">Empresa</span>
                    {!collapsed && (
                      openSections.empresa ? 
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 text-primary" /> : 
                        <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:text-primary" />
                    )}
                  </SidebarGroupLabel>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {companyItems.filter(item => canAccess(item.roles)).map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink to={item.url} className={getNavClassName(item.url)}>
                            <item.icon className="w-4 h-4" />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-4 bg-gradient-to-t from-sidebar-accent/20 to-transparent">
        <div className="space-y-2">
          {userRole === 'admin' ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-all duration-200 hover:translate-x-1 group"
              onClick={() => window.location.href = '/admin/configuracoes'}
            >
              <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              {!collapsed && <span className="ml-2 font-medium">Configurações</span>}
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent transition-all duration-200 hover:translate-x-1"
              onClick={() => window.location.href = '/perfil'}
            >
              <UserCircle className="w-4 h-4" />
              {!collapsed && <span className="ml-2 font-medium">Meu Perfil</span>}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-gradient-to-r hover:from-destructive/10 hover:to-transparent transition-all duration-200 hover:translate-x-1 group"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            {!collapsed && <span className="ml-2 font-medium">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
