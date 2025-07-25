-- Adicionar campo webhook_url à tabela site_configurations
ALTER TABLE public.site_configurations 
ADD COLUMN webhook_url TEXT;