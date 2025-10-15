-- ============================================================================
-- COMO APROVAR NOVOS AUTORES MANUALMENTE
-- ============================================================================

-- ============================================================================
-- 1. VER USUÁRIOS PENDENTES
-- ============================================================================

-- Execute esta query para ver todos os usuários que se cadastraram mas não foram aprovados
SELECT 
  p.user_id,
  u.email,
  p.full_name,
  u.created_at,
  p.is_approved
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.is_approved = false
ORDER BY u.created_at DESC;

-- ============================================================================
-- 2. APROVAR USUÁRIO ESPECÍFICO
-- ============================================================================

-- Substitua 'USER_ID_AQUI' pelo ID do usuário que você quer aprovar
-- Substitua 'redator' pelo role desejado (redator, editor, admin)

-- Aprovar profile
UPDATE public.profiles 
SET is_approved = true, access_revoked = false
WHERE user_id = 'USER_ID_AQUI';

-- Adicionar role
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_AQUI', 'redator')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 3. EXEMPLO PRÁTICO
-- ============================================================================

-- Se um novo usuário se cadastrou com ID: 12345678-1234-1234-1234-123456789012
-- e você quer aprová-lo como redator:

-- UPDATE public.profiles 
-- SET is_approved = true, access_revoked = false
-- WHERE user_id = '12345678-1234-1234-1234-123456789012';

-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('12345678-1234-1234-1234-123456789012', 'redator')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 4. VERIFICAR SE FUNCIONOU
-- ============================================================================

-- Execute esta query para confirmar que o usuário foi aprovado
SELECT 
  p.user_id,
  p.full_name,
  p.is_approved,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE p.user_id = 'USER_ID_AQUI';
