# PRD: Torneios, Chaveamentos e Rankings do Baskferia

## 1. Visão Geral
**Objetivo:** Adicionar à página pública do Baskferia uma seção interativa para acompanhar os confrontos e classificações das competições oficiais: Torneio de Elite 5x5, Torneio de 3 Pontos e Torneio de X1. O painel administrativo permitirá gerenciar o status de ativação de cada torneio, alternar seu formato (Chaveamento Eliminatório vs. Ranking por Pontos) e atualizar as chaves/pontuações em tempo real.

---

## 2. Requisitos de Negócio (BR)
* **BR-01 (Controle de Status e Formato):** O painel administrativo deve permitir:
  * Ativar/desativar cada um dos 3 torneios (`5x5`, `3pts`, `x1`). Torneios inativos não aparecem no site público.
  * Escolher o formato de exibição do torneio: **Chaveamento (Bracket)** ou **Ranking (Tabela por Pontos)**.
* **BR-02 (Eliminatórias Automáticas - Bracket):** O chaveamento segue a estrutura de 8 participantes (Quartas de Final -> Semifinal -> Final). 
  * O Admin define os 8 competidores iniciais das Quartas.
  * Ao preencher o placar de uma partida, o sistema impede empates e move automaticamente o vencedor para o slot correspondente na próxima fase (Semifinal e depois Final).
* **BR-03 (Indicação de Eliminados):** Qualquer competidor (time ou representante) que for derrotado em qualquer partida concluída terá sua logo exibida em escala de cinza (`grayscale opacity-50`) em todas as etapas em que aparece na tela de chaveamento.
* **BR-04 (Exibição dos Representantes):** Nos torneios individuais (`3pts` e `x1`), a exibição visual deve incluir a foto e o nome do atleta, além da mini logo do time a que ele pertence.
* **BR-05 (Ranking por Pontos):** Se o formato de Ranking for selecionado (ex: nos arremessos), o Admin insere os participantes e suas respectivas pontuações. O site público exibe uma tabela ordenada de forma decrescente pela pontuação.
* **BR-06 (Responsividade Mobile):**
  * **Desktop:** Exibe a árvore clássica de chaveamentos com conectores visuais.
  * **Mobile:** Exibe uma interface empilhada em abas de etapas (Aba 1: Quartas, Aba 2: Semis, Aba 3: Final) para garantir a legibilidade.

---

## 3. Requisitos Funcionais (FR)

### Área Pública (`/baskferia`)
* **FR-01 (Seção de Chaves/Resultados):** Criar uma seção interativa com um seletor (abas ou botões) para alternar entre os torneios ativos (`Elite 5x5`, `3 Pontos`, `X1`).
* **FR-02 (Renderização do Bracket - Desktop):** Desenhar a árvore eliminatória brutalista:
  * Etapa 1: Quartas de Final (4 confrontos).
  * Etapa 2: Semifinais (2 confrontos).
  * Etapa 3: Final (1 confronto).
  * Mostrar "Em Breve" se o competidor daquela vaga ainda não estiver definido.
* **FR-03 (Renderização do Bracket - Mobile):** Fornecer abas para navegar entre as fases do torneio.
* **FR-04 (Renderização do Ranking):** Exibir tabela brutalista com a lista ordenada dos competidores, contendo Nome, Time, Foto, Pontuação e posição no ranking (1º, 2º, 3º...).

### Painel Administrativo (`/admin`)
* **FR-05 (Aba Torneios):** Adicionar aba "Torneios" no `AdminShell` com:
  * Lista dos 3 torneios com chaves para Ativo/Inativo e seletor de formato (Chaveamento vs. Ranking).
  * Sub-aba para gerenciar os dados conforme o formato ativo.
* **FR-06 (Gerenciamento do Bracket):** Formulário simples para atualizar cada um dos 7 jogos do torneio (placar e seleção de competidores nas quartas).
* **FR-07 (Gerenciamento do Ranking):** Interface para adicionar competidores ao ranking do torneio e digitar suas pontuações.

---

## 4. Modelo de Dados Sugerido

### Tabela `tournaments`
* `id` (text, primary key - `'5x5'`, `'3pts'`, `'x1'`)
* `name` (text, not null)
* `is_active` (boolean, default true)
* `format` (text, default 'bracket' - `'bracket'` ou `'ranking'`)

### Tabela `matches`
* `id` (uuid, primary key)
* `tournament_id` (text, references tournaments(id))
* `match_number` (integer, not null) - de 1 a 7
* `stage` (text, not null) - `'quarterfinals'`, `'semifinals'`, `'final'`
* `team_id_1` (uuid, references teams(id) on delete set null)
* `team_id_2` (uuid, references teams(id) on delete set null)
* `representative_id_1` (uuid, references representatives(id) on delete set null)
* `representative_id_2` (uuid, references representatives(id) on delete set null)
* `score_1` (integer)
* `score_2` (integer)
* `created_at` (timestamptz, default now())

### Tabela `rankings`
* `id` (uuid, primary key)
* `tournament_id` (text, references tournaments(id))
* `team_id` (uuid, references teams(id) on delete cascade)
* `representative_id` (uuid, references representatives(id) on delete cascade)
* `score` (integer, default 0)
* `created_at` (timestamptz, default now())
