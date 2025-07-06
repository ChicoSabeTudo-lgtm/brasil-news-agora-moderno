import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';

export const Stats = () => {
  const stats = [
    {
      title: "Total de Notícias",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: FileText,
      description: "Últimos 30 dias"
    },
    {
      title: "Visualizações",
      value: "45.2K",
      change: "+8%",
      trend: "up",
      icon: Eye,
      description: "Esta semana"
    },
    {
      title: "Usuários Ativos",
      value: "892",
      change: "+3%",
      trend: "up",
      icon: Users,
      description: "Hoje"
    },
    {
      title: "Engajamento",
      value: "94.5%",
      change: "+2%",
      trend: "up",
      icon: TrendingUp,
      description: "Média mensal"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
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
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};