-- Criar alguns posts de teste com status 'scheduled' para testar o botão editar
INSERT INTO public.social_scheduled_posts (
  news_id,
  platform,
  content,
  scheduled_for,
  status,
  created_by
) VALUES 
  (
    (SELECT id FROM public.news LIMIT 1),
    'facebook',
    'Post de teste agendado para o Facebook',
    now() + interval '2 hours',
    'scheduled',
    (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1)
  ),
  (
    (SELECT id FROM public.news LIMIT 1),
    'twitter',
    'Post de teste agendado para o Twitter',
    now() + interval '4 hours',
    'scheduled',
    (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1)
  );