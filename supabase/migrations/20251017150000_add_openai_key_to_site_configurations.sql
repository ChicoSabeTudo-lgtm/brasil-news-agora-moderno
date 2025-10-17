-- Adiciona coluna para armazenar a chave da API da OpenAI nas configurações do site
ALTER TABLE public.site_configurations
ADD COLUMN IF NOT EXISTS openai_api_key TEXT;

