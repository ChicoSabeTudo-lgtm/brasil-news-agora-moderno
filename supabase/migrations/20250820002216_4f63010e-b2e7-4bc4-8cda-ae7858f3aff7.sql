-- Remove o constraint antigo que não inclui WhatsApp
ALTER TABLE public.social_scheduled_posts 
DROP CONSTRAINT social_scheduled_posts_platform_check;

-- Adiciona um novo constraint que inclui WhatsApp
ALTER TABLE public.social_scheduled_posts 
ADD CONSTRAINT social_scheduled_posts_platform_check 
CHECK (platform = ANY (ARRAY['instagram'::text, 'twitter'::text, 'facebook'::text, 'linkedin'::text, 'whatsapp'::text]));