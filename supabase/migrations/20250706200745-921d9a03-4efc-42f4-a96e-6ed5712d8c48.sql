-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('header', 'politics', 'sports', 'international')),
  ad_code TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Create policies for advertisements
CREATE POLICY "Advertisements are publicly viewable when active" 
ON public.advertisements 
FOR SELECT 
USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));

CREATE POLICY "Admins can manage all advertisements" 
ON public.advertisements 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Redators can view all advertisements" 
ON public.advertisements 
FOR SELECT 
USING (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();