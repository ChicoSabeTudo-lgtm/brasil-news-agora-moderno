import { createContext, useContext, useEffect, useState } from 'react';
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
  requestOTPLogin: (email: string, password: string) => Promise<{ error: any; success?: boolean }>;
  verifyOTPLogin: (email: string, code: string) => Promise<{ error: any; success?: boolean }>;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função para gerar código OTP simples
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Função para simular envio de WhatsApp (em produção, usar API real)
function simulateWhatsAppSend(phone: string, code: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`📱 SIMULAÇÃO: Enviando código ${code} para WhatsApp ${phone}`);
    // Em produção, aqui seria a chamada real para a API do WhatsApp
    setTimeout(() => resolve(true), 1000);
  });
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  // Armazenar OTP temporariamente no localStorage
  const [pendingOTP, setPendingOTP] = useState<{
    email: string;
    code: string;
    expiresAt: number;
  } | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setIsOtpVerified(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Fazer login normalmente
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

      // Se credenciais são válidas, gerar OTP localmente
      if (authData.session) {
        setIsOtpVerified(false);
        
        // Gerar OTP
        const otpCode = generateOTPCode();
        const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutos
        
        // Armazenar OTP temporariamente
        setPendingOTP({
          email,
          code: otpCode,
          expiresAt
        });
        
        // Buscar telefone do usuário para enviar WhatsApp
        const { data: profile } = await supabase
          .from('profiles')
          .select('whatsapp_phone')
          .eq('user_id', authData.user.id)
          .single();
        
        const phone = profile?.whatsapp_phone || '+5511999999999'; // Fallback
        
        // Simular envio de WhatsApp
        await simulateWhatsAppSend(phone, otpCode);
        
        toast({
          title: "Código enviado!",
          description: `Código ${otpCode} enviado para seu WhatsApp.`,
        });
        
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
      
      const userData: any = {
        full_name: fullName,
      };

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

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
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
      setIsOtpVerified(false);
      setPendingOTP(null);
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
      // Revalidar credenciais
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        return { error: authError.message };
      }

      if (authData.session) {
        // Gerar novo OTP
        const otpCode = generateOTPCode();
        const expiresAt = Date.now() + (5 * 60 * 1000);
        
        setPendingOTP({
          email,
          code: otpCode,
          expiresAt
        });
        
        // Buscar telefone
        const { data: profile } = await supabase
          .from('profiles')
          .select('whatsapp_phone')
          .eq('user_id', authData.user.id)
          .single();
        
        const phone = profile?.whatsapp_phone || '+5511999999999';
        
        // Simular envio
        await simulateWhatsAppSend(phone, otpCode);
        
        toast({
          title: "Código reenviado!",
          description: `Novo código ${otpCode} enviado para seu WhatsApp.`,
        });
        
        return { error: null, success: true };
      }
      
      return { error: null, success: true };
    } catch (error: any) {
      return { error: 'Ocorreu um erro inesperado' };
    }
  };

  const verifyOTPLogin = async (email: string, code: string) => {
    try {
      // Verificar se há OTP pendente
      if (!pendingOTP || pendingOTP.email !== email) {
        toast({
          title: "Código não encontrado",
          description: "Solicite um novo código primeiro.",
          variant: "destructive",
        });
        return { error: "Código não encontrado" };
      }

      // Verificar se não expirou
      if (Date.now() > pendingOTP.expiresAt) {
        toast({
          title: "Código expirado",
          description: "Solicite um novo código.",
          variant: "destructive",
        });
        setPendingOTP(null);
        return { error: "Código expirado" };
      }

      // Verificar código
      if (pendingOTP.code !== code) {
        toast({
          title: "Código inválido",
          description: "Verifique o código digitado.",
          variant: "destructive",
        });
        return { error: "Código inválido" };
      }

      // Código válido - marcar como verificado
      setIsOtpVerified(true);
      setPendingOTP(null);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });

      // Redirecionar para admin
      window.location.href = '/admin';
      return { error: null, success: true };

    } catch (error: any) {
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
