-- ============================================
-- ADICIONAR CAMPO CNPJ À TABELA DE CLIENTES
-- ============================================
-- Execute este SQL no Supabase Dashboard
-- SQL Editor → Nova Query → Cole e Execute
-- ============================================

-- Adicionar coluna CNPJ à tabela finance_contacts
ALTER TABLE public.finance_contacts
ADD COLUMN IF NOT EXISTS cnpj TEXT;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.finance_contacts.cnpj IS 'CNPJ do cliente (opcional) - formato: 00.000.000/0000-00';

-- Verificar se a coluna foi adicionada com sucesso
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'finance_contacts'
  AND column_name = 'cnpj';

-- ============================================
-- RESULTADO ESPERADO:
-- column_name | data_type | is_nullable | column_default
-- cnpj        | text      | YES         | null
-- ============================================

