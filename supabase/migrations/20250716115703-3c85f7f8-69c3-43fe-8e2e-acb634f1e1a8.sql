-- Create bucket for news downloads
INSERT INTO storage.buckets (id, name, public) VALUES ('news-downloads', 'news-downloads', true);

-- Create table for news downloads
CREATE TABLE public.news_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_news_downloads_news FOREIGN KEY (news_id) REFERENCES public.news(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.news_downloads ENABLE ROW LEVEL SECURITY;

-- Create policies for news downloads
CREATE POLICY "News downloads are publicly viewable" 
ON public.news_downloads 
FOR SELECT 
USING (true);

CREATE POLICY "Redators and admins can manage news downloads" 
ON public.news_downloads 
FOR ALL 
USING (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'redator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create storage policies for news downloads
CREATE POLICY "News downloads are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-downloads');

CREATE POLICY "Redators and admins can upload news downloads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-downloads' AND (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('redator', 'admin')
  )
));

CREATE POLICY "Redators and admins can update news downloads" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-downloads' AND (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('redator', 'admin')
  )
));

CREATE POLICY "Redators and admins can delete news downloads" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-downloads' AND (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('redator', 'admin')
  )
));

-- Create trigger for updated_at
CREATE TRIGGER update_news_downloads_updated_at
BEFORE UPDATE ON public.news_downloads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_news_downloads_news_id ON public.news_downloads(news_id);
CREATE INDEX idx_news_downloads_sort_order ON public.news_downloads(sort_order);