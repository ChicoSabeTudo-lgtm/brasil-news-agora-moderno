-- Verificar e corrigir as políticas da tabela instagram_images
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can create their own instagram images" ON public.instagram_images;
DROP POLICY IF EXISTS "Users can view their own instagram images" ON public.instagram_images;
DROP POLICY IF EXISTS "Users can update their own instagram images" ON public.instagram_images;
DROP POLICY IF EXISTS "Users can delete their own instagram images" ON public.instagram_images;

-- Criar políticas mais simples e funcionais
CREATE POLICY "instagram_images_insert" 
ON public.instagram_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "instagram_images_select" 
ON public.instagram_images 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "instagram_images_update" 
ON public.instagram_images 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "instagram_images_delete" 
ON public.instagram_images 
FOR DELETE 
USING (auth.uid() = user_id);