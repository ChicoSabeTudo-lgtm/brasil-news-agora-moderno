-- SECURITY FIX: Remove overly permissive RLS policies on otp_codes table
-- Current policies allow public read access to sensitive authentication data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can select OTP codes for verification" ON public.otp_codes;
DROP POLICY IF EXISTS "Users can insert OTP codes for any email" ON public.otp_codes;
DROP POLICY IF EXISTS "Users can delete their own OTP codes" ON public.otp_codes;

-- Create secure policies that restrict access appropriately
-- Only service role (edge functions) can insert OTP codes
CREATE POLICY "Service role can insert OTP codes" 
ON public.otp_codes 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Only service role (edge functions) can read OTP codes for verification
CREATE POLICY "Service role can select OTP codes" 
ON public.otp_codes 
FOR SELECT 
USING (auth.role() = 'service_role');

-- Only service role (edge functions) can delete OTP codes
CREATE POLICY "Service role can delete OTP codes" 
ON public.otp_codes 
FOR DELETE 
USING (auth.role() = 'service_role');

-- Authenticated users cannot access OTP codes directly - they must use edge functions
-- This prevents any potential data leakage through the API