---
name: pickup-task
description: Mark one or more tasks from docs/tasks/TASK-INDEX.md as in-progress when starting execution. Updates TASK-INDEX.md status to 🔄 and updates the task file(s) YAML frontmatter to status: in-progress. Use when told to "pickup task", "pick up TASK-...", "start task", "work on TASK-...", "take on task", or when beginning execution on any task.
---

# Skill: Pickup Task

You are picking up one or more tasks to begin active execution.
Follow these steps immediately before writing implementation code.

## Step 1 — Identify the Task(s)

Identify all task IDs requested by the user (e.g. `TASK-INFRA-003`, `TASK-BACK-010`).
If the user specifies a feature or description rather than an explicit ID, look up the corresponding task ID(s) in `docs/tasks/TASK-INDEX.md`.

## Step 2 — Update Task File Frontmatter

For each task ID:
1. Locate the task markdown file under `docs/tasks/<domain>/TASK-<DOMAIN>-<NNN>*.md` (domain folder matches lowercase code, e.g. `infra/`, `back/`, `mob/`, `web/`, `wrk/`, `admin/`, `ops/`).
2. Inspect the YAML frontmatter.
3. Update `status:` to `in-progress` (e.g., change `status: todo` to `status: in-progress`).
4. If working in a per-task worktree or branch (per `docs/WORKTREE_WORKFLOW.md`), make this edit in that branch.

## Step 3 — Update docs/tasks/TASK-INDEX.md

In `docs/tasks/TASK-INDEX.md`:
1. Find the table row matching each task ID.
2. In the `Status` column, change the emoji from `📋` (or previous status) to `🔄`.

## Step 4 — Confirm and Proceed

Report back briefly:
- List each task ID marked `in-progress` (`🔄`).
- Note that execution has started, and proceed with reading the relevant Tier 2 specifications (local `PRD.md` and design docs) and implementing the acceptance criteria.
