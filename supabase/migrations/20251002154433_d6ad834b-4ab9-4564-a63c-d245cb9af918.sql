-- Create legal_cases table for judicial processes management
CREATE TABLE public.legal_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT NOT NULL,
  case_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  lawyer_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  hearing_date DATE,
  plaintiff TEXT NOT NULL,
  defendant TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Create legal_case_documents table
CREATE TABLE public.legal_case_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legal_case_id UUID NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_case_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legal_cases
CREATE POLICY "Admins e redatores podem gerenciar processos judiciais"
  ON public.legal_cases
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- RLS Policies for legal_case_documents
CREATE POLICY "Admins e redatores podem gerenciar documentos de processos"
  ON public.legal_case_documents
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_legal_cases_updated_at
  BEFORE UPDATE ON public.legal_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_legal_cases_hearing_date ON public.legal_cases(hearing_date);
CREATE INDEX idx_legal_cases_status ON public.legal_cases(status);
CREATE INDEX idx_legal_cases_case_number ON public.legal_cases(case_number);
CREATE INDEX idx_legal_case_documents_case_id ON public.legal_case_documents(legal_case_id);