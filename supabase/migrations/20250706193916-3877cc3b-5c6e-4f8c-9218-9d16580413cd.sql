-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#0066cc',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Categories are publicly viewable" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins e gestores podem gerenciar categorias"
ON public.categories
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'gestor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'gestor')
);

CREATE POLICY "Redatores, gestores e admins podem ver categorias"
ON public.categories
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'redator') OR
  public.has_role(auth.uid(), 'gestor') OR
  public.has_role(auth.uid(), 'admin')
);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, color, sort_order) VALUES 
('Política', 'politica', 'Notícias sobre política nacional e internacional', '#dc2626', 1),
('Economia', 'economia', 'Economia, mercado financeiro e negócios', '#059669', 2),
('Esportes', 'esportes', 'Cobertura esportiva nacional e internacional', '#ea580c', 3),
('Tecnologia', 'tecnologia', 'Inovação, startups e tecnologia', '#2563eb', 4),
('Internacional', 'internacional', 'Notícias do mundo todo', '#7c3aed', 5),
('Nacional', 'nacional', 'Acontecimentos nacionais importantes', '#0891b2', 6),
('Entretenimento', 'entretenimento', 'Cultura, cinema, música e celebridades', '#e11d48', 7),
('Saúde', 'saude', 'Saúde, medicina e bem-estar', '#16a34a', 8);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();