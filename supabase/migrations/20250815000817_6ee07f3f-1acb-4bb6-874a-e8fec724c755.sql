-- Inserir dados de exemplo para teste se não existir
INSERT INTO public.social_scheduled_posts (
  news_id, 
  platform, 
  content, 
  scheduled_for, 
  created_by, 
  status
) 
SELECT 
  n.id,
  'instagram',
  'Post de teste para Instagram sobre: ' || n.title,
  now() + interval '1 day',
  '610e7321-e707-45c8-b48d-7c86f31f1750',
  'scheduled'
FROM public.news n
WHERE n.is_published = true
LIMIT 1
ON CONFLICT DO NOTHING;