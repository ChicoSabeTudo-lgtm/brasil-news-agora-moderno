-- Corrigir função com search_path adequado
DROP FUNCTION public.get_image_url_with_fallback(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.get_image_url_with_fallback(
  p_image_url TEXT,
  p_public_url TEXT,
  p_path TEXT
) RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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