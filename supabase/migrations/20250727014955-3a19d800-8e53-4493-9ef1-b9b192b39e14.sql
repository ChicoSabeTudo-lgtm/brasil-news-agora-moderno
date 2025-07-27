-- Adicionar coluna mockup_image_url na tabela site_configurations
ALTER TABLE public.site_configurations 
ADD COLUMN mockup_image_url TEXT;