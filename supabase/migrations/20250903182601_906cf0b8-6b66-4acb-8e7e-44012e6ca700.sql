-- Migração para limpar dados inconsistentes de imagens
-- Atualizar path com base no image_url para imagens existentes
UPDATE public.news_images 
SET 
  path = CASE 
    WHEN image_url LIKE '%/storage/v1/object/public/news-images/%' THEN 
      SUBSTRING(image_url FROM '.*/storage/v1/object/public/news-images/(.*)$')
    ELSE NULL
  END,
  updated_at = now()
WHERE path IS NULL AND image_url IS NOT NULL;

-- Criar função para obter URL de imagem com fallback
CREATE OR REPLACE FUNCTION public.get_image_url_with_fallback(
  p_image_url TEXT,
  p_public_url TEXT,
  p_path TEXT
) RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Prioridade: public_url > image_url > construir URL a partir do path
  IF p_public_url IS NOT NULL AND p_public_url != '' THEN
    RETURN p_public_url;
  END IF;
  
  IF p_image_url IS NOT NULL AND p_image_url != '' THEN
    RETURN p_image_url;
  END IF;
  
  IF p_path IS NOT NULL AND p_path != '' THEN
    RETURN 'https://spgusjrjrhfychhdwixn.supabase.co/storage/v1/object/public/news-images/' || p_path;
  END IF;
  
  RETURN NULL;
END;
$$;