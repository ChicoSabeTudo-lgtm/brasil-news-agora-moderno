-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id),
  author_id UUID REFERENCES auth.users(id),
  is_breaking BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  tags TEXT[],
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "News are publicly viewable when published" 
ON public.news 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Authenticated users can view all news" 
ON public.news 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Redators and admins can create news" 
ON public.news 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'redator'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Redators can update their own news, admins can update all" 
ON public.news 
FOR UPDATE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (has_role(auth.uid(), 'redator'::app_role) AND author_id = auth.uid())
);

CREATE POLICY "Admins can delete news" 
ON public.news 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate slug
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to slug format
  base_slug := lower(regexp_replace(
    regexp_replace(
      regexp_replace(title, '[áàâãä]', 'a', 'g'),
      '[éèêë]', 'e', 'g'
    ),
    '[íìîï]', 'i', 'g'
  ));
  base_slug := regexp_replace(
    regexp_replace(base_slug, '[óòôõö]', 'o', 'g'),
    '[úùûü]', 'u', 'g'
  );
  base_slug := regexp_replace(base_slug, '[ç]', 'c', 'g');
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s]', '', 'g');
  base_slug := regexp_replace(trim(base_slug), '\s+', '-', 'g');
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if necessary
  WHILE EXISTS (SELECT 1 FROM public.news WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create trigger to auto-generate slug
CREATE OR REPLACE FUNCTION public.set_news_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_news_slug_trigger
BEFORE INSERT OR UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.set_news_slug();