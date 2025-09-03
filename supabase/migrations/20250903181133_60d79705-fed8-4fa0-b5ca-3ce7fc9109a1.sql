-- Adicionar colunas path e public_url à tabela news_images
ALTER TABLE public.news_images 
ADD COLUMN IF NOT EXISTS path TEXT,
ADD COLUMN IF NOT EXISTS public_url TEXT;

-- Renomear is_featured para is_cover para maior clareza
ALTER TABLE public.news_images 
RENAME COLUMN is_featured TO is_cover;

-- Criar índice único parcial para garantir apenas uma capa por notícia
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_images_single_cover 
ON public.news_images (news_id) 
WHERE is_cover = true;

-- Criar função RPC para gerenciar capa das imagens
CREATE OR REPLACE FUNCTION public.set_news_cover(
  p_news_id UUID,
  p_image_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Remover capa de todas as imagens desta notícia
  UPDATE public.news_images 
  SET is_cover = false, updated_at = now()
  WHERE news_id = p_news_id;
  
  -- Definir a nova capa
  UPDATE public.news_images 
  SET is_cover = true, updated_at = now()
  WHERE id = p_image_id AND news_id = p_news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Atualizar dados existentes: popular public_url com image_url se estiver vazio
UPDATE public.news_images 
SET public_url = image_url 
WHERE public_url IS NULL OR public_url = '';

-- Função para reordenar imagens em lote
CREATE OR REPLACE FUNCTION public.reorder_news_images(
  p_news_id UUID,
  p_image_orders JSONB
) RETURNS VOID AS $$
DECLARE
  item JSONB;
BEGIN
  -- Loop através de cada item no array JSON
  FOR item IN SELECT * FROM jsonb_array_elements(p_image_orders)
  LOOP
    UPDATE public.news_images 
    SET sort_order = (item->>'sort_order')::integer,
        updated_at = now()
    WHERE id = (item->>'id')::uuid 
      AND news_id = p_news_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;