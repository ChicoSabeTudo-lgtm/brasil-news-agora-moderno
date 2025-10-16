-- Criar tabela para enquetes
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  allow_multiple_votes BOOLEAN NOT NULL DEFAULT false,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para opções de enquete
CREATE TABLE public.poll_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para votos (controle de um voto por IP/sessão)
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  voter_ip INET,
  voter_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, voter_ip, voter_session_id)
);

-- Adicionar colunas para controle de blocos na tabela site_configurations
ALTER TABLE public.site_configurations 
ADD COLUMN live_stream_block_enabled BOOLEAN DEFAULT true,
ADD COLUMN poll_block_enabled BOOLEAN DEFAULT true;

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies para polls
CREATE POLICY "Polls são visíveis publicamente quando ativas" 
ON public.polls 
FOR SELECT 
USING (is_published = true AND is_active = true);

CREATE POLICY "Admins, gestores e redatores podem gerenciar enquetes" 
ON public.polls 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'gestor'::app_role) OR
  has_role(auth.uid(), 'redator'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'gestor'::app_role) OR
  has_role(auth.uid(), 'redator'::app_role)
);

-- Policies para poll_options
CREATE POLICY "Opções de enquete são visíveis publicamente" 
ON public.poll_options 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.polls 
  WHERE polls.id = poll_options.poll_id 
  AND polls.is_published = true 
  AND polls.is_active = true
));

CREATE POLICY "Admins, gestores e redatores podem gerenciar opções de enquete" 
ON public.poll_options 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'gestor'::app_role) OR
  has_role(auth.uid(), 'redator'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'gestor'::app_role) OR
  has_role(auth.uid(), 'redator'::app_role)
);

-- Policies para poll_votes
CREATE POLICY "Qualquer um pode votar" 
ON public.poll_votes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.polls 
  WHERE polls.id = poll_votes.poll_id 
  AND polls.is_published = true 
  AND polls.is_active = true
  AND (polls.end_date IS NULL OR polls.end_date > now())
));

CREATE POLICY "Votos são visíveis para contagem" 
ON public.poll_votes 
FOR SELECT 
USING (true);

-- Trigger para atualizar contagem de votos
CREATE OR REPLACE FUNCTION public.update_poll_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.poll_options 
    SET vote_count = vote_count + 1
    WHERE id = NEW.option_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.poll_options 
    SET vote_count = vote_count - 1
    WHERE id = OLD.option_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_poll_vote_count_trigger
  AFTER INSERT OR DELETE ON public.poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_poll_vote_count();

-- Trigger para updated_at
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON public.polls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_poll_options_updated_at
  BEFORE UPDATE ON public.poll_options
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();