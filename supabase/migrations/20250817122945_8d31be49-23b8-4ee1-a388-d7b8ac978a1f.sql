-- Limpar políticas RLS existentes da tabela social_scheduled_posts
DROP POLICY IF EXISTS "Redators and admins can manage social posts" ON social_scheduled_posts;

-- Criar políticas RLS mais específicas para social_scheduled_posts
CREATE POLICY "Redators and admins can view all social posts" 
ON social_scheduled_posts 
FOR SELECT 
USING (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Redators and admins can insert social posts" 
ON social_scheduled_posts 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Redators and admins can update social posts" 
ON social_scheduled_posts 
FOR UPDATE 
USING (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Redators and admins can delete social posts" 
ON social_scheduled_posts 
FOR DELETE 
USING (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));