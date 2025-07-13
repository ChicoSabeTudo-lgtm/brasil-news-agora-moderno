-- Criar configuração inicial se não existir
INSERT INTO public.site_configurations (
  id,
  ads_txt_content,
  header_code,
  footer_code,
  logo_url,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  NULL,
  NULL,
  NULL,
  NULL,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_configurations
);