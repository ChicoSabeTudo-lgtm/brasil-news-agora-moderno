-- Create storage bucket for advertisement images
INSERT INTO storage.buckets (id, name, public) VALUES ('advertisements', 'advertisements', true);

-- Create policies for advertisement images
CREATE POLICY "Advertisement images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'advertisements');

CREATE POLICY "Admins e redatores podem enviar imagens de anúncios" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'advertisements' AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'redator'::app_role)
  )
);

CREATE POLICY "Admins e redatores podem atualizar imagens de anúncios" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'advertisements' AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'redator'::app_role)
  )
);

CREATE POLICY "Admins e redatores podem remover imagens de anúncios" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'advertisements' AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'redator'::app_role)
  )
);