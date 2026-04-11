# PRD: Pré-Inscrição Baskferia 2026

## 1. Visão Geral
**Objetivo:** Coletar dados de pré-inscrição para as modalidades individuais da 4ª edição do Baskferia, visando dimensionar a demanda e organizar as chaves de competição.
**Público-Alvo:** Comunidade da Zona Oeste de SP e atletas convidados.

## 2. Requisitos de Negócio (BR)
- **BR-01:** Identificar o volume de interessados por modalidade individual (3pts, 2pts).
- **BR-02:** Mapear o público feminino para ações de fomento.
- **BR-03:** Validar representantes de times para as modalidades restritas (X1 e Habilidades).
- **BR-04:** Segmentar por idade para organizar chaves/categorias justas.
- **BR-05:** **Exclusão de 5x5:** O torneio 5x5 já possui times definidos e não deve constar no formulário de interesse individual.

## 3. Requisitos Funcionais (FR)
- **FR-01:** Campos obrigatórios: Nome Completo, WhatsApp (novo), Email (novo), Gênero, Faixa Etária.
- **FR-02:** Seleção de Modalidade (Seleção Única):
    - Arremesso de 3 Pontos
    - Arremesso de 2 Pontos
    - Desafio de Habilidades (Restrito a representantes dos times 5x5)
    - X1 — Um contra Um (Restrito a representantes dos times 5x5)
- **FR-03:** Lógica de Restrição: Ao selecionar "X1" ou "Habilidades", exigir o campo "Nome do Time Oficial (Inscrito no 5x5)".
- **FR-04:** Persistência: Enviar para Supabase.
- **FR-05:** Feedback: Mensagem de confirmação reforçando o caráter de "pré-inscrição".

## 4. UI/UX (Design)
- **Estética:** Brutalista/Neon.
- **Clareza:** Textos explicativos sobre quem pode se inscrever no X1 e Habilidades.
