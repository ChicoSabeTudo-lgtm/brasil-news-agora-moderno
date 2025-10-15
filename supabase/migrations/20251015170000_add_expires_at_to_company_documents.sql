-- Add expires_at column to company_documents for certificate validity control
ALTER TABLE public.company_documents
ADD COLUMN IF NOT EXISTS expires_at DATE;

COMMENT ON COLUMN public.company_documents.expires_at
IS 'Data de validade opcional para certidões e outros documentos.';

