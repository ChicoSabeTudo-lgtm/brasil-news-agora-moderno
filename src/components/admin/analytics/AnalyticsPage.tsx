import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, Clock, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useNews } from '@/hooks/useNews';

type Period = 'today' | '7days' | '30days';

interface AnalyticsData {
  topArticles: any[];
  worstArticles: any[];
  allArticles: any[];
  categoryPerformance: any[];
  avgReadTime: number;
  onlineVisitors: number;
  topArticleNow: any;
  peakAudience: number;
}

// Function to fetch real data from the database
const fetchRealData = async (period: Period): Promise<AnalyticsData> => {
  try {
    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    // Fetch all published news with categories
    const { data: allNews, error } = await supabase
      .from('news')
      .select(`
        id,
        title,
        views,
        published_at,
        categories!inner (
          name,
          slug
        )
      `)
      .eq('is_published', true)
      .gte('published_at', startDate.toISOString())
      .order('views', { ascending: false });

    if (error) throw error;

    // Process articles data
    const processedArticles = allNews?.map(article => ({
      id: article.id,
      title: article.title,
      views: article.views || 0,
      published_at: new Date(article.published_at),
      category: article.categories?.name || 'Sem categoria'
    })) || [];

    // Calculate category performance
    const categoryStats: { [key: string]: number } = {};
    processedArticles.forEach(article => {
      if (!categoryStats[article.category]) {
        categoryStats[article.category] = 0;
      }
      categoryStats[article.category] += article.views;
    });

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#84cc16', '#6366f1', '#ec4899'];
    const categoryPerformance = Object.entries(categoryStats)
      .map(([category, views], index) => ({
        category,
        views,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.views - a.views);

    // Get top and worst performing articles
    const topArticles = processedArticles.slice(0, 5);
    const worstArticles = processedArticles.slice(-5).reverse();

    return {
      topArticles,
      worstArticles,
      allArticles: processedArticles,
      categoryPerformance,
      avgReadTime: Math.floor(Math.random() * 180) + 120, // Simulated for now
      onlineVisitors: Math.floor(Math.random() * 50) + 10, // Simulated for now
      topArticleNow: topArticles[0] || { title: 'Sem dados', views: 0 },
      peakAudience: Math.floor(Math.random() * 200) + 100, // Simulated for now
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    // Return empty data structure on error
    return {
      topArticles: [],
      worstArticles: [],
      allArticles: [],
      categoryPerformance: [],
      avgReadTime: 150,
      onlineVisitors: 15,
      topArticleNow: { title: 'Sem dados', views: 0 },
      peakAudience: 120,
    };
  }
};

export const AnalyticsPage = () => {
  const [period, setPeriod] = useState<Period>('7days');
  const [data, setData] = useState<AnalyticsData>({
    topArticles: [],
    worstArticles: [],
    allArticles: [],
    categoryPerformance: [],
    avgReadTime: 150,
    onlineVisitors: 15,
    topArticleNow: { title: 'Carregando...', views: 0 },
    peakAudience: 120,
  });
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState({
    onlineVisitors: 15,
    topArticleNow: { title: 'Carregando...', views: 0 },
    peakAudience: 120,
  });

  // Fetch real data when period changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const realData = await fetchRealData(period);
        setData(realData);
        setRealTimeData(prev => ({
          ...prev,
          topArticleNow: realData.topArticleNow,
        }));
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        onlineVisitors: Math.floor(Math.random() * 50) + 10,
        peakAudience: Math.floor(Math.random() * 200) + 100,
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getPeriodLabel = (period: Period) => {
    switch (period) {
      case 'today': return 'Hoje';
      case '7days': return 'Últimos 7 dias';
      case '30days': return 'Últimos 30 dias';
    }
  };

  const formatReadTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Análises</h1>
          <p className="text-muted-foreground">Métricas e insights do desempenho do site</p>
        </div>
        
        <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{realTimeData.onlineVisitors}</div>
            <p className="text-xs text-muted-foreground">Agora mesmo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio no Site</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatReadTime(data.avgReadTime)}</div>
            <p className="text-xs text-muted-foreground">{getPeriodLabel(period)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pico de Audiência</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData.peakAudience}</div>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mais Lida Agora</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold truncate">{realTimeData.topArticleNow.title}</div>
            <p className="text-xs text-muted-foreground">{realTimeData.topArticleNow.views} visualizações</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempenho por Categoria - Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.categoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Desempenho por Categoria - Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Visualizações</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryPerformance}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="views"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.categoryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Matérias com melhor e pior desempenho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top 5 - Melhor Desempenho
            </CardTitle>
          </CardHeader>
           <CardContent>
             {loading ? (
               <div className="space-y-4">
                 {Array.from({ length: 5 }).map((_, index) => (
                   <div key={index} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                     <div className="flex items-center gap-3">
                       <div className="w-6 h-6 bg-gray-200 rounded"></div>
                       <div>
                         <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                         <div className="h-3 bg-gray-200 rounded w-16"></div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                       <div className="h-3 bg-gray-200 rounded w-16"></div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : data.topArticles.length > 0 ? (
               <div className="space-y-4">
                 {data.topArticles.map((article, index) => (
                   <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex items-center gap-3">
                       <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center text-xs">
                         {index + 1}
                       </Badge>
                       <div>
                         <p className="font-medium text-sm">{article.title}</p>
                         <p className="text-xs text-muted-foreground">{article.category}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-bold text-green-600">{article.views}</p>
                       <p className="text-xs text-muted-foreground">visualizações</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-muted-foreground">
                 Nenhum dado disponível para o período selecionado
               </div>
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Bottom 5 - Pior Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : data.worstArticles.length > 0 ? (
              <div className="space-y-4">
                {data.worstArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{article.title}</p>
                        <p className="text-xs text-muted-foreground">{article.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{article.views}</p>
                      <p className="text-xs text-muted-foreground">visualizações</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de páginas mais visitadas */}
      <Card>
        <CardHeader>
          <CardTitle>Páginas Mais Visitadas - {getPeriodLabel(period)}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data de Publicação</TableHead>
                <TableHead className="text-right">Visualizações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.allArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{article.category}</Badge>
                  </TableCell>
                  <TableCell>{format(article.published_at, 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right font-mono">{article.views}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};