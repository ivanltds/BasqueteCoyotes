-- Migration 004: tabela de áudio por seção
-- Executa no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_audio (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section              TEXT NOT NULL CHECK (section IN ('homepage', 'baskferia')),
  name                 TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  cloudinary_url       TEXT NOT NULL,
  sort_order           INT  NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para listagem por seção ordenada
CREATE INDEX IF NOT EXISTS site_audio_section_order
  ON site_audio (section, sort_order ASC);

-- RLS
ALTER TABLE site_audio ENABLE ROW LEVEL SECURITY;

-- Leitura pública (player no site)
CREATE POLICY "site_audio_public_read"
  ON site_audio FOR SELECT
  USING (true);

-- Escrita apenas por service role (admin via supabaseAdmin)
CREATE POLICY "site_audio_service_write"
  ON site_audio FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
