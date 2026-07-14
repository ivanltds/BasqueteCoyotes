-- Tabela de Representantes das Equipes do Baskferia
CREATE TABLE IF NOT EXISTS representatives (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  team_id         uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  modality        text NOT NULL,
  photo_url       text NOT NULL,
  photo_public_id text NOT NULL,
  link            text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;

-- Leitura pública para qualquer visitante
CREATE POLICY "Public read representatives"
  ON representatives FOR SELECT USING (true);

-- Controle total para a service_role (backend administrativo)
CREATE POLICY "Service role all representatives"
  ON representatives FOR ALL USING (auth.role() = 'service_role');
