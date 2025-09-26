-- Add credit column to news_images for proper photo credits
alter table if exists public.news_images
  add column if not exists credit text;

comment on column public.news_images.credit is 'Photo credit/source for the image (e.g., Freepik, Agência Brasil)';

