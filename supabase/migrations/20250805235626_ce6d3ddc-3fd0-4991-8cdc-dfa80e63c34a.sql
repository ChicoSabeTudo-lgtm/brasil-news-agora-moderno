-- Verificar e ajustar política RLS para table instagram_images
-- O problema pode estar na verificação do auth.uid()

-- Primeiro, vamos remover a política INSERT existente
DROP POLICY IF EXISTS "Users can create their own instagram images" ON public.instagram_images;

-- Recriar com verificação mais robusta
CREATE POLICY "Users can create their own instagram images" ON public.instagram_images
FOR INSERT 
TO public
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id
);

-- Verificar se a sessão está funcionando corretamente
-- Criar função helper para debug das políticas RLS (APENAS TEMPORÁRIO)
CREATE OR REPLACE FUNCTION public.debug_rls_auth()
RETURNS TABLE(
  current_user_id UUID,
  session_exists BOOLEAN,
  test_user_id UUID
) 
LANGUAGE SQL 
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() as current_user_id,
    (auth.uid() IS NOT NULL) as session_exists,
    '610e7321-e707-45c8-b48d-7c86f31f1750'::UUID as test_user_id;
$$;