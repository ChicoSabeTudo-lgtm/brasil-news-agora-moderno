-- Create DAS payments table
CREATE TABLE public.das_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_month DATE NOT NULL,
  due_date DATE NOT NULL,
  value NUMERIC NOT NULL,
  payment_date DATE,
  observations TEXT,
  das_boleto_path TEXT,
  das_boleto_url TEXT,
  payment_proof_path TEXT,
  payment_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.das_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins e redatores podem gerenciar DAS"
  ON public.das_payments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_das_payments_updated_at
  BEFORE UPDATE ON public.das_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_finance_updated_at();

-- Function to update DAS status
CREATE OR REPLACE FUNCTION public.update_das_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update overdue DAS payments
  UPDATE public.das_payments
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE
  AND status = 'pending';
END;
$$;