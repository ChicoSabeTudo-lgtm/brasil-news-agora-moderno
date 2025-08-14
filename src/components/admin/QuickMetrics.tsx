import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QuickMetricsData {
  newsThisMonth: number;
  viewsThisMonth: number;
  pendingMessages: number;
  activeUsers: number;
}

export const QuickMetrics = () => {
  const [metrics, setMetrics] = useState<QuickMetricsData>({
    newsThisMonth: 0,
    viewsThisMonth: 0,
    pendingMessages: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuickMetrics = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Notícias publicadas este mês
        const { count: newsThisMonth } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true)
          .gte('published_at', startOfMonth.toISOString())
          .lte('published_at', endOfMonth.toISOString());

        // Total de visualizações deste mês
        const { data: monthNewsViews } = await supabase
          .from('news')
          .select('views')
          .eq('is_published', true)
          .gte('published_at', startOfMonth.toISOString())
          .lte('published_at', endOfMonth.toISOString());

        const monthViews = monthNewsViews?.reduce((sum, news) => sum + (news.views || 0), 0) || 0;

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
          newsThisMonth: newsThisMonth || 0,
          viewsThisMonth: monthViews,
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
          Estatísticas do mês atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Notícias este mês</span>
            <span className="text-2xl font-bold text-primary">
              {metrics.newsThisMonth}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Visualizações este mês</span>
            <span className="text-2xl font-bold text-primary">
              {formatNumber(metrics.viewsThisMonth)}
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