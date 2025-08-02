-- Add social webhook URL column to site_configurations table
ALTER TABLE public.site_configurations 
ADD COLUMN social_webhook_url TEXT;