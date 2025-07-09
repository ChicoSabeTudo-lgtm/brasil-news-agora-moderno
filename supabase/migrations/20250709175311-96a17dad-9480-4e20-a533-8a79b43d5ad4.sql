-- Create table for site configurations
CREATE TABLE public.site_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ads_txt_content text,
  header_code text,
  footer_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage site configurations" 
ON public.site_configurations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_configurations_updated_at
BEFORE UPDATE ON public.site_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration row
INSERT INTO public.site_configurations (ads_txt_content, header_code, footer_code) 
VALUES ('', '', '');