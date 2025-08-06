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
import { Send, Download, Calendar, Clock, Facebook, Twitter, MessageCircle, Instagram, Image as ImageIcon, Type, Move, ZoomIn, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InstagramPostGenerator from './InstagramPostGenerator';

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

export default function PostSharingForm({ prefilledData, onDataUsed }: { prefilledData?: { title: string; url: string } | null; onDataUsed?: () => void }) {
  const { user } = useAuth();
  const { configuration } = useSiteConfigurations();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState('content');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [postData, setPostData] = useState<PostData>({
    title: prefilledData?.title || '',
    summary: prefilledData?.title || '',
    link: prefilledData?.url || '',
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

  // Effect to handle prefilled data
  useEffect(() => {
    if (prefilledData) {
      setPostData(prev => ({
        ...prev,
        title: prefilledData.title,
        summary: prefilledData.title,
        link: prefilledData.url
      }));
      // Mark data as used
      onDataUsed?.();
    }
  }, [prefilledData, onDataUsed]);

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Cache para imagem do mockup
  const [cachedMockupImage, setCachedMockupImage] = useState<HTMLImageElement | null>(null);

  // Função para carregar imagem de forma assíncrona
  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Permite CORS
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🎯 handleImageUpload chamado');
    const file = e.target.files?.[0];
    
    if (!file) {
      console.log('⚠️ Nenhum arquivo foi selecionado');
      return;
    }

    console.log('🔥 Upload iniciado:', `${file.name} (${file.size} bytes)`);
    setIsGeneratingPreview(true);
    
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        console.error('❌ Arquivo não é uma imagem');
        setIsGeneratingPreview(false);
        return;
      }

      // Converter para base64 de forma síncrona
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('📁 Arquivo lido com sucesso');
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          console.error('❌ Erro ao ler arquivo');
          reject(new Error('Erro ao ler arquivo'));
        };
        reader.readAsDataURL(file);
      });

      console.log('✅ Base64 gerado, tamanho:', base64.length);
      
      // Atualizar estado
      setPostData(prev => {
        const newData = {
          ...prev,
          backgroundImage: base64
        };
        console.log('🗂️ PostData atualizado com nova imagem');
        return newData;
      });

      // Gerar preview imediatamente após upload
      if (postData.title) {
        console.log('🎨 Gerando preview após upload da imagem...');
        setTimeout(() => {
          generateImageCanvas();
        }, 200);
      }

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      setPreviewError('Erro ao fazer upload da imagem');
    } finally {
      setIsGeneratingPreview(false);
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
    if (!configuration?.social_webhook_url) {
      toast({
        title: "Erro",
        description: "URL do webhook social não configurada. Configure nas configurações do site.",
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
        platforms: postData.platforms,
        content: {
          title: postData.title,
          summary: postData.summary,
          link: postData.link,
          schedule: postData.schedulePost ? {
            date: postData.scheduleDate,
            time: postData.scheduleTime
          } : null
        }
      };

      const response = await fetch(configuration.social_webhook_url, {
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
    if (!configuration?.social_webhook_url) {
      toast({
        title: "Erro",
        description: "URL do webhook social não configurada. Configure nas configurações do site.",
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

      const response = await fetch(configuration.social_webhook_url, {
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
                value="instagram-new" 
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
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


            <TabsContent value="instagram-new">
              <InstagramPostGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}