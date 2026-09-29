# 🤖 {{PROJECT_NAME}}: AI AGENTS & CO-PILOT CONFIGURATION GUIDELINES

Welcome, AI Agent / Co-pilot. You are assisting in building **{{PROJECT_NAME}}**. {{PROJECT_DESCRIPTION}}

To ensure architectural consistency, reduce code debt, and prevent cross-framework pollution, you **MUST** strictly follow the guidelines below based on the workspace context you are operating in.

> This file is the single source of truth for agent behaviour in this repo.
> Per-project values (domains, scopes, commands) live in [`docs/PROJECT-MAP.md`](./docs/PROJECT-MAP.md).
> `CLAUDE.md` and `GEMINI.md` point here — do not duplicate rules between them.

---

## 🌍 GLOBAL PRINCIPLES (ALL AGENTS MUST READ)

1. **Behavioral Test Coverage:** Every new feature (`feat`) must ship with tests that cover its acceptance criteria. Changes to existing features or refactors must verify that existing tests still pass and adjust them to reflect the new behaviour. No `feat` commit is done without test files. No `fix`/`refactor` is done without running the test suite.
2. **Traceability:** Every behavioral change (`feat`/`fix`/`perf`) traces back to a requirement, an ADR, or an issue — enforced by commit footers and CI.
3. **Documentation as a byproduct:** Decisions are recorded where the next agent will find them (ADRs, milestones, tasks) — see the Document Map below.
4. **Task State Lifecycle (In-Progress on Pickup):** When told to pick up a task or multiple tasks from `docs/tasks/TASK-INDEX.md` and starting execution, the agent MUST immediately mark those tasks as `in-progress`:
   - In `docs/tasks/TASK-INDEX.md`: Change the status column from `📋` (or current status) to `🔄`.
   - In the task file (`docs/tasks/<domain>/TASK-*.md`): Update the YAML frontmatter `status` field to `in-progress`.
   - If working in a per-task worktree or branch (per `docs/WORKTREE_WORKFLOW.md`), make these changes in that branch as part of task execution.

<!-- PROJECT: add your product-level principles here (e.g. offline-first, zero
     vendor lock-in, efficiency targets). Derive them from PRD.md / docs/WHY.md
     so agents can tie decisions back to them. Keep the list short — principles,
     not rules. -->

---

## ⚖️ CONTEXT RETRIEVAL ECONOMY (TOKEN-SAVING)

To save API input tokens and prevent context bloat, obey these execution rules:

* **No Blind Indexing:** Do NOT read or demand full external documentation files for simple syntax fixes, typos, formatting, or isolated UI styling.
* **Conditional Trigger:** Use the **Document Map** below to determine exactly which files to read. Reading more than the tier requires is wasteful. Reading less causes errors.
* **Targeted Diffs Only:** Do NOT rewrite hundreds of unchanged lines of code. Provide minimal code blocks or targeted updates.

---

## 🗺️ DOCUMENT MAP — INTELLIGENT ROUTING

**Before fetching any file, classify your task using the tiers below. Fetch only what the tier requires.**

---

### Tier 0 — Proceed immediately, no extra reads

Simple, self-contained changes with no domain ambiguity:
- Typos, formatting, import ordering, linter/vet errors
- Isolated UI colour token swaps or spacing adjustments
- Adding a null check or guard clause to existing logic
- Renaming a local variable

→ **Fetch nothing. Proceed.**

---

### Tier 1 — Local scope: read one local AGENTS.md

You are modifying code within a known app or package, and the rules of that context are all you need:
- Adding a screen, widget, or method to an existing feature
- Fixing a bug that is clearly contained within one app or package

→ Read `docs/PROJECT-MAP.md` to find which `AGENTS.md` owns the area you are
working in, then read **that one file only**. Stop there.

---

### Tier 2 — New feature or endpoint: read local PRD + design doc

You are implementing something new within a known scope, or picking up a defined task:
- New endpoint, new DB table, new screen tied to a PRD requirement
- Implementing a feature from a task in `docs/tasks/`

> **Task Pickup Requirement:** When starting execution on one or more tasks from `docs/tasks/TASK-INDEX.md`, immediately mark them as in-progress (`status: in-progress` in frontmatter and `🔄` in `docs/tasks/TASK-INDEX.md`) before writing implementation code.

| Working in | Read these files |
|:---|:---|
| Any app/package with its own `PRD.md` | that `PRD.md` + `docs/design/NN-<feature>.md` (if exists) |
| Infra work (Docker, Compose, CI/CD, scripts) | `docs/infra/REQUIREMENTS.md` |

→ Read the **local PRD** for the affected area. Read the **design doc** if one covers this feature. Stop there.

---

### Tier 3 — Cross-cutting architecture: read root PRD + check ADRs

You are making a decision that affects multiple apps, the data model, or a platform-wide pattern:
- Choosing a library or dependency
- Modifying a state machine, auth flow, or sync strategy
- Adding or removing a shared package

| Action | Read this |
|:---|:---|
| Understand full product scope | `PRD.md` (root) |
| Resolve ambiguous domain terminology | `docs/GLOSSARY.md` |
| Check if this decision was already made | `docs/decisions/ADR-*.md` |

→ **After completing the task:** create a new ADR in `docs/decisions/` if the architectural choice isn't already recorded.

---

### Tier 4 — Historical rationale: read ADRs + milestone docs

You need to understand why something was designed a certain way before extending it:
- "Why does auth use opaque refresh tokens and not long-lived JWTs?"
- Reviewing a past milestone before adding a new feature on top of it

| Action | Read this |
|:---|:---|
| Find the architectural decision | `docs/decisions/ADR-*.md` |
| Understand milestone history and rationale | `docs/milestones/CHANGELOG.md` → then the specific `MXXX-*.md` |

