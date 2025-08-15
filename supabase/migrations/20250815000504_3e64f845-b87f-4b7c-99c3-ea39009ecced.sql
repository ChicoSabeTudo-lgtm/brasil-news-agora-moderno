-- Criar tabela social_scheduled_posts se não existir
CREATE TABLE IF NOT EXISTS public.social_scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter', 'facebook', 'linkedin')),
  content TEXT NOT NULL,
  image_url TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  cron_job_id INTEGER,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Habilitar RLS
ALTER TABLE public.social_scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Criar políticas de RLS
CREATE POLICY "Users can view social scheduled posts" 
ON public.social_scheduled_posts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'redator')
  )
);

CREATE POLICY "Users can create social scheduled posts" 
ON public.social_scheduled_posts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'redator')
  )
  AND created_by = auth.uid()
);

CREATE POLICY "Users can update social scheduled posts" 
ON public.social_scheduled_posts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'redator')
  )
);

CREATE POLICY "Users can delete social scheduled posts" 
ON public.social_scheduled_posts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'redator')
  )
);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_social_scheduled_posts_updated_at
  BEFORE UPDATE ON public.social_scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns dados de exemplo para teste
INSERT INTO public.social_scheduled_posts (
  news_id, 
  platform, 
  content, 
  scheduled_for, 
  created_by, 
  status
) VALUES (
  (SELECT id FROM public.news LIMIT 1),
  'instagram',
  'Post de teste para Instagram #teste',
  now() + interval '1 day',
  '610e7321-e707-45c8-b48d-7c86f31f1750',
  'scheduled'
) ON CONFLICT DO NOTHING;