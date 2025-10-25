-- Adicionar coluna created_by_name à tabela facebook_daily_schedule
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar a coluna
ALTER TABLE public.facebook_daily_schedule
ADD COLUMN IF NOT EXISTS created_by_name TEXT;

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN public.facebook_daily_schedule.created_by_name 
IS 'Nome do usuário que criou a postagem (armazenado para facilitar exibição)';

-- 3. Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'facebook_daily_schedule'
  AND column_name = 'created_by_name';
