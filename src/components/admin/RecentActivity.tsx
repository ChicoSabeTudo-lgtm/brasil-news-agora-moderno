import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'news_published' | 'news_updated' | 'user_registered';
  title: string;
  description: string;
  timestamp: string;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // Buscar notícias recentes publicadas
        const { data: recentNews } = await supabase
          .from('news')
          .select('id, title, published_at, updated_at, is_published')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(5);

        // Buscar usuários recentes
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, full_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        const activityItems: ActivityItem[] = [];

        // Adicionar notícias publicadas
        if (recentNews) {
          recentNews.forEach(news => {
            if (news.published_at) {
              activityItems.push({
                id: `news_published_${news.id}`,
                type: 'news_published',
                title: 'Nova notícia publicada',
                description: news.title,
                timestamp: news.published_at
              });
            }
          });
        }

        // Adicionar usuários registrados
        if (recentUsers) {
          recentUsers.forEach(user => {
            activityItems.push({
              id: `user_registered_${user.id}`,
              type: 'user_registered',
              title: 'Usuário cadastrado',
              description: user.full_name || 'Novo usuário',
              timestamp: user.created_at
            });
          });
        }

        // Ordenar por timestamp mais recente
        activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setActivities(activityItems.slice(0, 3));
      } catch (error) {
        console.error('Erro ao buscar atividade recente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-32" />
                  <div className="h-3 bg-muted rounded animate-pulse w-48" />
                </div>
                <div className="h-3 bg-muted rounded animate-pulse w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>
          Últimas ações realizadas no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma atividade recente encontrada
            </p>
          ) : (
            activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`flex items-center justify-between ${
                  index < activities.length - 1 ? 'border-b pb-2' : ''
                }`}
              >
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.timestamp), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};