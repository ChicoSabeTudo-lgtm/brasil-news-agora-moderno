import imageCompression from 'browser-image-compression';

export interface OptimizedImageResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  format: 'avif' | 'webp' | 'jpeg';
  savings: number; // Percentage saved
}

const MAX_WIDTH = 1920;
const QUALITY = 0.9; // 90% quality

/**
 * Detecta se o navegador suporta AVIF
 */
async function supportsAVIF(): Promise<boolean> {
  if (typeof createImageBitmap === 'undefined') return false;
  
  const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  
  try {
    const blob = await fetch(avifData).then(r => r.blob());
    await createImageBitmap(blob);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converte um arquivo para um formato específico
 */
async function convertToFormat(
  file: File,
  format: 'image/avif' | 'image/webp' | 'image/jpeg',
  quality: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Não foi possível criar contexto do canvas'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Erro ao converter imagem'));
            return;
          }

          const extension = format.split('/')[1];
          const newFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, `.${extension}`),
            { type: format }
          );

          resolve(newFile);
        },
        format,
        quality
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Redimensiona a imagem mantendo a proporção
 */
async function resizeImage(file: File, maxWidth: number): Promise<File> {
  const options = {
    maxWidthOrHeight: maxWidth,
    useWebWorker: true,
    preserveExif: false,
  };

  try {
    const resizedFile = await imageCompression(file, options);
    return resizedFile;
  } catch (error) {
    console.warn('Erro ao redimensionar com imageCompression, usando arquivo original:', error);
    return file;
  }
}

/**
 * Otimiza uma imagem: redimensiona e converte para AVIF ou WebP
 */
export async function optimizeImage(file: File): Promise<OptimizedImageResult> {
  const originalSize = file.size;
  
  try {
    // 1. Redimensionar para largura máxima mantendo proporção
    let processedFile = await resizeImage(file, MAX_WIDTH);

    // 2. Tentar converter para AVIF
    const hasAVIFSupport = await supportsAVIF();
    let format: 'avif' | 'webp' | 'jpeg' = 'jpeg';
    
    if (hasAVIFSupport) {
      try {
        processedFile = await convertToFormat(processedFile, 'image/avif', QUALITY);
        format = 'avif';
        console.log('✅ Imagem convertida para AVIF');
      } catch (error) {
        console.warn('Falha ao converter para AVIF, tentando WebP:', error);
        // Fallback para WebP
        try {
          processedFile = await convertToFormat(processedFile, 'image/webp', QUALITY);
          format = 'webp';
          console.log('✅ Imagem convertida para WebP');
        } catch (webpError) {
          console.warn('Falha ao converter para WebP, usando JPEG:', webpError);
          processedFile = await convertToFormat(processedFile, 'image/jpeg', QUALITY);
          format = 'jpeg';
        }
      }
    } else {
      // Se não suporta AVIF, tenta WebP diretamente
      try {
        processedFile = await convertToFormat(processedFile, 'image/webp', QUALITY);
        format = 'webp';
        console.log('✅ Imagem convertida para WebP (navegador sem suporte AVIF)');
      } catch (error) {
        console.warn('Falha ao converter para WebP, usando JPEG:', error);
        processedFile = await convertToFormat(processedFile, 'image/jpeg', QUALITY);
        format = 'jpeg';
      }
    }

    const optimizedSize = processedFile.size;
    const savings = ((originalSize - optimizedSize) / originalSize) * 100;

    return {
      file: processedFile,
      originalSize,
      optimizedSize,
      format,
      savings: Math.max(0, savings), // Garantir que não seja negativo
    };
  } catch (error) {
    console.error('Erro ao otimizar imagem:', error);
    
    // Em caso de erro, retornar arquivo original
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      format: 'jpeg',
      savings: 0,
    };
  }
}

/**
 * Formata bytes para exibição legível
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

