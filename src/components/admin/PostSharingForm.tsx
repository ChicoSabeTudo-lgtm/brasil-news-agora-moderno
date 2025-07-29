import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteConfigurations } from '@/hooks/useSiteConfigurations';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Download, Calendar, Clock, Facebook, Twitter, MessageCircle, Instagram, Image as ImageIcon, Type, Move, ZoomIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PostData {
  title: string;
  summary: string;
  link: string;
  platforms: string[];
  schedulePost: boolean;
  scheduleDate: string;
  scheduleTime: string;
  backgroundImage: string | null;
  textPosition: { x: number; y: number };
  textZoom: number;
  textSize: 'small' | 'medium' | 'large';
  textAlign: 'left' | 'center' | 'right';
  instagramCaption: string;
  scheduleInstagram: boolean;
  instagramDate: string;
  instagramTime: string;
}

export default function PostSharingForm() {
  const { user } = useAuth();
  const { configuration } = useSiteConfigurations();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState('content');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [postData, setPostData] = useState<PostData>({
    title: '',
    summary: '',
    link: '',
    platforms: [],
    schedulePost: false,
    scheduleDate: '',
    scheduleTime: '',
    backgroundImage: null,
    textPosition: { x: 50, y: 50 },
    textZoom: 100,
    textSize: 'medium',
    textAlign: 'center',
    instagramCaption: '',
    scheduleInstagram: false,
    instagramDate: '',
    instagramTime: '',
  });

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Cache para imagem do mockup
  const [cachedMockupImage, setCachedMockupImage] = useState<HTMLImageElement | null>(null);

  // Função para carregar imagem de forma assíncrona
  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(new Error(`Falha ao carregar imagem: ${src}`));
      img.src = src;
    });
  }, []);

  // Função para desenhar o card básico
  const drawCard = useCallback((canvas: HTMLCanvasElement, cardImg: HTMLImageElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Contexto do canvas não disponível');

    // Desenhar imagem de fundo
    ctx.drawImage(cardImg, 0, 0, canvas.width, canvas.height);
    
    // Configurar texto
    const fontSize = postData.textSize === 'small' ? 48 : postData.textSize === 'medium' ? 72 : 96;
    ctx.font = `bold ${fontSize * (postData.textZoom / 100)}px Arial, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.textAlign = postData.textAlign as CanvasTextAlign;
    
    // Calcular posição
    const x = (postData.textPosition.x / 100) * canvas.width;
    const y = (postData.textPosition.y / 100) * canvas.height;
    
    // Desenhar texto com contorno
    ctx.strokeText(postData.title, x, y);
    ctx.fillText(postData.title, x, y);
  }, [postData.title, postData.textPosition, postData.textZoom, postData.textSize, postData.textAlign]);

  // Cache do mockup quando a URL muda
  useEffect(() => {
    if (configuration?.mockup_image_url) {
      loadImage(configuration.mockup_image_url)
        .then(setCachedMockupImage)
        .catch(error => {
          console.error('Erro ao carregar mockup:', error);
          setCachedMockupImage(null);
        });
    } else {
      setCachedMockupImage(null);
    }
  }, [configuration?.mockup_image_url, loadImage]);

  // Auto-gerar preview quando dados relevantes mudam
  useEffect(() => {
    const generatePreview = async () => {
      if (postData.backgroundImage && postData.title) {
        try {
          await generateImageCanvas();
        } catch (error) {
          console.error('Erro ao gerar preview automaticamente:', error);
        }
      }
    };
    
    // Debounce para evitar muitas chamadas
    const timeoutId = setTimeout(generatePreview, 300);
    return () => clearTimeout(timeoutId);
  }, [postData.backgroundImage, postData.title, postData.textPosition, postData.textZoom, postData.textSize, postData.textAlign]);

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setPostData(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('🔥 Upload iniciado:', file ? `${file.name} (${file.size} bytes)` : 'Nenhum arquivo selecionado');
    
    if (file) {
      console.log('📂 Criando FileReader...');
      const reader = new FileReader();
      
      reader.onload = (event) => {
        console.log('📁 Arquivo lido com sucesso, atualizando estado...');
        const result = event.target?.result as string;
        console.log('📄 Dados do arquivo (primeiros 100 chars):', result.substring(0, 100));
        
        setPostData(prev => {
          const newData = {
            ...prev,
            backgroundImage: result
          };
          console.log('✅ Estado backgroundImage atualizado, tamanho:', result.length);
          return newData;
        });
      };
      
      reader.onerror = (error) => {
        console.error('❌ Erro ao ler arquivo:', error);
      };
      
      console.log('🔄 Iniciando leitura do arquivo...');
      reader.readAsDataURL(file);
    } else {
      console.log('⚠️ Nenhum arquivo foi selecionado');
    }
  };

  const generateImageCanvas = useCallback(async (): Promise<string | null> => {
    if (!postData.backgroundImage || !postData.title) {
      const error = 'Dados insuficientes: imagem de fundo e título são obrigatórios';
      setPreviewError(error);
      return null;
    }

    setIsGeneratingPreview(true);
    setPreviewError(null);

    try {
      // Carregar imagem de fundo
      const cardImg = await loadImage(postData.backgroundImage);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Contexto do canvas não disponível');
      }

      if (cachedMockupImage) {
        // Renderizar com mockup
        canvas.width = cachedMockupImage.width;
        canvas.height = cachedMockupImage.height;
        
        // Desenhar mockup como fundo
        ctx.drawImage(cachedMockupImage, 0, 0);
        
        // Área do card no mockup (ajuste conforme seu mockup)
        const cardAreaX = canvas.width * 0.15;
        const cardAreaY = canvas.height * 0.25;
        const cardAreaWidth = canvas.width * 0.7;
        const cardAreaHeight = cardAreaWidth * (1440/1080);
        
        // Canvas temporário para o card
        const cardCanvas = document.createElement('canvas');
        cardCanvas.width = 1080;
        cardCanvas.height = 1440;
        
        drawCard(cardCanvas, cardImg);
        
        // Desenhar card no mockup
        ctx.drawImage(cardCanvas, cardAreaX, cardAreaY, cardAreaWidth, cardAreaHeight);
      } else {
        // Renderizar sem mockup
        canvas.width = 1080;
        canvas.height = 1440;
        
        drawCard(canvas, cardImg);
      }
      
      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setGeneratedImageUrl(imageUrl);
      return imageUrl;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar imagem';
      console.error('Erro ao gerar canvas:', errorMessage);
      setPreviewError(errorMessage);
      return null;
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [postData.backgroundImage, postData.title, cachedMockupImage, loadImage, drawCard]);

  const downloadImage = async () => {
    try {
      const imageUrl = await generateImageCanvas();
      if (imageUrl) {
        const link = document.createElement('a');
        link.download = `post-${Date.now()}.jpg`;
        link.href = imageUrl;
        link.click();
      }
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

  const sendSocialWebhook = async () => {
    if (!configuration?.webhook_url) {
      toast({
        title: "Erro",
        description: "URL do webhook não configurada. Configure nas configurações do site.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const webhookData = {
        type: 'social_media',
        timestamp: new Date().toISOString(),
        user_id: user?.id,
        content: {
          title: postData.title,
          summary: postData.summary,
          link: postData.link,
          platforms: postData.platforms,
          schedule: postData.schedulePost ? {
            date: postData.scheduleDate,
            time: postData.scheduleTime
          } : null
        }
      };

      const response = await fetch(configuration.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Post das redes sociais enviado com sucesso para o webhook.",
        });
        
        // Reset only social fields
        setPostData(prev => ({
          ...prev,
          title: '',
          summary: '',
          link: '',
          platforms: [],
          schedulePost: false,
          scheduleDate: '',
          scheduleTime: ''
        }));
      } else {
        throw new Error('Erro na resposta do webhook');
      }
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar post. Verifique a configuração do webhook.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendInstagramWebhook = async () => {
    if (!configuration?.webhook_url) {
      toast({
        title: "Erro",
        description: "URL do webhook não configurada. Configure nas configurações do site.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const imageUrl = await generateImageCanvas();
      
      const webhookData = {
        type: 'instagram',
        timestamp: new Date().toISOString(),
        user_id: user?.id,
        content: {
          title: postData.title
        },
        visual: {
          image_url: imageUrl,
          text_position: postData.textPosition,
          text_zoom: postData.textZoom,
          text_size: postData.textSize,
          text_align: postData.textAlign
        },
        instagram: {
          caption: postData.instagramCaption,
          schedule: postData.scheduleInstagram ? {
            date: postData.instagramDate,
            time: postData.instagramTime
          } : null
        }
      };

      const response = await fetch(configuration.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Post do Instagram enviado com sucesso para o webhook.",
        });
        
        // Reset Instagram fields
        setPostData(prev => ({
          ...prev,
          backgroundImage: null,
          textPosition: { x: 50, y: 50 },
          textZoom: 100,
          textSize: 'medium',
          textAlign: 'center',
          instagramCaption: '',
          scheduleInstagram: false,
          instagramDate: '',
          instagramTime: ''
        }));
        setGeneratedImageUrl(null);
      } else {
        throw new Error('Erro na resposta do webhook');
      }
    } catch (error) {
      console.error('Erro ao enviar webhook:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar post do Instagram. Verifique a configuração do webhook.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isContentValid = () => {
    return postData.title.trim() !== '';
  };

  const isInstagramValid = () => {
    return postData.instagramCaption.trim() !== '' && postData.backgroundImage !== null;
  };

  return (
    <ProtectedRoute requiredRole="redator">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Compartilhamento de Posts
              </h1>
              <p className="text-muted-foreground mt-2">
                Crie e compartilhe conteúdo para suas redes sociais
              </p>
            </div>
          </div>

          <Tabs value={currentStep} onValueChange={setCurrentStep} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="content" 
                className="flex items-center gap-2"
              >
                <Type className="w-4 h-4" />
                Conteúdo Principal - WhatsApp, X, Facebook
              </TabsTrigger>
              <TabsTrigger 
                value="instagram" 
                className="flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo Principal - WhatsApp, X, Facebook</CardTitle>
                  <CardDescription>
                    Configure o conteúdo que será compartilhado nas redes sociais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Digite o título do post"
                      value={postData.title}
                      onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Resumo</Label>
                    <Textarea
                      id="summary"
                      placeholder="Digite um resumo opcional do post"
                      value={postData.summary}
                      onChange={(e) => setPostData(prev => ({ ...prev, summary: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link</Label>
                    <Input
                      id="link"
                      type="url"
                      placeholder="https://exemplo.com"
                      value={postData.link}
                      onChange={(e) => setPostData(prev => ({ ...prev, link: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Plataformas</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="facebook"
                          checked={postData.platforms.includes('facebook')}
                          onCheckedChange={(checked) => handlePlatformChange('facebook', checked as boolean)}
                        />
                        <Label htmlFor="facebook" className="flex items-center gap-2">
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="twitter"
                          checked={postData.platforms.includes('twitter')}
                          onCheckedChange={(checked) => handlePlatformChange('twitter', checked as boolean)}
                        />
                        <Label htmlFor="twitter" className="flex items-center gap-2">
                          <Twitter className="w-4 h-4" />
                          X (Twitter)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="whatsapp"
                          checked={postData.platforms.includes('whatsapp')}
                          onCheckedChange={(checked) => handlePlatformChange('whatsapp', checked as boolean)}
                        />
                        <Label htmlFor="whatsapp" className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="schedule"
                        checked={postData.schedulePost}
                        onCheckedChange={(checked) => setPostData(prev => ({ ...prev, schedulePost: checked }))}
                      />
                      <Label htmlFor="schedule" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Agendar postagem
                      </Label>
                    </div>
                  </div>

                  {postData.schedulePost && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="schedule-date">Data</Label>
                        <Input
                          id="schedule-date"
                          type="date"
                          value={postData.scheduleDate}
                          onChange={(e) => setPostData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schedule-time">Hora</Label>
                        <Input
                          id="schedule-time"
                          type="time"
                          value={postData.scheduleTime}
                          onChange={(e) => setPostData(prev => ({ ...prev, scheduleTime: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={sendSocialWebhook}
                      disabled={!postData.title.trim() || !postData.platforms.length || isSubmitting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Enviando...' : 'Enviar para Redes Sociais'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="instagram">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Controles e Formulário */}
                <div className="space-y-6">
                  {/* Card Visual Generator */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Gerador de Cards Visuais</CardTitle>
                      <CardDescription>
                        Configure a aparência do seu card para Instagram
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="background">Imagem de Fundo</Label>
                        <Input
                          id="background"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                        />
                      </div>

                      {postData.backgroundImage && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Posição Horizontal: {postData.textPosition.x}%</Label>
                            <Slider
                              value={[postData.textPosition.x]}
                              onValueChange={(value) => setPostData(prev => ({
                                ...prev,
                                textPosition: { ...prev.textPosition, x: value[0] }
                              }))}
                              max={100}
                              step={1}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Posição Vertical: {postData.textPosition.y}%</Label>
                            <Slider
                              value={[postData.textPosition.y]}
                              onValueChange={(value) => setPostData(prev => ({
                                ...prev,
                                textPosition: { ...prev.textPosition, y: value[0] }
                              }))}
                              max={100}
                              step={1}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Zoom do Texto: {postData.textZoom}%</Label>
                            <Slider
                              value={[postData.textZoom]}
                              onValueChange={(value) => setPostData(prev => ({ ...prev, textZoom: value[0] }))}
                              min={50}
                              max={200}
                              step={10}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Tamanho do Texto</Label>
                            <Select
                              value={postData.textSize}
                              onValueChange={(value: 'small' | 'medium' | 'large') => 
                                setPostData(prev => ({ ...prev, textSize: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Pequeno</SelectItem>
                                <SelectItem value="medium">Médio</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Alinhamento do Texto</Label>
                            <Select
                              value={postData.textAlign}
                              onValueChange={(value: 'left' | 'center' | 'right') => 
                                setPostData(prev => ({ ...prev, textAlign: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="center">Centro</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                           <Button 
                            onClick={generateImageCanvas}
                            className="w-full"
                            variant="outline"
                            disabled={isGeneratingPreview || !postData.backgroundImage || !postData.title}
                          >
                            {isGeneratingPreview ? 'Gerando...' : 'Atualizar Preview'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Instagram Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Finalizar Post do Instagram</CardTitle>
                      <CardDescription>
                        Configure a legenda e agendamento para Instagram
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="caption">Legenda</Label>
                        <Textarea
                          id="caption"
                          placeholder="Digite a legenda para o Instagram..."
                          value={postData.instagramCaption}
                          onChange={(e) => setPostData(prev => ({ ...prev, instagramCaption: e.target.value }))}
                          rows={4}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="schedule-instagram"
                            checked={postData.scheduleInstagram}
                            onCheckedChange={(checked) => setPostData(prev => ({ ...prev, scheduleInstagram: checked }))}
                          />
                          <Label htmlFor="schedule-instagram" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Agendar Post
                          </Label>
                        </div>
                      </div>

                      {postData.scheduleInstagram && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="instagram-date">Data</Label>
                            <Input
                              id="instagram-date"
                              type="date"
                              value={postData.instagramDate}
                              onChange={(e) => setPostData(prev => ({ ...prev, instagramDate: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="instagram-time">Hora</Label>
                            <Input
                              id="instagram-time"
                              type="time"
                              value={postData.instagramTime}
                              onChange={(e) => setPostData(prev => ({ ...prev, instagramTime: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={downloadImage}
                          disabled={!postData.backgroundImage}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          onClick={sendInstagramWebhook}
                          disabled={!postData.instagramCaption.trim() || !postData.backgroundImage || isSubmitting}
                          className="flex-1"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {isSubmitting ? 'Enviando...' : 'Enviar Instagram'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {configuration?.mockup_image_url ? 'Pré-visualização com Mockup' : 'Pré-visualização (1080x1440)'}
                    </CardTitle>
                  </CardHeader>
                   <CardContent>
                     <div className={`${configuration?.mockup_image_url ? 'aspect-[9/16]' : 'aspect-[3/4]'} bg-muted rounded-lg flex items-center justify-center relative overflow-hidden`}>
                       {isGeneratingPreview ? (
                         // Estado de carregamento
                         <div className="text-center text-muted-foreground">
                           <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                           <p>Gerando preview...</p>
                         </div>
                       ) : previewError ? (
                         // Estado de erro
                         <div className="text-center text-destructive">
                           <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                           <p className="text-sm">{previewError}</p>
                           <Button 
                             onClick={generateImageCanvas}
                             variant="outline" 
                             size="sm" 
                             className="mt-2"
                           >
                             Tentar novamente
                           </Button>
                         </div>
                       ) : generatedImageUrl ? (
                         // Imagem final gerada
                         <img
                           src={generatedImageUrl}
                           alt="Preview Final"
                           className="w-full h-full object-contain"
                         />
                       ) : postData.backgroundImage && postData.title ? (
                         // Preview básico (quando não há imagem gerada ainda)
                         !configuration?.mockup_image_url ? (
                           <div className="relative w-full h-full">
                             <img
                               src={postData.backgroundImage}
                               alt="Background"
                               className="w-full h-full object-cover"
                             />
                             <div
                               className="absolute text-white font-bold"
                               style={{
                                 left: `${postData.textPosition.x}%`,
                                 top: `${postData.textPosition.y}%`,
                                 transform: 'translate(-50%, -50%)',
                                 fontSize: `${(postData.textSize === 'small' ? 16 : postData.textSize === 'medium' ? 24 : 32) * (postData.textZoom / 100)}px`,
                                 textAlign: postData.textAlign,
                                 textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                 maxWidth: '90%',
                                 wordWrap: 'break-word'
                               }}
                             >
                               {postData.title}
                             </div>
                           </div>
                         ) : (
                           // Aguardando geração com mockup
                           <div className="text-center text-muted-foreground">
                             <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                             <p>Aguardando geração do preview com mockup...</p>
                           </div>
                         )
                       ) : (
                         // Estado inicial
                         <div className="text-center text-muted-foreground">
                           <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                           <p>Selecione uma imagem de fundo e adicione um título</p>
                         </div>
                       )}
                     </div>
                   </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}