import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface KpiWidgetProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export const KpiWidget = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  status = 'info',
  className = ''
}: KpiWidgetProps) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className={`text-xs ${getStatusColor()}`}>
            <Icon className="w-3 h-3 mr-1" />
            KPI
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {value}
            </div>
            {subtitle && (
              <p className={`text-sm ${getTrendColor()}`}>
                {subtitle}
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-primary opacity-80" />
        </div>
      </CardContent>
    </Card>
  );
};