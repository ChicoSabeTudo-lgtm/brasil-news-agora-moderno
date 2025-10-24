-- Script para testar se a tabela facebook_daily_schedule existe
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'facebook_daily_schedule';

-- 2. Verificar estrutura da tabela (se existir)
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'facebook_daily_schedule'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'facebook_daily_schedule';

-- 4. Verificar se a função clean_old_facebook_schedule existe
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'clean_old_facebook_schedule';

-- 5. Testar inserção de dados (se tabela existir)
INSERT INTO public.facebook_daily_schedule (
  news_title, 
  news_url, 
  scheduled_date, 
  scheduled_time
) VALUES (
  'Teste de Pauta Facebook',
  'https://exemplo.com/noticia-teste',
  CURRENT_DATE,
  '14:30:00'
);

-- 6. Verificar se o registro foi inserido
SELECT * FROM public.facebook_daily_schedule 
WHERE news_title = 'Teste de Pauta Facebook';

-- 7. Limpar dados de teste
DELETE FROM public.facebook_daily_schedule 
WHERE news_title = 'Teste de Pauta Facebook';
