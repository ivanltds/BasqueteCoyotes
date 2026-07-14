# PRD: Times Participantes do Baskferia

## 1. Visão Geral
**Objetivo:** Exibir as equipes oficiais que disputarão o campeonato de elite (2º Sábado) do Baskferia 2026 de forma dinâmica. Além de permitir a inclusão, edição e exclusão das marcas, logos, fotos e dados detalhados desses times pelo painel administrativo autenticado.

**Público-Alvo:** Fãs de basquete de rua, torcedores das equipes e atletas.

---

## 2. Requisitos de Negócio (BR)
* **BR-01 (Cadastro Completo):** Os times devem ser gerenciados pelo painel administrativo contendo nome, local de origem, logo quadrada, foto do time em formato paisagem, descrição curta e história completa.
* **BR-02 (Modal de Detalhes):** A exibição dos detalhes de cada time (foto oficial da equipe e história) será feita por meio de um Modal rico e interativo na própria página pública, mantendo o usuário imerso na experiência do evento.
* **BR-03 (Imagens Organizadas):** As imagens dos times cadastrados devem ser salvas em uma pasta específica no Cloudinary (`coyotes/teams`), evitando misturar com as fotos de membros do time Coyotes.
* **BR-04 (Exclusão Física Completa):** Ao excluir um time no Admin, além de apagar os dados do banco de dados (Supabase), as duas imagens vinculadas (logo e foto do time) devem ser excluídas fisicamente do Cloudinary.

---

## 3. Requisitos Funcionais (FR)

### Área Pública (`/baskferia`)
* **FR-01 (Seção de Equipes):** Criar uma seção brutalista de times participantes na página pública do Baskferia.
* **FR-02 (Grid de Cards):** A seção listará os times cadastrados em um grid responsivo de cards. Cada card exibirá:
  * Logo do time em formato quadrado (`aspect-square`).
  * Nome do time.
  * Local de origem (cidade/bairro).
  * Descrição curta (1 a 2 frases).
* **FR-03 (Modal Interativo):** O clique no card do time abrirá um Modal contendo:
  * Logo quadrada e Nome da Equipe.
  * Local de origem.
  * Foto Oficial do Time em formato paisagem (`aspect-video`).
  * Texto detalhado (História/Descrição Longa) com suporte a parágrafos ou Markdown.

### Painel Administrativo (`/admin`)
* **FR-04 (Aba Times):** Integrar uma aba "Times" no `AdminShell` com CRUD completo.
* **FR-05 (Upload Duplo):** O formulário administrativo deve permitir o upload e a pré-visualização de:
  * **Logo do Time:** Imagem quadrada.
  * **Foto da Equipe:** Imagem paisagem.
  ambas enviadas diretamente para a pasta `coyotes/teams` do Cloudinary.
* **FR-06 (Limpeza no Cloudinary):** O endpoint de DELETE de times deve chamar a API do Cloudinary para remover `logo_public_id` e `team_photo_public_id` associados antes de deletar o registro no banco.

---

## 4. UI/UX (Design)
* **Tema Baskferia:** Uso da paleta de cores característica (escuro `#0E0E0E` com destaques em neon `#E0FF00` e laranja `#FF5722`).
* **Visual dos Cards:** Estilo brutalista com bordas sólidas, sombras deslocadas no hover (`shadow-brutal-org` ou similar).
* **Modal de Detalhes:** Layout centralizado, fundo escuro semi-transparente e botão de fechamento destacado.

---

## 5. Modelo de Dados Sugerido
Tabela `teams`:
* `id` (uuid, primary key)
* `name` (text, not null)
* `location` (text, not null)
* `logo_url` (text, not null)
* `logo_public_id` (text, not null)
* `team_photo_url` (text, not null)
* `team_photo_public_id` (text, not null)
* `description_short` (text, not null)
* `description_long` (text, not null)
* `created_at` (timestamptz, default now())
