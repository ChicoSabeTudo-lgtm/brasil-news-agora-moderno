import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuickMetricsData {
  newsToday: number;
  totalViews: number;
  pendingMessages: number;
  activeUsers: number;
}

export const QuickMetrics = () => {
  const [metrics, setMetrics] = useState<QuickMetricsData>({
    newsToday: 0,
    totalViews: 0,
    pendingMessages: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuickMetrics = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Notícias publicadas hoje
        const { count: newsToday } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('published_at', today.toISOString());

        // Total de visualizações
        const { data: viewsData } = await supabase
          .from('news')
          .select('views')
          .eq('is_published', true);

        const totalViews = viewsData?.reduce((sum, news) => sum + (news.views || 0), 0) || 0;

        // Mensagens pendentes (contato + publicidade)
        const { count: contactMessages } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: adRequests } = await supabase
          .from('advertising_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const pendingMessages = (contactMessages || 0) + (adRequests || 0);

        // Usuários ativos (aprovados e não revogados)
        const { count: activeUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_approved', true)
          .eq('access_revoked', false);

        setMetrics({
          newsToday: newsToday || 0,
          totalViews,
          pendingMessages,
          activeUsers: activeUsers || 0
        });
      } catch (error) {
        console.error('Erro ao buscar métricas rápidas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuickMetrics();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas Rápidas</CardTitle>
          <CardDescription>
            Resumo das principais estatísticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
                <div className="h-8 bg-muted rounded animate-pulse w-12" />
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
        <CardTitle>Métricas Rápidas</CardTitle>
        <CardDescription>
          Resumo das principais estatísticas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Notícias hoje</span>
            <span className="text-2xl font-bold text-primary">
              {metrics.newsToday}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Visualizações</span>
            <span className="text-2xl font-bold text-primary">
              {formatNumber(metrics.totalViews)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Pendências</span>
            <span className="text-2xl font-bold text-primary">
              {metrics.pendingMessages}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Usuários ativos</span>
            <span className="text-2xl font-bold text-primary">
              {metrics.activeUsers}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};