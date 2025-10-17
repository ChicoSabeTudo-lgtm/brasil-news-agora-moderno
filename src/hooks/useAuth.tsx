import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { securityLogger, SecurityEventType } from '@/utils/securityLogger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOtpVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; requiresOTP?: boolean }>;
  signUp: (email: string, password: string, fullName: string, whatsappPhone?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  requestOTPLogin: (email: string, password: string, explicitUserId?: string) => Promise<{ error: string | null; success?: boolean }>;
  verifyOTPLogin: (email: string, code: string) => Promise<{ error: string | null; success?: boolean }>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEBUG_OTP = true;

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
          const fetchRole = async () => {
            try {
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .maybeSingle();

              if (error) throw error;

              setUserRole(data?.role || null);
            } catch (error) {
              console.error('Erro ao buscar role do usuário:', error);
              setUserRole(null);
            }
          };

          fetchRole();
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
        securityLogger.log(
          SecurityEventType.LOGIN_FAILED,
          { email, error: authError.message }
        );
        
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

        // Buscar role mais recente após login
        const userId = authData.user?.id;
        if (userId) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

          setUserRole(roleData?.role || null);
        }
        
        // Gerar OTP e enviar webhook
        const { error: otpError } = await requestOTPLogin(email, password, userId);

        if (otpError) {
          // Se erro no OTP, fazer logout
          await supabase.auth.signOut();
          updateOtpVerified(false);
          return { error: { message: otpError } };
        }

        // OTP enviado com sucesso, aguardar verificação
        securityLogger.log(
          SecurityEventType.LOGIN_SUCCESS,
          { email, requiresOTP: true }
        );
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

  const requestOTPLogin = async (email: string, password: string, explicitUserId?: string) => {
    try {
      // Revalidar sessão e obter usuário atualizado quando necessário
      let targetUserId = explicitUserId;

      if (!targetUserId) {
        const { data: userData } = await supabase.auth.getUser();
        targetUserId = userData.user?.id || undefined;
      }

      if (!targetUserId) {
        return { error: 'Não foi possível identificar o usuário autenticado.' };
      }

      if (!userRole) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (roleData?.role) {
          setUserRole(roleData.role);
        }
      }

      if (DEBUG_OTP) {
        console.log('[OTP] Usuário autenticado:', {
          email,
          userId: targetUserId,
        });
      }

      // Gerar OTP localmente
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
      
      if (DEBUG_OTP) {
        console.log('[OTP] Código gerado:', otpCode);
      }
      
      // Buscar telefone do usuário
      const { data: profileRows, error: profileError } = await supabase
        .from('profiles')
        .select('whatsapp_phone, email')
        .eq('user_id', targetUserId)
        .limit(1);

      if (DEBUG_OTP) {
        console.log('[OTP] Resultado query profiles:', {
          profileRows,
          profileError,
        });
      }

      if (profileError) {
        console.error('Erro ao buscar profile:', profileError);
        toast({
          title: "Erro ao buscar dados",
          description: "Falha ao consultar o perfil deste usuário.",
          variant: "destructive",
        });
        return { error: "Erro ao buscar profile" };
      }

      let whatsappPhone = profileRows?.[0]?.whatsapp_phone as string | undefined;

      if (!whatsappPhone) {
        if (DEBUG_OTP) {
          console.log('[OTP] WhatsApp ausente, tentando recuperar via metadata.');
        }

        const { data: userData } = await supabase.auth.getUser();
        const metaFullName = (userData.user?.user_metadata as any)?.full_name as string | undefined;
        const metaWhatsAppRaw = (userData.user?.user_metadata as any)?.whatsapp_phone as string | undefined;

        if (metaWhatsAppRaw) {
          const normalizedPhone = formatPhoneNumber(metaWhatsAppRaw);

          const { data: ensureProfile, error: ensureError } = await supabase.rpc('ensure_user_profile', {
            p_user_id: targetUserId,
            p_full_name: metaFullName || email,
            p_whatsapp_phone: normalizedPhone,
          });

          if (ensureError) {
            console.error('Erro ao normalizar WhatsApp via RPC:', ensureError);
          } else {
            whatsappPhone = (ensureProfile as any)?.whatsapp_phone || normalizedPhone;

            if (!whatsappPhone) {
              const { data: refreshedProfile } = await supabase
                .from('profiles')
                .select('whatsapp_phone')
                .eq('user_id', targetUserId)
                .limit(1)
                .maybeSingle();

              whatsappPhone = refreshedProfile?.whatsapp_phone || whatsappPhone;
            }
          }
        }
      }

      if (!whatsappPhone) {
        toast({
          title: "Perfil não configurado",
          description: "Execute o script CONFIGURAR_WHATSAPP_SQL.sql no Supabase para vincular o WhatsApp deste usuário.",
          variant: "destructive",
        });

        if (DEBUG_OTP) {
          console.log('[OTP] WhatsApp ausente, abortando.');
        }

        return { error: "WhatsApp não configurado" };
      }

      if (DEBUG_OTP) {
        console.log('[OTP] WhatsApp encontrado:', whatsappPhone);
      }

      // Salvar OTP via função RPC (já dispara webhook no banco)
      const { data: rpcData, error: rpcError } = await supabase.rpc('generate_otp_code', {
        p_email: email,
        p_code: otpCode,
        p_whatsapp_phone: whatsappPhone,
        p_user_id: targetUserId,
        p_expires_in_seconds: 300,
      });

      if (rpcError) {
        console.error('Erro ao salvar OTP via RPC:', rpcError);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o código de verificação.",
          variant: "destructive",
        });
        return { error: "Erro ao salvar OTP" };
      }

      if (DEBUG_OTP) {
        console.log('[OTP] RPC retorno:', rpcData);
        console.log('[OTP] Webhook disparado pelo banco com payload:', {
          email,
          user_id: targetUserId,
          whatsapp_phone: whatsappPhone,
          otp_code: otpCode,
        });
      }

      toast({
        title: "Código enviado!",
        description: "Verifique seu WhatsApp para o código de verificação.",
      });

      // Opcional: fallback local caso deseje testar envio direto
      // const { data: config } = await supabase
      //   .from('site_configurations')
      //   .select('otp_webhook_url')
      //   .order('updated_at', { ascending: false })
      //   .limit(1)
      //   .single();

      // if (config?.otp_webhook_url) {
      //   try {
      //     await fetch(config.otp_webhook_url, {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify({
      //         email,
      //         user_id: targetUserId,
      //         whatsapp_phone: whatsappPhone,
      //         otp_code: otpCode,
      //         timestamp: new Date().toISOString(),
      //       }),
      //     });
      //   } catch (fallbackError) {
      //     console.error('Falha no fallback do webhook:', fallbackError);
      //   }
      // }

      return { error: null, success: true };
    } catch (error: any) {
      console.error('Erro ao gerar OTP:', error);
      toast({
        title: "Erro ao enviar código",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });

      if (DEBUG_OTP) {
        console.log('[OTP] Erro inesperado:', error);
      }

      return { error: 'Ocorreu um erro inesperado' };
    }
  };

  const verifyOTPLogin = async (email: string, code: string) => {
    try {
      // Limpar códigos expirados e verificar via função RPC
      const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_otp_code', {
        p_email: email,
        p_code: code,
      });

      if (verifyError) {
        console.error('Erro ao verificar OTP via RPC:', verifyError);
        toast({
          title: "Erro na verificação",
          description: "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
        return { error: "Erro na verificação" };
      }

      if (!verifyResult) {
        toast({
          title: "Código inválido",
          description: "Código não encontrado ou expirado. Solicite um novo código.",
          variant: "destructive",
        });
        return { error: "Código inválido ou expirado" };
      }

      // Código válido - marcar como OTP verificado
      updateOtpVerified(true);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });

      // Redirecionar para admin
      window.location.href = '/admin';
      return { error: null, success: true };

    } catch (error: any) {
      console.error('Erro na verificação OTP:', error);
      toast({
        title: "Erro na verificação",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      return { error: 'Ocorreu um erro inesperado' };
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