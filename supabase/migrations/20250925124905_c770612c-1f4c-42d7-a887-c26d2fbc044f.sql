-- Verificar e corrigir políticas RLS que podem estar referenciando a tabela users incorretamente

-- Primeiro, vamos verificar as políticas existentes na tabela news
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'news';

-- Remover a política problemática que está tentando acessar auth.users
DROP POLICY IF EXISTS "news_update_policy" ON public.news;

-- Verificar se há outras políticas problemáticas
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE (qual LIKE '%auth.users%' OR with_check LIKE '%auth.users%');