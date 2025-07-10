-- Create storage bucket for advertisement images
INSERT INTO storage.buckets (id, name, public) VALUES ('advertisements', 'advertisements', true);

-- Create policies for advertisement images
CREATE POLICY "Advertisement images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'advertisements');

CREATE POLICY "Admins and redators can upload advertisement images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'advertisements' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role)));

CREATE POLICY "Admins and redators can update advertisement images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'advertisements' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role)));

CREATE POLICY "Admins and redators can delete advertisement images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'advertisements' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'redator'::app_role)));