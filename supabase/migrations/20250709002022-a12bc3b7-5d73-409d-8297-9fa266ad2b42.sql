-- Create function to increment video views
CREATE OR REPLACE FUNCTION public.increment_video_views(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.videos 
  SET views = views + 1,
      updated_at = now()
  WHERE id = video_id;
END;
$$;