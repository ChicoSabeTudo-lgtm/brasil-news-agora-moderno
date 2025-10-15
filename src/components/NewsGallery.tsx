import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { optimizeImage, formatBytes } from '@/utils/imageOptimizer';
import { validateFileUpload } from '@/utils/inputValidator';
import { securityLogger, SecurityEventType } from '@/utils/securityLogger';
import {
  Upload,
  X,
  Star,
  StarOff,
  GripVertical,
  RotateCcw,
  RotateCw,
  ImageIcon,
  Loader2
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NewsImage {
  id?: string;
  news_id?: string;
  image_url: string;
  path?: string;
  public_url?: string;
  caption?: string;
  is_cover: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  image_format?: 'avif' | 'webp' | 'jpeg' | 'png' | 'gif';
  original_format?: string;
  original_size?: number;
  optimized_size?: number;
}

interface NewsGalleryProps {
  newsId?: string;
  isEditor?: boolean;
  onImagesChange?: (images: NewsImage[]) => void;
  initialImages?: NewsImage[];
  onUploadingChange?: (uploading: boolean) => void;
}

// Componente para item arrastável da galeria
const SortableGalleryItem = ({
  image,
  index,
  isEditor,
  onCaptionChange,
  onSetCover,
  onRemove,
  onRotate,
  showThumbnail = true
}: {
  image: NewsImage;
  index: number;
  isEditor: boolean;
  onCaptionChange: (index: number, caption: string) => void;
  onSetCover: (index: number) => void;
  onRemove: (index: number) => void;
  onRotate: (index: number) => void;
  showThumbnail?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id || `temp-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 bg-card ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className={`flex gap-4 ${!showThumbnail ? 'flex-col' : ''}`}>
        {/* Handle para arrastar (apenas no modo editor e com múltiplas imagens) */}
        {isEditor && showThumbnail && (
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        )}

        {/* Imagem - thumbnail pequeno ou imagem grande */}
        <div className={showThumbnail ? "flex-shrink-0" : "w-full"}>
          <img
            src={image.public_url || image.image_url}
            alt={image.caption || ''}
            className={
              showThumbnail 
                ? "w-20 h-20 object-cover rounded" 
                : "w-full h-auto max-h-96 object-cover rounded-lg"
            }
          />
        </div>

        {/* Conteúdo */}
        <div className={`flex-1 space-y-2 ${!showThumbnail ? 'mt-4' : ''}`}>
          {isEditor ? (
            <Textarea
              value={image.caption || ''}
              onChange={(e) => onCaptionChange(index, e.target.value)}
              placeholder="Legenda da imagem..."
              className="min-h-[60px]"
            />
          ) : (
            image.caption && (
              <p className={`text-sm text-muted-foreground ${!showThumbnail ? 'text-center italic' : ''}`}>
                {image.caption}
              </p>
            )
          )}
        </div>

        {/* Ações (apenas no modo editor) */}
        {isEditor && (
          <div className={`flex gap-1 ${!showThumbnail ? 'justify-center mt-2' : 'flex-col'}`}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetCover(index)}
              className={image.is_cover ? 'bg-yellow-100' : ''}
            >
              {image.is_cover ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate(index)}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function NewsGallery({ newsId, isEditor = false, onImagesChange, initialImages = [], onUploadingChange }: NewsGalleryProps) {
  const [images, setImages] = useState<NewsImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  // CORREÇÃO: Simplificar lógica de permissões - sempre mostrar no modo editor
  const canEdit = isEditor && user && (userRole === 'admin' || userRole === 'redator');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (newsId) {
      fetchImages();
    }
  }, [newsId]);

  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images);
    }
  }, [images, onImagesChange]);

  const fetchImages = async () => {
    if (!newsId) return;

    try {
      const { data, error } = await supabase
        .from('news_images')
        .select('*')
        .eq('news_id', newsId)
        .order('sort_order');

      if (error) throw error;

      setImages(data || []);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!canEdit) {
      toast({
        title: "Sem permissão",
        description: "Você não tem permissão para fazer upload de imagens.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try { onUploadingChange && onUploadingChange(true); } catch {}

    try {
      const imagesToSave: NewsImage[] = [];
      let totalSavings = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar arquivo antes de processar
        const validation = validateFileUpload(file, {
          maxSizeMB: 10,
          allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
          allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']
        });

        if (!validation.isValid) {
          securityLogger.log(
            SecurityEventType.SUSPICIOUS_UPLOAD,
            { fileName: file.name, fileType: file.type, error: validation.error }
          );
          
          toast({
            title: "Arquivo inválido",
            description: validation.error,
            variant: "destructive",
          });
          continue; // Pular este arquivo
        }
        
        // Otimizar imagem antes do upload
        toast({
          title: "Otimizando imagem...",
          description: `Processando ${file.name} (${i + 1}/${files.length})`,
        });

        const optimizationResult = await optimizeImage(file);
        const optimizedFile = optimizationResult.file;
        
        totalSavings += optimizationResult.savings;

        // Gerar nome de arquivo com extensão correta
        const fileExt = optimizationResult.format;
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload da imagem otimizada para o Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(fileName, optimizedFile);

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('news-images')
          .getPublicUrl(fileName);

        const newImage: NewsImage = {
          image_url: publicUrl,
          path: uploadData.path,
          public_url: publicUrl,
          caption: '',
          is_cover: images.length === 0 && i === 0, // Primeira imagem como capa se não houver outras
          sort_order: images.length + i,
          news_id: newsId,
          image_format: optimizationResult.format,
          original_format: file.type.split('/')[1] || 'unknown',
          original_size: optimizationResult.originalSize,
          optimized_size: optimizationResult.optimizedSize,
        };

        imagesToSave.push(newImage);
      }

      // Salvar no banco de dados se temos newsId
      if (newsId && imagesToSave.length > 0) {
        const validImages = imagesToSave.map(img => ({
          ...img,
          news_id: newsId // Garantir que news_id sempre esteja presente
        }));
        
        const { error } = await supabase.from('news_images').insert(validImages);
        if (error) throw error;

        // Recarregar para obter IDs
        await fetchImages();
      } else {
        // Apenas adicionar ao estado local se não temos newsId
        setImages(prev => [...prev, ...imagesToSave]);
      }

      // Calcular economia média
      const avgSavings = files.length > 0 ? totalSavings / files.length : 0;
      const savingsText = avgSavings > 0 
        ? ` Economia média: ${avgSavings.toFixed(1)}%` 
        : '';

      if (newsId) {
        toast({
          title: "✅ Galeria otimizada e salva",
          description: `${files.length} ${files.length === 1 ? 'imagem foi otimizada' : 'imagens foram otimizadas'} e ${files.length === 1 ? 'salva' : 'salvas'} com sucesso.${savingsText}`,
        });
      } else {
        toast({
          title: "✅ Imagens otimizadas",
          description: `${files.length} ${files.length === 1 ? 'imagem otimizada' : 'imagens otimizadas'}.${savingsText} Serão vinculadas ao salvar a notícia.`,
        });
      }

      // Limpar o input file para permitir upload da mesma imagem novamente
      event.target.value = '';
      
    } catch (error) {
      console.error('Erro saving images:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as imagens.",
        variant: "destructive",
      });
    } finally {
      // CORREÇÃO: Sempre definir uploading como false no final
      setUploading(false);
      try { onUploadingChange && onUploadingChange(false); } catch {}
    }
  };

  // CORREÇÃO: SEMPRE mostrar a galeria no modo editor, independente de ter imagens ou não
  // Só esconder se não for modo editor E não houver imagens
  if (!isEditor && images.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Galeria de Imagens
        </CardTitle>
        {isEditor && (
          <CardDescription>
            Adicione e gerencie as imagens da notícia. A primeira imagem será usada como capa.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload de arquivos (sempre mostrar no modo editor) */}
        {isEditor && (
          <div>
            <Label htmlFor="image-upload">Adicionar Imagens</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="mt-1"
            />
            {uploading && (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Fazendo upload...</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 10MB por imagem.
            </p>
          </div>
        )}

        {/* Exibição das imagens */}
        {images.length > 0 ? (
          // SEMPRE usar o mesmo container da galeria - DndContext
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images.map(img => img.id || `temp-${images.indexOf(img)}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {images.map((image, index) => (
                  <SortableGalleryItem
                    key={image.id || `temp-${index}`}
                    image={image}
                    index={index}
                    isEditor={canEdit}
                    onCaptionChange={handleCaptionChange}
                    onSetCover={handleSetCover}
                    onRemove={handleRemoveImage}
                    onRotate={handleRotateImage}
                    showThumbnail={images.length > 1} // Só mostra thumbnail se há múltiplas imagens
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          // Mensagem quando não há imagens (sempre mostrar no modo editor)
          isEditor && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Nenhuma imagem adicionada ainda</p>
              <p className="text-sm">Use o campo acima para fazer upload de imagens para a galeria</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => (item.id || `temp-${items.indexOf(item)}`) === active.id);
        const newIndex = items.findIndex(item => (item.id || `temp-${items.indexOf(item)}`) === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Atualizar sort_order
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          sort_order: index
        }));

        // Salvar nova ordem no banco se temos newsId
        if (newsId) {
          saveImageOrder(updatedItems);
        }

        return updatedItems;
      });
    }
  }

  async function saveImageOrder(orderedImages: NewsImage[]) {
    try {
      for (const image of orderedImages) {
        if (image.id) {
          await supabase
            .from('news_images')
            .update({ sort_order: image.sort_order })
            .eq('id', image.id);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar ordem das imagens:', error);
    }
  }

  function handleCaptionChange(index: number, caption: string) {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, caption } : img
    ));

    // Salvar no banco se temos ID
    const image = images[index];
    if (image.id) {
      supabase
        .from('news_images')
        .update({ caption })
        .eq('id', image.id)
        .then(({ error }) => {
          if (error) console.error('Erro ao salvar legenda:', error);
        });
    }
  }

  

  function handleSetCover(index: number) {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      is_cover: i === index
    })));

    // Salvar no banco
    images.forEach((image, i) => {
      if (image.id) {
        supabase
          .from('news_images')
          .update({ is_cover: i === index })
          .eq('id', image.id)
          .then(({ error }) => {
            if (error) console.error('Erro ao definir capa:', error);
          });
      }
    });
  }

  async function handleRemoveImage(index: number) {
    const image = images[index];
    
    try {
      // Remover do storage
      if (image.path) {
        await supabase.storage
          .from('news-images')
          .remove([image.path]);
      }

      // Remover do banco se temos ID
      if (image.id) {
        await supabase
          .from('news_images')
          .delete()
          .eq('id', image.id);
      }

      // Remover do estado
      setImages(prev => prev.filter((_, i) => i !== index));

      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a imagem.",
        variant: "destructive",
      });
    }
  }

  function handleRotateImage(index: number) {
    // Implementar rotação de imagem se necessário
    toast({
      title: "Rotação",
      description: "Funcionalidade de rotação será implementada em breve.",
    });
  }
}
