-- Adicionar coluna link e remover valor das propagandas
ALTER TABLE public.finance_advertisements 
  ADD COLUMN IF NOT EXISTS link TEXT,
  DROP COLUMN IF EXISTS value;