-- Adicionar coluna user_password à tabela otp_codes para armazenar senha temporariamente
ALTER TABLE public.otp_codes 
ADD COLUMN user_password TEXT;