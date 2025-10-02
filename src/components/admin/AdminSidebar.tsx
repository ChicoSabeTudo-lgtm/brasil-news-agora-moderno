import { NavLink, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import {
  DollarSign,
  CreditCard,
  Receipt,
  ShoppingCart,
  Calculator,
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
    roles: ['admin', 'redator'],
  },
];

const generalItems = [
  {
    title: 'Contato',
    url: '/admin?tab=contact',
    icon: Mail,
    roles: ['admin', 'redator'],
    badgeType: 'contact',
  },
  {
    title: 'Anunciantes',
    url: '/admin?tab=advertising',
    icon: Building,
    roles: ['admin', 'redator'],
    badgeType: 'advertising',
  },
];

const financialItems = [
  {
    title: 'Lançamentos',
    url: '/admin?tab=finance',
    icon: DollarSign,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Clientes/Receita',
    url: '/admin?tab=clients',
    icon: ShoppingCart,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Fornecedores/Despesa',
    url: '/admin?tab=suppliers',
    icon: Receipt,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Propagandas',
    url: '/admin?tab=ads-finance',
    icon: Megaphone,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Gestão de PIs',
    url: '/admin?tab=insertion-orders',
    icon: CreditCard,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Calculadora RH',
    url: '/admin?tab=hr-calculator',
    icon: Calculator,
    roles: ['admin', 'redator'],
  },
];

const companyItems = [
  {
    title: 'Dados da Empresa',
    url: '/admin?tab=company-data',
    icon: Building2,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Documentos',
    url: '/admin?tab=company-documents',
    icon: FileText,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Certidões',
    url: '/admin?tab=company-certifications',
    icon: Shield,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Notas Fiscais',
    url: '/admin?tab=invoices',
    icon: Receipt,
    roles: ['admin', 'redator'],
  },
  {
    title: 'Pagamentos DAS',
    url: '/admin?tab=das-payments',
    icon: FileText,
    roles: ['admin', 'redator'],
  },
];

export const AdminSidebar = () => {
  const { userRole, signOut, user } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { data: pendingCounts } = usePendingCounts();
  
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
      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-2 border-primary' 
      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';
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
    <Sidebar className="border-r border-sidebar-border bg-sidebar shadow-sm">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sidebar-foreground">Admin Panel</h2>
              <p className="text-xs text-sidebar-foreground/70">ChicoSabeTudo</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
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
        </SidebarGroup>

        {(userRole === 'admin' || userRole === 'redator') && (
          <SidebarGroup>
            <SidebarGroupLabel>
              {userRole === 'admin' ? 'Administração' : 'Ferramentas'}
            </SidebarGroupLabel>
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
          </SidebarGroup>
        )}

        {(userRole === 'admin' || userRole === 'redator') && (
          <SidebarGroup>
            <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
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
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
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
        </SidebarGroup>

        {(userRole === 'admin' || userRole === 'redator') && (
          <SidebarGroup>
            <SidebarGroupLabel>Empresa</SidebarGroupLabel>
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
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          {userRole === 'admin' ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/admin/configuracoes'}
            >
              <Settings className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Configurações</span>}
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/perfil'}
            >
              <UserCircle className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Meu Perfil</span>}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
