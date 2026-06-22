-- Integrantes da Matilha
CREATE TABLE IF NOT EXISTS members (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  height              text NOT NULL,
  neighborhood        text NOT NULL,
  city                text NOT NULL,
  started_month       int  NOT NULL CHECK (started_month BETWEEN 1 AND 12),
  started_year        int  NOT NULL,
  photo_url           text NOT NULL,
  photo_public_id     text,
  approved            boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved members"
  ON members FOR SELECT USING (approved = true);

CREATE POLICY "Public insert members"
  ON members FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role all members"
  ON members FOR ALL USING (auth.role() = 'service_role');

-- Participantes Baskferia
CREATE TABLE IF NOT EXISTS baskferia_participants (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  height              text NOT NULL,
  neighborhood        text NOT NULL,
  city                text NOT NULL,
  photo_url           text NOT NULL,
  photo_public_id     text,
  edition             int  DEFAULT 4,
  year                int  DEFAULT 2026,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE baskferia_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read participants"
  ON baskferia_participants FOR SELECT USING (true);

CREATE POLICY "Public insert participants"
  ON baskferia_participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role all participants"
  ON baskferia_participants FOR ALL USING (auth.role() = 'service_role');
