-- ============================================================================
-- CONFIGURAÇÃO AUTOMÁTICA PARA NOVOS AUTORES
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. FUNÇÃO PARA CRIAR PROFILE AUTOMATICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, is_approved, access_revoked)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    false, -- Novos usuários precisam de aprovação
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. TRIGGER PARA EXECUTAR AUTOMATICAMENTE
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. FUNÇÃO PARA APROVAR USUÁRIO (ADMIN)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.approve_user(user_uuid UUID, user_role TEXT DEFAULT 'redator')
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Atualizar profile para aprovado
  UPDATE public.profiles 
  SET is_approved = true, access_revoked = false
  WHERE user_id = user_uuid;
  
  -- Adicionar role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_uuid, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Retornar resultado
  SELECT json_build_object(
    'success', true,
    'message', 'Usuário aprovado com sucesso',
    'user_id', user_uuid,
    'role', user_role
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. FUNÇÃO PARA LISTAR USUÁRIOS PENDENTES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ,
  is_approved BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. POLÍTICAS RLS PARA AS FUNÇÕES
-- ============================================================================

-- Permitir que admins vejam usuários pendentes
CREATE POLICY "Admins can view pending users" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Permitir que admins aprovem usuários
CREATE POLICY "Admins can approve users" ON public.profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);
