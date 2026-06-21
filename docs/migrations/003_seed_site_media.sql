-- =============================================================================
-- Seed: site_media — popula com as fotos já existentes no Cloudinary
-- Rode no Supabase → SQL Editor
--
-- ANTES DE RODAR:
--   1. Abra o Cloudinary Media Library (https://console.cloudinary.com/media)
--   2. Localize as fotos de hero (pasta coyotes/hero ou raiz) e do Thiago
--   3. Clique em cada foto → copie a "Secure URL" e o "Public ID"
--   4. Substitua os placeholders __URL__ e __PUBLIC_ID__ abaixo
-- =============================================================================

-- Limpa seeds anteriores (seguro rodar mais de uma vez)
DELETE FROM site_media WHERE section IN (
  'hero_main', 'hero_baskferia',
  'person_thiago', 'person_geovani', 'person_ivan'
);

-- ─── Hero Principal ───────────────────────────────────────────────────────────
-- Foto do time completo (foto-time-completo.jpg)
-- Encontre em: Cloudinary → Media Library → buscar "foto-time-completo"
INSERT INTO site_media (section, cloudinary_public_id, cloudinary_url, resource_type, sort_order)
VALUES (
  'hero_main',
  'image_eu02my',
  'https://res.cloudinary.com/dqt35bpzt/image/upload/image_eu02my',
  'image',
  0
);

-- ─── Hero Baskferia ───────────────────────────────────────────────────────────
-- Deixe vazio por enquanto (vai usar textura de asfalto como fallback)
-- Descomente e preencha quando tiver uma foto específica para o Baskferia:
-- INSERT INTO site_media (section, cloudinary_public_id, cloudinary_url, resource_type, sort_order)
-- VALUES ('hero_baskferia', '__PUBLIC_ID__', '__URL__', 'image', 0);

-- ─── Thiago Fidelis (coordenador) ────────────────────────────────────────────
-- Foto do treinador (foto-treinador.jpg ou similar)
-- Encontre em: Cloudinary → Media Library → buscar "foto-treinador"
INSERT INTO site_media (section, cloudinary_public_id, cloudinary_url, resource_type, sort_order)
VALUES (
  'person_thiago',
  'WhatsApp_Image_2026-04-15_at_12.02.47_t0xayl',
  'https://res.cloudinary.com/dqt35bpzt/image/upload/WhatsApp_Image_2026-04-15_at_12.02.47_t0xayl',
  'image',
  0
);

-- ─── Geovane Nunes ────────────────────────────────────────────────────────────
-- URL conhecida (hardcoded no código)
INSERT INTO site_media (section, cloudinary_public_id, cloudinary_url, resource_type, sort_order)
VALUES (
  'person_geovani',
  'nani_ha122j',
  'https://res.cloudinary.com/dqt35bpzt/image/upload/v1775908084/nani_ha122j.jpg',
  'image',
  0
);

-- ─── Ivan Souza ───────────────────────────────────────────────────────────────
-- URL conhecida (hardcoded no código)
INSERT INTO site_media (section, cloudinary_public_id, cloudinary_url, resource_type, sort_order)
VALUES (
  'person_ivan',
  'ivan_ocqtgu',
  'https://res.cloudinary.com/dqt35bpzt/image/upload/v1775908084/ivan_ocqtgu.jpg',
  'image',
  0
);

-- Verificação final
SELECT section, cloudinary_public_id, resource_type FROM site_media ORDER BY section;
