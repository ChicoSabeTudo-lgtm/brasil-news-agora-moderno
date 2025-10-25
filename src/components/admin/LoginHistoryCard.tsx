import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogIn, Clock, User, Shield, Smartphone } from 'lucide-react';
import { useLoginHistory } from '@/hooks/useLoginHistory';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

const roleColors = {
  admin: 'bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-800',
  redator: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800',
  gestor: 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-800',
  viewer: 'bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-800',
};

const roleNames = {
  admin: 'Administrador',
  redator: 'Redator',
  gestor: 'Gestor',
  viewer: 'Visualizador',
};

export const LoginHistoryCard = () => {
  const { logins, loading } = useLoginHistory(10);

  const formatDateTime = (dateString: string) => {
    return formatInTimeZone(
      new Date(dateString),
      'America/Fortaleza',
      'dd/MM/yyyy \'às\' HH:mm',
      { locale: ptBR }
    );
  };

  const getDeviceType = (userAgent: string) => {
    if (!userAgent) return 'Desktop';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'Mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'Tablet';
    }
    return 'Desktop';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          Últimos Logins
        </CardTitle>
        <CardDescription>
          Histórico dos últimos 10 logins realizados no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : logins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <LogIn className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum login registrado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logins.map((login) => (
              <div
                key={login.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {login.user_email}
                    </p>
                    {login.user_role && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${roleColors[login.user_role as keyof typeof roleColors] || roleColors.viewer}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {roleNames[login.user_role as keyof typeof roleNames] || login.user_role}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(login.login_at)}
                    </div>
                    
                    {login.user_agent && (
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        {getDeviceType(login.user_agent)}
                      </div>
                    )}
                    
                    {login.ip_address && (
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{login.ip_address}</span>
                      </div>
                    )}
                  </div>
                  
                  {!login.success && login.failure_reason && (
                    <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                      ❌ {login.failure_reason}
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  {login.success ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                      ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">
                      ✗
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

