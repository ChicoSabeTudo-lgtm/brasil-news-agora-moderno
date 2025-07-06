-- Add scheduled_publish_at column to news table for scheduling functionality
ALTER TABLE public.news 
ADD COLUMN scheduled_publish_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance when querying scheduled news
CREATE INDEX idx_news_scheduled_publish_at ON public.news(scheduled_publish_at) 
WHERE scheduled_publish_at IS NOT NULL AND is_published = false;

-- Create function to automatically publish scheduled news
CREATE OR REPLACE FUNCTION public.publish_scheduled_news()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.news 
  SET 
    is_published = true,
    published_at = now(),
    updated_at = now()
  WHERE 
    scheduled_publish_at IS NOT NULL 
    AND scheduled_publish_at <= now()
    AND is_published = false;
END;
$$;