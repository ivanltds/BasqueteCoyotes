# PRD: Torneios, Chaveamentos e Rankings do Baskferia

## 1. Visão Geral
**Objetivo:** Adicionar à página pública do Baskferia uma seção interativa para acompanhar os confrontos e classificações das competições oficiais: Torneio de Elite 5x5, Torneio de 3 Pontos e Torneio de X1. O painel administrativo permitirá gerenciar o status de ativação de cada torneio, escolher seu formato de competição e atualizar as chaves/tabelas/pontuações em tempo real.

---

## 2. Requisitos de Negócio (BR)
* **BR-01 (Controle de Status e Formato):** O painel administrativo deve permitir:
  * Ativar/desativar cada um dos 3 torneios (`5x5`, `3pts`, `x1`). Torneios inativos não aparecem no site público.
  * Escolher o formato de exibição do torneio: **Chaveamento (Bracket)**, **Ranking (Tabela por Pontos)** ou **Fase de Grupos (Groups)**.
* **BR-02 (Eliminatórias Automáticas - Bracket):** O chaveamento segue a estrutura de 8 participantes (Quartas de Final -> Semifinal -> Final).
  * O Admin define os 8 competidores iniciais das Quartas.
  * Ao preencher o placar de uma partida, o sistema impede empates e move automaticamente o vencedor para o slot correspondente na próxima fase (Semifinal e depois Final).
* **BR-03 (Indicação de Eliminados):** Qualquer competidor (time ou representante) que for derrotado na partida final (ou em qualquer partida concluída do bracket) terá sua logo exibida em escala de cinza (`grayscale opacity-45`) em todas as etapas em que aparece.
* **BR-04 (Exibição dos Representantes):** Nos torneios individuais (`3pts` e `x1`), a exibição visual deve incluir a foto e o nome do atleta, além da mini logo do time a que ele pertence.
* **BR-05 (Torneio de 3 Pontos - Ranking com Final):** 
  * O Admin registra os participantes e suas respectivas pontuações acumuladas.
  * Os 2 competidores com a maior pontuação no ranking geral avançam de forma automática para disputar uma Grande Final (confronto individual 1x1).
  * O site público exibe o ranking geral e, logo abaixo, a caixa do confronto da Grande Final.
* **BR-06 (Torneio de X1 - Fase de Grupos com Final):**
  * O torneio conta com 6 participantes divididos em 2 grupos (Grupo A e Grupo B, com 3 competidores cada).
  * Jogam todos contra todos dentro de cada grupo (3 partidas por grupo, totalizando 6 jogos).
  * O 1º colocado do Grupo A e o 1º colocado do Grupo B avançam automaticamente para a Grande Final (Jogo 7).
  * O site público exibe a classificação do Grupo A e Grupo B lado a lado, as partidas da fase de grupos e o confronto final.

---

## 3. Requisitos Funcionais (FR)

### Área Pública (`/baskferia`)
* **FR-01 (Seção de Chaves/Resultados):** Criar uma seção interativa com um seletor para alternar entre os torneios ativos (`Elite 5x5`, `3 Pontos`, `X1`).
* **FR-02 (Renderização do Bracket):** Desenhar a árvore eliminatória brutalista clássica de 8 times para a Elite 5x5.
* **FR-03 (Renderização do Ranking):** Exibir tabela de pontuação com posições ordenadas para o Torneio de 3 Pontos e a Grande Final logo abaixo.
* **FR-04 (Renderização de Grupos):** Exibir tabelas do Grupo A e Grupo B lado a lado para o X1, a lista de partidas da fase de grupos e a Grande Final em destaque.

### Painel Administrativo (`/admin`)
* **FR-05 (Aba Torneios):** Gerenciamento completo de configurações de ativação e formatos de torneio.
* **FR-06 (Gerenciamento do Chaveamento):** Registrar os participantes iniciais e atualizar os placares dos jogos.
* **FR-07 (Gerenciamento de Ranking & Grupos):** Adicionar competidores informando seus pontos e, se aplicável, a qual grupo (`A` ou `B`) eles pertencem.

---

## 4. Modelo de Dados

### Tabela `tournaments`
* `id` (text, primary key - `'5x5'`, `'3pts'`, `'x1'`)
* `name` (text, not null)
* `is_active` (boolean, default true)
* `format` (text, default 'bracket' - `'bracket'` | `'ranking'` | `'groups'`)

### Tabela `matches`
* `id` (uuid, primary key)
* `tournament_id` (text, references tournaments(id))
* `match_number` (integer, not null) - de 1 a 7
* `stage` (text, not null) - `'quarterfinals'`, `'semifinals'`, `'final'`
* `team_id_1`, `team_id_2` (uuid, references teams(id))
* `representative_id_1`, `representative_id_2` (uuid, references representatives(id))
* `score_1`, `score_2` (integer)

### Tabela `rankings`
* `id` (uuid, primary key)
* `tournament_id` (text, references tournaments(id))
* `team_id` (uuid, references teams(id) on delete cascade)
* `representative_id` (uuid, references representatives(id) on delete cascade)
* `score` (integer, default 0)
* `group_name` (text) - `'A'` ou `'B'` para torneios de fase de grupos
