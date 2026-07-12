-- Tabela de Apoiadores/Patrocinadores
CREATE TABLE IF NOT EXISTS supporters (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  photo_url           text NOT NULL,
  photo_public_id     text NOT NULL,
  link                text NOT NULL,
  clicks_count        integer DEFAULT 0,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;

-- Leitura pública permitida para qualquer visitante do site
CREATE POLICY "Public read supporters"
  ON supporters FOR SELECT USING (true);

-- Controle total para a role administrativa/backend (service_role)
CREATE POLICY "Service role all supporters"
  ON supporters FOR ALL USING (auth.role() = 'service_role');
