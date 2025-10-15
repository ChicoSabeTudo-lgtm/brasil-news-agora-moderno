-- ============================================================================
-- FUNÇÃO SEGURA PARA GERAR E ARMAZENAR OTP
-- Também dispara webhook via pg_net.http_post
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_otp_code(
  p_email TEXT,
  p_code TEXT,
  p_whatsapp_phone TEXT,
  p_user_id UUID,
  p_expires_in_seconds INTEGER DEFAULT 300
)
RETURNS TABLE(otp_code TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expires_at TIMESTAMPTZ := now() + make_interval(secs => p_expires_in_seconds);
  v_webhook_url TEXT;
BEGIN
  -- Limpa códigos expirados
  PERFORM public.cleanup_expired_otp_codes();

  -- Remove códigos anteriores para o mesmo email
  DELETE FROM public.otp_codes
  WHERE user_email = p_email;

  -- Salva novo código
  INSERT INTO public.otp_codes (user_email, code, expires_at)
  VALUES (p_email, p_code, v_expires_at);

  -- Busca webhook configurado
  SELECT otp_webhook_url
  INTO v_webhook_url
  FROM public.site_configurations
  ORDER BY updated_at DESC
  LIMIT 1;

  -- Dispara webhook via pg_net
  IF v_webhook_url IS NOT NULL THEN
    BEGIN
      PERFORM net.http_post(
        url := v_webhook_url,
        body := jsonb_build_object(
          'email', p_email,
          'user_id', p_user_id,
          'whatsapp_phone', p_whatsapp_phone,
          'otp_code', p_code,
          'timestamp', now()
        ),
        headers := jsonb_build_object('Content-Type', 'application/json')
      );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Falha ao chamar webhook OTP (%): %', v_webhook_url, SQLERRM;
    END;
  END IF;

  RETURN QUERY SELECT p_code, v_expires_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_otp_code(TEXT, TEXT, TEXT, UUID, INTEGER) TO authenticated;
