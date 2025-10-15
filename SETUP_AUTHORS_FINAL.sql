-- ============================================================================
-- SCRIPT FINAL PARA CONFIGURAR AUTORES COM NOMES REAIS
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. FRANCISCO ALVES (chicop7@gmail.com) - 55+ notícias
-- ============================================================================

-- Criar profile
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'Francisco Alves', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false;

-- Criar role
INSERT INTO public.user_roles (user_id, role)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 2. YASMIM RODRIGUES DOS SANTOS (yasmimrodriguesdsa@gmail.com) - 13+ notícias
-- ============================================================================

-- Criar profile
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'Yasmim Rodrigues dos Santos', true, false)
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false;

-- Criar role
INSERT INTO public.user_roles (user_id, role)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 3. PORTAL CHICOSABETUDO (faleconosco@chicosabetudo.com.br) - 5+ notícias
-- ============================================================================

-- Criar profile
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
VALUES ('705fd72e-c3cd-4009-b8cd-ef7b2645bc12', 'Portal ChicoSabeTudo', true, false)
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

SELECT 
  p.user_id,
  p.full_name as nome,
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
