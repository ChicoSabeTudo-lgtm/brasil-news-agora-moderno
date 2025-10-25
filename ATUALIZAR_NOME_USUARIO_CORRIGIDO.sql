-- Script CORRIGIDO para atualizar o nome do usuário na tabela profiles
-- Execute este script no Supabase SQL Editor

-- 1. Verificar a estrutura da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar se o registro já existe
SELECT *
FROM public.profiles
WHERE id = '610e7321-e707-45c8-b48d-7c86f31f1750';

-- 3. OPÇÃO A: Se o registro JÁ EXISTE, apenas atualizar o full_name
UPDATE public.profiles
SET 
  full_name = 'Francisco Alves',
  updated_at = NOW()
WHERE id = '610e7321-e707-45c8-b48d-7c86f31f1750';

-- 4. OPÇÃO B: Se o registro NÃO EXISTE, criar com todos os campos obrigatórios
INSERT INTO public.profiles (id, user_id, full_name, email, updated_at)
VALUES (
  '610e7321-e707-45c8-b48d-7c86f31f1750',
  '610e7321-e707-45c8-b48d-7c86f31f1750',  -- user_id = id
  'Francisco Alves',
  'chicop7@gmail.com',
  NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
  full_name = 'Francisco Alves',
  updated_at = NOW();

-- 5. Verificar se foi atualizado corretamente
SELECT 
  id,
  user_id,
  full_name,
  email,
  updated_at
FROM public.profiles
WHERE id = '610e7321-e707-45c8-b48d-7c86f31f1750';
