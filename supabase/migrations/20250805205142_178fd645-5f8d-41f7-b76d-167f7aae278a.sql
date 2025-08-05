-- Remover a política restritiva atual para logo apenas
DROP POLICY IF EXISTS "Anyone can view site logo" ON public.site_configurations;

-- Criar política mais abrangente para acesso público às configurações do site
CREATE POLICY "Public site configurations access" 
ON public.site_configurations 
FOR SELECT 
USING (true);