-- Configurar webhook URL do OTP
UPDATE public.site_configurations 
SET otp_webhook_url = 'https://webhooks8.investehoje.com.br/webhook/otp',
    updated_at = now()
WHERE id = '0deb895d-265c-4199-b60b-6e28442b5a75';