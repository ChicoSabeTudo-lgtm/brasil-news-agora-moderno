import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Image as ImageIcon, Download } from 'lucide-react';

interface VisualData {
  title: string;
  backgroundImage: string | null;
}

interface InstagramVisualEditorProps {
  onContinue: (data: VisualData & { generatedImageUrl: string }) => void;
}

export default function InstagramVisualEditor({ onContinue }: InstagramVisualEditorProps) {
  const [visualData, setVisualData] = useState<VisualData>({
    title: '',
    backgroundImage: null,
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
      
      setVisualData(prev => ({
        ...prev,
        backgroundImage: imageUrl
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

            // Calcular dimensões para object-fit: contain
            const canvasAspectRatio = canvas.width / canvas.height;
            const imageAspectRatio = img.width / img.height;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (imageAspectRatio > canvasAspectRatio) {
              // Imagem é mais larga - ajustar pela largura
              drawWidth = canvas.width;
              drawHeight = canvas.width / imageAspectRatio;
              drawX = 0;
              drawY = (canvas.height - drawHeight) / 2;
            } else {
              // Imagem é mais alta - ajustar pela altura
              drawHeight = canvas.height;
              drawWidth = canvas.height * imageAspectRatio;
              drawX = (canvas.width - drawWidth) / 2;
              drawY = 0;
            }

            // Desenhar imagem centralizada
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            
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
  }, [visualData.backgroundImage]);

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
                  <Label htmlFor="title">Título (opcional)</Label>
                  <Input
                    id="title"
                    placeholder="Digite um título para identificar a imagem"
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
                        className="max-w-full max-h-full object-contain"
                        style={{ imageRendering: 'auto' }}
                      />
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