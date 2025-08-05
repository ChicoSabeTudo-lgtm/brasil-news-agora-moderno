-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar cron job para executar limpeza das imagens do Instagram a cada 7 dias
-- Executa todo domingo às 02:00 (0 2 * * 0)
SELECT cron.schedule(
  'cleanup-instagram-images-weekly',
  '0 2 * * 0', -- Todo domingo às 02:00
  $$
  SELECT
    net.http_post(
        url:='https://spgusjrjrhfychhdwixn.supabase.co/functions/v1/cleanup-instagram-images',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZ3VzanJqcmhmeWNoaGR3aXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTMwODAsImV4cCI6MjA2NzM4OTA4MH0.cjsRonxr7utjcpQoyuYCUddCQR9C60YNQqyxj07atsE"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);