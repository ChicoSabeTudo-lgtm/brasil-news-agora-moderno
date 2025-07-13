-- Adicionar novos tipos de posição para anúncios in-content
ALTER TYPE advertisements_position_type ADD VALUE IF NOT EXISTS 'in_content';

-- Criar nova tabela para anúncios in-content específicos para notícias
CREATE TABLE IF NOT EXISTS public.news_advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  advertisement_id UUID NOT NULL REFERENCES public.advertisements(id) ON DELETE CASCADE,
  paragraph_position INTEGER NOT NULL DEFAULT 1, -- Posição do parágrafo antes do qual inserir o anúncio
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Evitar duplicatas
  UNIQUE(news_id, advertisement_id, paragraph_position)
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.news_advertisements ENABLE ROW LEVEL SECURITY;

-- Políticas para news_advertisements
CREATE POLICY "Admins e redators podem gerenciar anúncios in-content"
  ON public.news_advertisements
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

CREATE POLICY "Anúncios in-content são visíveis publicamente quando ativos"
  ON public.news_advertisements
  FOR SELECT
  USING (is_active = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_news_advertisements_updated_at
  BEFORE UPDATE ON public.news_advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar a coluna position na tabela advertisements para suportar o novo valor
UPDATE public.advertisements 
SET position = 'in_content' 
WHERE position NOT IN ('header', 'politics', 'sports', 'international', 'in_content')
AND ad_code IS NOT NULL;