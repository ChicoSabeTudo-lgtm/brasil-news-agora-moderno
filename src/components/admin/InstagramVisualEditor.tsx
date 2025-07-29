import { useState, useEffect, useCallback } from 'react';
import { useSiteConfigurations } from '@/hooks/useSiteConfigurations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Image as ImageIcon, ZoomIn, Move, Type } from 'lucide-react';

interface VisualData {
  title: string;
  backgroundImage: string | null;
  textPosition: { x: number; y: number };
  textZoom: number;
  textSize: 'small' | 'medium' | 'large';
  textAlign: 'left' | 'center' | 'right';
  imageZoom: number;
  imagePosition: { x: number; y: number };
  fillMode: 'fit' | 'fill';
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
    imageZoom: 100,
    imagePosition: { x: 50, y: 50 },
    fillMode: 'fill',
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

    // Configurar canvas para 1080x1440 (Stories Portrait)
    canvas.width = 1080;
    canvas.height = 1440;

    // Preencher fundo preto para letterbox/pillarbox
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calcular escala baseada no modo de preenchimento
    const canvasAspectRatio = canvas.width / canvas.height;
    const imageAspectRatio = cardImg.width / cardImg.height;
    
    let baseScale;
    if (visualData.fillMode === 'fill') {
      // Modo FILL: preencher completamente a área (com crop se necessário)
      if (imageAspectRatio > canvasAspectRatio) {
        // Imagem é mais larga - ajustar pela altura para preencher
        baseScale = canvas.height / cardImg.height;
      } else {
        // Imagem é mais alta - ajustar pela largura para preencher
        baseScale = canvas.width / cardImg.width;
      }
    } else {
      // Modo FIT: manter aspect ratio sem crop
      if (imageAspectRatio > canvasAspectRatio) {
        // Imagem é mais larga - ajustar pela largura
        baseScale = canvas.width / cardImg.width;
      } else {
        // Imagem é mais alta - ajustar pela altura
        baseScale = canvas.height / cardImg.height;
      }
    }

    // Aplicar zoom sobre a escala base
    const imageZoomFactor = visualData.imageZoom / 100;
    const finalScale = baseScale * imageZoomFactor;
    
    // Calcular dimensões finais da imagem
    const imageWidth = cardImg.width * finalScale;
    const imageHeight = cardImg.height * finalScale;
    
    // Calcular posição centralizada com offset do usuário
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Converter posição de porcentagem para pixels (relativo ao canvas)
    const offsetX = ((visualData.imagePosition.x - 50) / 100) * canvas.width;
    const offsetY = ((visualData.imagePosition.y - 50) / 100) * canvas.height;
    
    // Posição final da imagem
    const imageX = centerX - imageWidth / 2 + offsetX;
    const imageY = centerY - imageHeight / 2 + offsetY;

    // Desenhar imagem mantendo aspect ratio
    ctx.drawImage(cardImg, imageX, imageY, imageWidth, imageHeight);
    
