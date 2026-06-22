-- Migration 005: notícias e configurações do site

-- Tabela de notícias
CREATE TABLE IF NOT EXISTS news (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title                TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  excerpt              TEXT,
  content              TEXT NOT NULL DEFAULT '',
  cover_url            TEXT,
  cover_public_id      TEXT,
  published            BOOLEAN NOT NULL DEFAULT false,
  published_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS news_published_at ON news (published_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS news_slug ON news (slug);

-- Tabela de configurações do site (key/value)
CREATE TABLE IF NOT EXISTS site_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valor padrão: 3 notícias na home
INSERT INTO site_config (key, value)
  VALUES ('home_news_count', '3')
  ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_public_read"
  ON news FOR SELECT USING (published = true);

CREATE POLICY "news_service_write"
  ON news FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "site_config_public_read"
  ON site_config FOR SELECT USING (true);

CREATE POLICY "site_config_service_write"
  ON site_config FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
