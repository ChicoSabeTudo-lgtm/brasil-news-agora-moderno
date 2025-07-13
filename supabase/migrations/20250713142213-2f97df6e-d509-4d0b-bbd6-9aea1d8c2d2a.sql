-- Adicionar coluna para logo na tabela site_configurations
ALTER TABLE public.site_configurations 
ADD COLUMN logo_url TEXT;

-- Criar bucket para logos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para o bucket logos
CREATE POLICY "Admins podem fazer upload de logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Logos são públicos para visualização" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Admins podem atualizar logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem deletar logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'logos' AND has_role(auth.uid(), 'admin'::app_role));