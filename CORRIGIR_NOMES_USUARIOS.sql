-- Script para corrigir nomes dos usuários
-- Execute este SQL no Supabase

-- 1. Primeiro, vamos ver quais usuários não têm perfil
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as nome_do_metadata,
  p.full_name as nome_do_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY u.created_at DESC;

-- 2. Criar perfis para usuários que não têm
-- Usando o nome dos metadados ou a parte do email antes do @
INSERT INTO public.profiles (user_id, full_name, created_at, updated_at)
SELECT 
  u.id,
  CASE 
    WHEN u.raw_user_meta_data->>'full_name' IS NOT NULL 
    THEN u.raw_user_meta_data->>'full_name'
    ELSE INITCAP(REPLACE(split_part(u.email, '@', 1), '.', ' '))
  END as full_name,
  u.created_at,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- 3. Atualizar perfis existentes que têm nomes incompletos
UPDATE public.profiles 
SET full_name = CASE 
  WHEN full_name IS NULL OR full_name = '' OR LENGTH(full_name) < 3
  THEN INITCAP(REPLACE(split_part(
    (SELECT email FROM auth.users WHERE id = profiles.user_id), '@', 1), '.', ' '))
  ELSE full_name
END
WHERE user_id IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.id = profiles.user_id
);

-- 4. Verificar o resultado final
SELECT 
  u.email,
  p.full_name,
  p.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
ORDER BY p.created_at DESC;
