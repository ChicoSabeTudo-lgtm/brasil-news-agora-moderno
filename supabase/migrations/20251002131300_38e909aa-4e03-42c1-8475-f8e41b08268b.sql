-- Criar tabela de anexos de PIs
CREATE TABLE IF NOT EXISTS public.insertion_order_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insertion_order_id UUID NOT NULL REFERENCES public.insertion_orders(id) ON DELETE CASCADE,
  attachment_type TEXT NOT NULL CHECK (attachment_type IN ('pi_document', 'marketing_material', 'proof')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.insertion_order_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins e redatores podem gerenciar anexos de PI"
  ON public.insertion_order_attachments
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'));

-- Trigger para updated_at
CREATE TRIGGER update_insertion_order_attachments_updated_at
  BEFORE UPDATE ON public.insertion_order_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket de storage para anexos de PI (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('insertion-order-attachments', 'insertion-order-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Admins e redatores podem visualizar anexos de PI"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'insertion-order-attachments' 
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'))
  );

CREATE POLICY "Admins e redatores podem fazer upload de anexos de PI"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'insertion-order-attachments'
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'))
  );

CREATE POLICY "Admins e redatores podem deletar anexos de PI"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'insertion-order-attachments'
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'redator'))
  );