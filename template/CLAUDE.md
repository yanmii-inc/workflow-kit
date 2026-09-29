# {{PROJECT_NAME}} — Claude Code rules

@AGENTS.md

## Project notes

- **Task Pickup Lifecycle**: Whenever told to pick up a task or multiple tasks from `docs/tasks/TASK-INDEX.md` and start execution, immediately mark those tasks as in-progress:
  1. Update the status column in `docs/tasks/TASK-INDEX.md` to `🔄`.
  2. Update the YAML frontmatter in each corresponding task file (`docs/tasks/<domain>/TASK-*.md`) to `status: in-progress`.

<!-- PROJECT: add anything Claude Code-specific here (commands, quirks,
     machine-local paths). Everything else lives in AGENTS.md — keep this file
     thin so rules have one home. -->
