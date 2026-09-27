# 🗺️ {{PROJECT_NAME}} — Project Map

> **The single place** where project-specific workflow values live: domain codes,
> commit scopes, paths, requirement prefixes, and test commands.
> Skills, hooks, and agent rules reference this file instead of hardcoding values.
>
> **When you add, rename, or remove an app/package: update this file first.**

---

## Domain Codes (task IDs & paths)

| Code | Path | Task subfolder | REQ prefix |
|:---|:---|:---|:---|
| `API` | `apps/api` | `api/` | `REQ-API-` |
| `INFRA` | `docker/`, `.github/`, `scripts/` | `infra/` | `REQ-INFRA-` |

<!-- PROJECT: add one row per app/package. Code = short uppercase token used in
     TASK-<CODE>-NNN ids; subfolder = lowercase docs/tasks/ subdirectory;
     REQ prefix = requirement ID prefix used in PRDs and commit footers. -->

---

## Commit Scopes

| Scope | Path | Owns |
|:---|:---|:---|
| `infra` | `docker/`, `compose.*`, `.github/`, `scripts/` | Build, deploy, CI/CD |
| `docs` | `docs/` | Documentation |
| `workspace` | root config files | Tooling, workspace config |

<!-- PROJECT: keep this table in sync with `scope-enum` in `.commitlintrc.json`
     and the scopes table in docs/COMMIT_CONVENTION.md. The installer
     regenerates those two from workflow config — this file is the human view. -->

---

## Test & Lint Commands

| Area | Test command | Lint/format command |
|:---|:---|:---|
| `apps/api` | `go test ./apps/api/...` | `go vet ./apps/api/...` |

<!-- PROJECT: one row per area. Skills (write-task DoD, reconcile test check)
     and the pre-push hook read from this table. -->

---

## Traceability Convention (quick reference)

- Requirement: `REQ-<PREFIX>-NNN` defined in the owning PRD (or `docs/infra/REQUIREMENTS.md`)
- Decision: `ADR-NNN` in `docs/decisions/`
- Task: `TASK-<CODE>-NNN` in `docs/tasks/`
- Commit footers: `Implements: REQ-XX-NNN` · `See: ADR-NNN` · `Closes: #NNN`
