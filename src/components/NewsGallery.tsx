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
}

interface NewsGalleryProps {
  newsId?: string;
  isEditor?: boolean;
  onImagesChange?: (images: NewsImage[]) => void;
  initialImages?: NewsImage[];
}

// Componente para item arrastável da galeria
const SortableGalleryItem = ({ 
  image, 
  index, 
  isEditor, 
  onCaptionChange, 
  onSetCover, 
  onRemove,
  onRotate 
}: {
  image: NewsImage;
  index: number;
  isEditor: boolean;
  onCaptionChange: (index: number, caption: string) => void;
  onSetCover: (index: number) => void;
  onRemove: (index: number) => void;
  onRotate: (index: number) => void;
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
      <div className="flex gap-4">
        {/* Handle para arrastar (apenas no modo editor) */}
        {isEditor && (
          <div 
            {...attributes} 
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={image.public_url || image.image_url}
            alt={image.caption || `Imagem ${index + 1}`}
            className="w-20 h-20 object-cover rounded"
          />
        </div>
        
        {/* Informações e controles */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            {image.is_cover && (
              <Badge variant="default">
                <Star className="w-3 h-3 mr-1" />
                Capa
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Posição: {index + 1}
            </span>
          </div>
          
          {/* Caption input (apenas no modo editor) */}
          {isEditor ? (
            <Textarea
              placeholder="Legenda da imagem (opcional)"
              value={image.caption || ''}
              onChange={(e) => onCaptionChange(index, e.target.value)}
              rows={2}
            />
          ) : image.caption ? (
            <p className="text-sm text-muted-foreground">{image.caption}</p>
          ) : null}
        </div>
        
        {/* Botões de ação (apenas no modo editor) */}
        {isEditor && (
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetCover(index)}
              title={image.is_cover ? "Remover da capa" : "Definir como capa"}
            >
              {image.is_cover ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRotate(index)}
              title="Rotacionar imagem 90°"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(index)}
              className="text-destructive hover:text-destructive"
              title="Remover imagem"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const NewsGallery = ({ 
  newsId, 
  isEditor = false, 
  onImagesChange, 
  initialImages = [] 
}: NewsGalleryProps) => {
  const [images, setImages] = useState<NewsImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const { user, userRole, isOtpVerified } = useAuth();

  // Configurar sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Verificar se o usuário tem permissão para editar
  const canEdit = isEditor && user && (userRole === 'admin' || userRole === 'redator');
  
  // Debug das permissões - SIMPLIFICADO
  console.log('🔍 NewsGallery DEBUG - Permissions Check:', {
    isEditor,
    user: user ? { id: user.id, email: user.email } : null,
    userRole,
    canEdit,
    newsId,
    timestamp: new Date().toISOString()
  });

  // Loading state para aguardar carregamento das permissões
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  
  useEffect(() => {
    // Aguarda o carregamento das informações do usuário
    if (user !== undefined && userRole !== undefined) {
      setPermissionsLoaded(true);
      console.log('✅ Permissions loaded:', { userRole, canEdit });
    }
  }, [user, userRole, canEdit]);

  useEffect(() => {
    if (newsId) {
      fetchImages();
    }
  }, [newsId]);

  const fetchImages = async () => {
    if (!newsId) return;

    try {
      const { data, error } = await supabase
        .from('news_images')
        .select('*')
        .eq('news_id', newsId)
        .order('is_cover', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as imagens.",
        variant: "destructive",
      });
    }
  };

  // Função para sanitizar nome do arquivo
  const sanitizeFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    const sanitized = nameWithoutExtension
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens no início/fim
    
    return `${sanitized}.${extension}`;
  };

  // Otimizar imagem antes do upload
  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Redimensionar se muito grande (max 1920px)
        const maxWidth = 1920;
        const maxHeight = 1920;
        
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload de arquivo individual
  const uploadFile = async (file: File): Promise<NewsImage> => {
    console.log('🚀 Iniciando uploadFile para:', file.name, 'Tamanho:', file.size);
    
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        console.error('❌ Tipo de arquivo inválido:', file.type);
        throw new Error('Por favor, selecione apenas arquivos de imagem.');
      }
      console.log('✅ Tipo de arquivo válido:', file.type);
      
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error('❌ Arquivo muito grande:', file.size);
        throw new Error('O arquivo deve ter no máximo 10MB.');
      }
      console.log('✅ Tamanho do arquivo OK:', file.size);

      // Otimizar imagem
      console.log('🔄 Otimizando imagem...');
      const optimizedFile = await optimizeImage(file);
      console.log('✅ Imagem otimizada. Tamanho original:', file.size, 'Otimizado:', optimizedFile.size);
      
      // Gerar caminho estruturado: newsId/uuid-filename
      const fileExtension = optimizedFile.name.split('.').pop();
      const uuid = crypto.randomUUID();
      const sanitizedName = sanitizeFileName(optimizedFile.name);
      const fileName = `${uuid}-${sanitizedName}`;
      const filePath = newsId ? `${newsId}/${fileName}` : fileName;
      console.log('📁 Caminho do arquivo:', filePath);

      // Upload para o bucket
      console.log('☁️ Fazendo upload para storage...');
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, optimizedFile);

      if (uploadError) {
        console.error('❌ Erro no upload para storage:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }
      console.log('✅ Upload para storage concluído');

      // Obter URL pública
      console.log('🔗 Obtendo URL pública...');
      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);
      console.log('✅ URL pública obtida:', publicUrl);

      // Criar objeto NewsImage
      const newImage: NewsImage = {
        news_id: newsId,
        image_url: publicUrl,
        path: filePath,
        public_url: publicUrl,
        caption: '',
        is_cover: images.length === 0, // Primeira imagem é capa automaticamente
        sort_order: images.length,
      };
      console.log('✅ Objeto NewsImage criado:', newImage);

      return newImage;
    } catch (error) {
      console.error('💥 Erro em uploadFile:', error);
      throw error;
    }
  };

  // Upload de múltiplos arquivos
  const handleFileUpload = async (files: File[]) => {
    console.log('🚀 handleFileUpload chamado:', { 
      canEdit, 
      files: files.length, 
      permissionsLoaded,
      isEditor,
      user: !!user,
      isOtpVerified,
      userRole 
    });
    
    // Aguardar carregamento das permissões se necessário
    if (!permissionsLoaded) {
      console.log('⏳ Aguardando carregamento das permissões...');
      toast({
        title: "Aguarde",
        description: "Carregando permissões de usuário...",
        variant: "default",
      });
      return;
    }
    
    if (!canEdit) {
      const reason = !isEditor ? 'Não está no modo editor' :
                     !user ? 'Usuário não autenticado' :
                     !(userRole === 'admin' || userRole === 'redator') ? `Permissão insuficiente (role: ${userRole})` : 'Motivo desconhecido';
                     
      console.error('❌ Upload negado:', reason);
      toast({
        title: "Acesso negado",
        description: `Você não tem permissão para fazer upload de imagens. Motivo: ${reason}`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      console.log('📁 Iniciando upload de', files.length, 'arquivos para newsId:', newsId);
      
      // Upload todos os arquivos em paralelo
      const uploadPromises = files.map((file, index) => {
        console.log(`📤 Iniciando upload do arquivo ${index + 1}:`, file.name);
        return uploadFile(file);
      });
      
      console.log('⏳ Aguardando conclusão de todos os uploads...');
      const uploadedImages = await Promise.all(uploadPromises);
      console.log('✅ Todos os uploads concluídos:', uploadedImages);
      
      // Se temos newsId, salvar diretamente no banco
      if (newsId && uploadedImages.length > 0) {
        console.log('💾 Salvando imagens no banco de dados...');
        const imagesToSave = uploadedImages.map((img, index) => ({
          news_id: newsId,
          image_url: img.image_url,
          path: img.path,
          public_url: img.public_url,
          caption: img.caption || null,
          is_cover: img.is_cover,
          sort_order: images.length + index
        }));
        
        console.log('📝 Dados para inserir no banco:', imagesToSave);

        const { data: savedImages, error: saveError } = await supabase
          .from('news_images')
          .insert(imagesToSave)
          .select();

        if (saveError) {
          console.error('💥 Erro ao salvar imagens no banco:', saveError);
          throw new Error(`Erro ao salvar no banco: ${saveError.message}`);
        }
        
        console.log('✅ Imagens salvas no banco:', savedImages);
        
        // Atualizar estado com dados salvos (incluindo IDs)
        const updatedImages = [...images, ...(savedImages || [])];
        setImages(updatedImages);
        onImagesChange?.(updatedImages);
      } else {
        // Atualizar apenas estado local (para newsId vazio)
        const updatedImages = [...images, ...uploadedImages];
        setImages(updatedImages);
        onImagesChange?.(updatedImages);
      }

      toast({
        title: "Upload concluído",
        description: `${files.length} ${files.length === 1 ? 'imagem foi adicionada' : 'imagens foram adicionadas'} à galeria.`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Não foi possível fazer upload das imagens.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Manipular drag-and-drop de arquivos
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (!canEdit) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      handleFileUpload(imageFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canEdit) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Manipular mudança de legenda
  const handleCaptionChange = (index: number, caption: string) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, caption } : img
    );
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  // Definir como capa usando RPC
  const handleSetCover = async (index: number) => {
    const imageToSet = images[index];
    
    if (!imageToSet.id || !newsId) {
      // Para imagens ainda não salvas, atualizar apenas o estado local
      const updatedImages = images.map((img, i) => ({
        ...img,
        is_cover: i === index
      }));
      setImages(updatedImages);
      onImagesChange?.(updatedImages);
      return;
    }

    try {
      // Usar RPC para garantir consistência
      const { error } = await supabase.rpc('set_news_cover', {
        p_news_id: newsId,
        p_image_id: imageToSet.id
      });

      if (error) throw error;

      // Atualizar estado local
      const updatedImages = images.map((img) => ({
        ...img,
        is_cover: img.id === imageToSet.id
      }));
      setImages(updatedImages);
      onImagesChange?.(updatedImages);

      toast({
        title: "Capa atualizada",
        description: "A imagem de capa foi definida com sucesso.",
      });
    } catch (error) {
      console.error('Error setting cover:', error);
      toast({
        title: "Erro",
        description: "Não foi possível definir a imagem como capa.",
        variant: "destructive",
      });
    }
  };

  // Rotacionar imagem 90 graus no sentido horário
  const handleRotateImage = async (index: number) => {
    const imageToRotate = images[index];
    
    if (!imageToRotate.image_url && !imageToRotate.public_url) {
      toast({
        title: "Erro",
        description: "Não foi possível rotacionar a imagem.",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageUrl = imageToRotate.public_url || imageToRotate.image_url;
      
      // Criar canvas para rotacionar a imagem
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        // Configurar canvas com dimensões rotacionadas
        canvas.width = img.height;
        canvas.height = img.width;
        
        // Rotacionar 90 graus no sentido horário
        ctx?.translate(canvas.width / 2, canvas.height / 2);
        ctx?.rotate(Math.PI / 2);
        ctx?.drawImage(img, -img.width / 2, -img.height / 2);
        
        // Converter para blob
        canvas.toBlob(async (blob) => {
          if (!blob) {
            toast({
              title: "Erro",
              description: "Falha ao processar a rotação da imagem.",
              variant: "destructive",
            });
            return;
          }
          
          try {
            // Criar novo arquivo com nome único
            const fileExtension = 'jpg';
            const uuid = crypto.randomUUID();
            const fileName = `rotated-${uuid}.${fileExtension}`;
            const filePath = newsId ? `${newsId}/${fileName}` : fileName;
            
            // Upload da imagem rotacionada
            const { error: uploadError } = await supabase.storage
              .from('news-images')
              .upload(filePath, blob);
            
            if (uploadError) {
              throw new Error(`Erro no upload: ${uploadError.message}`);
            }
            
            // Obter nova URL pública
            const { data: { publicUrl } } = supabase.storage
              .from('news-images')
              .getPublicUrl(filePath);
            
            // Atualizar a imagem no estado
            const updatedImages = images.map((img, i) => 
              i === index ? {
                ...img,
                image_url: publicUrl,
                public_url: publicUrl,
                path: filePath
              } : img
            );
            
            setImages(updatedImages);
            onImagesChange?.(updatedImages);
            
            // Se a imagem já está salva no banco, atualizar
            if (imageToRotate.id && newsId) {
              const { error: updateError } = await supabase
                .from('news_images')
                .update({
                  image_url: publicUrl,
                  public_url: publicUrl,
                  path: filePath,
                  updated_at: new Date().toISOString()
                })
                .eq('id', imageToRotate.id);
              
              if (updateError) {
                console.error('Erro ao atualizar imagem no banco:', updateError);
              }
            }
            
            // Remover imagem antiga do storage se for diferente
            if (imageToRotate.path && imageToRotate.path !== filePath) {
              await supabase.storage
                .from('news-images')
                .remove([imageToRotate.path]);
            }
            
            toast({
              title: "Imagem rotacionada",
              description: "A imagem foi rotacionada com sucesso.",
            });
            
          } catch (error) {
            console.error('Erro ao salvar imagem rotacionada:', error);
            toast({
              title: "Erro",
              description: "Não foi possível salvar a imagem rotacionada.",
              variant: "destructive",
            });
          }
        }, 'image/jpeg', 0.85);
      };
      
      img.onerror = () => {
        toast({
          title: "Erro",
          description: "Não foi possível carregar a imagem para rotação.",
          variant: "destructive",
        });
      };
      
      img.src = imageUrl;
      
    } catch (error) {
      console.error('Error rotating image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rotacionar a imagem.",
        variant: "destructive",
      });
    }
  };

  // Remover imagem
  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      // Remover do banco se tiver ID
      if (imageToRemove.id && newsId) {
        const { error: dbError } = await supabase
          .from('news_images')
          .delete()
          .eq('id', imageToRemove.id);
        
        if (dbError) throw dbError;
      }

      // Remover do storage
      if (imageToRemove.path) {
        const { error: storageError } = await supabase.storage
          .from('news-images')
          .remove([imageToRemove.path]);
        
        if (storageError) console.warn('Warning removing from storage:', storageError);
      }

      // Atualizar estado local
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      onImagesChange?.(updatedImages);

      toast({
        title: "Imagem removida",
        description: "A imagem foi removida da galeria.",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a imagem.",
        variant: "destructive",
      });
    }
  };

  // Manipular reordenação por drag-and-drop
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => (img.id || `temp-${images.indexOf(img)}`) === active.id);
      const newIndex = images.findIndex((img) => (img.id || `temp-${images.indexOf(img)}`) === over.id);

      const reorderedImages = arrayMove(images, oldIndex, newIndex);
      
      // Atualizar sort_order
      const updatedImages = reorderedImages.map((img, index) => ({
        ...img,
        sort_order: index
      }));

      setImages(updatedImages);
      onImagesChange?.(updatedImages);

      // Se as imagens já estão salvas, atualizar no banco
      if (newsId && updatedImages.every(img => img.id)) {
        try {
          const imageOrders = updatedImages.map((img, index) => ({
            id: img.id,
            sort_order: index
          }));

          const { error } = await supabase.rpc('reorder_news_images', {
            p_news_id: newsId,
            p_image_orders: JSON.stringify(imageOrders)
          });

          if (error) throw error;
        } catch (error) {
          console.error('Error reordering images:', error);
          toast({
            title: "Erro",
            description: "Não foi possível salvar a nova ordem das imagens.",
            variant: "destructive",
          });
        }
      }
    }
  };

  // Salvar imagens no banco
  const saveImages = async () => {
    if (!newsId) return;

    try {
      // Remover imagens existentes
      await supabase
        .from('news_images')
        .delete()
        .eq('news_id', newsId);

      // Inserir novas imagens
      const imagesToSave = images.map((img, index) => ({
        news_id: newsId,
        image_url: img.image_url,
        path: img.path,
        public_url: img.public_url,
        caption: img.caption || null,
        is_cover: img.is_cover,
        sort_order: index
      }));

      if (imagesToSave.length > 0) {
        const { error } = await supabase
          .from('news_images')
          .insert(imagesToSave);

        if (error) throw error;
      }

      toast({
        title: "Galeria salva",
        description: "As imagens foram salvas com sucesso.",
      });

      // Recarregar para obter IDs
      await fetchImages();
    } catch (error) {
      console.error('Error saving images:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as imagens.",
        variant: "destructive",
      });
    }
  };

  if (!canEdit && images.length === 0) {
    return null; // Não mostrar nada se não há imagens e não é modo editor
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Galeria de Imagens
        </CardTitle>
        <CardDescription>
          {isEditor 
            ? "Gerencie as imagens da notícia. Arraste para reordenar e defina uma imagem como capa."
            : `${images.length} ${images.length === 1 ? 'imagem' : 'imagens'} na galeria`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Área de upload (apenas no modo editor) */}
        {canEdit && permissionsLoaded && (
          <div 
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center">
              <Upload className={`mx-auto h-12 w-12 mb-4 ${
                dragOver ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <div>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-primary hover:text-primary/80">
                    {uploading ? 'Fazendo upload...' : 'Clique para fazer upload'}
                  </span>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleFileUpload(files);
                    }}
                    disabled={uploading}
                  />
                </Label>
                <p className="text-muted-foreground text-sm mt-2">
                  Ou arraste e solte suas imagens aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo 10MB por imagem • Formatos: JPG, PNG, WebP
                </p>
              </div>
            </div>
            
            {uploading && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Fazendo upload...</span>
              </div>
            )}
          </div>
        )}

        {/* Loading state para permissões */}
        {isEditor && !permissionsLoaded && (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Carregando permissões...</span>
            </div>
          </div>
        )}

        {/* Lista de imagens */}
        {images.length > 0 && (
          <div className="space-y-4">
            {canEdit ? (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={images.map((img, index) => img.id || `temp-${index}`)}
                  strategy={verticalListSortingStrategy}
                >
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
                     />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              // Modo visualização (sem drag-and-drop)
              images.map((image, index) => (
                <SortableGalleryItem
                  key={image.id || `temp-${index}`}
                  image={image}
                  index={index}
                  isEditor={false}
                  onCaptionChange={() => {}}
                  onSetCover={() => {}}
                  onRemove={() => {}}
                  onRotate={() => {}}
                />
              ))
            )}
          </div>
        )}

        {/* Botões de ação (apenas no modo editor) */}
        {canEdit && images.length > 0 && newsId && (
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={saveImages} disabled={uploading}>
              Salvar Galeria
            </Button>
            <Button 
              variant="outline" 
              onClick={fetchImages}
              disabled={uploading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
          </div>
        )}

        {/* Estado vazio */}
        {images.length === 0 && !canEdit && (
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma imagem na galeria.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};