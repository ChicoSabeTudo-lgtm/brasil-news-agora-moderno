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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <LatestNewsWidget />
        <ActiveUsersWidget />
        <UrgentTasksWidget />
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiWidget
          title="Previsão Mensal"
          value="R$ 125.430"
          subtitle="+12.5% vs mês anterior"
          icon={TrendingUp}
          trend="up"
          status="success"
        />
        <KpiWidget
          title="Saldo Atual"
          value="R$ 89.240"
          subtitle="Disponível"
          icon={DollarSign}
          status="info"
        />
        <KpiWidget
          title="Recebido"
          value="R$ 45.680"
          subtitle="Últimos 30 dias"
          icon={CreditCard}
          trend="up"
          status="success"
        />
        <KpiWidget
          title="Investido"
          value="R$ 32.150"
          subtitle="-5.2% vs planejado"
          icon={PieChart}
          trend="down"
          status="warning"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-slide-in">
          <QuickMetrics />
        </div>
        
        {/* Performance Chart Placeholder */}
        <div className="admin-slide-in">
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Performance Semanal
            </h3>
            <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PieChart className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Gráfico de performance em breve
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};