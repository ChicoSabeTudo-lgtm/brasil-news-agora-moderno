import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { MessageCircle } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [whatsappFullName, setWhatsappFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  
  const { signIn, signUp, resetPassword, signInWithWhatsApp, verifyWhatsAppOTP, signUpWithWhatsApp, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReset = searchParams.get('reset') === 'true';

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    if (!error) {
      navigate('/admin');
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
    
    const { error } = await signUp(email, password, fullName);
    if (!error) {
      setEmail('');
      setPassword('');
      setFullName('');
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

  const handleWhatsAppLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formattedPhone = formatPhoneNumber(phone);
    const { error } = await signInWithWhatsApp(formattedPhone);
    
    if (!error) {
      setShowOtpInput(true);
      setIsSignUpMode(false);
    }
    
    setIsLoading(false);
  };

  const handleWhatsAppSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formattedPhone = formatPhoneNumber(phone);
    const { error } = await signUpWithWhatsApp(formattedPhone, whatsappFullName);
    
    if (!error) {
      setShowOtpInput(true);
      setIsSignUpMode(true);
    }
    
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formattedPhone = formatPhoneNumber(phone);
    const { error } = await verifyWhatsAppOTP(formattedPhone, otp);
    
    if (!error) {
      navigate('/admin');
    }
    
    setIsLoading(false);
  };

  const resetWhatsAppForm = () => {
    setPhone('');
    setOtp('');
    setWhatsappFullName('');
    setShowOtpInput(false);
    setIsSignUpMode(false);
  };

  return (
    <div className="min-h-screen bg-background">      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              NEWS<span className="text-foreground">BRASIL</span>
            </CardTitle>
            <CardDescription>
              Acesse sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Email</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
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
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
                
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

              <TabsContent value="whatsapp">
                {!showOtpInput ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-medium">Login via WhatsApp</h3>
                    </div>
                    
                    <Tabs defaultValue="whatsapp-login" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="whatsapp-login">Entrar</TabsTrigger>
                        <TabsTrigger value="whatsapp-signup">Cadastrar</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="whatsapp-login">
                        <form onSubmit={handleWhatsAppLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Número do WhatsApp</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="(11) 99999-9999"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Digite seu número com DDD
                            </p>
                          </div>
                          
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Enviando código...' : 'Enviar código pelo WhatsApp'}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      <TabsContent value="whatsapp-signup">
                        <form onSubmit={handleWhatsAppSignUp} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="whatsapp-name">Nome Completo</Label>
                            <Input
                              id="whatsapp-name"
                              type="text"
                              placeholder="Seu nome completo"
                              value={whatsappFullName}
                              onChange={(e) => setWhatsappFullName(e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="whatsapp-phone">Número do WhatsApp</Label>
                            <Input
                              id="whatsapp-phone"
                              type="tel"
                              placeholder="(11) 99999-9999"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Digite seu número com DDD
                            </p>
                          </div>
                          
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Enviando código...' : 'Criar conta via WhatsApp'}
                          </Button>
                          
                          <p className="text-xs text-muted-foreground text-center">
                            Novos usuários são cadastrados como redatores por padrão.
                          </p>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="text-lg font-medium">Código enviado!</h3>
                      <p className="text-sm text-muted-foreground">
                        Verifique seu WhatsApp e digite o código de 6 dígitos
                      </p>
                      <p className="text-sm font-medium mt-1">{phone}</p>
                    </div>
                    
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
                      
                      <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                        {isLoading ? 'Verificando...' : 'Verificar código'}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full" 
                        onClick={resetWhatsAppForm}
                      >
                        Voltar
                      </Button>
                    </form>
                  </div>
                )}
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
    </div>
  );
}