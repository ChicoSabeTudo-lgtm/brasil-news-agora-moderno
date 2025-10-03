-- Políticas de acesso para o bucket company-documents
-- Nota: O bucket já existe conforme a configuração do projeto

DROP POLICY IF EXISTS "Admins e redatores podem fazer upload de certidões" ON storage.objects;
DROP POLICY IF EXISTS "Admins e redatores podem visualizar certidões" ON storage.objects;
DROP POLICY IF EXISTS "Admins e redatores podem deletar certidões" ON storage.objects;
DROP POLICY IF EXISTS "Admins e redatores podem atualizar certidões" ON storage.objects;

CREATE POLICY "Admins e redatores podem fazer upload de certidões"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-documents' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
);

CREATE POLICY "Admins e redatores podem visualizar certidões"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'company-documents'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
);

CREATE POLICY "Admins e redatores podem deletar certidões"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-documents'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
);

CREATE POLICY "Admins e redatores podem atualizar certidões"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-documents'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role))
);