    // Configurar texto
    const fontSize = visualData.textSize === 'small' ? 48 : visualData.textSize === 'medium' ? 72 : 96;
    ctx.font = `bold ${fontSize * (visualData.textZoom / 100)}px Arial, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.textAlign = visualData.textAlign as CanvasTextAlign;
    
    // Calcular posição do texto
    const textX = (visualData.textPosition.x / 100) * canvas.width;
    const textY = (visualData.textPosition.y / 100) * canvas.height;
    
    // Desenhar texto com contorno
    ctx.strokeText(visualData.title, textX, textY);
    ctx.fillText(visualData.title, textX, textY);
  }, [visualData.title, visualData.textPosition, visualData.textZoom, visualData.textSize, visualData.textAlign, visualData.imageZoom, visualData.imagePosition, visualData.fillMode]);

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
  }, [visualData.backgroundImage, visualData.title, visualData.textPosition, visualData.textZoom, visualData.textSize, visualData.textAlign, visualData.imageZoom, visualData.imagePosition, visualData.fillMode]);

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
      
      // Resetar zoom e posicionamento para cada novo upload
      setVisualData(prev => ({
        ...prev,
        backgroundImage: imageUrl,
        imageZoom: 100,
        imagePosition: { x: 50, y: 50 },
        fillMode: 'fill'
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
        // Renderizar com mockup mantendo proporção Stories Portrait
        const mockupAspectRatio = cachedMockupImage.width / cachedMockupImage.height;
        const storiesAspectRatio = 1080 / 1440;
        
        if (mockupAspectRatio > storiesAspectRatio) {
          canvas.width = 1080;
          canvas.height = 1080 / mockupAspectRatio;
        } else {
          canvas.height = 1440;
          canvas.width = 1440 * mockupAspectRatio;
        }
        
        // Desenhar mockup como fundo
        ctx.drawImage(cachedMockupImage, 0, 0, canvas.width, canvas.height);
        
        // Área do card no mockup para Stories Portrait (1080x1440)
        const cardAreaX = canvas.width * 0.15;
        const cardAreaY = canvas.height * 0.15;
        const cardAreaWidth = canvas.width * 0.7;
        const cardAreaHeight = cardAreaWidth * (1440/1080); // Proporção Stories Portrait
        
        // Canvas temporário para o card
        const cardCanvas = document.createElement('canvas');
        cardCanvas.width = 1080;
        cardCanvas.height = 1440;
        
        drawCard(cardCanvas, cardImg);
        
        // Desenhar card no mockup
        ctx.drawImage(cardCanvas, cardAreaX, cardAreaY, cardAreaWidth, cardAreaHeight);
      } else {
        // Renderizar sem mockup - formato Stories Portrait
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
                    <ImageIcon className="w-5 h-5" />
                    Controles da Imagem
                  </CardTitle>
                  <CardDescription>
                    Ajuste o zoom e posicionamento da imagem de fundo
                  </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <Label>Modo de Preenchimento</Label>
                     <Select
                       value={visualData.fillMode}
                       onValueChange={(value: 'fit' | 'fill') => 
                         setVisualData(prev => ({ ...prev, fillMode: value }))
                       }
                     >
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="fit">Ajustar (sem crop)</SelectItem>
                         <SelectItem value="fill">Preencher (com crop)</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label>Zoom da Imagem: {visualData.imageZoom}%</Label>
                     <Slider
                       value={[visualData.imageZoom]}
                       onValueChange={(value) => setVisualData(prev => ({ ...prev, imageZoom: value[0] }))}
                       min={10}
                       max={500}
                       step={5}
                     />
                   </div>

                  <div className="space-y-2">
                    <Label>Posição Horizontal da Imagem: {visualData.imagePosition.x}%</Label>
                    <Slider
                      value={[visualData.imagePosition.x]}
                      onValueChange={(value) => setVisualData(prev => ({
                        ...prev,
                        imagePosition: { ...prev.imagePosition, x: value[0] }
                      }))}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Posição Vertical da Imagem: {visualData.imagePosition.y}%</Label>
                    <Slider
                      value={[visualData.imagePosition.y]}
                      onValueChange={(value) => setVisualData(prev => ({
                        ...prev,
                        imagePosition: { ...prev.imagePosition, y: value[0] }
                      }))}
                      max={100}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {visualData.backgroundImage && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Move className="w-5 h-5" />
                    Controles do Texto
                  </CardTitle>
                  <CardDescription>
                    Ajuste a posição e tamanho do texto sobre a imagem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Posição Horizontal do Texto: {visualData.textPosition.x}%</Label>
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
                    <Label>Posição Vertical do Texto: {visualData.textPosition.y}%</Label>
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
              <div className="w-full max-w-lg mx-auto">
                <div 
                  className="relative bg-gray-100 rounded-lg shadow-inner"
                  style={{
                    width: '100%',
                    aspectRatio: '3/4', // 1080x1440 proporção
                    overflow: 'hidden'
                  }}
                >
                  {/* Indicador de dimensões */}
                  <div className="absolute top-2 left-2 z-20 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    1080x1440px
                  </div>

                  {/* Loading state */}
                  {isGeneratingPreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                      <div className="text-center text-gray-600">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm">Gerando preview...</p>
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {previewError && !isGeneratingPreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                      <div className="text-center text-red-600">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm px-4">{previewError}</p>
                        <Button 
                          onClick={generateImageCanvas}
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                        >
                          Tentar novamente
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Generated image */}
                  {generatedImageUrl && !isGeneratingPreview && !previewError && (
                    <div className="absolute inset-0">
                      <img
                        src={generatedImageUrl}
                        alt="Preview Final"
                        className={`w-full h-full ${visualData.fillMode === 'fill' ? 'object-cover' : 'object-contain'}`}
                        style={{ imageRendering: 'auto' }}
                      />
                    </div>
                  )}

                  {/* Live preview (quando não há imagem gerada) */}
                  {!generatedImageUrl && visualData.backgroundImage && visualData.title && !isGeneratingPreview && !previewError && (
                    <div className="absolute inset-0">
                      {/* Fundo preto para letterbox/pillarbox */}
                      <div className="absolute inset-0 bg-black" />
                      
                      {/* Container da imagem com object-contain para nunca fazer crop */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <img
                           src={visualData.backgroundImage}
                           alt="Preview"
                           className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out"
                           style={{
                             transform: `
                               scale(${visualData.imageZoom / 100})
                               translate(
                                 ${((visualData.imagePosition.x - 50) / (visualData.imageZoom / 100)) * 2}%,
                                 ${((visualData.imagePosition.y - 50) / (visualData.imageZoom / 100)) * 2}%
                               )
                             `,
                             transformOrigin: 'center center'
                           }}
                         />
                      </div>

                      {/* Texto sobreposto */}
                      <div
                        className="absolute text-white font-bold z-10 select-none"
                        style={{
                          left: `${visualData.textPosition.x}%`,
                          top: `${visualData.textPosition.y}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${Math.max(8, (visualData.textSize === 'small' ? 12 : visualData.textSize === 'medium' ? 16 : 20) * (visualData.textZoom / 100))}px`,
                          textAlign: visualData.textAlign,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
                          maxWidth: '90%',
                          wordWrap: 'break-word',
                          lineHeight: '1.2',
                          fontWeight: '700'
                        }}
                      >
                        {visualData.title}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {!visualData.backgroundImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Adicione uma imagem e título</p>
                        <p className="text-xs text-gray-400">para ver o preview</p>
                      </div>
                    </div>
                  )}

                  {/* Missing title state */}
                  {visualData.backgroundImage && !visualData.title && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center text-gray-500">
                        <Type className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Adicione um título</p>
                        <p className="text-xs text-gray-400">para ver o preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}