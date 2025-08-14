import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, Clock, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';
import { format } from 'date-fns';

type Period = 'today' | '7days' | '30days';

// Mock data - In real implementation, this would come from the database
const generateMockData = (period: Period) => {
  const mockArticles = [
    { id: 1, title: 'Nova lei de trânsito entra em vigor', category: 'Nacional', published_at: new Date('2024-01-15'), views: 1250 },
    { id: 2, title: 'Time local vence campeonato estadual', category: 'Esportes', published_at: new Date('2024-01-14'), views: 890 },
    { id: 3, title: 'Mercado financeiro em alta', category: 'Economia', published_at: new Date('2024-01-13'), views: 750 },
    { id: 4, title: 'Festival de música movimenta a cidade', category: 'Entretenimento', published_at: new Date('2024-01-12'), views: 680 },
    { id: 5, title: 'Novas tecnologias em saúde', category: 'Saude', published_at: new Date('2024-01-11'), views: 620 },
    { id: 6, title: 'Prefeito anuncia obras de infraestrutura', category: 'Politica', published_at: new Date('2024-01-10'), views: 580 },
    { id: 7, title: 'Descoberta científica revolucionária', category: 'Tecnologia', published_at: new Date('2024-01-09'), views: 520 },
    { id: 8, title: 'Mudanças climáticas preocupam especialistas', category: 'Internacional', published_at: new Date('2024-01-08'), views: 480 },
    { id: 9, title: 'Nova startup local recebe investimento', category: 'Economia', published_at: new Date('2024-01-07'), views: 420 },
    { id: 10, title: 'Campanha de vacinação é prorrogada', category: 'Saude', published_at: new Date('2024-01-06'), views: 380 },
  ];

  const categoryPerformance = [
    { category: 'Nacional', views: 2100, color: '#8b5cf6' },
    { category: 'Esportes', views: 1800, color: '#06b6d4' },
    { category: 'Economia', views: 1650, color: '#10b981' },
    { category: 'Entretenimento', views: 1200, color: '#f59e0b' },
    { category: 'Saude', views: 1000, color: '#ef4444' },
    { category: 'Politica', views: 950, color: '#84cc16' },
    { category: 'Tecnologia', views: 800, color: '#6366f1' },
    { category: 'Internacional', views: 700, color: '#ec4899' },
  ];

  return {
    topArticles: mockArticles.slice(0, 5),
    worstArticles: mockArticles.slice(-5).reverse(),
    allArticles: mockArticles,
    categoryPerformance,
    avgReadTime: Math.floor(Math.random() * 180) + 120, // 2-5 minutes
    onlineVisitors: Math.floor(Math.random() * 50) + 10,
    topArticleNow: mockArticles[0],
    peakAudience: Math.floor(Math.random() * 200) + 100,
  };
};

export const AnalyticsPage = () => {
  const [period, setPeriod] = useState<Period>('7days');
  const [data, setData] = useState(generateMockData('7days'));
  const [realTimeData, setRealTimeData] = useState({
    onlineVisitors: 25,
    topArticleNow: data.topArticleNow,
    peakAudience: 142,
  });

  useEffect(() => {
    setData(generateMockData(period));
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