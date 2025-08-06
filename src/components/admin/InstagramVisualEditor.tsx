import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Image as ImageIcon, Download, ZoomIn, Move, Type, AlignLeft, AlignCenter, AlignRight, RotateCcw } from 'lucide-react';
import { useInstagramMockup } from '@/hooks/useInstagramMockup';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface VisualData {
  title: string;
  backgroundImage: string | null;
  imageZoom: number;
  imagePosition: { x: number; y: number };
  textSize: number;
  textAlign: 'left' | 'center' | 'right';
  textPosition: { y: number };
  generatedImageUrl: string;
}

interface InstagramVisualEditorProps {
  onContinue: (data: VisualData) => void;
  initialData?: VisualData | null;
}

export default function InstagramVisualEditor({ onContinue, initialData }: InstagramVisualEditorProps) {
  const { user } = useAuth();
  const { mockupUrl } = useInstagramMockup();
  
  const [visualData, setVisualData] = useState<VisualData>({
    title: initialData?.title || '',
    backgroundImage: initialData?.backgroundImage || null,
    imageZoom: initialData?.imageZoom || 100,
    imagePosition: initialData?.imagePosition || { x: 0, y: 0 },
    textSize: initialData?.textSize || 36,
    textAlign: initialData?.textAlign || 'center',
    textPosition: initialData?.textPosition || { y: 85 },
    generatedImageUrl: initialData?.generatedImageUrl || ''
  });

  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 Novo arquivo selecionado:', file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setVisualData(prev => ({ 
          ...prev, 
          backgroundImage: imageUrl,
          imageZoom: 100,
          imagePosition: { x: 0, y: 0 }
        }));
        setPreviewError(null);
        console.log('✅ Imagem carregada no estado');
      };
      reader.readAsDataURL(file);
    }
  };

  const generateFinalImageBlob = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!visualData.backgroundImage) {
        console.error('❌ Nenhuma imagem de fundo disponível');
        resolve(null);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('❌ Não foi possível obter contexto do canvas');
        resolve(null);
        return;
      }

      // Definir dimensões do Instagram Stories
      canvas.width = 1080;
      canvas.height = 1920;
      
      console.log('🎨 Iniciando geração da imagem final...');

      const backgroundImg = new Image();
      backgroundImg.crossOrigin = 'anonymous';
      
      backgroundImg.onload = () => {
        // Calcular dimensões da imagem com zoom
        const scale = visualData.imageZoom / 100;
        const scaledWidth = backgroundImg.width * scale;
        const scaledHeight = backgroundImg.height * scale;
        
        // Calcular posição da imagem
        const imageX = (canvas.width - scaledWidth) / 2 + (visualData.imagePosition.x * canvas.width / 100);
        const imageY = (canvas.height - scaledHeight) / 2 + (visualData.imagePosition.y * canvas.height / 100);
        
        // Desenhar imagem de fundo
        ctx.drawImage(backgroundImg, imageX, imageY, scaledWidth, scaledHeight);
        
        console.log('✅ Imagem de fundo desenhada');

        // Carregar e aplicar mockup se disponível
        if (mockupUrl) {
          const mockupImg = new Image();
          mockupImg.crossOrigin = 'anonymous';
          
          mockupImg.onload = () => {
            ctx.drawImage(mockupImg, 0, 0, canvas.width, canvas.height);
            console.log('✅ Mockup aplicado');
            
            // Aplicar texto após mockup
            applyTextToCanvas();
          };
          
          mockupImg.onerror = () => {
            console.warn('⚠️ Erro ao carregar mockup, continuando sem ele');
            applyTextToCanvas();
          };
          
          mockupImg.src = mockupUrl;
        } else {
          console.log('ℹ️ Nenhum mockup disponível, aplicando apenas texto');
          applyTextToCanvas();
        }

        function applyTextToCanvas() {
          if (visualData.title.trim()) {
            console.log('🔤 Aplicando texto à imagem...');
            
            // Configurar fonte exatamente como configurado
            const fontSize = visualData.textSize;
            ctx.font = `900 ${fontSize}px 'Archivo Black', sans-serif`;
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.textAlign = visualData.textAlign;
            
            // Calcular posição Y baseada na configuração
            const textYPercent = visualData.textPosition.y;
            const textY = (canvas.height * textYPercent) / 100;
            
            // Configurar posição X baseada no alinhamento
            const paddingHorizontal = canvas.width * 0.05; // 5% padding lateral
            let textX;
            
            switch (visualData.textAlign) {
              case 'left':
                textX = paddingHorizontal;
                break;
              case 'right':
                textX = canvas.width - paddingHorizontal;
                break;
              default: // center
                textX = canvas.width / 2;
                break;
            }
            
            // Quebrar texto em linhas se necessário
            const maxWidth = canvas.width - (paddingHorizontal * 2);
            const words = visualData.title.toUpperCase().split(' ');
            const lines: string[] = [];
            let currentLine = '';
            
            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const metrics = ctx.measureText(testLine);
              
              if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }
            
            if (currentLine) {
              lines.push(currentLine);
            }
            
            // Desenhar linhas de texto
            const lineHeight = fontSize * 1.2;
            const totalHeight = (lines.length - 1) * lineHeight;
            
            lines.forEach((line, index) => {
              const lineY = textY - totalHeight + (index * lineHeight);
              
              console.log(`📝 Desenhando linha ${index + 1}: "${line}" em Y=${lineY}`);
              
              // Contorno do texto
              ctx.strokeText(line, textX, lineY);
              // Texto preenchido
              ctx.fillText(line, textX, lineY);
            });
            
            console.log('✅ Texto aplicado com sucesso:', {
              tamanho: fontSize,
              posicao: { x: textX, y: textY },
              alinhamento: visualData.textAlign,
              linhas: lines.length
            });
          }
          
          // Gerar blob final
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('✅ Imagem final gerada com sucesso');
              resolve(blob);
            } else {
              console.error('❌ Erro ao gerar blob da imagem');
              resolve(null);
            }
          }, 'image/jpeg', 0.9);
        }
      };
      
      backgroundImg.onerror = () => {
        console.error('❌ Erro ao carregar imagem de fundo');
        resolve(null);
      };
      
      backgroundImg.src = visualData.backgroundImage;
    });
  }, [visualData, mockupUrl]);

  const uploadImageToSupabase = async (imageBlob: Blob): Promise<string | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const fileName = `instagram-${Date.now()}.jpg`;
      
      console.log('📤 Iniciando upload para Supabase...');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        toast.error('Erro ao fazer upload da imagem');
        return null;
      }

      console.log('✅ Upload realizado:', uploadData.path);

      const { data: urlData } = supabase.storage
        .from('news-images')
        .getPublicUrl(uploadData.path);

      const imageUrl = urlData.publicUrl;
      console.log('✅ URL pública obtida:', imageUrl);

      // Salvar metadados na tabela
      const { error: dbError } = await supabase
        .from('instagram_images')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          title: visualData.title,
          text_size: visualData.textSize,
          text_align: visualData.textAlign,
          text_position_y: visualData.textPosition.y,
          image_zoom: visualData.imageZoom,
          image_position_x: visualData.imagePosition.x,
          image_position_y: visualData.imagePosition.y
        });

      if (dbError) {
        console.error('❌ Erro ao salvar metadados:', dbError);
        toast.error('Erro ao salvar informações da imagem');
        return null;
      }

      console.log('✅ Metadados salvos com sucesso');
      toast.success('Imagem gerada e salva com sucesso!');
      
      return imageUrl;

    } catch (error) {
      console.error('❌ Erro inesperado no upload:', error);
      toast.error('Erro inesperado ao processar imagem');
      return null;
    }
  };

  const generateFinalImage = async () => {
    const blob = await generateFinalImageBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      return url;
    }
    return null;
  };

  const handleContinue = async () => {
    if (!visualData.backgroundImage || !visualData.title.trim()) {
      toast.error('Por favor, adicione uma imagem e um título');
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('🚀 Iniciando processo de finalização...');
      
      // Gerar imagem final
      const imageBlob = await generateFinalImageBlob();
      
      if (!imageBlob) {
        toast.error('Erro ao gerar imagem final');
        return;
      }

      // Upload para Supabase
      const uploadedUrl = await uploadImageToSupabase(imageBlob);
      
      if (!uploadedUrl) {
        return; // Erro já mostrado na função de upload
      }

      // Continuar para próxima etapa
      onContinue({
        ...visualData,
        generatedImageUrl: uploadedUrl
      });

    } catch (error) {
      console.error('❌ Erro no processo de finalização:', error);
      toast.error('Erro ao processar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!visualData.backgroundImage || !visualData.title.trim()) {
      toast.error('Por favor, adicione uma imagem e um título');
      return;
    }

    const imageUrl = await generateFinalImage();
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `instagram-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(imageUrl);
      toast.success('Download iniciado!');
    }
  };

  const isValid = visualData.backgroundImage && visualData.title.trim();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Editor Visual Instagram
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure sua imagem no formato Instagram Stories
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
                      min={-100}
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
                      min={-100}
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
                    Configuração de Texto
                  </CardTitle>
                  <CardDescription>
                    Configure o tamanho, posição e alinhamento do texto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Tamanho da Fonte: {visualData.textSize}px</Label>
                    <Slider
                      value={[visualData.textSize]}
                      onValueChange={(value) => {
                        console.log('🎯 Alterando tamanho da fonte:', value[0]);
                        setVisualData(prev => ({ ...prev, textSize: value[0] }));
                      }}
                      min={16}
                      max={72}
                      step={2}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      Controla o tamanho real da fonte na imagem final
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Posição Vertical</Label>
                    <Slider
                      value={[visualData.textPosition.y]}
                      onValueChange={(value) => {
                        console.log('📍 Alterando posição Y:', value[0]);
                        setVisualData(prev => ({ 
                          ...prev, 
                          textPosition: { y: value[0] } 
                        }));
                      }}
                      min={10}
                      max={90}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground">
                      {visualData.textPosition.y}% da altura da imagem (de cima para baixo)
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Alinhamento Horizontal</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={visualData.textAlign === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          console.log('🔄 Alterando alinhamento para: esquerda');
                          setVisualData(prev => ({ ...prev, textAlign: 'left' }));
                        }}
                        className="flex items-center gap-2 flex-1"
                      >
                        <AlignLeft className="w-4 h-4" />
                        Esquerda
                      </Button>
                      <Button
                        type="button"
                        variant={visualData.textAlign === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          console.log('🔄 Alterando alinhamento para: centro');
                          setVisualData(prev => ({ ...prev, textAlign: 'center' }));
                        }}
                        className="flex items-center gap-2 flex-1"
                      >
                        <AlignCenter className="w-4 h-4" />
                        Centro
                      </Button>
                      <Button
                        type="button"
                        variant={visualData.textAlign === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          console.log('🔄 Alterando alinhamento para: direita');
                          setVisualData(prev => ({ ...prev, textAlign: 'right' }));
                        }}
                        className="flex items-center gap-2 flex-1"
                      >
                        <AlignRight className="w-4 h-4" />
                        Direita
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('🔄 Resetando configurações de texto');
                      setVisualData(prev => ({ 
                        ...prev, 
                        textSize: 36,
                        textAlign: 'center',
                        textPosition: { y: 85 }
                      }));
                    }}
                    className="flex items-center gap-2 w-full"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resetar Configurações
                  </Button>
                </CardContent>
              </Card>
            )}

            {isValid && (
              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex items-center gap-2 flex-1"
                  disabled={isUploading}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                
                <Button
                  onClick={handleContinue}
                  className="flex items-center gap-2 flex-1"
                  disabled={isUploading}
                >
                  <ArrowRight className="w-4 h-4" />
                  {isUploading ? 'Processando...' : 'Continuar'}
                </Button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle>Preview Instagram Stories</CardTitle>
                <CardDescription>
                  Visualização em tempo real da sua imagem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full max-w-[300px] mx-auto">
                  <div 
                    className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl"
                    style={{ 
                      aspectRatio: '9/16',
                      height: 'clamp(400px, 60vh, 600px)'
                    }}
                  >
                    {!visualData.backgroundImage && (
                      <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
                        Adicione uma imagem para ver o preview
                      </div>
                    )}
                    
                    {visualData.backgroundImage && (
                      <>
                        <img
                          src={visualData.backgroundImage}
                          alt="Background"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            transform: `scale(${visualData.imageZoom / 100}) translate(${visualData.imagePosition.x}%, ${visualData.imagePosition.y}%)`,
                            transformOrigin: 'center center'
                          }}
                        />
                        
                        {mockupUrl && (
                          <img
                            src={mockupUrl}
                            alt="Instagram Mockup"
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                          />
                        )}
                        
                        {visualData.title && (
                          <div 
                            className="absolute left-0 right-0 pointer-events-none text-white px-4"
                            style={{
                              top: `${visualData.textPosition.y}%`,
                              fontSize: `${Math.max(12, visualData.textSize * 0.3)}px`,
                              textAlign: visualData.textAlign,
                              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                              fontWeight: '900',
                              fontFamily: "'Archivo Black', sans-serif",
                              lineHeight: '1.2',
                              textTransform: 'uppercase',
                              transform: 'translateY(-50%)'
                            }}
                          >
                            {visualData.title}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}