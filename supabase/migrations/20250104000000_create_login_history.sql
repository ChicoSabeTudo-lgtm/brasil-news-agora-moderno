-- ============================================================================
-- LOGIN HISTORY - Histórico de logins no sistema
-- Data: 2025-01-04
-- Objetivo: Rastrear todos os logins realizados pelos usuários
-- ============================================================================

-- Criar tabela de histórico de logins
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_role TEXT,
  ip_address INET,
  user_agent TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  failure_reason TEXT
);

-- Enable RLS
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver o histórico completo de logins
CREATE POLICY "Admins podem visualizar todos os logins"
ON public.login_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Usuários podem ver apenas seus próprios logins
CREATE POLICY "Usuários podem ver seus próprios logins"
ON public.login_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Sistema pode inserir registros de login
CREATE POLICY "Sistema pode inserir login history"
ON public.login_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON public.login_history(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_success ON public.login_history(success);

-- Comentários
COMMENT ON TABLE public.login_history IS 'Histórico completo de logins no sistema';
COMMENT ON COLUMN public.login_history.user_id IS 'ID do usuário que fez login';
COMMENT ON COLUMN public.login_history.user_email IS 'Email do usuário (snapshot)';
COMMENT ON COLUMN public.login_history.user_role IS 'Role do usuário no momento do login';
COMMENT ON COLUMN public.login_history.success IS 'Se o login foi bem-sucedido';
COMMENT ON COLUMN public.login_history.failure_reason IS 'Motivo da falha (se aplicável)';

