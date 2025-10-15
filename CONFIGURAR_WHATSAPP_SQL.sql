-- ============================================================================
-- CONFIGURAR WHATSAPP PARA USUÁRIOS EXISTENTES
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. PRIMEIRO: CRIAR PROFILES PARA OS USUÁRIOS EXISTENTES
-- ============================================================================

-- Francisco Alves (chicop7@gmail.com)
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked, whatsapp_phone)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'Francisco Alves', true, false, '+5511999999999')
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false,
    whatsapp_phone = EXCLUDED.whatsapp_phone;

-- Yasmim Rodrigues (yasmimrodriguesdsa@gmail.com)
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked, whatsapp_phone)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'Yasmim Rodrigues dos Santos', true, false, '+5511999999998')
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false,
    whatsapp_phone = EXCLUDED.whatsapp_phone;

-- Portal ChicoSabeTudo (faleconosco@chicosabetudo.com.br)
INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked, whatsapp_phone)
VALUES ('705fd72e-c3cd-4009-b8cd-ef7b2645bc12', 'Portal ChicoSabeTudo', true, false, '+5511999999997')
ON CONFLICT (user_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    is_approved = true,
    access_revoked = false,
    whatsapp_phone = EXCLUDED.whatsapp_phone;

-- ============================================================================
-- 2. CRIAR ROLES PARA OS USUÁRIOS
-- ============================================================================

-- Francisco Alves
INSERT INTO public.user_roles (user_id, role)
VALUES ('610e7321-e707-45c8-b48d-7c86f31f1750', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- Yasmim Rodrigues
INSERT INTO public.user_roles (user_id, role)
VALUES ('bfbf7dbe-3f41-4667-ae86-8978d0fed605', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- Portal ChicoSabeTudo
INSERT INTO public.user_roles (user_id, role)
VALUES ('705fd72e-c3cd-4009-b8cd-ef7b2645bc12', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 3. VERIFICAÇÃO FINAL
-- ============================================================================

SELECT 
  p.user_id,
  p.full_name as nome,
  p.whatsapp_phone,
  p.is_approved,
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
GROUP BY p.user_id, p.full_name, p.whatsapp_phone, p.is_approved, ur.role
ORDER BY total_noticias DESC;
