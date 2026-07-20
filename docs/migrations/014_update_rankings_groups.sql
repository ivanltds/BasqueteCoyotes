-- Adicionar coluna de grupo na tabela de rankings
ALTER TABLE rankings ADD COLUMN IF NOT EXISTS group_name text; -- 'A' ou 'B' para torneios de fase de grupos

-- Atualizar o formato dos torneios padrão
UPDATE tournaments SET format = 'ranking' WHERE id = '3pts';
UPDATE tournaments SET format = 'groups' WHERE id = 'x1';
UPDATE tournaments SET format = 'bracket' WHERE id = '5x5';
