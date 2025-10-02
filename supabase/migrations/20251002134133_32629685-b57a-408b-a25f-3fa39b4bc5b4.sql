-- Criar tabela para dados da empresa
CREATE TABLE IF NOT EXISTS public.company_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  legal_name text NOT NULL,
  trade_name text NOT NULL,
  cnpj text NOT NULL,
  state_registration text,
  municipal_registration text,
  social_network text,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  bank_code text NOT NULL,
  bank_agency text NOT NULL,
  bank_account text NOT NULL,
  pix_key text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Admins e redatores podem visualizar dados da empresa"
ON public.company_data
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'redator'::app_role)
);

CREATE POLICY "Apenas admins podem gerenciar dados da empresa"
ON public.company_data
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_company_data_updated_at
BEFORE UPDATE ON public.company_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO public.company_data (
  legal_name,
  trade_name,
  cnpj,
  state_registration,
  municipal_registration,
  social_network,
  address,
  phone,
  email,
  bank_code,
  bank_agency,
  bank_account,
  pix_key
) VALUES (
  'ADRIANA PINTO PUREZA - ME',
  'CHICO SABE TUDO',
  '148.358.870-00142',
  '8535324',
  '5790',
  '@portalchicosabetudo',
  'R. Mal. Mascarenhas de Morais, CARDEAL BRANDO VILELA, Paulo Afonso',
  '75988194371',
  'chicop7@gmail.com',
  '077',
  '001',
  '32803036',
  'CNPJ 14835887000142'
) ON CONFLICT DO NOTHING;