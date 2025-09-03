-- Primeiro, remover TODAS as políticas do bucket news-images
DROP POLICY IF EXISTS "News images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Redators and admins can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "Redators and admins can update news images" ON storage.objects;
DROP POLICY IF EXISTS "Redators and admins can delete news images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images to news-images bucket" ON storage.objects;
DROP POLICY IF EXISTS "News images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "news-images-auth-upload" ON storage.objects;
DROP POLICY IF EXISTS "news-images-public-read" ON storage.objects;