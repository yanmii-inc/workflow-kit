# Skill: pickup-task

Mark one or more tasks from `docs/tasks/TASK-INDEX.md` as in-progress when starting execution.

**Trigger phrases:** "pickup task", "pick up TASK-...", "start task", "work on TASK-...", "take on task", "start execution on task"

---

## Steps

### 1. Identify the task(s)

Extract all task IDs from the user prompt or find the corresponding task IDs in `docs/tasks/TASK-INDEX.md`.

### 2. Update each task file

For each task:
- Open `docs/tasks/<domain>/TASK-<DOMAIN>-<NNN>*.md`.
- In the YAML frontmatter, change `status: todo` (or prior status) to `status: in-progress`.
- If on a task branch or worktree (per `docs/WORKTREE_WORKFLOW.md`), keep this update within that branch.

### 3. Update TASK-INDEX.md

In `docs/tasks/TASK-INDEX.md`:
- Locate the row for each task ID.
- In the `Status` column, change the emoji from `📋` to `🔄`.

### 4. Proceed with execution

Report which task(s) have been marked `in-progress` (`🔄`) and continue with implementation.
