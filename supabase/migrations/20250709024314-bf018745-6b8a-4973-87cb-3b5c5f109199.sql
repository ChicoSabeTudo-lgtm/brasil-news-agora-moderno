-- Adicionar campo is_featured na tabela news para marcar destaques manuais
ALTER TABLE public.news 
ADD COLUMN is_featured boolean DEFAULT false;

-- Criar índice para melhor performance nas consultas de destaques
CREATE INDEX idx_news_featured ON public.news(is_featured, published_at) WHERE is_featured = true AND is_published = true;

-- Função para garantir que não tenhamos mais de 3 destaques ativos
CREATE OR REPLACE FUNCTION public.manage_featured_news()
RETURNS TRIGGER AS $$
DECLARE
  featured_count INTEGER;
BEGIN
  -- Se está marcando como destaque
  IF NEW.is_featured = true AND (OLD.is_featured IS NULL OR OLD.is_featured = false) THEN
    -- Contar quantos destaques já existem
    SELECT COUNT(*) INTO featured_count
    FROM public.news
    WHERE is_featured = true AND is_published = true AND id != NEW.id;
    
    -- Se já temos 3 destaques, remover o mais antigo
    IF featured_count >= 3 THEN
      UPDATE public.news
      SET is_featured = false, updated_at = now()
      WHERE is_featured = true 
        AND is_published = true 
        AND id != NEW.id
        AND published_at = (
          SELECT MIN(published_at)
          FROM public.news
          WHERE is_featured = true 
            AND is_published = true 
            AND id != NEW.id
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerenciar destaques automaticamente
CREATE TRIGGER trigger_manage_featured_news
  BEFORE UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION public.manage_featured_news();