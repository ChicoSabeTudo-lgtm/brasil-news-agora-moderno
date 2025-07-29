-- Create OTP codes table for WhatsApp authentication
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add WhatsApp phone field to profiles
ALTER TABLE public.profiles 
ADD COLUMN whatsapp_phone TEXT;

-- Enable RLS on otp_codes
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for otp_codes
CREATE POLICY "Users can insert OTP codes for any email" 
ON public.otp_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can select OTP codes for verification" 
ON public.otp_codes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can delete their own OTP codes" 
ON public.otp_codes 
FOR DELETE 
USING (true);

-- Create function to clean expired OTP codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.otp_codes 
  WHERE expires_at < now();
END;
$$;

-- Create index for better performance
CREATE INDEX idx_otp_codes_email_expires ON public.otp_codes(user_email, expires_at);
CREATE INDEX idx_otp_codes_expires ON public.otp_codes(expires_at);