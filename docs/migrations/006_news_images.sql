-- Fotos inline de notícias
CREATE TABLE IF NOT EXISTS news_images (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id             uuid NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  cloudinary_url      text NOT NULL,
  cloudinary_public_id text NOT NULL,
  caption             text,
  sort_order          int NOT NULL DEFAULT 0,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE news_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read news_images"
  ON news_images FOR SELECT USING (true);

CREATE POLICY "Service role write news_images"
  ON news_images FOR ALL USING (auth.role() = 'service_role');
