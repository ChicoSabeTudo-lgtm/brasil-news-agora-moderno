import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteConfigurations } from '@/hooks/useSiteConfigurations';
import { useSiteLogo } from '@/hooks/useSiteLogo';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Save, FileText, Code, Code2, Image, Upload, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function SiteConfigurations() {
  const { user } = useAuth();
  const { configuration, isLoading, updateConfiguration } = useSiteConfigurations();
  const { refetchLogo } = useSiteLogo();
  const navigate = useNavigate();
  
  const [adsTxtContent, setAdsTxtContent] = useState('');
  const [headerCode, setHeaderCode] = useState('');
  const [footerCode, setFooterCode] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [socialWebhookUrl, setSocialWebhookUrl] = useState('');
  const [otpWebhookUrl, setOtpWebhookUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [mockupFile, setMockupFile] = useState<File | null>(null);
  const [mockupPreview, setMockupPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Update states when configuration is loaded
  useEffect(() => {
    if (configuration && !isLoading) {
      setAdsTxtContent(configuration.ads_txt_content || '');
      setHeaderCode(configuration.header_code || '');
      setFooterCode(configuration.footer_code || '');
      setWebhookUrl(configuration.webhook_url || '');
      setOtpWebhookUrl(configuration.otp_webhook_url || '');
      setSocialWebhookUrl(configuration.social_webhook_url || '');
      setLogoPreview(configuration.logo_url || null);
      setMockupPreview(configuration.mockup_image_url || null);
    }
  }, [configuration, isLoading]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  const handleMockupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMockupFile(file);
      const preview = URL.createObjectURL(file);
      setMockupPreview(preview);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;

    setIsUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da logo:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da logo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMockup = async () => {
    if (!mockupFile) return null;

    setIsUploading(true);
    try {
      const fileExt = mockupFile.name.split('.').pop();
      const fileName = `instagram-mockup-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, mockupFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do mockup:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do mockup. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    let logoUrl = configuration?.logo_url;
    let mockupUrl = configuration?.mockup_image_url;
    
    if (logoFile) {
      logoUrl = await uploadLogo();
      if (!logoUrl) return; // Se falhou o upload, não continua
    }

    if (mockupFile) {
      mockupUrl = await uploadMockup();
      if (!mockupUrl) return; // Se falhou o upload, não continua
    }

    updateConfiguration.mutate({
      ads_txt_content: adsTxtContent,
      header_code: headerCode,
      footer_code: footerCode,
      webhook_url: webhookUrl,
      otp_webhook_url: otpWebhookUrl,
      social_webhook_url: socialWebhookUrl,
      logo_url: logoUrl,
      mockup_image_url: mockupUrl,
    }, {
      onSuccess: () => {
        // Força atualização da logo após salvar
        setTimeout(() => {
          refetchLogo();
        }, 100);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="sr-only">Carregando...</span>
        </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Painel
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Configurações do Site
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie configurações avançadas do site
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={updateConfiguration.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateConfiguration.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>

          <Tabs defaultValue="logo" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="logo" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Logo
              </TabsTrigger>
              <TabsTrigger value="instagram-mockup" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="webhook-otp" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                OTP
              </TabsTrigger>
              <TabsTrigger value="webhook-social" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Social
              </TabsTrigger>
              <TabsTrigger value="ads-txt" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Ads.txt
              </TabsTrigger>
              <TabsTrigger value="header" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Header
              </TabsTrigger>
              <TabsTrigger value="footer" className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Footer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logo">
              <Card>
                <CardHeader>
                  <CardTitle>Logomarca do Site</CardTitle>
                  <CardDescription>
                    Faça upload da logomarca que aparecerá no header e footer do site.
                    Recomendamos PNG com fundo transparente, altura ideal: 32-40px.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo-upload">Nova Logomarca</Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  
                  {logoPreview && (
                    <div className="space-y-2">
                      <Label>Preview da Logo</Label>
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <img 
                          src={logoPreview} 
                          alt="Preview da logo" 
                          className="h-10 max-w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Dicas para a logo:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Use PNG com fundo transparente</li>
                      <li>Altura recomendada: 32-40px</li>
                      <li>Largura máxima: 200px</li>
                      <li>Certifique-se de que tenha bom contraste</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instagram-mockup">
              <Card>
                <CardHeader>
                  <CardTitle>Mockup do Instagram</CardTitle>
                  <CardDescription>
                    Faça upload da imagem de mockup que será usada como fundo para a pré-visualização 
                    dos cards visuais do Instagram. Esta imagem deve ter o espaço do post em branco ou transparente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mockup-upload">Imagem de Mockup do Feed</Label>
                    <Input
                      id="mockup-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleMockupFileChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  
                  {mockupPreview && (
                    <div className="space-y-2">
                      <Label>Preview do Mockup</Label>
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <img 
                          src={mockupPreview} 
                          alt="Preview do mockup" 
                          className="max-w-full max-h-96 object-contain mx-auto"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Dicas para o mockup:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Use uma imagem de um celular com o Instagram aberto</li>
                      <li>O espaço do post deve estar em branco ou transparente</li>
                      <li>Formato recomendado: PNG com transparência</li>
                      <li>Resolução alta para melhor qualidade na sobreposição</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhook-otp">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook para Login OTP</CardTitle>
                  <CardDescription>
                    Configure a URL do webhook do n8n que receberá os códigos OTP para envio via WhatsApp.
                    Esta URL será chamada quando um usuário solicitar login com código de verificação.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="otp-webhook-url">URL do Webhook OTP</Label>
                    <Input
                      id="otp-webhook-url"
                      type="url"
                      placeholder="https://your-n8n-webhook.com/webhook/otp"
                      value={otpWebhookUrl}
                      onChange={(e) => setOtpWebhookUrl(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Como funciona:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>O sistema enviará uma requisição POST para esta URL quando um usuário solicitar login</li>
                      <li>O payload JSON incluirá: email, user_id, whatsapp_phone, otp_code, timestamp</li>
                      <li>Seu n8n deve buscar o número do usuário e enviar o código via WhatsApp</li>
                      <li>Certifique-se de que a URL está acessível e aceita requisições POST</li>
                    </ul>
                    
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="font-medium mb-2">Exemplo do payload enviado:</p>
                      <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`{
  "email": "usuario@exemplo.com",
  "user_id": "00000000-0000-0000-0000-000000000000",
  "whatsapp_phone": "+5511999999999",
  "otp_code": "123456",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhook-social">
              <Card>
                <CardHeader>
                  <CardTitle>Webhook para Compartilhamento Social</CardTitle>
                  <CardDescription>
                    Configure a URL do webhook do n8n que receberá informações sobre notícias 
                    para compartilhamento automático nas redes sociais.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="social-webhook-url">URL do Webhook Social</Label>
                    <Input
                      id="social-webhook-url"
                      type="url"
                      placeholder="https://your-n8n-webhook.com/webhook/social"
                      value={socialWebhookUrl}
                      onChange={(e) => setSocialWebhookUrl(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Como funciona:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>O sistema enviará uma requisição POST para esta URL quando compartilhamentos forem enviados</li>
                      <li>O payload JSON incluirá: tipo de conteúdo, plataformas selecionadas, dados do conteúdo</li>
                      <li>Seu n8n pode processar essas informações e realizar os compartilhamentos automaticamente</li>
                      <li>Útil para automação de posts no Facebook, Instagram, Twitter, WhatsApp, etc.</li>
                    </ul>
                    
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="font-medium mb-2">Exemplos dos payloads enviados:</p>
                      
                      <p className="font-medium text-sm mb-1">Compartilhamento de Conteúdo Principal:</p>
                      <pre className="text-xs bg-background p-2 rounded border overflow-x-auto mb-3">
{`{
  "type": "social_media",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "user_id": "uuid-do-usuario",
  "platforms": ["facebook", "twitter", "whatsapp"],
  "content": {
    "title": "Título do Post",
    "summary": "Resumo do conteúdo...",
    "link": "https://site.com/link-completo",
    "schedule": {
      "date": "2024-01-16",
      "time": "14:30"
    }
  }
}`}
                      </pre>
                      
                      <p className="font-medium text-sm mb-1">Compartilhamento do Instagram:</p>
                      <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
{`{
  "type": "instagram",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "user_id": "uuid-do-usuario",
  "platforms": ["instagram"],
  "content": {
    "title": "Título da Imagem"
  },
  "visual": {
    "image_url": "blob:url-da-imagem",
    "text_size": 48,
    "text_align": "left",
    "image_zoom": 100,
    "image_position": {"x": 50, "y": 50}
  },
  "instagram": {
    "caption": "Legenda do post no Instagram...",
    "schedule": {
      "date": "2024-01-16",
      "time": "16:00"
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ads-txt">
              <Card>
                <CardHeader>
                  <CardTitle>Arquivo Ads.txt</CardTitle>
                  <CardDescription>
                    Configure o conteúdo do arquivo ads.txt do seu site. 
                    Este arquivo é usado para autorizar vendedores de publicidade.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ads-txt">Conteúdo do Ads.txt</Label>
                    <Textarea
                      id="ads-txt"
                      placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                      value={adsTxtContent}
                      onChange={(e) => setAdsTxtContent(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Exemplo de linha:</p>
                    <code className="bg-muted px-2 py-1 rounded">
                      google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
                    </code>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="header">
              <Card>
                <CardHeader>
                  <CardTitle>Códigos no Header</CardTitle>
                  <CardDescription>
                    Adicione códigos HTML que serão inseridos no &lt;head&gt; de todas as páginas.
                    Útil para analytics, pixels de rastreamento, verificação de domínio, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="header-code">Código HTML para o Header</Label>
                    <Textarea
                      id="header-code"
                      placeholder={`<!-- Google Analytics -->
<script>
  // Seu código aqui
</script>

<!-- Meta tags -->
<meta name="google-site-verification" content="..." />`}
                      value={headerCode}
                      onChange={(e) => setHeaderCode(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Exemplos comuns:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Google Analytics</li>
                      <li>Facebook Pixel</li>
                      <li>Meta tags de verificação</li>
                      <li>Scripts de rastreamento</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="footer">
              <Card>
                <CardHeader>
                  <CardTitle>Códigos no Footer</CardTitle>
                  <CardDescription>
                    Adicione códigos HTML que serão inseridos no final do &lt;body&gt; de todas as páginas.
                    Útil para scripts de publicidade, chat, widgets, etc.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="footer-code">Código HTML para o Footer</Label>
                    <Textarea
                      id="footer-code"
                      placeholder={`<!-- Scripts de publicidade -->
<script>
  // Seu código aqui
</script>

<!-- Widgets -->
<div id="chat-widget"></div>`}
                      value={footerCode}
                      onChange={(e) => setFooterCode(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Exemplos comuns:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Scripts de publicidade</li>
                      <li>Widgets de chat</li>
                      <li>Scripts de remarketing</li>
                      <li>Botões de compartilhamento</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="my-8" />

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={updateConfiguration.isPending || isUploading}
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateConfiguration.isPending || isUploading ? 'Salvando...' : 'Salvar Todas as Configurações'}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
