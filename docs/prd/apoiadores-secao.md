# PRD: Seção de Apoiadores e Gerenciamento

## 1. Visão Geral
**Objetivo:** Adicionar uma seção pública na página de Apoio (`/apoiar`) para expor as marcas apoiadoras do projeto Coyotes do Basquetebol, promovendo a reciprocidade comercial por meio de links externos monitorados. Além disso, disponibilizar um painel de controle administrativo (`/admin`) para cadastro e gestão dessas marcas.

**Público-Alvo:** Patrocinadores, parceiros comerciais e apoiadores locais da Zona Oeste de SP.

---

## 2. Requisitos de Negócio (BR)
* **BR-01 (Sem Hierarquia):** Todos os apoiadores devem ser exibidos no mesmo nível de destaque, sem distinção de categorias (Master, Gold, etc.).
* **BR-02 (Gestão Autônoma):** O time do Coyotes deve ter autonomia para cadastrar, editar e excluir apoiadores diretamente pelo painel administrativo autenticado.
* **BR-03 (Métricas de Engajamento):** Registrar o volume total de cliques recebidos no link de cada apoiador, gerando transparência sobre o retorno da parceria.
* **BR-04 (Armazenamento de Imagens):** Reutilizar a integração do Cloudinary existente no projeto para o upload e otimização das logos quadradas.

---

## 3. Requisitos Funcionais (FR)

### Área Pública (`/apoiar`)
* **FR-01 (Seção de Apoiadores):** Adicionar uma nova seção responsiva abaixo das opções de ajuda contendo o grid de apoiadores.
* **FR-02 (Cards Brutalistas):** Cada card de apoiador deve exibir:
  * Logo do apoiador em formato estritamente quadrado (`aspect-square`), preenchendo o card proporcionalmente.
  * Título (nome) do apoiador abaixo da logo.
* **FR-03 (Link Externo):** O clique no card redireciona para o link cadastrado abrindo obrigatoriamente em uma nova aba (`target="_blank"`, `rel="noopener noreferrer"`).
* **FR-04 (Rastreamento de Cliques):** O clique no card deve enviar um evento em background para incrementar o contador de cliques no banco de dados antes de direcionar o usuário (ou por proxy de API).

### Painel Administrativo (`/admin`)
* **FR-05 (Aba Apoiadores):** Integrar uma aba "Apoiadores" no `AdminShell`.
* **FR-06 (Formulário de Cadastro/Edição):** Permitir o cadastro com os campos:
  * Nome do Apoiador.
  * Logo (upload direto para o Cloudinary, salvando `photo_url` e `photo_public_id`).
  * Link de redirecionamento (URL válida).
* **FR-07 (Monitoramento):** Exibir na listagem administrativa a contagem de cliques de cada parceiro.
* **FR-08 (Remoção):** Permitir a exclusão lógica/física do apoiador no banco e da respectiva imagem no Cloudinary.

---

## 4. UI/UX (Design)
* **Página Apoio:** Grid fluido (`grid-cols-2 md:grid-cols-4 gap-6`) que se adapte a dispositivos móveis.
* **Estética:** Estilo brutalista característico do projeto (bordas marcadas `border-2 border-b-stone` ou `border-b-orange`, cores escuras de fundo com tipografia marcante).
* **Hover:** Efeito interativo ao passar o mouse sobre os cards (ex: alteração de cor de borda, sutil translação, etc.).

---

## 5. Modelo de Dados Sugerido
Tabela `supporters`:
* `id` (uuid, primary key)
* `name` (text, not null)
* `photo_url` (text, not null)
* `photo_public_id` (text, optional)
* `link` (text, not null)
* `clicks_count` (integer, default 0)
* `created_at` (timestamptz, default now())
