-- ========================================
-- CRIAR TABELA E CONFIGURAÇÕES PARA PAGAMENTOS INSS
-- Execute este SQL no painel do Supabase
-- ========================================

-- Create INSS payments table
CREATE TABLE IF NOT EXISTS public.inss_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_month DATE NOT NULL,
  due_date DATE NOT NULL,
  value NUMERIC NOT NULL,
  payment_date DATE,
  observations TEXT,
  inss_boleto_path TEXT,
  inss_boleto_url TEXT,
  payment_proof_path TEXT,
  payment_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inss_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Admins e redatores podem gerenciar INSS" ON public.inss_payments;

-- RLS Policies
CREATE POLICY "Admins e redatores podem gerenciar INSS"
  ON public.inss_payments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS update_inss_payments_updated_at ON public.inss_payments;

-- Trigger for updated_at
CREATE TRIGGER update_inss_payments_updated_at
  BEFORE UPDATE ON public.inss_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_finance_updated_at();

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.update_inss_status();

-- Function to update INSS status
CREATE OR REPLACE FUNCTION public.update_inss_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update overdue INSS payments
  UPDATE public.inss_payments
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE
  AND status = 'pending';
END;
$$;

-- Grant permissions
GRANT ALL ON public.inss_payments TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_inss_status() TO authenticated;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_inss_payments_reference_month ON public.inss_payments(reference_month);
CREATE INDEX IF NOT EXISTS idx_inss_payments_status ON public.inss_payments(status);
CREATE INDEX IF NOT EXISTS idx_inss_payments_due_date ON public.inss_payments(due_date);
CREATE INDEX IF NOT EXISTS idx_inss_payments_uploaded_by ON public.inss_payments(uploaded_by);

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Tabela inss_payments criada com sucesso!';
END $$;

