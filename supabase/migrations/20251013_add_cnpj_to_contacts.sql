-- Adicionar coluna CNPJ à tabela finance_contacts
ALTER TABLE public.finance_contacts
ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Comentário para documentar a coluna
COMMENT ON COLUMN public.finance_contacts.cnpj IS 'CNPJ do cliente (opcional) - formato: 00.000.000/0000-00';

