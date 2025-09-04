import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOtpVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; requiresOTP?: boolean }>;
  signUp: (email: string, password: string, fullName: string, whatsappPhone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  requestOTPLogin: (email: string, password: string) => Promise<{ error: string | null; success?: boolean }>;
  verifyOTPLogin: (email: string, code: string) => Promise<{ error: string | null; success?: boolean }>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOtpVerified, setIsOtpVerified] = useState(() => {
    // Inicializar do localStorage
    return localStorage.getItem('isOtpVerified') === 'true';
  });
  const { toast } = useToast();

  // Helper para atualizar isOtpVerified no state e localStorage
  const updateOtpVerified = (verified: boolean) => {
    setIsOtpVerified(verified);
    localStorage.setItem('isOtpVerified', verified.toString());
  };

  // Token refresh monitoring
  const checkTokenValidity = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Token validation error:', error);
        // If token is invalid, force logout
        await signOut();
        return false;
      }
      
      if (!session) {
        console.log('ℹ️ No session found');
        return false;
      }
      
      // Check if token is close to expiring (within 5 minutes)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry < 300) { // 5 minutes
        console.log('🔄 Token expiring soon, attempting refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          await signOut();
          return false;
        }
        
        if (refreshedSession) {
          console.log('✅ Token refreshed successfully');
          setSession(refreshedSession);
          setUser(refreshedSession.user);
          return true;
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error checking token validity:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setUserRole(null);
          updateOtpVerified(false);
          setLoading(false);
          return;
        }
        
        // Synchronous state updates only
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer role fetching to avoid blocking
          setTimeout(async () => {
            try {
              const { data } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              setUserRole(data?.role || 'redator');
            } catch (error) {
              setUserRole('redator');
            }
          }, 0);
        } else {
          setUserRole(null);
          updateOtpVerified(false);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Session will be processed by the listener above
    });

    // Set up token monitoring interval (check every 4 minutes)
    const tokenCheckInterval = setInterval(checkTokenValidity, 4 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Fazer login normalmente para validar credenciais
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        toast({
          title: "Erro no login",
          description: authError.message,
          variant: "destructive",
        });
        return { error: authError };
      }

      // Se credenciais são válidas, manter sessão mas marcar como NÃO verificado
      if (authData.session) {
        updateOtpVerified(false); // Usuário está "pré-autenticado" mas não pode acessar
        
        // Gerar OTP e enviar webhook
        const { error: otpError } = await requestOTPLogin(email, password);
        
        if (otpError) {
          // Se erro no OTP, fazer logout
          await supabase.auth.signOut();
          updateOtpVerified(false);
          return { error: { message: otpError } };
        }
        
        // OTP enviado com sucesso, aguardar verificação
        return { error: null, requiresOTP: true };
      }
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, whatsappPhone?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Preparar os dados para incluir WhatsApp nos metadados
      const userData: any = {
        full_name: fullName,
      };

      // Incluir WhatsApp formatado nos metadados se fornecido
      if (whatsappPhone) {
        userData.whatsapp_phone = formatPhoneNumber(whatsappPhone);
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });
      
      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
      });
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Helper function to format phone number
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add +55 prefix if not present
    if (cleaned.length === 11 && !cleaned.startsWith('55')) {
      return `+55${cleaned}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+${cleaned}`;
    }
    
    return phone;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      updateOtpVerified(false); // Reset flag OTP ao fazer logout
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth?reset=true`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        toast({
          title: "Erro ao redefinir senha",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir a senha.",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const requestOTPLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-otp', {
        body: { email, password }
      });

      if (error) {
        const errorMessage = error.message || 'Erro ao solicitar código OTP';
        toast({
          title: "Erro ao enviar código",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: errorMessage };
      }

      if (data?.error) {
        toast({
          title: "Erro no login",
          description: data.error,
          variant: "destructive",
        });
        return { error: data.error };
      }

      toast({
        title: "Código enviado!",
        description: "Verifique seu WhatsApp para o código de verificação.",
      });

      return { error: null, success: true };
    } catch (error: any) {
      const errorMessage = 'Ocorreu um erro inesperado';
      toast({
        title: "Erro ao enviar código",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  const verifyOTPLogin = async (email: string, code: string) => {
    try {
      // Chamar edge function para verificar o código OTP
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, code }
      });

      if (error) {
        const errorMessage = error.message || 'Erro ao verificar código OTP';
        toast({
          title: "Erro na verificação",
          description: errorMessage,
          variant: "destructive",
        });
        return { error: errorMessage };
      }

      if (data?.error) {
        toast({
          title: "Código inválido",
          description: data.error,
          variant: "destructive",
        });
        return { error: data.error };
      }

      // Código válido - marcar como OTP verificado
      updateOtpVerified(true);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });

      // Redirecionar para admin - sessão já está ativa e OTP verificado
      window.location.href = '/admin';
      return { error: null, success: true };

    } catch (error: any) {
      const errorMessage = 'Ocorreu um erro inesperado';
      toast({
        title: "Erro na verificação",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  const value = {
    user,
    session,
    loading,
    isOtpVerified,
    signIn,
    signUp,
    signOut,
    resetPassword,
    requestOTPLogin,
    verifyOTPLogin,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};