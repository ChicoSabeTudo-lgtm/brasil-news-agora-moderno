-- Create storage bucket for news images
INSERT INTO storage.buckets (id, name, public) VALUES ('news-images', 'news-images', true);

-- Create policies for news images storage
CREATE POLICY "News images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update news images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete news images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

-- Create table for news gallery images
CREATE TABLE public.news_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on news_images
ALTER TABLE public.news_images ENABLE ROW LEVEL SECURITY;

-- Create policies for news_images
CREATE POLICY "News images are publicly viewable" 
ON public.news_images 
FOR SELECT 
USING (true);

CREATE POLICY "Redators and admins can manage news images" 
ON public.news_images 
FOR ALL 
USING (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_news_images_updated_at
BEFORE UPDATE ON public.news_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Remove image_url column from news table since we're using gallery now
ALTER TABLE public.news DROP COLUMN IF EXISTS image_url;