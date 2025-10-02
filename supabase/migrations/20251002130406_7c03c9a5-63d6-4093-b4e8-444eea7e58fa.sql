-- Tabela de Pedidos de Inserção (PI)
CREATE TABLE IF NOT EXISTS public.insertion_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pi_number TEXT NOT NULL UNIQUE,
  contact_id UUID REFERENCES public.finance_contacts(id) ON DELETE SET NULL,
  vehicle TEXT NOT NULL,
  value NUMERIC(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Pendente' CHECK (payment_status IN ('Pendente', 'Pago')),
  email_sent BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_insertion_orders_contact ON public.insertion_orders(contact_id);
CREATE INDEX idx_insertion_orders_pi_number ON public.insertion_orders(pi_number);
CREATE INDEX idx_insertion_orders_dates ON public.insertion_orders(start_date, end_date);
CREATE INDEX idx_insertion_orders_status ON public.insertion_orders(payment_status);

-- RLS
ALTER TABLE public.insertion_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e redatores podem gerenciar PIs"
  ON public.insertion_orders
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_insertion_orders_updated_at
  BEFORE UPDATE ON public.insertion_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_finance_updated_at();