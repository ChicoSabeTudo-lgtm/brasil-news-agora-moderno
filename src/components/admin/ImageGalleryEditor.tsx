import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Star, StarOff, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';

interface NewsImage {
  id?: string;
  image_url: string;
  caption: string;
  is_featured: boolean;
  sort_order: number;
  file?: File;
}

interface ImageGalleryEditorProps {
  newsId?: string;
  onImagesChange?: (images: NewsImage[]) => void;
  initialImages?: NewsImage[];
}

export const ImageGalleryEditor = ({ newsId, onImagesChange, initialImages = [] }: ImageGalleryEditorProps) => {
  const [images, setImages] = useState<NewsImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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
        .order('sort_order');

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

  // Detect format support
  const canConvertToFormat = (format: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      canvas.toBlob(
        (blob) => resolve(!!blob),
        format,
        0.8
      );
    });
  };

  const optimizeImage = async (file: File): Promise<File> => {
    console.log('Starting image optimization for:', file.name);
    
    return new Promise(async (resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = async () => {
          console.log('Image loaded, dimensions:', img.width, 'x', img.height);
          
          // Resize if too large (max 1920px width)
          const maxWidth = 1920;
          const maxHeight = 1920;
          
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
            console.log('Resizing to:', width, 'x', height);
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Try formats in order of preference: AVIF -> WebP -> JPEG
          const formats = [
            { mime: 'image/avif', ext: 'avif' },
            { mime: 'image/webp', ext: 'webp' },
            { mime: 'image/jpeg', ext: 'jpg' }
          ];
          
          for (const format of formats) {
            console.log('Trying format:', format.mime);
            
            const supported = await canConvertToFormat(format.mime);
            console.log('Format supported:', supported);
            
            if (supported) {
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    console.log('Successfully converted to', format.mime, 'Size:', blob.size);
                    const optimizedFile = new File([blob], `${file.name.split('.')[0]}.${format.ext}`, {
                      type: format.mime,
                      lastModified: Date.now()
                    });
                    resolve(optimizedFile);
                    return;
                  }
                  console.log('Failed to convert to', format.mime);
                },
                format.mime,
                0.85
              );
              break;
            }
          }
          
          // If all conversions fail, return original file
          setTimeout(() => {
            console.log('All format conversions failed, using original file');
            resolve(file);
          }, 1000);
        };
        
        img.onerror = () => {
          console.error('Failed to load image for optimization');
          reject(new Error('Failed to load image'));
        };
        
        img.src = URL.createObjectURL(file);
      } catch (error) {
        console.error('Error in image optimization:', error);
        reject(error);
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    try {
      console.log('Starting upload for file:', file.name, 'Size:', file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecione apenas arquivos de imagem.');
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('O arquivo deve ter no máximo 10MB.');
      }
      
      // Optimize image with format detection and fallbacks
      const optimizedFile = await optimizeImage(file);
      console.log('Image optimized:', optimizedFile.name, 'Size:', optimizedFile.size);
      
      const fileExtension = optimizedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExtension}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, optimizedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);

      const newImage: NewsImage = {
        image_url: publicUrl,
        caption: '',
        is_featured: images.length === 0, // Primeira imagem é destaque automaticamente
        sort_order: images.length,
        file: optimizedFile
      };

      return newImage;
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Não foi possível fazer upload da imagem.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no Upload",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const handleMultipleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      // Upload todas as imagens em paralelo
      const uploadPromises = files.map(handleFileUpload);
      const uploadedImages = await Promise.all(uploadPromises);
      
      // Ajustar sort_order baseado no número atual de imagens
      const adjustedImages = uploadedImages.map((img, index) => ({
        ...img,
        sort_order: images.length + index,
        is_featured: images.length === 0 && index === 0 // Apenas a primeira se não houver nenhuma
      }));

      const updatedImages = [...images, ...adjustedImages];
      setImages(updatedImages);
      onImagesChange?.(updatedImages);

      toast({
        title: "Imagens carregadas",
        description: `${files.length} ${files.length === 1 ? 'imagem foi adicionada' : 'imagens foram adicionadas'} à galeria.`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload de algumas imagens.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, caption } : img
    );
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const toggleFeatured = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      is_featured: i === index ? !img.is_featured : false // Apenas uma pode ser destaque
    }));
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      // Se a imagem tem ID, remove do banco
      if (imageToRemove.id && newsId) {
        const { error } = await supabase
          .from('news_images')
          .delete()
          .eq('id', imageToRemove.id);
        
        if (error) throw error;
      }

      // Remove do storage se não for uma URL externa
      if (imageToRemove.image_url.includes('news-images')) {
        const fileName = imageToRemove.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('news-images')
            .remove([fileName]);
        }
      }

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

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];
    
    // Update sort_order
    updatedImages.forEach((img, i) => {
      img.sort_order = i;
    });

    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const saveImages = async () => {
    if (!newsId) return;

    try {
      // Delete existing images for this news
      await supabase
        .from('news_images')
        .delete()
        .eq('news_id', newsId);

      // Insert new images
      const imagesToSave = images.map((img, index) => ({
        news_id: newsId,
        image_url: img.image_url,
        caption: img.caption || null,
        is_featured: img.is_featured,
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
    } catch (error) {
      console.error('Error saving images:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as imagens.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galeria de Imagens</CardTitle>
        <CardDescription>
          Gerencie as imagens da notícia. A primeira imagem com destaque será a capa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-primary hover:text-primary/80">
                  Clique para fazer upload
                </span>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleMultipleFileUpload(files);
                  }}
                  disabled={uploading}
                />
              </Label>
              <p className="text-muted-foreground text-sm mt-2">
                Ou arraste e solte suas imagens aqui
              </p>
            </div>
          </div>
        </div>

        {/* Images List */}
        {images.length > 0 && (
          <div className="space-y-4">
            {images.map((image, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={image.image_url}
                      alt={image.caption || `Imagem ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {image.is_featured && (
                        <Badge variant="default">
                          <Star className="w-3 h-3 mr-1" />
                          Capa
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        Posição: {index + 1}
                      </span>
                    </div>
                    
                    <Textarea
                      placeholder="Legenda da imagem (opcional)"
                      value={image.caption}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(index)}
                      title={image.is_featured ? "Remover da capa" : "Definir como capa"}
                    >
                      {image.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      <GripVertical className="w-3 h-3 text-muted-foreground" />
                      <div className="flex flex-col">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveImage(index, 'up')}
                          disabled={index === 0}
                          title="Mover para cima"
                          className="h-6 px-1"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveImage(index, 'down')}
                          disabled={index === images.length - 1}
                          title="Mover para baixo"
                          className="h-6 px-1"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="text-destructive hover:text-destructive"
                      title="Remover imagem"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {newsId && images.length > 0 && (
          <Button onClick={saveImages} className="w-full">
            Salvar Galeria
          </Button>
        )}

        {uploading && (
          <div className="text-center text-muted-foreground">
            Fazendo upload...
          </div>
        )}
      </CardContent>
    </Card>
  );
};