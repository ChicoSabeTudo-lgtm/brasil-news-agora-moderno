import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp,
  Activity,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  totalNews: number;
  publishedNews: number;
  totalViews: number;
  totalUsers: number;
  contactMessages: number;
  advertisingRequests: number;
}

export const Stats = () => {
  const [stats, setStats] = useState<StatsData>({
    totalNews: 0,
    publishedNews: 0,
    totalViews: 0,
    totalUsers: 0,
    contactMessages: 0,
    advertisingRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar estatísticas de notícias
        const { data: newsData } = await supabase
          .from('news')
          .select('views, is_published');

        // Buscar total de usuários
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Buscar mensagens de contato pendentes
        const { count: contactCount } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Buscar solicitações de publicidade pendentes
        const { count: adsCount } = await supabase
          .from('advertising_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (newsData) {
          const totalNews = newsData.length;
          const publishedNews = newsData.filter(news => news.is_published).length;
          const totalViews = newsData.reduce((sum, news) => sum + (news.views || 0), 0);

          setStats({
            totalNews,
            publishedNews,
            totalViews,
            totalUsers: usersCount || 0,
            contactMessages: contactCount || 0,
            advertisingRequests: adsCount || 0
          });
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const statsConfig = [
    {
      title: "Total de Notícias",
      value: formatNumber(stats.totalNews),
      subtitle: `${stats.publishedNews} publicadas`,
      icon: FileText,
      description: "Total no sistema"
    },
    {
      title: "Visualizações",
      value: formatNumber(stats.totalViews),
      subtitle: "Todas as notícias",
      icon: Eye,
      description: "Total acumulado"
    },
    {
      title: "Usuários",
      value: formatNumber(stats.totalUsers),
      subtitle: "Registrados",
      icon: Users,
      description: "Total de perfis"
    },
    {
      title: "Pendências",
      value: formatNumber(stats.contactMessages + stats.advertisingRequests),
      subtitle: `${stats.contactMessages} contatos, ${stats.advertisingRequests} anúncios`,
      icon: MessageSquare,
      description: "Aguardando resposta"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">
                <div className="font-medium">{stat.subtitle}</div>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};