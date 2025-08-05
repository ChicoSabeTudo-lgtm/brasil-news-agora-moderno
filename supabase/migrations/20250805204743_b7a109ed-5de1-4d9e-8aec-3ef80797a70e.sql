-- Permitir acesso público à logo do site
CREATE POLICY "Anyone can view site logo" 
ON public.site_configurations 
FOR SELECT 
USING (true);