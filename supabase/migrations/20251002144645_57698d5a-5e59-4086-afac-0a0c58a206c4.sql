-- Create company_certifications table
CREATE TABLE IF NOT EXISTS public.company_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_type TEXT NOT NULL CHECK (certification_type IN ('municipal', 'fgts', 'estadual', 'trabalhista', 'federal')),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expiring_soon', 'expired')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.company_certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins e redatores podem gerenciar certidões"
  ON public.company_certifications
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_company_certifications_updated_at
  BEFORE UPDATE ON public.company_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_finance_updated_at();

-- Function to update certification status based on expiry date
CREATE OR REPLACE FUNCTION public.update_certification_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update expired certifications
  UPDATE public.company_certifications
  SET status = 'expired'
  WHERE expiry_date < CURRENT_DATE
  AND status != 'expired';
  
  -- Update expiring soon (30 days or less)
  UPDATE public.company_certifications
  SET status = 'expiring_soon'
  WHERE expiry_date >= CURRENT_DATE
  AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND status != 'expiring_soon';
  
  -- Update active certifications
  UPDATE public.company_certifications
  SET status = 'active'
  WHERE expiry_date > CURRENT_DATE + INTERVAL '30 days'
  AND status != 'active';
END;
$$;