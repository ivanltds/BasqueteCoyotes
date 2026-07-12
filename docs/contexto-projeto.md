# Contexto do Projeto — Coyotes do Basquetebol
> ÍNDICE CENTRAL. Máximo 300 linhas.
> Todo agente lê ao iniciar. Todo agente atualiza ao criar arquivos.

## Projeto
Site oficial do Coyotes do Basquetebol e do evento Baskferia. Oferece funcionalidades de galeria dinâmica, feed do Instagram, informações de patrocinadores e módulo de pré-inscrição.

## Objetivo de Negócio
Centralizar a comunicação do time, gerenciar inscrições para eventos (Baskferia) e expor patrocinadores e galeria de mídia de forma dinâmica sem necessidade de alteração de código frequente (usando Cloudinary).

## Stack
- Frontend  : Next.js 15, React 19, Tailwind CSS, TypeScript
- Backend   : Next.js API Routes
- Banco     : Supabase (@supabase/supabase-js)
- Infra     : Vercel, Cloudinary (Mídia), Behold.so (Instagram)
- Testes    : n/a

## Estrutura de Pastas
| Pasta                       | Propósito                                  |
|-----------------------------|--------------------------------------------|
| .gemini/agents/             | Definição dos agentes                      |
| .gemini/melhoria-continua/  | Aprendizados incrementais por agente       |
| docs/contexto-projeto.md    | Este índice central                        |
| docs/prd/                   | PRDs por demanda                           |
| docs/arquitetura/           | Documentação arquitetural                  |
| docs/design-system/         | Design system                              |
| docs/deploys/               | Histórico de deploys                       |
| app/                        | Roteamento e páginas do Next.js            |
| components/                 | Componentes de UI reutilizáveis            |
| lib/                        | Utilitários e SDK clients (ex: Cloudinary) |

## PRDs
| ID      | Nome                          | Status       | Fase Atual  |
|---------|-------------------------------|--------------|-------------|
| PRD-001 | Pré-Inscrição Baskferia 2026   | concluído    | DEV         |
| PRD-002 | Seção de Apoiadores & Admin   | em-progresso | DESCOBERTA  |

## Arquivos Registrados
| Arquivo                                    | Responsável | Descrição                |
|--------------------------------------------|-------------|--------------------------|
| GEMINI.md                                  | Sistema     | Instruções globais       |
| README-AGENTS.md                           | Sistema     | Guia de uso              |
| .gemini/agents/maestro.md                  | Sistema     | Orquestrador             |
| .gemini/agents/ba.md                       | Sistema     | Analista de negócios     |
| .gemini/agents/ux-ui.md                    | Sistema     | Designer UX/UI           |
| .gemini/agents/architect.md                | Sistema     | Arquiteto                |
| .gemini/agents/dev.md                      | Sistema     | Desenvolvedor            |
| .gemini/agents/qa.md                       | Sistema     | QA                       |
| .gemini/agents/devops.md                   | Sistema     | DevOps                   |
| docs/contexto-projeto.md                   | Sistema     | Índice central           |
| docs/prd/baskferia-prospecting-form.md     | Sistema     | PRD do formulário Baskferia |
| docs/prd/apoiadores-secao.md               | Sistema     | PRD da seção de apoiadores |
| README.md                                  | Sistema     | Documentação técnica     |

## Última Atualização
- Data    : 2026-07-12
- Por     : @maestro
- Motivo  : Registro dos PRDs de Prospecção e Seção de Apoiadores