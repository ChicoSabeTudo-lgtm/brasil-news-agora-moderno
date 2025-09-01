import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, ZoomIn, Move, Type, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { PostData, ImageState, TextState } from './InstagramPostGenerator';
import { useInstagramMockup } from '@/hooks/useInstagramMockup';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InstagramEditorProps {
  onContinue: (data: PostData) => void;
  initialData?: PostData | null;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1440;
const BOTTOM_PADDING = 65;

export default function InstagramEditor({ onContinue, initialData }: InstagramEditorProps) {
  const { mockupUrl, refetchMockup } = useInstagramMockup();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize mockup URL to prevent unnecessary re-renders
  const stableMockupUrl = useMemo(() => mockupUrl, [mockupUrl]);

  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    url: null,
    zoom: 1,
    positionX: 50,
    positionY: 50,
  });

  const [textState, setTextState] = useState<TextState>({
    title: '',
    fontSize: 60,
    verticalPosition: 85,
    alignment: 'center',
    fontFamily: 'Archivo Black, sans-serif',
    color: '#ffffff',
  });

  // Estados para debugging e loading
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isMockupLoading, setIsMockupLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mockupLoadError, setMockupLoadError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Initialize with existing data if provided
  useEffect(() => {
    if (initialData) {
      setImageState(initialData.image);
      setTextState(initialData.text);
    }
  }, [initialData]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      addDebugInfo('Canvas não encontrado');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      addDebugInfo('Contexto 2D não disponível');
      return;
    }

    addDebugInfo('Iniciando renderização do canvas');

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    setIsCanvasReady(false);

    // Draw image if exists
    if (imageState.url) {
      addDebugInfo(`Tentando carregar imagem: ${imageState.url.substring(0, 50)}...`);
      
      const loadImageWithRetry = (attempts = 0) => {
        const img = new Image();
        
        // Configure CORS for object URLs
        img.crossOrigin = 'anonymous';
        
        // Add timeout for image loading
        const timeout = setTimeout(() => {
          addDebugInfo(`Timeout ao carregar imagem (tentativa ${attempts + 1})`);
          if (attempts < 1) {
            addDebugInfo('Tentando novamente...');
            setTimeout(() => loadImageWithRetry(attempts + 1), 500);
          } else {
            addDebugInfo('Falha definitiva no carregamento da imagem');
            setIsCanvasReady(true);
            toast.error('Falha ao carregar imagem após tentativas');
          }
        }, 10000);
        
        img.onload = () => {
          try {
            clearTimeout(timeout);
            const { zoom, positionX, positionY } = imageState;
            
            addDebugInfo(`Imagem carregada: ${img.width}x${img.height}, zoom=${zoom}, pos=(${positionX}%, ${positionY}%)`);
            
            // Calculate scaled dimensions
            const scaledWidth = img.width * zoom;
            const scaledHeight = img.height * zoom;
            
            // Calculate position based on percentage
            const x = (CANVAS_WIDTH - scaledWidth) * (positionX / 100);
            const y = (CANVAS_HEIGHT - scaledHeight) * (positionY / 100);
            
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
            addDebugInfo('Imagem renderizada com sucesso');
            
            // Draw Instagram mockup and text
            drawMockupOverlay(ctx, () => {
              drawTextOverlay(ctx);
              setIsCanvasReady(true);
              addDebugInfo('Canvas pronto com imagem, mockup e texto');
            });
          } catch (error) {
            clearTimeout(timeout);
            addDebugInfo(`Erro ao renderizar imagem: ${error}`);
            setIsCanvasReady(true);
          }
        };
        
        img.onerror = (error) => {
          clearTimeout(timeout);
          addDebugInfo(`Erro ao carregar imagem no canvas (tentativa ${attempts + 1}): ${error}`);
          
          if (attempts < 1) {
            addDebugInfo('Tentando novamente...');
            setTimeout(() => loadImageWithRetry(attempts + 1), 500);
          } else {
            addDebugInfo('Falha definitiva no carregamento da imagem');
            setIsCanvasReady(true);
            toast.error('Erro ao carregar imagem no preview');
          }
        };
        
        // Validate URL before loading
        if (!imageState.url || !imageState.url.startsWith('blob:')) {
          addDebugInfo('URL da imagem inválida');
          setIsCanvasReady(true);
          return;
        }
        
        img.src = imageState.url;
      };
      
      loadImageWithRetry();
    } else {
      addDebugInfo('Renderizando apenas mockup e texto');
      // Draw Instagram mockup and text
      drawMockupOverlay(ctx, () => {
        drawTextOverlay(ctx);
        setIsCanvasReady(true);
        addDebugInfo('Canvas pronto sem imagem');
      });
    }
  }, [imageState.url, imageState.zoom, imageState.positionX, imageState.positionY, textState, stableMockupUrl]);

  const drawTextOverlay = (ctx: CanvasRenderingContext2D) => {
    if (!textState.title.trim()) return;

    const { fontSize, verticalPosition, alignment, fontFamily, color } = textState;
    
    // Semi-transparent overlay for text readability
    const overlayHeight = fontSize + 40;
    const overlayY = (CANVAS_HEIGHT * verticalPosition / 100) - overlayHeight / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, Math.max(0, overlayY), CANVAS_WIDTH, overlayHeight);

    // Text setup - ensure bold weight
    ctx.font = `900 ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';

    // Text alignment
    let textX = CANVAS_WIDTH / 2;
    ctx.textAlign = 'center';
    
    if (alignment === 'left') {
      textX = 40;
      ctx.textAlign = 'left';
    } else if (alignment === 'right') {
      textX = CANVAS_WIDTH - 40;
      ctx.textAlign = 'right';
    }

    // Calculate Y position with bottom padding
    const maxY = CANVAS_HEIGHT - BOTTOM_PADDING;
    const textY = Math.min((CANVAS_HEIGHT * verticalPosition / 100), maxY);

    // Word wrap (convert to uppercase)
    const words = textState.title.toUpperCase().split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxWidth = CANVAS_WIDTH - 80; // 40px padding on each side

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Draw lines
    const lineHeight = fontSize * 1.2;
    const startY = textY - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, index) => {
      const y = Math.min(startY + index * lineHeight, maxY);
      ctx.fillText(line, textX, y);
    });
  };

  const drawMockupOverlay = (ctx: CanvasRenderingContext2D, onComplete?: () => void) => {
    if (!stableMockupUrl) {
      addDebugInfo('Mockup URL não disponível');
      if (onComplete) onComplete();
      return;
    }

    setIsMockupLoading(true);
    setMockupLoadError(null);

    const mockupImg = new Image();
    
    const timeout = setTimeout(() => {
      addDebugInfo('Timeout ao carregar mockup');
      setMockupLoadError('Timeout ao carregar mockup');
      setIsMockupLoading(false);
      if (onComplete) onComplete();
    }, 10000);

    mockupImg.onload = () => {
      try {
        clearTimeout(timeout);
        addDebugInfo('Mockup carregado, aplicando overlay');
        // Draw the mockup scaled to cover the full canvas (1080x1440)
        ctx.drawImage(mockupImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        addDebugInfo('Mockup renderizado');
        setIsMockupLoading(false);
        if (onComplete) onComplete();
      } catch (error) {
        clearTimeout(timeout);
        const errorMsg = `Erro ao renderizar mockup: ${error}`;
        addDebugInfo(errorMsg);
        setMockupLoadError(errorMsg);
        setIsMockupLoading(false);
        if (onComplete) onComplete();
      }
    };
    
    mockupImg.onerror = () => {
      clearTimeout(timeout);
      const errorMsg = 'Erro ao carregar mockup';
      addDebugInfo(errorMsg);
      setMockupLoadError(errorMsg);
      setIsMockupLoading(false);
      if (onComplete) onComplete();
    };
    
    mockupImg.crossOrigin = 'anonymous';
    mockupImg.src = stableMockupUrl;
  };

  // Debounced effect to prevent excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      drawCanvas();
    }, 100);

    return () => clearTimeout(timer);
  }, [drawCanvas]);

  const addDebugInfo = (info: string) => {
    console.log(`🎨 Instagram Editor: ${info}`);
    setDebugInfo(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    addDebugInfo('Iniciando upload de imagem...');
    setIsUploadingImage(true);
    setUploadError(null);

    try {
      // Validações
      if (!file) {
        throw new Error('Nenhum arquivo selecionado');
      }

      addDebugInfo(`Arquivo selecionado: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de arquivo não suportado: ${file.type}. Use JPG, PNG ou WebP.`);
      }

      // Validar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo: 10MB.`);
      }

      // Limpar URL anterior se existir
      if (imageState.url) {
        URL.revokeObjectURL(imageState.url);
        addDebugInfo('URL anterior limpa');
      }

      // Criar nova URL de objeto
      const url = URL.createObjectURL(file);
      addDebugInfo('Nova URL de objeto criada');

      // Validação simplificada - deixar o canvas fazer a validação real
      addDebugInfo('Pré-validação da imagem concluída - processando...');

      // Atualizar estado
      setImageState(prev => ({ ...prev, file, url }));
      addDebugInfo('Estado da imagem atualizado');
      
      toast.success('Imagem carregada com sucesso!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar imagem';
      addDebugInfo(`Erro: ${errorMessage}`);
      setUploadError(errorMessage);
      toast.error(errorMessage);
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const generateCanvasDataUrl = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleContinue = () => {
    const canvasDataUrl = generateCanvasDataUrl();
    if (!canvasDataUrl) return;

    const postData: PostData = {
      image: imageState,
      text: textState,
      canvasDataUrl,
    };

    onContinue(postData);
  };

  const isValid = imageState.url && textState.title.trim();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editor de Posts do Instagram</h1>
        <p className="text-muted-foreground">Passo 1: Crie seu design visual</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Imagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Enviar Imagem (JPG/PNG/WebP)</Label>
                <Input
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                  disabled={isUploadingImage}
                />
                {isUploadingImage && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando imagem...
                  </div>
                )}
                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
                {imageState.url && !uploadError && (
                  <div className="text-sm text-green-600">
                    ✅ Imagem carregada com sucesso
                  </div>
                )}
              </div>

              {/* Debug Information */}
              {debugInfo.length > 0 && (
                <div className="bg-muted p-3 rounded text-xs">
                  <details>
                    <summary className="cursor-pointer font-medium">Debug Info</summary>
                    <div className="mt-2 space-y-1">
                      {debugInfo.map((info, index) => (
                        <div key={index} className="text-muted-foreground">{info}</div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Controls */}
          {imageState.url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZoomIn className="h-5 w-5" />
                  Controles da Imagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Zoom: {imageState.zoom.toFixed(1)}x</Label>
                  <Slider
                    value={[imageState.zoom]}
                    onValueChange={([value]) => setImageState(prev => ({ ...prev, zoom: value }))}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Posição Horizontal: {imageState.positionX}%</Label>
                  <Slider
                    value={[imageState.positionX]}
                    onValueChange={([value]) => setImageState(prev => ({ ...prev, positionX: value }))}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Posição Vertical: {imageState.positionY}%</Label>
                  <Slider
                    value={[imageState.positionY]}
                    onValueChange={([value]) => setImageState(prev => ({ ...prev, positionY: value }))}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Text Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Controles de Texto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título/Texto</Label>
                <Input
                  id="title"
                  value={textState.title}
                  onChange={(e) => setTextState(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite o título do seu post..."
                />
              </div>

              <div>
                <Label>Tamanho da Fonte: {textState.fontSize}px</Label>
                <Slider
                  value={[textState.fontSize]}
                  onValueChange={([value]) => setTextState(prev => ({ ...prev, fontSize: value }))}
                  min={40}
                  max={120}
                  step={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Posição Vertical: {textState.verticalPosition}%</Label>
                <Slider
                  value={[textState.verticalPosition]}
                  onValueChange={([value]) => setTextState(prev => ({ ...prev, verticalPosition: value }))}
                  min={0}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Alinhamento do Texto</Label>
                <RadioGroup
                  value={textState.alignment}
                  onValueChange={(value: 'left' | 'center' | 'right') => 
                    setTextState(prev => ({ ...prev, alignment: value }))
                  }
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="left" />
                    <Label htmlFor="left">Esquerda</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="center" id="center" />
                    <Label htmlFor="center">Centro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="right" />
                    <Label htmlFor="right">Direita</Label>
                  </div>
                </RadioGroup>
              </div>


              <div>
                <Label htmlFor="font-color">Cor da Fonte</Label>
                <Input
                  id="font-color"
                  type="color"
                  value={textState.color}
                  onChange={(e) => setTextState(prev => ({ ...prev, color: e.target.value }))}
                  className="w-20 h-10"
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleContinue}
            disabled={!isValid || isUploadingImage || !isCanvasReady}
            className="w-full"
            size="lg"
          >
            {!isCanvasReady ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparando...
              </>
            ) : (
              <>
                Continuar para Finalizar
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <Card className="w-fit">
            <CardHeader>
              <CardTitle>Visualização ao Vivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden relative" style={{ width: '324px', height: '432px' }}>
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
                {!isCanvasReady && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Carregando preview...</p>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Tamanho final: 1080x1440px
              </p>
              {!mockupUrl && (
                <Alert className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Mockup do Instagram não encontrado. Configure um mockup nas configurações do site.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}