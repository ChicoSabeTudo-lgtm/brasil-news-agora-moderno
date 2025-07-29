-- Add otp_webhook_url column to site_configurations table
ALTER TABLE public.site_configurations 
ADD COLUMN otp_webhook_url TEXT;