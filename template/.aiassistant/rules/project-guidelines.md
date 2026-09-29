# {{PROJECT_NAME}} Project Rules for JetBrains AI Assistant

This file defines project guidelines for AI assistants working in JetBrains IDEs (IntelliJ IDEA, GoLand, PyCharm, WebStorm, etc.).

The canonical rules live in `AGENTS.md` — this file is a condensed mirror for
JetBrains AI. Per-project values (domains, scopes, commands) live in `docs/PROJECT-MAP.md`.

## Task Complexity Documentation Tiers

Before making changes, read documentation based on task complexity:

### Tier 0 — No documentation needed
- Simple fixes: typos, formatting, import ordering, linter errors
- Isolated UI tweaks: colors, spacing adjustments
- Adding null checks or guard clauses
- Local variable renaming

### Tier 1 — Read one AGENTS.md file
Working within a single app or package? Read the `AGENTS.md` that owns that
area — see the domain map in `docs/PROJECT-MAP.md`.

### Tier 2 — New features or endpoints
Implementing new features or tasks from `docs/tasks/`? Read:

- Per-area PRD: `<area>/PRD.md`
- Design doc if exists: `docs/design/NN-<feature>.md`

### Tier 3 — Cross-cutting architectural changes
Making decisions affecting multiple apps, data models, or platform patterns? Read:

- `PRD.md` (root) — full product scope
- `docs/decisions/ADR-*.md` — existing architectural decisions

## Core Principles

1. **Test Coverage**: Every `feat` requires tests covering acceptance criteria; `fix`/`refactor` requires verifying existing tests pass.
2. **Traceability**: Every behavioral change traces to a requirement, ADR, or issue via commit footers.
3. **Documentation as a byproduct**: Decisions are recorded in ADRs, milestones, and tasks.
4. **Task State Lifecycle (In-Progress on Pickup)**: When instructed to pick up one or more tasks from `docs/tasks/TASK-INDEX.md` and start execution, immediately mark them as in-progress (set status to `🔄` in `docs/tasks/TASK-INDEX.md` and `status: in-progress` in each task's YAML frontmatter).

<!-- PROJECT: add your product-level principles (offline-first, vendor
     independence, performance targets...) mirroring AGENTS.md. -->

## Commit Convention

Follow `docs/COMMIT_CONVENTION.md`. Format:

```
<type>(<scope>): <subject>

[body - explain WHY]

Implements: REQ-XX-NNN
See: ADR-NNN
Closes: #NNN
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `revert`, `style`

**Scopes**: see `docs/PROJECT-MAP.md`. Currently: {{SCOPES_COMMA}}

## Workflow Commands

From repository root (see `docs/PROJECT-MAP.md` for the full table):

<!-- PROJECT: paste your install/lint/test commands per area. -->

## AI Agent Skills

The project includes reusable workflows for AI agents:

- `pickup-task` — Mark tasks in-progress when starting execution
- `write-adr` — Document architectural decisions
- `write-task` — Create and track tasks
- `record-milestone` — Update milestone documentation

Skills are located in `.agents/skills/` with detailed instructions.
