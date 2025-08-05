-- Inserir a nova configuração de logo do site
INSERT INTO public.site_configurations (logo_url)
VALUES ('/lovable-uploads/chicosabe-logo.png')
ON CONFLICT DO NOTHING;