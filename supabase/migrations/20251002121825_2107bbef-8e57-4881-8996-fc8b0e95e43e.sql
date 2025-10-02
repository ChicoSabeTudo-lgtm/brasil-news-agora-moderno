-- Criar tabela de projetos financeiros
CREATE TABLE IF NOT EXISTS public.finance_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS public.finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de contatos (clientes e fornecedores)
CREATE TABLE IF NOT EXISTS public.finance_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cliente', 'fornecedor')),
  email TEXT,
  phone TEXT,
  company TEXT,
  contact_person TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de transações financeiras
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  description TEXT NOT NULL,
  value NUMERIC(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  pay_date DATE,
  status TEXT NOT NULL CHECK (status IN ('Pendente', 'Pago', 'Atrasado')),
  supplier TEXT,
  contact_id UUID REFERENCES public.finance_contacts(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.finance_projects(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.finance_categories(id) ON DELETE SET NULL,
  method TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de anexos de transações
CREATE TABLE IF NOT EXISTS public.finance_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.finance_transactions(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar bucket de storage para anexos financeiros
INSERT INTO storage.buckets (id, name, public)
VALUES ('finance-attachments', 'finance-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.finance_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para finance_projects
CREATE POLICY "Admins e redatores podem gerenciar projetos"
  ON public.finance_projects
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Políticas RLS para finance_categories
CREATE POLICY "Admins e redatores podem gerenciar categorias"
  ON public.finance_categories
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Políticas RLS para finance_contacts
CREATE POLICY "Admins e redatores podem gerenciar contatos"
  ON public.finance_contacts
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Políticas RLS para finance_transactions
CREATE POLICY "Admins e redatores podem gerenciar transações"
  ON public.finance_transactions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Políticas RLS para finance_attachments
CREATE POLICY "Admins e redatores podem gerenciar anexos"
  ON public.finance_attachments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role));

-- Políticas de storage para finance-attachments
CREATE POLICY "Admins e redatores podem fazer upload de anexos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'finance-attachments' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role)));

CREATE POLICY "Admins e redatores podem visualizar anexos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'finance-attachments' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role)));

CREATE POLICY "Admins e redatores podem deletar anexos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'finance-attachments' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role)));

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_finance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_finance_projects_updated_at
  BEFORE UPDATE ON public.finance_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_finance_updated_at();

CREATE TRIGGER update_finance_categories_updated_at
  BEFORE UPDATE ON public.finance_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_finance_updated_at();

CREATE TRIGGER update_finance_contacts_updated_at
  BEFORE UPDATE ON public.finance_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_finance_updated_at();

CREATE TRIGGER update_finance_transactions_updated_at
  BEFORE UPDATE ON public.finance_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_finance_updated_at();