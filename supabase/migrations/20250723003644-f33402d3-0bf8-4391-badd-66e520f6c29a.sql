-- Create daily_briefs table for "Pautas do Dia"
CREATE TABLE public.daily_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  brief_date DATE NOT NULL DEFAULT CURRENT_DATE,
  brief_time TIME NOT NULL DEFAULT CURRENT_TIME,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_andamento', 'finalizada')),
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta')),
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_briefs ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_briefs
CREATE POLICY "Redators and admins can manage daily briefs"
ON public.daily_briefs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'redator') OR has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'redator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Daily briefs are viewable by authenticated users"
ON public.daily_briefs
FOR SELECT
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_briefs_updated_at
  BEFORE UPDATE ON public.daily_briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();