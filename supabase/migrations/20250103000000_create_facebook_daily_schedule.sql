-- Create facebook_daily_schedule table for Facebook Daily Schedule
CREATE TABLE public.facebook_daily_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_title TEXT NOT NULL,
  news_url TEXT NOT NULL,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.facebook_daily_schedule ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (admin, redator, gestor)
CREATE POLICY "facebook_schedule_select" ON public.facebook_daily_schedule
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'redator'::app_role) OR 
    public.has_role(auth.uid(), 'gestor'::app_role)
  );

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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_facebook_schedule_updated_at
  BEFORE UPDATE ON public.facebook_daily_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to clean old Facebook schedule entries (fuso Fortaleza)
CREATE OR REPLACE FUNCTION public.clean_old_facebook_schedule()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete entries from previous days (using Fortaleza timezone)
  DELETE FROM public.facebook_daily_schedule
  WHERE scheduled_date < (CURRENT_DATE AT TIME ZONE 'America/Fortaleza')::date;
END;
$$;

-- Create index for performance
CREATE INDEX idx_facebook_schedule_date_time ON public.facebook_daily_schedule(scheduled_date, scheduled_time);

-- Comment for documentation
COMMENT ON TABLE public.facebook_daily_schedule IS 'Tabela para gerenciar pauta diária do Facebook com limpeza automática';
COMMENT ON FUNCTION public.clean_old_facebook_schedule() IS 'Remove registros de dias anteriores da pauta do Facebook (fuso America/Fortaleza)';
