-- Tabela de Times/Equipes do Baskferia
CREATE TABLE IF NOT EXISTS teams (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  location              text NOT NULL,
  logo_url              text NOT NULL,
  logo_public_id        text NOT NULL,
  team_photo_url        text NOT NULL,
  team_photo_public_id  text NOT NULL,
  description_short     text NOT NULL,
  description_long      text NOT NULL,
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Leitura pública permitida para qualquer visitante
CREATE POLICY "Public read teams"
  ON teams FOR SELECT USING (true);

-- Controle total para o service_role (backend administrativo)
CREATE POLICY "Service role all teams"
  ON teams FOR ALL USING (auth.role() = 'service_role');
