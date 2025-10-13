// Image Handler for News API

interface ImageUploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

export async function uploadImageFromBase64(
  base64Data: string,
  supabaseClient: any
): Promise<ImageUploadResult> {
  try {
    // Remover prefixo data:image/...;base64, se existir
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    
    // Validar tamanho (máx 5MB)
    const sizeInBytes = (base64Clean.length * 3) / 4;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (sizeInBytes > maxSize) {
      return {
        success: false,
        error: 'Imagem muito grande. Máximo 5MB permitido.'
      };
    }

    // Decodificar base64
    const imageBuffer = Uint8Array.from(atob(base64Clean), c => c.charCodeAt(0));
    
    // Detectar tipo de imagem
    const contentType = detectImageType(base64Data);
    const extension = contentType.split('/')[1] || 'jpg';
    
    // Gerar nome único
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
    
    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('news-images')
      .upload(fileName, imageBuffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        success: false,
        error: uploadError.message
      };
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabaseClient.storage
      .from('news-images')
      .getPublicUrl(fileName);

    return {
      success: true,
      path: uploadData.path,
      publicUrl: publicUrl
    };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error.message || 'Erro ao fazer upload da imagem'
    };
  }
}

function detectImageType(base64Data: string): string {
  if (base64Data.startsWith('data:image/png')) return 'image/png';
  if (base64Data.startsWith('data:image/gif')) return 'image/gif';
  if (base64Data.startsWith('data:image/webp')) return 'image/webp';
  return 'image/jpeg'; // padrão
}

export async function saveNewsImages(
  newsId: string,
  images: Array<{ base64: string; caption?: string; is_cover?: boolean }>,
  supabaseClient: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const imageRecords = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // Upload da imagem
      const uploadResult = await uploadImageFromBase64(image.base64, supabaseClient);
      
      if (!uploadResult.success) {
        return {
          success: false,
          error: `Erro ao fazer upload da imagem ${i + 1}: ${uploadResult.error}`
        };
      }
      
      // Preparar registro
      imageRecords.push({
        news_id: newsId,
        image_url: uploadResult.publicUrl,
        path: uploadResult.path,
        public_url: uploadResult.publicUrl,
        caption: image.caption || '',
        is_cover: image.is_cover || (i === 0), // Primeira imagem é capa por padrão
        sort_order: i
      });
    }
    
    // Salvar registros no banco
    if (imageRecords.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('news_images')
        .insert(imageRecords);
      
      if (insertError) {
        console.error('Error inserting image records:', insertError);
        return {
          success: false,
          error: insertError.message
        };
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving news images:', error);
    return {
      success: false,
      error: error.message || 'Erro ao salvar imagens'
    };
  }
}

