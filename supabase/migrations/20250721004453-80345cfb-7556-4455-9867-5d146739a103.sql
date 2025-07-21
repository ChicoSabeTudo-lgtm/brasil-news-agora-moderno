-- Create storage bucket for news media files
INSERT INTO storage.buckets (id, name, public) VALUES ('news-media', 'news-media', true);

-- Create policies for news media uploads
CREATE POLICY "News media are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-media');

CREATE POLICY "Redators and admins can upload news media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'news-media' 
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('redator', 'admin')
    )
  )
);

CREATE POLICY "Redators and admins can update news media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'news-media' 
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('redator', 'admin')
    )
  )
);

CREATE POLICY "Redators and admins can delete news media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'news-media' 
  AND (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('redator', 'admin')
    )
  )
);

-- Create table to store news media metadata
CREATE TABLE public.news_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'video' or 'audio'
  mime_type TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER, -- duration in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news_media ENABLE ROW LEVEL SECURITY;

-- Create policies for news media table
CREATE POLICY "News media are publicly viewable" 
ON public.news_media 
FOR SELECT 
USING (true);

CREATE POLICY "Redators and admins can manage news media" 
ON public.news_media 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('redator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('redator', 'admin')
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_news_media_updated_at
  BEFORE UPDATE ON public.news_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();