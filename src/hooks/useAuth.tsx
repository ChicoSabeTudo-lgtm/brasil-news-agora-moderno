import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
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
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .single();
              
              if (!error && data) {
                setUserRole(data.role);
              }
            } catch (error) {
              console.error('Error fetching user role:', error);
            }
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta.",
        });
      }
      
      return { error };
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
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
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

      // If user was created and we have a WhatsApp phone, update profile
      if (data.user && whatsappPhone) {
        const formattedPhone = formatPhoneNumber(whatsappPhone);
        
        // Wait a bit for the profile to be created by the trigger
        setTimeout(async () => {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ whatsapp_phone: formattedPhone })
            .eq('user_id', data.user.id);
          
          if (profileError) {
            console.error('Error updating WhatsApp phone:', profileError);
          }
        }, 1000);
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
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, code }
      });

      if (error) {
        const errorMessage = error.message || 'Erro ao verificar código';
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

      if (data?.success) {
        // Set the session from the tokens
        if (data.access_token && data.refresh_token) {
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token
          });
        }
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta.",
        });
        
        // Redirect to admin
        window.location.href = '/admin';
        return { error: null, success: true };
      }

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