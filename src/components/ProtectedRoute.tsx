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

  console.log('🔍 ProtectedRoute Debug:', {
    user: !!user,
    loading,
    userRole,
    isOtpVerified,
    requiredRole,
    allowedRoles
  });

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
    console.log('❌ Usuário não logado, redirecionando para login');
    return <Navigate to="/auth" replace />;
  }

  // Se está logado mas OTP não foi verificado, redireciona para login
  if (!isOtpVerified) {
    console.log('❌ OTP não verificado, redirecionando para login');
    return <Navigate to="/auth" replace />;
  }

  // Se userRole ainda não foi carregado, aguarda
  if (userRole === null) {
    console.log('⏳ UserRole ainda não carregado, aguardando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">Carregando permissões...</span>
      </div>
    );
  }

  const effectiveAllowedRoles = allowedRoles || (requiredRole ? [requiredRole, 'admin'] : null);
  console.log('🔍 Verificando permissões:', {
    effectiveAllowedRoles,
    userRole,
    hasRequiredRole: effectiveAllowedRoles?.includes(userRole as 'admin' | 'redator' | 'gestor')
  });

  if (effectiveAllowedRoles) {
    const hasRequiredRole = effectiveAllowedRoles.includes(userRole as 'admin' | 'redator' | 'gestor');
    if (!hasRequiredRole) {
      console.log('❌ Usuário não tem permissão:', { userRole, effectiveAllowedRoles });
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Role: {userRole} | Permitidos: {effectiveAllowedRoles.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  }
  
  console.log('✅ Acesso permitido');
  return <>{children}</>;
};
