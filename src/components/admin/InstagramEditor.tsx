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
  const fontRedrawRequestedRef = useRef(false);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const mockupImgRef = useRef<HTMLImageElement | null>(null);

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

  // Função para melhorar qualidade da imagem
  const enhanceImageQuality = (img: HTMLImageElement): string => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return img.src;

    // Usar dimensões da imagem original
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;

    // Desenhar imagem original
    tempCtx.drawImage(img, 0, 0);

    // Aplicar apenas sharpening (sem ajustes de contraste/brilho)
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const sharpenedData = applySharpen(imageData);
    tempCtx.putImageData(sharpenedData, 0, 0);

    // Converter para JPEG de alta qualidade
    return tempCanvas.toDataURL('image/jpeg', 0.95);
  };

  const applySharpen = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new ImageData(width, height);
    const outputData = output.data;

    // Kernel de nitidez
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB apenas
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              sum += data[idx] * kernel[kernelIdx];
            }
          }
          const outputIdx = (y * width + x) * 4 + c;
          outputData[outputIdx] = Math.min(255, Math.max(0, sum));
        }
        // Copiar alpha
        const alphaIdx = (y * width + x) * 4 + 3;
        outputData[alphaIdx] = data[alphaIdx];
      }
    }

    return output;
  };

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

    addDebugInfo('Renderização do canvas (cache-aware)');

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    setIsCanvasReady(false);

    // Draw base image from cache if available
    if (imageState.url && baseImgRef.current) {
      const img = baseImgRef.current;
      const { zoom, positionX, positionY } = imageState;
      const scaledWidth = img.width * zoom;
      const scaledHeight = img.height * zoom;
      const x = (CANVAS_WIDTH - scaledWidth) * (positionX / 100);
      const y = (CANVAS_HEIGHT - scaledHeight) * (positionY / 100);
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      addDebugInfo('Imagem base (cache) renderizada');
    } else if (imageState.url && !baseImgRef.current) {
      // Lazy-load once if needed
      const img = new Image();
      if (!imageState.url.startsWith('blob:') && !imageState.url.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        baseImgRef.current = img;
        addDebugInfo('Imagem base carregada (lazy)');
        drawCanvas();
      };
      img.onerror = () => {
        addDebugInfo('Falha ao carregar imagem base (lazy)');
      };
      img.src = imageState.url;
    }

    // Draw mockup and text synchronously when available
    drawMockupOverlay(ctx);
    drawTextOverlay(ctx);
    setIsCanvasReady(true);
    addDebugInfo('Canvas pronto (sem recarregar imagens)');
  }, [imageState.url, imageState.zoom, imageState.positionX, imageState.positionY, textState, stableMockupUrl]);

  const drawTextOverlay = (ctx: CanvasRenderingContext2D) => {
    if (!textState.title.trim()) return;

    const { fontSize, verticalPosition, alignment, fontFamily, color } = textState;
    
    // Check if font is loaded, but don't trigger infinite redraws
    if (document.fonts && !document.fonts.check(`normal ${fontSize}px "Archivo Black"`)) {
      addDebugInfo('Fonte Archivo Black ainda não carregada, usando fallback');
      // Only request one redraw after fonts are ready
      if (!fontRedrawRequestedRef.current) {
        fontRedrawRequestedRef.current = true;
        document.fonts.ready.then(() => {
          addDebugInfo('Fontes carregadas');
          fontRedrawRequestedRef.current = false;
          // Trigger single redraw without causing loop
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
              context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
              context.fillStyle = '#000000';
              context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
              
              if (imageState.url && baseImgRef.current) {
                const img = baseImgRef.current;
                const { zoom, positionX, positionY } = imageState;
                const scaledWidth = img.width * zoom;
                const scaledHeight = img.height * zoom;
                const x = (CANVAS_WIDTH - scaledWidth) * (positionX / 100);
                const y = (CANVAS_HEIGHT - scaledHeight) * (positionY / 100);
                context.drawImage(img, x, y, scaledWidth, scaledHeight);
              }
              
              drawMockupOverlay(context);
              drawTextOverlay(context);
            }
          }
        });
      }
      // Continue drawing with fallback font
    }
    
    // Semi-transparent overlay for text readability
    const overlayHeight = fontSize + 40;
    const overlayY = (CANVAS_HEIGHT * verticalPosition / 100) - overlayHeight / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, Math.max(0, overlayY), CANVAS_WIDTH, overlayHeight);

    // Text setup - ensure Archivo Black is used with fallback
    const fontString = `normal ${fontSize}px "Archivo Black", "Arial Black", sans-serif`;
    ctx.font = fontString;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    
    addDebugInfo(`Aplicando fonte: ${fontString}`);

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

  const drawMockupOverlay = (ctx: CanvasRenderingContext2D) => {
    if (!mockupImgRef.current) {
      if (!stableMockupUrl) addDebugInfo('Mockup URL não disponível');
      return;
    }
    ctx.drawImage(mockupImgRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  // Debounced effect to prevent excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      drawCanvas();
    }, 100);

    return () => clearTimeout(timer);
  }, [drawCanvas]);

  // Preload mockup once when URL changes
  useEffect(() => {
    if (!stableMockupUrl) {
      mockupImgRef.current = null;
      return;
    }
    setIsMockupLoading(true);
    setMockupLoadError(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const url = stableMockupUrl;
    img.onload = () => {
      if (stableMockupUrl !== url) return; // URL changed meanwhile
      mockupImgRef.current = img;
      setIsMockupLoading(false);
      addDebugInfo('Mockup pré-carregado em cache');
      // Trigger canvas redraw by updating a counter instead of calling drawCanvas directly
      setIsCanvasReady(prev => !prev);
    };
    img.onerror = () => {
      if (stableMockupUrl !== url) return;
      setIsMockupLoading(false);
      setMockupLoadError('Erro ao carregar mockup');
      mockupImgRef.current = null;
      addDebugInfo('Falha ao pré-carregar mockup');
    };
    img.src = url;
  }, [stableMockupUrl]);

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
      if (imageState.url && imageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageState.url);
        addDebugInfo('URL anterior limpa');
      }

      // Usar FileReader para converter para DataURL (evita problemas de CORS)
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          addDebugInfo('Imagem convertida para DataURL com sucesso');
          
          // Pré-validação da imagem
          const tempImg = new Image();
          tempImg.onload = () => {
            addDebugInfo(`Pré-validação concluída: ${tempImg.width}x${tempImg.height}`);
            
            // Processar imagem para melhorar qualidade
            const processedDataUrl = enhanceImageQuality(tempImg);
            addDebugInfo('Imagem processada para melhor qualidade');
            
            // Criar nova imagem com versão processada
            const enhancedImg = new Image();
            enhancedImg.onload = () => {
              // Atualizar estado com imagem processada
              setImageState(prev => ({ ...prev, file, url: processedDataUrl }));
              baseImgRef.current = enhancedImg;
              addDebugInfo('Estado da imagem atualizado com versão melhorada');
              
              toast.success('Imagem carregada e otimizada com sucesso!');
              drawCanvas();
            };
            
            enhancedImg.onerror = () => {
              addDebugInfo('Erro ao carregar imagem processada, usando original');
              // Fallback para imagem original
              setImageState(prev => ({ ...prev, file, url: dataUrl }));
              baseImgRef.current = tempImg;
              toast.success('Imagem carregada com sucesso!');
              drawCanvas();
            };
            
            enhancedImg.src = processedDataUrl;
          };
          
          tempImg.onerror = () => {
            addDebugInfo('Erro na pré-validação da imagem');
            setUploadError('Erro ao carregar a imagem. Tente outro arquivo.');
            toast.error('Erro ao carregar a imagem. Tente outro arquivo.');
          };
          
          tempImg.src = dataUrl;
        }
      };
      
      reader.onerror = () => {
        addDebugInfo('Erro ao ler arquivo com FileReader');
        setUploadError('Erro ao processar a imagem.');
        toast.error('Erro ao processar a imagem.');
      };
      
      addDebugInfo('Iniciando conversão com FileReader...');
      reader.readAsDataURL(file);

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
