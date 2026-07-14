# PRD: Representantes dos Torneios do Baskferia

## 1. Visão Geral
**Objetivo:** Exibir os atletas/representantes que disputarão as modalidades individuais (e o campeonato principal) do Baskferia 2026. Permitir o cadastro, edição e exclusão desses representantes pelo painel administrativo, vinculando cada um a um time previamente cadastrado e a uma modalidade do evento.

---

## 2. Requisitos de Negócio (BR)
* **BR-01 (Mapeamento de Relacionamento):** Cada representante deve ser vinculado obrigatoriamente a uma equipe existente na tabela `teams`. No Admin, a seleção do time deve ser feita via dropdown dinâmico.
* **BR-02 (Modalidades Estruturadas):** Os representantes devem disputar uma das modalidades do evento. A modalidade será selecionada a partir de opções predefinidas:
  * Arremesso de 3 Pontos (3pts)
  * Desafio de Habilidades (habilidades)
  * Arremesso de 2 Pontos (2pts)
  * X1 — Um contra Um (x1)
  * Torneio 5x5 (5x5)
* **BR-03 (Exibição Pública):** Os representantes serão mostrados em uma seção dedicada na página pública do Baskferia, logo após a seção dos Times Participantes.
* **BR-04 (Mídias no Cloudinary):** As fotos dos representantes serão enviadas para uma pasta específica: `coyotes/representatives`.
* **BR-05 (Exclusão Física):** Ao excluir um representante no Admin, a foto correspondente deve ser apagada do Cloudinary e o registro removido do Supabase.

---

## 3. Requisitos Funcionais (FR)

### Área Pública (`/baskferia`)
* **FR-01 (Seção de Representantes):** Criar uma seção brutalista com os representantes dos torneios.
* **FR-02 (Grid de Atletas):** A seção listará os representantes cadastrados em um grid responsivo (`grid-cols-2 md:grid-cols-4 gap-6`). Cada card de representante exibirá:
  * Foto da pessoa em formato vertical (`aspect-[3/4]`), estilo card de jogador.
  * Nome do representante.
  * Nome do time que ele representa.
  * Modalidade em texto destacado em neon/laranja.
  * Se houver um link opcional (ex: perfil do Instagram), o card terá um botão/link discreto ou o próprio card será clicável (abrindo em `_blank`).

### Painel Administrativo (`/admin`)
* **FR-03 (Aba Representantes):** Adicionar uma aba "Representantes" no `AdminShell` com CRUD completo.
* **FR-04 (Formulário Admin):** O formulário de cadastro/edição deve incluir:
  * Nome do Representante.
  * Dropdown dinâmico para seleção do Time (alimentado pela lista de times cadastrados).
  * Dropdown para seleção de Modalidade.
  * Upload de Foto (enviado para `coyotes/representatives` no Cloudinary).
  * Campo de texto para Link Opcional (Instagram ou similar).
* **FR-05 (Limpeza Automática):** O DELETE deve acionar o Cloudinary para destruir a imagem física via `public_id`.

---

## 4. Modelo de Dados Sugerido
Tabela `representatives`:
* `id` (uuid, primary key)
* `name` (text, not null)
* `team_id` (uuid, references teams(id) on delete cascade)
* `modality` (text, not null)
* `photo_url` (text, not null)
* `photo_public_id` (text, not null)
* `link` (text, nullable)
* `created_at` (timestamptz, default now())
