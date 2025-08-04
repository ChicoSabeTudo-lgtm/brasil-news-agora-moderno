-- Adicionar colunas de controle de tempo na tabela polls
ALTER TABLE public.polls 
ADD COLUMN vote_limit_type TEXT DEFAULT 'once' CHECK (vote_limit_type IN ('once', 'daily', 'unlimited')),
ADD COLUMN vote_reset_time TIME DEFAULT '00:00:00';

-- Adicionar timestamp do último voto para controle diário  
ALTER TABLE public.poll_votes
ADD COLUMN voted_at_date DATE DEFAULT CURRENT_DATE;

-- Remover a constraint existente corretamente
ALTER TABLE public.poll_votes 
DROP CONSTRAINT IF EXISTS poll_votes_poll_id_voter_ip_voter_session_id_key;

-- Função para verificar se o usuário pode votar
CREATE OR REPLACE FUNCTION public.can_user_vote(
  poll_id_param UUID,
  voter_ip_param INET DEFAULT NULL,
  voter_session_id_param TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  poll_config RECORD;
  existing_vote_count INTEGER;
BEGIN
  -- Buscar configuração da enquete
  SELECT vote_limit_type, vote_reset_time 
  INTO poll_config
  FROM public.polls 
  WHERE id = poll_id_param 
    AND is_published = true 
    AND is_active = true
    AND (end_date IS NULL OR end_date > now());
  
  IF poll_config IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Se é ilimitado, sempre pode votar
  IF poll_config.vote_limit_type = 'unlimited' THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar votos existentes baseado no tipo de limitação
  IF poll_config.vote_limit_type = 'once' THEN
    SELECT COUNT(*) INTO existing_vote_count
    FROM public.poll_votes
    WHERE poll_id = poll_id_param
      AND (
        (voter_session_id_param IS NOT NULL AND voter_session_id = voter_session_id_param)
        OR (voter_ip_param IS NOT NULL AND voter_ip = voter_ip_param)
      );
      
  ELSIF poll_config.vote_limit_type = 'daily' THEN
    SELECT COUNT(*) INTO existing_vote_count
    FROM public.poll_votes
    WHERE poll_id = poll_id_param
      AND voted_at_date = CURRENT_DATE
      AND (
        (voter_session_id_param IS NOT NULL AND voter_session_id = voter_session_id_param)
        OR (voter_ip_param IS NOT NULL AND voter_ip = voter_ip_param)
      );
  END IF;
  
  RETURN existing_vote_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;