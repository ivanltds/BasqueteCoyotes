-- Tabela para mídias configuráveis do site (hero, fotos de membros)
CREATE TABLE IF NOT EXISTS site_media (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  section         TEXT        NOT NULL,           -- 'hero_main' | 'hero_baskferia' | 'person_thiago' | 'person_ivan' | 'person_geovani'
  cloudinary_public_id TEXT   NOT NULL,
  cloudinary_url  TEXT        NOT NULL,
  resource_type   TEXT        DEFAULT 'image',    -- 'image' | 'video'
  sort_order      INTEGER     DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE site_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_media"
  ON site_media FOR SELECT TO anon USING (true);

CREATE POLICY "Service role full access site_media"
  ON site_media FOR ALL TO service_role USING (true);

-- Índice para busca por seção
CREATE INDEX IF NOT EXISTS site_media_section_idx ON site_media (section, sort_order);
