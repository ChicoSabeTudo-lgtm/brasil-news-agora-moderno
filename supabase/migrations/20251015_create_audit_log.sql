-- ============================================================================
-- AUDIT LOG - Sistema de auditoria completo
-- Data: 2025-10-15
-- Objetivo: Rastrear mudanças críticas no sistema
-- ============================================================================

-- Criar tabela de audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'CUSTOM')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver audit log
CREATE POLICY "Apenas admins podem visualizar audit log"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Sistema pode inserir (via trigger)
CREATE POLICY "Sistema pode inserir no audit log"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

-- Função para log automático
CREATE OR REPLACE FUNCTION public.audit_log_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- INSERT
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_log (
      table_name,
      record_id,
      action,
      new_data,
      user_id
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'INSERT',
      to_jsonb(NEW),
      auth.uid()
    );
    RETURN NEW;
  
  -- UPDATE
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_log (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid()
    );
    RETURN NEW;
  
  -- DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_log (
      table_name,
      record_id,
      action,
      old_data,
      user_id
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      auth.uid()
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Adicionar triggers em tabelas críticas

-- Audit para site_configurations (mudanças de configuração)
DROP TRIGGER IF EXISTS audit_site_configurations ON public.site_configurations;
CREATE TRIGGER audit_site_configurations
  AFTER INSERT OR UPDATE OR DELETE ON public.site_configurations
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_function();

-- Audit para user_roles (mudanças de permissões)
DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_function();

-- Audit para news (criação/edição/deleção de notícias)
DROP TRIGGER IF EXISTS audit_news_changes ON public.news;
CREATE TRIGGER audit_news_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_function();

-- Comentários
COMMENT ON TABLE public.audit_log IS 'Sistema de auditoria para rastrear mudanças críticas';
COMMENT ON COLUMN public.audit_log.table_name IS 'Nome da tabela que foi modificada';
COMMENT ON COLUMN public.audit_log.action IS 'Tipo de ação: INSERT, UPDATE, DELETE ou CUSTOM';
COMMENT ON COLUMN public.audit_log.old_data IS 'Dados antes da modificação (UPDATE/DELETE)';
COMMENT ON COLUMN public.audit_log.new_data IS 'Dados após a modificação (INSERT/UPDATE)';

