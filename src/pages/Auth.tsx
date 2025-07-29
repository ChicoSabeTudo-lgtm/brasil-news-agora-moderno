import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteLogo } from '@/hooks/useSiteLogo';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { MessageCircle } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, resetPassword, requestOTPLogin, verifyOTPLogin, user } = useAuth();
  const { logoUrl } = useSiteLogo();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReset = searchParams.get('reset') === 'true';

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error, requiresOTP } = await signIn(email, password);
    
    if (requiresOTP) {
      setCurrentEmail(email);
      setShowOtpModal(true);
      setPassword(''); // Clear password for security
    }
    
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error, success } = await verifyOTPLogin(currentEmail, otp);
    
    if (success) {
      setShowOtpModal(false);
      setOtp('');
      setCurrentEmail('');
      // Usuário será redirecionado automaticamente
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    
    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(email, password, fullName, whatsappPhone);
    if (!error) {
      setEmail('');
      setPassword('');
      setFullName('');
      setWhatsappPhone('');
      setConfirmPassword('');
    }
    
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await resetPassword(resetEmail);
    setResetEmail('');
    
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    if (!currentEmail) return;
    
    setIsLoading(true);
    
    // For resend, we need the original password again
    // In a real implementation, you might want to store this temporarily
    // or have a separate resend endpoint that doesn't require password
    setIsLoading(false);
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp('');
    setCurrentEmail('');
  };

  return (
    <div className="min-h-screen bg-background">      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={logoUrl} 
                alt="Logo do site" 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <CardDescription>
              Acesse sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-medium">Login com código WhatsApp</h3>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Enviando código...' : 'Entrar'}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      O código será enviado para seu WhatsApp cadastrado
                    </p>
                  </form>
                </div>
                
                <Separator className="my-4" />
                
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Esqueceu sua senha?
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email para recuperação</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Redefinir Senha'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Nome Completo</Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-phone">WhatsApp</Label>
                    <Input
                      id="whatsapp-phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={whatsappPhone}
                      onChange={(e) => setWhatsappPhone(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Digite seu número com DDD (será usado para o login via código)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Criar Conta'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Novos usuários são cadastrados como redatores por padrão.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Código enviado via WhatsApp
            </DialogTitle>
            <DialogDescription>
              Digite o código de 6 dígitos que você recebeu no WhatsApp
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Código de verificação</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={closeOtpModal}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={handleResendOTP}
                disabled={isLoading}
              >
                Reenviar código
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}