-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL,
  invoice_series TEXT,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('servicos', 'produtos', 'mista')),
  
  -- Client data
  client_id UUID REFERENCES finance_contacts(id),
  client_name TEXT NOT NULL,
  client_document TEXT NOT NULL,
  
  -- Financial info
  issue_date DATE NOT NULL,
  due_date DATE,
  total_value NUMERIC NOT NULL,
  tax_value NUMERIC DEFAULT 0,
  net_value NUMERIC GENERATED ALWAYS AS (total_value - tax_value) STORED,
  
  -- Payment info
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'overdue')),
  payment_method TEXT,
  payment_date DATE,
  
  -- Description
  description TEXT,
  notes TEXT,
  
  -- Files
  invoice_pdf_path TEXT,
  invoice_pdf_url TEXT,
  invoice_xml_path TEXT,
  invoice_xml_url TEXT,
  payment_proof_path TEXT,
  payment_proof_url TEXT,
  
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins e redatores podem gerenciar notas fiscais"
  ON public.invoices
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_finance_updated_at();

-- Function to update invoice status based on due date
CREATE OR REPLACE FUNCTION public.update_invoice_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update overdue invoices
  UPDATE public.invoices
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE
  AND status = 'pending';
END;
$$;