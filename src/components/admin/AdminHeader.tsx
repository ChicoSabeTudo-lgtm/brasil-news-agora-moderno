import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AdminHeader = () => {
  const { user, userRole } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      } else {
        setUserName(user?.email || '');
      }
    };

    const loadNotifications = async () => {
      // Count unread contact messages
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');

      setNotifications(count || 0);
    };

    loadUserProfile();
    loadNotifications();

    // Update notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-foreground hover:bg-accent hover:text-accent-foreground" />
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Painel Administrativo
            </h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              ChicoSabeTudo - Sistema de Gestão
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center admin-badge-pulse"
              >
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            )}
          </Button>

          {/* User Info */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">
              {userName || user?.email}
            </p>
            <Badge variant="secondary" className="text-xs">
              {userRole === 'admin' ? 'Administrador' : 'Redator'}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};