→ Read the **specific ADR or milestone doc**. Do not read all of them.

---

### Tier 5 — Task planning & lifecycle: read task index + templates

You are decomposing PRD requirements into tasks, reviewing what work exists, picking up tasks, or generating GitHub Issues:

| Action | Do this |
|:---|:---|
| Review all tasks and their status | Read `docs/tasks/TASK-INDEX.md` |
| Pick up / start one or more tasks | Mark `🔄` in `docs/tasks/TASK-INDEX.md` + set `status: in-progress` in task frontmatter (or invoke `pickup-task` skill) |
| Create a new task file | Copy `docs/tasks/TASK-TEMPLATE.md` (or invoke the `write-task` skill) |
| Push unlinked tasks to GitHub Issues | Run `python3 scripts/gh_create_issues.py --dry-run` first, then without `--dry-run` |

---

### Agent Skills — Reusable Workflows

These project-local skills encode the exact steps for common documentation tasks.
They are available in multiple IDEs (Zed, Claude Code, and others with custom prompts).

| Skill | Trigger phrases | What it does |
|:---|:---|:---|
| `pickup-task` | "pickup task", "pick up TASK-...", "start working on TASK-...", "take on task" | Marks task(s) as in-progress in TASK-INDEX.md (🔄) and sets status: in-progress in frontmatter before executing |
| `write-adr` | "write an ADR for X", "document why we chose Y", "record this decision" | Reads the template, numbers the next ADR, creates the file, links it to the active milestone |
| `write-task` | "create a task for X", "break down REQ-XX", "add a work item" | Reads TASK-INDEX + template, creates the task file, updates the index row |
| `record-milestone` | "update the milestone", "mark M00X as done", "checkpoint our progress" | Updates the milestone doc + CHANGELOG.md with decisions, deferred work, and lessons learned |
| `reconcile` | "reconcile", "catch up the docs", "document what we just built" | Syncs documentation with code changes, identifies missing artifacts (Claude Code only) |

**Skill locations:**
- `.agents/skills/` — Universal skill definitions
- `.claude/skills/` — Claude Code-specific formats
- Zed auto-suggests skills when your prompt matches (invoke via `/`)

---

### Full Document Registry

| Document | Path | Tier |
|:---|:---|:---:|
| Global AI rules + routing (this file) | `AGENTS.md` | Auto-loaded |
| Project map (domains, scopes, commands) | `docs/PROJECT-MAP.md` | 1+ |
| **Commit message convention** | **`docs/COMMIT_CONVENTION.md`** | **Always** |
| Domain glossary | `docs/GLOSSARY.md` | 3 |
| Ecosystem PRD (product vision) | `PRD.md` | 3 |
| Infrastructure requirements | `docs/infra/REQUIREMENTS.md` | 2–3 |
| Per-app product requirements | `<area>/PRD.md` | 2 |
| Per-area AI rules | `<area>/AGENTS.md` | 1 |
| Feature flow designs | `docs/design/NN-<feature>.md` | 2 |
| Architecture Decision Records | `docs/decisions/NNN-<title>.md` | 3–4 |
| Milestone changelog index | `docs/milestones/CHANGELOG.md` | 4 |
| Specific milestone rationale | `docs/milestones/MXXX-<title>.md` | 4 |
| Task registry | `docs/tasks/TASK-INDEX.md` | 5 |
| Task template | `docs/tasks/TASK-TEMPLATE.md` | 5 |

---

## 🛠️ CONTEXT-SPECIFIC AGENT INSTRUCTIONS

<!-- PROJECT: add one subsection per app/package (tech stack, local boundaries,
     prohibited patterns, test commands). Keep the discipline: each section
     states Role, Tech Stack, Local Boundaries, Prohibited, Testing. Which
     areas exist and which commands run — see docs/PROJECT-MAP.md. -->

---

## 📝 COMMIT CONVENTION

Every commit to this repository must follow [`docs/COMMIT_CONVENTION.md`](docs/COMMIT_CONVENTION.md).

Key rules (read the full doc for examples and all footer trailers):

```
<type>(<scope>): <subject>   ← imperative, ≤72 chars, no period
```

| Applies to | Detail |
|:---|:---|
| **Types** | `feat` `fix` `docs` `refactor` `test` `chore` `perf` `ci` `revert` `style` |
| **Scopes** | {{SCOPES_COMMA}} |
| **Footers** | `Implements: REQ-XX-NNN` · `See: ADR-NNN` · `Closes: #NNN` · `Refs: #NNN` · `BREAKING CHANGE: <desc>` |

Enforced automatically by `commitlint` (`.commitlintrc.json`). Templated by `.gitmessage`.

> [!CAUTION]
> **Rules CI will reject — memorise these before every commit:**
>
> **Rule 1 — Scope is NEVER optional.**
> `feat: add X` → rejected. Always `feat(<scope>): add X`.
> Pick from the valid scopes above. Bare type with no parentheses = CI failure.
>
> **Rule 2 — `feat` / `fix` / `perf` commits MUST include a traceability footer.**
> At least one of: `Implements: REQ-XX-NNN` · `See: ADR-NNN` · `Closes: #NNN` · `Refs: #NNN`
> All other types (`docs`, `refactor`, `test`, `chore`, `ci`, `style`, `revert`) are exempt.
>
> **Rule 3 — Line length ≤ 72 chars everywhere** (subject, body lines, footer lines).

<!-- graft:start -->
## Graft — repo context graph

This repo is indexed in `graft/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `graft map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `graft ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `graft grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `graft skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `graft callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `graft/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `graft ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `graft build` (deterministic,
no API key, $0).
<!-- graft:end -->
