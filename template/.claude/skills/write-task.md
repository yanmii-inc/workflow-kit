# Skill: write-task

Create a new task file and register it in the task index.

**Trigger phrases:** "create a task for X", "break down REQ-XX", "add a work item", "add a task", "write a task"

---

## Steps

### 1. Read the task index and project map

Read `docs/tasks/TASK-INDEX.md` to:
- Identify which milestone this task belongs to (default: the first milestone listed with `📋 todo` or `🔄 in-progress` tasks, or the active milestone from `docs/milestones/CHANGELOG.md`)
- Find the highest existing task number for the target domain code (e.g. if `TASK-API-005` exists, next API task is `TASK-API-006`)

Read `docs/PROJECT-MAP.md` for the valid domain codes, their paths, and subdirectories. Do not invent new domain codes without adding them to the map first.

### 2. Derive inputs from context

Use the current conversation, PRD references, and design docs to populate:

- **id** — `TASK-<CODE>-<NNN>` (zero-padded three digits)
- **title** — short human-readable description
- **milestone** — e.g. `M001`
- **prd_ref** — `REQ-XX-NNN` if traceable, otherwise `"—"`
- **app** — the primary app or package being modified
- **priority** — `high` / `medium` / `low` (default `high` if tied to a blocking PRD requirement)
- **complexity** — `S` (hours) / `M` (1–2 days) / `L` (3–5 days) / `XL` (sprint)
- **dependencies** — list of `TASK-*` IDs that must complete first, or `[]`

If `prd_ref` or scope is ambiguous, ask one question before writing.

### 3. Determine the file path

File path: `docs/tasks/<subdirectory>/TASK-<CODE>-<NNN>-<kebab-title>.md` where `<subdirectory>` is the lowercase domain code (see `docs/PROJECT-MAP.md`).

Create the subdirectory if it doesn't exist.

### 4. Write the task file

Use `docs/tasks/TASK-TEMPLATE.md` as the structure. Fill in all sections:

- **Objective** — one or two sentences: what does this task produce? What is the user-visible or system-level outcome?
- **Context** — why does this task exist? Link to ADRs, design docs, PRD sections that constrain it.
- **Acceptance Criteria** — specific, independently verifiable conditions. Minimum three ACs. Always include one AC that is test-specific: e.g. "Tests cover the happy path and at least one error/edge case."
- **Technical Notes** — implementation hints, constraints, prohibited patterns, related files, commands to run after completing (test/lint commands per area: `docs/PROJECT-MAP.md`).
- **Out of Scope** — explicitly list what this task does NOT include. Name the task(s) that own those pieces.
- **Definition of Done** — use the checklist below. Never omit the test line.

  **Generic DoD:**
  - [ ] Code written and self-reviewed
  - [ ] Tests written or updated — happy path + at least one error path
  - [ ] Project test command passes (see `docs/PROJECT-MAP.md` for the affected area)
  - [ ] Lint/format command passes
  - [ ] `TASK-INDEX.md` status updated to `done`
  - [ ] GitHub issue closed (if one exists)

  **For `fix`/`refactor` tasks** (instead of new test): "Existing tests verified and adjusted to reflect changed behaviour — `<test command>` passes clean."

Set `github_issue: null` — it will be filled by the sync script.

### 5. Add a row to TASK-INDEX.md

In `docs/tasks/TASK-INDEX.md`, find the correct milestone section (e.g. `## M001`). Append a new table row:

```
| [TASK-<CODE>-<NNN>](./<subdirectory>/TASK-<CODE>-<NNN>-<kebab-title>.md) | <title> | <prd_ref> | 🔴/🟠/🟡 | <complexity> | 📋 | — |
```

Priority emoji: 🔴 high · 🟠 medium · 🟡 low.

If the milestone section doesn't exist yet in TASK-INDEX.md, add it with a `## MXXX — <Title>` heading and an empty table matching the existing column format.

### 6. Remind about GitHub sync

After writing, tell the user:
```
Run: python3 scripts/gh_create_issues.py --dry-run
Then: python3 scripts/gh_create_issues.py
to create the GitHub Issue and back-fill the github_issue field.
```

### 7. Report

Tell the user:
- File created: `docs/tasks/<subdirectory>/TASK-<CODE>-<NNN>-<kebab-title>.md`
- TASK-INDEX.md row added under milestone `<MXXX>`
- Suggested commit: `docs(docs): add TASK-<CODE>-<NNN> <title>`
