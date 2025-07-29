import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Image as ImageIcon, Download, ZoomIn, Move, Type, AlignLeft, AlignCenter, AlignRight, RotateCcw } from 'lucide-react';
import { useInstagramMockup } from '@/hooks/useInstagramMockup';

interface VisualData {
  title: string;
  backgroundImage: string | null;
  imageZoom: number;
  imagePosition: { x: number; y: number };
  textSize: number;
  textAlign: 'left' | 'center' | 'right';
}

interface InstagramVisualEditorProps {
  onContinue: (data: VisualData & { generatedImageUrl: string }) => void;
}

export default function InstagramVisualEditor({ onContinue }: InstagramVisualEditorProps) {
  const { mockupUrl } = useInstagramMockup();
  const [visualData, setVisualData] = useState<VisualData>({
    title: '',
    backgroundImage: null,
    imageZoom: 100,
    imagePosition: { x: 50, y: 50 },
    textSize: 48,
    textAlign: 'center',
  });

  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    setIsGeneratingPreview(true);
    setPreviewError(null);
    
    try {
      if (!file.type.startsWith('image/')) {
        setPreviewError('Arquivo não é uma imagem');
        return;
      }

      // Usar createObjectURL para preview
      const imageUrl = URL.createObjectURL(file);
      
      // Resetar zoom e posição quando nova imagem é carregada
      setVisualData(prev => ({
        ...prev,
        backgroundImage: imageUrl,
        imageZoom: 100,
        imagePosition: { x: 50, y: 50 }
      }));

    } catch (error) {
      console.error('Erro no upload:', error);
      setPreviewError('Erro ao fazer upload da imagem');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const generateFinalImage = useCallback(async (): Promise<string | null> => {
    if (!visualData.backgroundImage) {
      setPreviewError('Imagem é obrigatória');
      return null;
    }

    setIsGeneratingPreview(true);
    setPreviewError(null);

    try {
      // Carregar imagem
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error('Contexto do canvas não disponível');
            }

            // Configurar canvas para 1080x1440 (Stories Portrait)
            canvas.width = 1080;
            canvas.height = 1440;

            // Preencher fundo preto
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calcular dimensões para object-fit: contain com zoom aplicado
            const canvasAspectRatio = canvas.width / canvas.height;
            const imageAspectRatio = img.width / img.height;
            
            let baseDrawWidth, baseDrawHeight, baseDrawX, baseDrawY;
            
            if (imageAspectRatio > canvasAspectRatio) {
              // Imagem é mais larga - ajustar pela largura
              baseDrawWidth = canvas.width;
              baseDrawHeight = canvas.width / imageAspectRatio;
              baseDrawX = 0;
              baseDrawY = (canvas.height - baseDrawHeight) / 2;
            } else {
              // Imagem é mais alta - ajustar pela altura
              baseDrawHeight = canvas.height;
              baseDrawWidth = canvas.height * imageAspectRatio;
              baseDrawX = (canvas.width - baseDrawWidth) / 2;
              baseDrawY = 0;
            }

            // Aplicar zoom
            const zoomFactor = visualData.imageZoom / 100;
            const drawWidth = baseDrawWidth * zoomFactor;
            const drawHeight = baseDrawHeight * zoomFactor;

            // Aplicar posicionamento
            const offsetX = ((visualData.imagePosition.x - 50) / 100) * canvas.width;
            const offsetY = ((visualData.imagePosition.y - 50) / 100) * canvas.height;
            
            const drawX = baseDrawX + offsetX - (drawWidth - baseDrawWidth) / 2;
            const drawY = baseDrawY + offsetY - (drawHeight - baseDrawHeight) / 2;

            // Desenhar imagem com zoom e posicionamento aplicados
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            
            // Desenhar texto se houver título
            if (visualData.title.trim()) {
              // Configurar texto
              const fontSize = visualData.textSize;
              ctx.font = `bold ${fontSize}px Arial, sans-serif`;
              ctx.fillStyle = '#FFFFFF';
              ctx.strokeStyle = '#000000';
              ctx.lineWidth = 3;
              ctx.textAlign = visualData.textAlign;
              
              // Calcular posição do texto (parte inferior com padding de 50px)
              const textY = canvas.height - 50;
              let textX;
              
              switch (visualData.textAlign) {
                case 'left':
                  textX = 60;
                  break;
                case 'right':
                  textX = canvas.width - 60;
                  break;
                default: // center
                  textX = canvas.width / 2;
                  break;
              }
              
              // Desenhar contorno do texto
              ctx.strokeText(visualData.title, textX, textY);
              // Desenhar texto preenchido
              ctx.fillText(visualData.title, textX, textY);
            }
            
            // Gerar blob e URL
            canvas.toBlob((blob) => {
              if (blob) {
                const imageUrl = URL.createObjectURL(blob);
                resolve(imageUrl);
              } else {
                reject(new Error('Erro ao gerar imagem final'));
              }
            }, 'image/jpeg', 0.9);
            
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = visualData.backgroundImage!;
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar imagem';
      console.error('Erro ao gerar imagem:', errorMessage);
      setPreviewError(errorMessage);
      return null;
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [visualData.backgroundImage, visualData.title, visualData.textSize, visualData.textAlign]);

  const handleContinue = async () => {
    const imageUrl = await generateFinalImage();
    if (imageUrl) {
      onContinue({ ...visualData, generatedImageUrl: imageUrl });
    }
  };

  const handleDownload = async () => {
    const imageUrl = await generateFinalImage();
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `instagram-story-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetTextSettings = () => {
    setVisualData(prev => ({
      ...prev,
      textSize: 48,
      textAlign: 'center'
    }));
  };

  const isValid = visualData.backgroundImage !== null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Editor Visual Instagram
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualização simples da sua imagem no formato Instagram Stories
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
                  Upload da Imagem
                </CardTitle>
                <CardDescription>
                  Faça upload da sua imagem para visualizar no formato Stories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Digite o título que aparecerá na imagem"
                    value={visualData.title}
                    onChange={(e) => setVisualData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background">Imagem *</Label>
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
                    <ZoomIn className="w-5 h-5" />
                    Controles da Imagem
                  </CardTitle>
                  <CardDescription>
                    Ajuste o zoom e posicionamento da imagem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Zoom da Imagem: {visualData.imageZoom}%</Label>
                    <Slider
                      value={[visualData.imageZoom]}
                      onValueChange={(value) => setVisualData(prev => ({ ...prev, imageZoom: value[0] }))}
                      min={10}
                      max={300}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Posição Horizontal: {visualData.imagePosition.x}%</Label>
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
                    <Label>Posição Vertical: {visualData.imagePosition.y}%</Label>
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

            {visualData.title && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Controles de Texto
                  </CardTitle>
                  <CardDescription>
                    Ajuste o tamanho e alinhamento do texto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tamanho da Fonte: {visualData.textSize}px</Label>
                    <Slider
                      value={[visualData.textSize]}
                      onValueChange={(value) => setVisualData(prev => ({ ...prev, textSize: value[0] }))}
                      min={20}
                      max={80}
                      step={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Alinhamento do Texto</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={visualData.textAlign === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVisualData(prev => ({ ...prev, textAlign: 'left' }))}
                        className="flex items-center gap-2"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={visualData.textAlign === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVisualData(prev => ({ ...prev, textAlign: 'center' }))}
                        className="flex items-center gap-2"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={visualData.textAlign === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setVisualData(prev => ({ ...prev, textAlign: 'right' }))}
                        className="flex items-center gap-2"
                      >
                        <AlignRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetTextSettings}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Fonte
                  </Button>
                </CardContent>
              </Card>
            )}

            {isValid && (
              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={isGeneratingPreview}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                
                <Button
                  onClick={handleContinue}
                  disabled={!isValid || isGeneratingPreview}
                  size="lg"
                  className="flex items-center gap-2 flex-1"
                >
                  Continuar Post
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>
                Preview Instagram Stories
              </CardTitle>
              <CardDescription>
                Visualização no formato 1080x1440 com fundo preto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-lg mx-auto">
                <div 
                  className="relative bg-black rounded-lg shadow-inner"
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                      <div className="text-center text-white">
                        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm">Processando...</p>
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {previewError && !isGeneratingPreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <div className="text-center text-red-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm px-4">{previewError}</p>
                      </div>
                    </div>
                  )}

                  {/* Image preview */}
                  {visualData.backgroundImage && !isGeneratingPreview && !previewError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={visualData.backgroundImage}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out"
                        style={{ 
                          imageRendering: 'auto',
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
                  )}

                  {/* Instagram Mockup Overlay */}
                  {mockupUrl && visualData.backgroundImage && !isGeneratingPreview && !previewError && (
                    <div className="absolute inset-0 pointer-events-none">
                      <img
                        src={mockupUrl}
                        alt="Instagram Mockup Overlay"
                        className="w-full h-full object-contain"
                        style={{ 
                          imageRendering: 'auto',
                          zIndex: 10
                        }}
                      />
                    </div>
                  )}

                   {/* Texto sobreposto */}
                   {visualData.title && visualData.backgroundImage && !isGeneratingPreview && !previewError && (
                     <div 
                       className="absolute bottom-0 left-0 right-0 pointer-events-none"
                       style={{
                         paddingBottom: '50px',
                         paddingLeft: '60px',
                         paddingRight: '60px',
                         fontSize: `${(visualData.textSize / 1080) * 100}%`,
                         textAlign: visualData.textAlign,
                         color: 'white',
                         textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                         fontWeight: 'bold',
                         fontFamily: 'Arial, sans-serif',
                         lineHeight: '1.2'
                       }}
                     >
                       {visualData.title}
                     </div>
                   )}

                  {/* Empty state */}
                  {!visualData.backgroundImage && !isGeneratingPreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Faça upload de uma imagem</p>
                        <p className="text-xs text-gray-500">para ver o preview</p>
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