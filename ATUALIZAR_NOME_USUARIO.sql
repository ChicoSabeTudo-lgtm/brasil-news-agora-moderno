-- Script para verificar e atualizar o nome do usuário na tabela profiles
-- Execute este script no Supabase SQL Editor

-- 1. Verificar os dados atuais do usuário
SELECT 
  id,
  full_name,
  email,
  created_at
FROM auth.users
WHERE email = 'chicop7@gmail.com';

-- 2. Verificar a tabela profiles
SELECT 
  id,
  full_name,
  email,
  updated_at
FROM public.profiles
WHERE id = '610e7321-e707-45c8-b48d-7c86f31f1750';

-- 3. Atualizar o nome na tabela profiles
UPDATE public.profiles
SET 
  full_name = 'Francisco Alves',
  updated_at = NOW()
WHERE id = '610e7321-e707-45c8-b48d-7c86f31f1750';

-- 4. Verificar se foi atualizado
SELECT 
  id,
  full_name,
  email,
  updated_at
FROM public.profiles
WHERE id = '610e7321-e707-45c8-b48d-7c86f31f1750';

-- 5. (OPCIONAL) Se a tabela profiles não tiver o registro, criar
INSERT INTO public.profiles (id, full_name, email, updated_at)
VALUES (
  '610e7321-e707-45c8-b48d-7c86f31f1750',
  'Francisco Alves',
  'chicop7@gmail.com',
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  full_name = 'Francisco Alves',
  updated_at = NOW();
