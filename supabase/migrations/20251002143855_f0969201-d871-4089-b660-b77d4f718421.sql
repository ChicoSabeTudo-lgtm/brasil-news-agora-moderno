-- Create company_documents table
CREATE TABLE IF NOT EXISTS public.company_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  document_type TEXT NOT NULL, -- ex: contrato_social, certidoes, alvara, etc
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins e redatores podem gerenciar documentos"
  ON public.company_documents
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'));

-- Create storage bucket for company documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-documents', 'company-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company documents
CREATE POLICY "Admins e redatores podem visualizar documentos da empresa"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'company-documents' AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'))
  );

CREATE POLICY "Admins e redatores podem fazer upload de documentos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-documents' AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'))
  );

CREATE POLICY "Admins e redatores podem deletar documentos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'company-documents' AND
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'))
  );

-- Trigger for updated_at
CREATE TRIGGER update_company_documents_updated_at
  BEFORE UPDATE ON public.company_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();