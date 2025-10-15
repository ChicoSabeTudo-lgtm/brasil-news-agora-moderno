-- ============================================================================
-- SCRIPT PARA CONFIGURAR AUTORES EXISTENTES
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================================

-- Este script cria profiles e roles para os 3 autores que já têm notícias
-- publicadas no sistema, regularizando a situação.

-- INSTRUÇÕES:
-- 1. Primeiro, execute a query abaixo para ver os emails dos autores
-- 2. Depois substitua 'Nome do Autor' pelos nomes reais
-- 3. Execute os INSERTs

-- ============================================================================
-- PASSO 1: CONSULTAR EMAILS DOS AUTORES
-- ============================================================================

SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as nome_metadata,
  created_at
FROM auth.users
WHERE id IN (
  '610e7321-e707-45c8-b48d-7c86f31f1750',
  'bfbf7dbe-3f41-4667-ae86-8978d0fed605',
  '705fd72e-c3cd-4009-b8cd-ef7b2645bc12'
)
ORDER BY created_at;

-- ============================================================================
-- PASSO 2: CRIAR PROFILES E ROLES
-- ============================================================================
-- SUBSTITUA 'Nome do Autor X' pelos nomes reais obtidos acima

-- ============================================================================
-- 1. AUTOR 1 (ID: 610e7321-e707-45c8-b48d-7c86f31f1750)
-- ============================================================================

-- Criar profile (SUBSTITUA O NOME)
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'Nome do Autor 1', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false;

-- Criar role
INSERT INTO public.user_roles (user_id, role)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 2. AUTOR 2 (ID: bfbf7dbe-3f41-4667-ae86-8978d0fed605)
-- ============================================================================

-- Criar profile (SUBSTITUA O NOME)
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'Nome do Autor 2', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false;

-- Criar role
INSERT INTO public.user_roles (user_id, role)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 3. AUTOR 3 (ID: 705fd72e-c3cd-4009-b8cd-ef7b2645bc12)
-- ============================================================================

-- Criar profile (SUBSTITUA O NOME)
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('705fd72e-c3cd-4009-b8cd-ef7b2645bc12', 'Nome do Autor 3', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false;

-- Criar role
INSERT INTO public.user_roles (user_id, role)
VALUES ('705fd72e-c3cd-4009-b8cd-ef7b2645bc12', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar profiles criados
SELECT 
  p.user_id,
  p.full_name,
  p.is_approved,
  p.access_revoked,
  ur.role,
  COUNT(n.id) as total_noticias
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
LEFT JOIN public.news n ON p.user_id = n.author_id
WHERE p.user_id IN (
  '610e7321-e707-45c8-b48d-7c86f31f1750',
  'bfbf7dbe-3f41-4667-ae86-8978d0fed605',
  '705fd72e-c3cd-4009-b8cd-ef7b2645bc12'
)
GROUP BY p.user_id, p.full_name, p.is_approved, p.access_revoked, ur.role
ORDER BY total_noticias DESC;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- 
-- user_id                              | full_name          | is_approved | access_revoked | role    | total_noticias
-- ----------------------------------------------------------------------------------------------------
-- 610e7321-e707-45c8-b48d-7c86f31f1750 | Redator Principal  | true        | false          | redator | 55
-- bfbf7dbe-3f41-4667-ae86-8978d0fed605 | Redator Secundário | true        | false          | redator | 13
-- 705fd72e-c3cd-4009-b8cd-ef7b2645bc12 | Redator Terciário  | true        | false          | redator | 5
-- 
-- ============================================================================

