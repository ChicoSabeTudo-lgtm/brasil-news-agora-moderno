import { useState, useEffect, useCallback } from 'react';
import { useSiteConfigurations } from '@/hooks/useSiteConfigurations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Image as ImageIcon, ZoomIn, Move } from 'lucide-react';

interface VisualData {
  title: string;
  backgroundImage: string | null;
  textPosition: { x: number; y: number };
  textZoom: number;
  textSize: 'small' | 'medium' | 'large';
  textAlign: 'left' | 'center' | 'right';
}

interface InstagramVisualEditorProps {
  onContinue: (data: VisualData & { generatedImageUrl: string }) => void;
}

export default function InstagramVisualEditor({ onContinue }: InstagramVisualEditorProps) {
  const { configuration } = useSiteConfigurations();
  
  const [visualData, setVisualData] = useState<VisualData>({
    title: '',
    backgroundImage: null,
    textPosition: { x: 50, y: 50 },
    textZoom: 100,
    textSize: 'medium',
    textAlign: 'center',
  });

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
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
    const fontSize = visualData.textSize === 'small' ? 48 : visualData.textSize === 'medium' ? 72 : 96;
    ctx.font = `bold ${fontSize * (visualData.textZoom / 100)}px Arial, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.textAlign = visualData.textAlign as CanvasTextAlign;
    
    // Calcular posição
    const x = (visualData.textPosition.x / 100) * canvas.width;
    const y = (visualData.textPosition.y / 100) * canvas.height;
    
    // Desenhar texto com contorno
    ctx.strokeText(visualData.title, x, y);
    ctx.fillText(visualData.title, x, y);
  }, [visualData.title, visualData.textPosition, visualData.textZoom, visualData.textSize, visualData.textAlign]);

  // Cache do mockup quando a URL muda
  useEffect(() => {
    if (configuration?.mockup_image_url) {
      // Para URLs do Supabase, usar proxy para evitar CORS
      const proxyUrl = configuration.mockup_image_url.includes('supabase.co') 
        ? configuration.mockup_image_url + '?cache-control=no-cors'
        : configuration.mockup_image_url;
      
      loadImage(proxyUrl)
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
      if (visualData.backgroundImage && visualData.title) {
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
  }, [visualData.backgroundImage, visualData.title, visualData.textPosition, visualData.textZoom, visualData.textSize, visualData.textAlign]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    setIsGeneratingPreview(true);
    
    try {
      if (!file.type.startsWith('image/')) {
        setPreviewError('Arquivo não é uma imagem');
        return;
      }

      // Usar createObjectURL em vez de base64 para evitar problemas de CORS
      const imageUrl = URL.createObjectURL(file);
      
      setVisualData(prev => ({
        ...prev,
        backgroundImage: imageUrl
      }));

      // Gerar preview imediatamente após upload
      if (visualData.title) {
        setTimeout(() => {
          generateImageCanvas();
        }, 200);
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      setPreviewError('Erro ao fazer upload da imagem');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const generateImageCanvas = useCallback(async (): Promise<string | null> => {
    if (!visualData.backgroundImage || !visualData.title) {
      const error = 'Dados insuficientes: imagem de fundo e título são obrigatórios';
      setPreviewError(error);
      return null;
    }

    setIsGeneratingPreview(true);
    setPreviewError(null);

    try {
      // Carregar imagem de fundo - se for blob URL, não precisa de CORS
      const cardImg = await loadImage(visualData.backgroundImage);
      
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
      
      // Usar toBlob para evitar problemas de CORS
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            setGeneratedImageUrl(imageUrl);
            resolve(imageUrl);
          } else {
            setPreviewError('Erro ao gerar imagem final');
            resolve(null);
          }
        }, 'image/jpeg', 0.9);
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar imagem';
      console.error('Erro ao gerar canvas:', errorMessage);
      setPreviewError(errorMessage);
      return null;
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [visualData.backgroundImage, visualData.title, cachedMockupImage, loadImage, drawCard]);

  const handleContinue = async () => {
    if (!generatedImageUrl) {
      const imageUrl = await generateImageCanvas();
      if (imageUrl) {
        onContinue({ ...visualData, generatedImageUrl: imageUrl });
      }
    } else {
      onContinue({ ...visualData, generatedImageUrl });
    }
  };

  const isValid = visualData.backgroundImage && visualData.title.trim() !== '';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Editor Visual Instagram
            </h1>
            <p className="text-muted-foreground mt-2">
              Primeira etapa: Configure a aparência visual do seu post
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controles */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Upload e Overlay
                </CardTitle>
                <CardDescription>
                  Faça upload da imagem e ela receberá automaticamente o overlay configurado pelo admin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Digite o título que aparecerá sobre a imagem"
                    value={visualData.title}
                    onChange={(e) => setVisualData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background">Imagem de Fundo *</Label>
                  <Input
                    id="background"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            {visualData.backgroundImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Move className="w-5 h-5" />
                    Controles de Posicionamento
                  </CardTitle>
                  <CardDescription>
                    Ajuste a posição e tamanho do texto sobre a imagem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Posição Horizontal: {visualData.textPosition.x}%</Label>
                    <Slider
                      value={[visualData.textPosition.x]}
                      onValueChange={(value) => setVisualData(prev => ({
                        ...prev,
                        textPosition: { ...prev.textPosition, x: value[0] }
                      }))}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Posição Vertical: {visualData.textPosition.y}%</Label>
                    <Slider
                      value={[visualData.textPosition.y]}
                      onValueChange={(value) => setVisualData(prev => ({
                        ...prev,
                        textPosition: { ...prev.textPosition, y: value[0] }
                      }))}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ZoomIn className="w-4 h-4" />
                      Zoom do Texto: {visualData.textZoom}%
                    </Label>
                    <Slider
                      value={[visualData.textZoom]}
                      onValueChange={(value) => setVisualData(prev => ({ ...prev, textZoom: value[0] }))}
                      min={50}
                      max={200}
                      step={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tamanho do Texto</Label>
                    <Select
                      value={visualData.textSize}
                      onValueChange={(value: 'small' | 'medium' | 'large') => 
                        setVisualData(prev => ({ ...prev, textSize: value }))
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
                      value={visualData.textAlign}
                      onValueChange={(value: 'left' | 'center' | 'right') => 
                        setVisualData(prev => ({ ...prev, textAlign: value }))
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
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleContinue}
                disabled={!isValid || isGeneratingPreview}
                size="lg"
                className="flex items-center gap-2"
              >
                Continuar Post
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>
                Pré-visualização ao Vivo
              </CardTitle>
              <CardDescription>
                Veja como ficará o layout final em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${configuration?.mockup_image_url ? 'aspect-[9/16]' : 'aspect-[3/4]'} bg-muted rounded-lg flex items-center justify-center relative overflow-hidden`}>
                {isGeneratingPreview ? (
                  <div className="text-center text-muted-foreground">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Gerando preview...</p>
                  </div>
                ) : previewError ? (
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
                  <img
                    src={generatedImageUrl}
                    alt="Preview Final"
                    className="w-full h-full object-contain"
                  />
                ) : visualData.backgroundImage && visualData.title ? (
                  !configuration?.mockup_image_url ? (
                    <div className="relative w-full h-full">
                      <img
                        src={visualData.backgroundImage}
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute text-white font-bold"
                        style={{
                          left: `${visualData.textPosition.x}%`,
                          top: `${visualData.textPosition.y}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${(visualData.textSize === 'small' ? 16 : visualData.textSize === 'medium' ? 24 : 32) * (visualData.textZoom / 100)}px`,
                          textAlign: visualData.textAlign,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                          maxWidth: '90%',
                          wordWrap: 'break-word'
                        }}
                      >
                        {visualData.title}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>Preview será gerado automaticamente...</p>
                    </div>
                  )
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>Adicione uma imagem e título para ver o preview</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}