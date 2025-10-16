-- Tabela de propagandas/anúncios mensais
CREATE TABLE IF NOT EXISTS public.finance_advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.finance_contacts(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'reportagem', 'rede_social')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_finance_advertisements_contact ON public.finance_advertisements(contact_id);
CREATE INDEX idx_finance_advertisements_dates ON public.finance_advertisements(start_date, end_date);
CREATE INDEX idx_finance_advertisements_type ON public.finance_advertisements(ad_type);

-- RLS
ALTER TABLE public.finance_advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins, gestores e redatores podem gerenciar propagandas"
  ON public.finance_advertisements
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'gestor'::app_role) OR
    has_role(auth.uid(), 'redator'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'gestor'::app_role) OR
    has_role(auth.uid(), 'redator'::app_role)
  );

-- Trigger para updated_at
CREATE TRIGGER update_finance_advertisements_updated_at
  BEFORE UPDATE ON public.finance_advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_finance_updated_at();