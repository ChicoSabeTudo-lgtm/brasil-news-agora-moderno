-- ============================================================================
-- CORREÇÃO DE SEGURANÇA - Storage Policies
-- Data: 2025-10-15
-- Objetivo: Restringir upload/delete de imagens apenas para redatores/admins
-- Impacto: Zero no funcionamento (apenas admin/redatores fazem upload)
-- ============================================================================

-- Remover policies permissivas existentes
DROP POLICY IF EXISTS "Authenticated users can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update news images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete news images" ON storage.objects;

-- UPLOAD: Apenas redatores e admins podem fazer upload
CREATE POLICY "Apenas redatores e admins podem fazer upload de imagens" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'news-images' AND 
  (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'redator')
    )
  )
);

-- UPDATE: Apenas redatores e admins podem atualizar
CREATE POLICY "Apenas redatores e admins podem atualizar imagens" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'news-images' AND 
  (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'redator')
    )
  )
);

-- DELETE: Apenas admins podem deletar (proteção extra)
CREATE POLICY "Apenas admins podem deletar imagens" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'news-images' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- SELECT continua público (correto para exibição de imagens)
-- Não precisa alterar pois a policy "News images are publicly accessible" já existe

-- Comentários
COMMENT ON POLICY "Apenas redatores e admins podem fazer upload de imagens" ON storage.objects 
IS 'Restringe upload de imagens apenas para usuários com role de redator ou admin';

COMMENT ON POLICY "Apenas admins podem deletar imagens" ON storage.objects 
IS 'Apenas administradores podem deletar imagens para prevenir perda acidental de dados';

