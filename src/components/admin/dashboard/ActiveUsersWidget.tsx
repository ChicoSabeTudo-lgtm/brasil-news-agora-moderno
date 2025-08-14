import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserActivity {
  id: string;
  full_name: string;
  role: string;
  last_seen: string;
  is_online: boolean;
}

export const ActiveUsersWidget = () => {
  const [activeUsers, setActiveUsers] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10);

        if (profiles) {
          const users = profiles.map(profile => ({
            id: profile.user_id,
            full_name: profile.full_name || 'Usuário',
            role: 'redator', // Default role since it's not in profiles table
            last_seen: profile.updated_at,
            is_online: new Date(profile.updated_at) > new Date(Date.now() - 15 * 60 * 1000) // 15 minutes
          }));

          setActiveUsers(users);
        }
      } catch (error) {
        console.error('Error fetching active users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const onlineCount = activeUsers.filter(user => user.is_online).length;

  if (isLoading) {
    return (
      <Card className="admin-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Usuários Ativos Agora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="admin-slide-in admin-hover-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Usuários Ativos Agora
          {onlineCount > 0 && (
            <Badge variant="default" className="admin-badge-pulse ml-auto">
              {onlineCount} online
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Atividade recente da equipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeUsers.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                </div>
                {user.is_online && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background admin-badge-pulse" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {user.full_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3" />
                  {user.is_online ? (
                    <span className="text-green-600">Online agora</span>
                  ) : (
                    <span>
                      Visto {new Date(user.last_seen).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
              
              <Badge 
                variant="secondary"
                className="text-xs"
              >
                Redator
              </Badge>
            </div>
          ))}
          {activeUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhum usuário ativo
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};