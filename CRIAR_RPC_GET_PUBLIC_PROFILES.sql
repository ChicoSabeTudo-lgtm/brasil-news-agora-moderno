-- Cria uma função RPC segura para obter nomes públicos de perfis
-- Use no Supabase SQL Editor antes de atualizar o frontend

-- Remove a função antiga se já existir (opcional e seguro)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'get_public_profiles'
      AND n.nspname = 'public'
  ) THEN
    DROP FUNCTION public.get_public_profiles(p_user_ids uuid[]);
  END IF;
END $$;

-- Cria função SECURITY DEFINER para retornar somente campos públicos
CREATE OR REPLACE FUNCTION public.get_public_profiles(p_user_ids uuid[])
RETURNS TABLE (
  user_id uuid,
  full_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, COALESCE(NULLIF(BTRIM(full_name), ''), NULL) AS full_name
  FROM public.profiles
  WHERE user_id = ANY(p_user_ids);
$$;

-- Permissões de execução para clientes web e logados
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO anon, authenticated;

-- Observação: esta função não expõe dados sensíveis (apenas user_id e full_name),
-- e respeita o princípio do menor privilégio via SECURITY DEFINER.

