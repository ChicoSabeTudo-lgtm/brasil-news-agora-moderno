-- Ensure only one cover (is_cover) per news_id in news_images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'enforce_single_cover_news_images'
  ) THEN
    CREATE OR REPLACE FUNCTION public.enforce_single_cover_news_images()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
      IF NEW.is_cover = true THEN
        UPDATE public.news_images
          SET is_cover = false, updated_at = now()
          WHERE news_id = NEW.news_id AND id <> NEW.id AND is_cover = true;
      END IF;
      RETURN NEW;
    END;
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_enforce_single_cover_news_images'
  ) THEN
    CREATE TRIGGER trg_enforce_single_cover_news_images
    BEFORE INSERT OR UPDATE ON public.news_images
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_single_cover_news_images();
  END IF;
END $$;

