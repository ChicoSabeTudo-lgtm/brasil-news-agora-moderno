-- Atualizar a configuração de logo existente
UPDATE public.site_configurations 
SET logo_url = '/lovable-uploads/chicosabe-logo.png',
    updated_at = now()
WHERE id = '0deb895d-265c-4199-b60b-6e28442b5a75';