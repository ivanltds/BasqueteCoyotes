-- Tabela de Torneios
CREATE TABLE IF NOT EXISTS tournaments (
  id          text PRIMARY KEY, -- '5x5', '3pts', 'x1'
  name        text NOT NULL,
  is_active   boolean DEFAULT true NOT NULL,
  format      text DEFAULT 'bracket' NOT NULL, -- 'bracket' ou 'ranking'
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "Public read tournaments"
  ON tournaments FOR SELECT USING (true);

-- Controle total para a role administrativa/backend (service_role)
CREATE POLICY "Service role all tournaments"
  ON tournaments FOR ALL USING (auth.role() = 'service_role');

-- Tabela de Confrontos (Matches)
CREATE TABLE IF NOT EXISTS matches (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id       text REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  match_number        integer NOT NULL, -- 1 a 7
  stage               text NOT NULL, -- 'quarterfinals', 'semifinals', 'final'
  
  -- Competidores (Podem ser times ou representantes)
  team_id_1           uuid REFERENCES teams(id) ON DELETE SET NULL,
  team_id_2           uuid REFERENCES teams(id) ON DELETE SET NULL,
  representative_id_1 uuid REFERENCES representatives(id) ON DELETE SET NULL,
  representative_id_2 uuid REFERENCES representatives(id) ON DELETE SET NULL,
  
  score_1             integer,
  score_2             integer,
  created_at          timestamptz DEFAULT now(),
  
  CONSTRAINT unique_match_per_tournament UNIQUE (tournament_id, match_number)
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read matches"
  ON matches FOR SELECT USING (true);

CREATE POLICY "Service role all matches"
  ON matches FOR ALL USING (auth.role() = 'service_role');

-- Tabela de Classificação (Rankings por Pontos)
CREATE TABLE IF NOT EXISTS rankings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id       text REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  team_id             uuid REFERENCES teams(id) ON DELETE CASCADE,
  representative_id   uuid REFERENCES representatives(id) ON DELETE CASCADE,
  score               integer DEFAULT 0 NOT NULL,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read rankings"
  ON rankings FOR SELECT USING (true);

CREATE POLICY "Service role all rankings"
  ON rankings FOR ALL USING (auth.role() = 'service_role');

-- Inserir os 3 torneios iniciais padrão
INSERT INTO tournaments (id, name, is_active, format) VALUES
  ('5x5', 'Torneio de Elite 5x5', true, 'bracket'),
  ('3pts', 'Torneio de 3 Pontos', true, 'ranking'),
  ('x1', 'Torneio de X1', true, 'bracket')
ON CONFLICT (id) DO NOTHING;

-- Inicializar os confrontos vazios para os 3 torneios
-- Torneio 5x5
INSERT INTO matches (tournament_id, match_number, stage) VALUES
  ('5x5', 1, 'quarterfinals'),
  ('5x5', 2, 'quarterfinals'),
  ('5x5', 3, 'quarterfinals'),
  ('5x5', 4, 'quarterfinals'),
  ('5x5', 5, 'semifinals'),
  ('5x5', 6, 'semifinals'),
  ('5x5', 7, 'final')
ON CONFLICT DO NOTHING;

-- Torneio X1
INSERT INTO matches (tournament_id, match_number, stage) VALUES
  ('x1', 1, 'quarterfinals'),
  ('x1', 2, 'quarterfinals'),
  ('x1', 3, 'quarterfinals'),
  ('x1', 4, 'quarterfinals'),
  ('x1', 5, 'semifinals'),
  ('x1', 6, 'semifinals'),
  ('x1', 7, 'final')
ON CONFLICT DO NOTHING;

-- Torneio 3pts
INSERT INTO matches (tournament_id, match_number, stage) VALUES
  ('3pts', 1, 'quarterfinals'),
  ('3pts', 2, 'quarterfinals'),
  ('3pts', 3, 'quarterfinals'),
  ('3pts', 4, 'quarterfinals'),
  ('3pts', 5, 'semifinals'),
  ('3pts', 6, 'semifinals'),
  ('3pts', 7, 'final')
ON CONFLICT DO NOTHING;
