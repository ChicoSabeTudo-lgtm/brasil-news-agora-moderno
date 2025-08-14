-- Create analytics tables for real-time visitor tracking

-- Table to track page views with session data
CREATE TABLE IF NOT EXISTS public.analytics_page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  visitor_ip INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_url TEXT NOT NULL
);

-- Table to track time spent on site (read time)
CREATE TABLE IF NOT EXISTS public.analytics_read_time (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track active visitors (heartbeats)
CREATE TABLE IF NOT EXISTS public.analytics_heartbeats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  article_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
  visitor_ip INET,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track daily audience peaks
CREATE TABLE IF NOT EXISTS public.analytics_audience_peaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  peak_count INTEGER NOT NULL,
  peak_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all analytics tables
ALTER TABLE public.analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_read_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_audience_peaks ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics tables (public read for aggregated data)
CREATE POLICY "Analytics page views are publicly readable for aggregation" 
ON public.analytics_page_views 
FOR SELECT 
USING (true);

CREATE POLICY "Analytics read time is publicly readable for aggregation" 
ON public.analytics_read_time 
FOR SELECT 
USING (true);

CREATE POLICY "Analytics heartbeats are publicly readable for aggregation" 
ON public.analytics_heartbeats 
FOR SELECT 
USING (true);

CREATE POLICY "Analytics audience peaks are publicly readable" 
ON public.analytics_audience_peaks 
FOR SELECT 
USING (true);

-- Allow inserting analytics data from frontend
CREATE POLICY "Anyone can insert page views" 
ON public.analytics_page_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can insert read time" 
ON public.analytics_read_time 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can insert heartbeats" 
ON public.analytics_heartbeats 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_created_at ON public.analytics_page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_article_id ON public.analytics_page_views(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session_id ON public.analytics_page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_read_time_created_at ON public.analytics_read_time(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_read_time_article_id ON public.analytics_read_time(article_id);

CREATE INDEX IF NOT EXISTS idx_analytics_heartbeats_last_seen ON public.analytics_heartbeats(last_seen);
CREATE INDEX IF NOT EXISTS idx_analytics_heartbeats_session_id ON public.analytics_heartbeats(session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_audience_peaks_date ON public.analytics_audience_peaks(date);

-- Function to clean up old heartbeats (older than 5 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_old_heartbeats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  DELETE FROM public.analytics_heartbeats 
  WHERE last_seen < now() - interval '5 minutes';
END;
$$;

-- Function to get current online visitors count
CREATE OR REPLACE FUNCTION public.get_online_visitors_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  visitor_count integer;
BEGIN
  -- First cleanup old heartbeats
  PERFORM public.cleanup_old_heartbeats();
  
  -- Count unique sessions in last 5 minutes
  SELECT COUNT(DISTINCT session_id) INTO visitor_count
  FROM public.analytics_heartbeats
  WHERE last_seen > now() - interval '5 minutes';
  
  RETURN COALESCE(visitor_count, 0);
END;
$$;

-- Function to get average read time for a period
CREATE OR REPLACE FUNCTION public.get_average_read_time(days_back integer DEFAULT 7)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  avg_seconds integer;
BEGIN
  SELECT COALESCE(AVG(seconds), 0)::integer INTO avg_seconds
  FROM public.analytics_read_time
  WHERE created_at > now() - (days_back || ' days')::interval
  AND seconds > 0 AND seconds < 3600; -- Filter out unrealistic values
  
  RETURN COALESCE(avg_seconds, 150); -- Default to 2.5 minutes
END;
$$;

-- Function to get today's peak audience
CREATE OR REPLACE FUNCTION public.get_todays_peak_audience()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  peak_count integer;
BEGIN
  SELECT COALESCE(MAX(peak_count), 0) INTO peak_count
  FROM public.analytics_audience_peaks
  WHERE date = CURRENT_DATE;
  
  -- If no peak recorded today, return current online count
  IF peak_count = 0 THEN
    SELECT public.get_online_visitors_count() INTO peak_count;
  END IF;
  
  RETURN COALESCE(peak_count, 0);
END;
$$;