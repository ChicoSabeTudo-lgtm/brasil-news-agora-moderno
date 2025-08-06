import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, ZoomIn, Move, Type, ArrowRight } from 'lucide-react';
import { PostData, ImageState, TextState } from './InstagramPostGenerator';
import { useInstagramMockup } from '@/hooks/useInstagramMockup';

interface InstagramEditorProps {
  onContinue: (data: PostData) => void;
  initialData?: PostData | null;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1440;
const BOTTOM_PADDING = 65;

export default function InstagramEditor({ onContinue, initialData }: InstagramEditorProps) {
  const { mockupUrl } = useInstagramMockup();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
  });

  // Initialize with existing data if provided
  useEffect(() => {
    if (initialData) {
      setImageState(initialData.image);
      setTextState(initialData.text);
    }
  }, [initialData]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw image if exists
    if (imageState.url) {
      const img = new Image();
      img.onload = () => {
        const { zoom, positionX, positionY } = imageState;
        
        // Calculate scaled dimensions
        const scaledWidth = img.width * zoom;
        const scaledHeight = img.height * zoom;
        
        // Calculate position based on percentage
        const x = (CANVAS_WIDTH - scaledWidth) * (positionX / 100);
        const y = (CANVAS_HEIGHT - scaledHeight) * (positionY / 100);
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Draw Instagram mockup first (behind text)
        drawMockupOverlay(ctx);
        
        // Draw text overlay on top
        drawTextOverlay(ctx);
      };
      img.src = imageState.url;
    } else {
      // Draw Instagram mockup first
      drawMockupOverlay(ctx);
      
      // Draw text overlay on top
      drawTextOverlay(ctx);
    }
  }, [imageState, textState, mockupUrl]);

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

  const drawMockupOverlay = (ctx: CanvasRenderingContext2D) => {
    if (!mockupUrl) return;

    const mockupImg = new Image();
    mockupImg.onload = () => {
      // Draw the mockup scaled to cover the full canvas (1080x1440)
      ctx.drawImage(mockupImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Redraw text on top of mockup
      drawTextOverlay(ctx);
    };
    mockupImg.crossOrigin = 'anonymous';
    mockupImg.src = mockupUrl;
  };

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const url = URL.createObjectURL(file);
      setImageState(prev => ({ ...prev, file, url }));
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
                <Label htmlFor="image-upload">Enviar Imagem (JPG/PNG)</Label>
                <Input
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>
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
                <Label htmlFor="font-family">Família da Fonte</Label>
                <Select 
                  value={textState.fontFamily} 
                  onValueChange={(value) => setTextState(prev => ({ ...prev, fontFamily: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                    <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                    <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                    <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                  </SelectContent>
                </Select>
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
            disabled={!isValid}
            className="w-full"
            size="lg"
          >
            Continuar para Finalizar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <Card className="w-fit">
            <CardHeader>
              <CardTitle>Visualização ao Vivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden" style={{ width: '324px', height: '432px' }}>
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
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Tamanho final: 1080x1440px
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}