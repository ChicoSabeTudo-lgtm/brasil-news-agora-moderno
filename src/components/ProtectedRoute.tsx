import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'redator' | 'gestor';
  allowedRoles?: Array<'admin' | 'redator' | 'gestor'>;
}

export const ProtectedRoute = ({ children, requiredRole, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, userRole, isOtpVerified } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  // Se não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se está logado mas OTP não foi verificado, redireciona para login
  if (!isOtpVerified) {
    return <Navigate to="/auth" replace />;
  }

  const effectiveAllowedRoles = allowedRoles || (requiredRole ? [requiredRole, 'admin'] : null);

  if (effectiveAllowedRoles && userRole) {
    const hasRequiredRole = effectiveAllowedRoles.includes(userRole as 'admin' | 'redator' | 'gestor');
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      );
    }
  }
  return <>{children}</>;
};
