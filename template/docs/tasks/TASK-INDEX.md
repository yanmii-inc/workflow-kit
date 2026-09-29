# 📋 {{PROJECT_NAME}} — Task Index

> **For agents:** Read this when planning work, decomposing PRD requirements into tasks,  
> or checking what is already in progress. Use `TASK-TEMPLATE.md` to create new task files.  
> Run `python3 scripts/gh_create_issues.py` to sync unlinked tasks to GitHub Issues.  
> **Task Pickup:** When told to pick up or start execution on any task(s), immediately mark the row status to `🔄` and update the task file frontmatter to `status: in-progress`.  
> **Routing tier:** 5 (task planning and work breakdown).

---

## Domain Codes

<!-- PROJECT: keep in sync with docs/PROJECT-MAP.md (that file is the source of truth). -->

| Code | Scope |
|:---|:---|
| `API` | `apps/api` |
| `INFRA` | Docker, CI/CD, deployment |

## Status Legend

| Symbol | Status | Meaning |
|:---:|:---|:---|
| 📋 | `todo` | Defined, not started |
| 🔄 | `in-progress` | Active development |
| ✅ | `done` | Implemented and verified |
| ⏸️ | `deferred` | Moved to a later milestone |
| ❌ | `cancelled` | No longer needed |

## Complexity Legend

| Code | Meaning |
|:---:|:---|
| `S` | Hours |
| `M` | 1–2 days |
| `L` | 3–5 days |
| `XL` | Sprint |

---

# Milestones

<!-- PROJECT: one `## MXXX — <Title>` section per milestone, each with a task
     table. Row format:
     | [TASK-<CODE>-NNN](./<subdir>/file.md) | Title | REQ-XX-NNN | 🔴/🟠/🟡 | S/M/L/XL | 📋 | — |
     Last column = linked GitHub issue (filled by scripts/gh_create_issues.py). -->

_No milestones yet — create one with the `record-milestone` skill or copy `docs/milestones/MILESTONE-TEMPLATE.md`._
