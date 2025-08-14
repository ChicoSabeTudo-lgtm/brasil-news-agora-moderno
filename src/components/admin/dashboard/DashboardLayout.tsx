import { LatestNewsWidget } from './LatestNewsWidget';
import { ActiveUsersWidget } from './ActiveUsersWidget';
import { UrgentTasksWidget } from './UrgentTasksWidget';
import { Stats } from '@/components/admin/Stats';
import { QuickMetrics } from '@/components/admin/QuickMetrics';
import { KpiWidget } from './KpiWidget';
import { TrendingUp, DollarSign, CreditCard, PieChart } from 'lucide-react';

export const DashboardLayout = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="admin-slide-in">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Dashboard Administrativo
        </h2>
        <p className="text-muted-foreground">
          Visão geral das atividades e estatísticas do sistema
        </p>
      </div>

      {/* Stats Overview */}
      <div className="admin-slide-in">
        <Stats />
      </div>

      {/* Custom Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatestNewsWidget />
        <div className="grid grid-cols-1 gap-6">
          <UrgentTasksWidget />
          <div className="admin-slide-in">
            <QuickMetrics />
          </div>
        </div>
      </div>
    </div>
  );
};