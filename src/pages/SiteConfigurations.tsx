import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteConfigurations } from '@/hooks/useSiteConfigurations';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, FileText, Code, Code2 } from 'lucide-react';

export default function SiteConfigurations() {
  const { user } = useAuth();
  const { configuration, isLoading, updateConfiguration } = useSiteConfigurations();
  
  const [adsTxtContent, setAdsTxtContent] = useState(configuration?.ads_txt_content || '');
  const [headerCode, setHeaderCode] = useState(configuration?.header_code || '');
  const [footerCode, setFooterCode] = useState(configuration?.footer_code || '');

  // Update states when configuration is loaded
  if (configuration && !isLoading) {
    if (adsTxtContent !== (configuration.ads_txt_content || '')) {
      setAdsTxtContent(configuration.ads_txt_content || '');
    }
    if (headerCode !== (configuration.header_code || '')) {
      setHeaderCode(configuration.header_code || '');
    }
    if (footerCode !== (configuration.footer_code || '')) {
      setFooterCode(configuration.footer_code || '');
    }
  }

  const handleSave = () => {
    updateConfiguration.mutate({
      ads_txt_content: adsTxtContent,
      header_code: headerCode,
      footer_code: footerCode,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Configurações do Site
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie configurações avançadas do site
              </p>
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

          <Tabs defaultValue="ads-txt" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
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
              disabled={updateConfiguration.isPending}
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateConfiguration.isPending ? 'Salvando...' : 'Salvar Todas as Configurações'}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}