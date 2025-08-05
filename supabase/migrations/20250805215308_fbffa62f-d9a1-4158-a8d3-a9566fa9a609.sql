-- Criar tabela para armazenar imagens geradas no Instagram
CREATE TABLE public.instagram_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  visual_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.instagram_images ENABLE ROW LEVEL SECURITY;

-- Política para usuários visualizarem suas próprias imagens
CREATE POLICY "Users can view their own instagram images" 
ON public.instagram_images 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias imagens
CREATE POLICY "Users can create their own instagram images" 
ON public.instagram_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias imagens
CREATE POLICY "Users can update their own instagram images" 
ON public.instagram_images 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias imagens
CREATE POLICY "Users can delete their own instagram images" 
ON public.instagram_images 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_instagram_images_updated_at
BEFORE UPDATE ON public.instagram_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();