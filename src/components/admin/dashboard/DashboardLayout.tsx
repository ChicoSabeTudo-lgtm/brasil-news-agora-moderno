import { LatestNewsWidget } from './LatestNewsWidget';
import { ActiveUsersWidget } from './ActiveUsersWidget';
import { UrgentTasksWidget } from './UrgentTasksWidget';
import { Stats } from '@/components/admin/Stats';
import { QuickMetrics } from '@/components/admin/QuickMetrics';

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

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="admin-slide-in">
          <QuickMetrics />
        </div>
        
        {/* Performance Chart Placeholder */}
        <div className="admin-slide-in admin-hover-glow">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Performance Semanal
            </h3>
            <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-8 h-8 bg-primary rounded-full animate-pulse" />
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