-- Tabela de galerias do site
-- Rodar no Supabase: https://app.supabase.com > SQL Editor

CREATE TABLE IF NOT EXISTS galleries (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_slug  TEXT UNIQUE NOT NULL,   -- nome da pasta no Cloudinary (ex: "antigas")
  display_name TEXT NOT NULL,           -- nome exibido no site (ex: "Antigas")
  sort_order   INTEGER DEFAULT 0,       -- ordem das abas
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Galerias já existentes no Cloudinary
INSERT INTO galleries (folder_slug, display_name, sort_order) VALUES
  ('antigas',     'Antigas',       0),
  ('baskferia25', 'Baskferia ''25', 1),
  ('jogo',        'Jogos',          2)
ON CONFLICT (folder_slug) DO NOTHING;

-- RLS: apenas service role pode modificar (admin)
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON galleries
  FOR SELECT USING (true);

CREATE POLICY "Service role full access" ON galleries
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
