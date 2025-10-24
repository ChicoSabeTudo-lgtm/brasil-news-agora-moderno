-- 🔧 APLICAR MIGRATION: Pauta Facebook (Diária)
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- 1. Criar tabela facebook_daily_schedule
CREATE TABLE IF NOT EXISTS public.facebook_daily_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_title TEXT NOT NULL,
  news_url TEXT NOT NULL,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.facebook_daily_schedule ENABLE ROW LEVEL SECURITY;

-- 3. Criar RLS Policies (admin, redator, gestor)
DROP POLICY IF EXISTS "facebook_schedule_select" ON public.facebook_daily_schedule;
CREATE POLICY "facebook_schedule_select" ON public.facebook_daily_schedule
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'redator'::app_role) OR 
    public.has_role(auth.uid(), 'gestor'::app_role)
  );

DROP POLICY IF EXISTS "facebook_schedule_write" ON public.facebook_daily_schedule;
CREATE POLICY "facebook_schedule_write" ON public.facebook_daily_schedule
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'redator'::app_role) OR 
    public.has_role(auth.uid(), 'gestor'::app_role)
  ) WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'redator'::app_role) OR 
    public.has_role(auth.uid(), 'gestor'::app_role)
  );

-- 4. Criar trigger para timestamp updates
DROP TRIGGER IF EXISTS update_facebook_schedule_updated_at ON public.facebook_daily_schedule;
CREATE TRIGGER update_facebook_schedule_updated_at
  BEFORE UPDATE ON public.facebook_daily_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Função de limpeza automática (fuso Fortaleza)
CREATE OR REPLACE FUNCTION public.clean_old_facebook_schedule()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Deletar entradas de dias anteriores (usando fuso Fortaleza)
  DELETE FROM public.facebook_daily_schedule
  WHERE scheduled_date < (CURRENT_DATE AT TIME ZONE 'America/Fortaleza')::date;
END;
$$;

-- 6. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_facebook_schedule_date_time ON public.facebook_daily_schedule(scheduled_date, scheduled_time);

-- 7. Comentários para documentação
COMMENT ON TABLE public.facebook_daily_schedule IS 'Tabela para gerenciar pauta diária do Facebook com limpeza automática';
COMMENT ON FUNCTION public.clean_old_facebook_schedule() IS 'Remove registros de dias anteriores da pauta do Facebook (fuso America/Fortaleza)';

-- 8. Verificar se foi criada corretamente
SELECT COUNT(*) as total_registros FROM public.facebook_daily_schedule;

-- 9. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'facebook_daily_schedule' 
ORDER BY ordinal_position;
