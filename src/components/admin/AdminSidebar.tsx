import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
    roles: ['admin', 'redator'],
    badge: 'pendentes',
  },
  {
    title: 'Anunciantes',
    url: '/admin?tab=advertising',
    icon: Building,
    roles: ['admin', 'redator'],
  },
];

export const AdminSidebar = () => {
  const { userRole, signOut, user } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
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

        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminOnlyItems.map((item) => (
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
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs admin-badge-pulse">
                              3
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