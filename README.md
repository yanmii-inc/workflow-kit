# workflow-kit

Reusable AI-agent workflow for any repository: documentation tiers, traceable
commits, ADRs, tasks, milestones, skills for Claude Code / Gemini / Cursor /
JetBrains AI / Zed, graft wiring, and CI-grade enforcement hooks.

One command installs it into a project. Re-running the command updates it —
without touching the files your project has customized.

## Install into a project

```bash
# inside the target project — fetch the kit and run it (no clone kept behind)
npx degit yanmii-inc/workflow-kit /tmp/workflow-kit
node /tmp/workflow-kit/install.mjs --config workflow.config.json --dry-run   # preview
node /tmp/workflow-kit/install.mjs --config workflow.config.json             # install

# no config yet? quick start with folder-name defaults:
node /tmp/workflow-kit/install.mjs

# or from a local clone of this repo
node /path/to/workflow-kit/install.mjs /path/to/project --config examples/lokalaku.config.json
```

Updating later is the same two lines — refetch the kit and re-run. Managed
files refresh; your seeded, customized files are left alone.

Without `--config`, the installer assumes the target folder name as project name
and a minimal default scope set. Copy `workflow.config.json`, fill it in, and
pass it via `--config` (the file is looked up in the target dir too).

Config schema:

```jsonc
{
  "name": "Lokalaku",            // display name, injected into docs
  "id": "lokalaku",              // slug — used in hook banners, paths
  "description": "One-liner",    // injected into AGENTS.md intro
  "scopes": [                    // drives commitlint, COMMIT_CONVENTION, .gitmessage
    { "name": "api", "path": "apps/api", "notes": "Backend API" }
  ]
}
```

## Update an existing install

```bash
node install.mjs /path/to/project --config my.config.json   # re-run anytime
node install.mjs /path/to/project --check                   # version + drift report
```

## What gets written, and what never gets touched

Every file is recorded in the target's `.workflow-kit.json` manifest with a class:

| Class | Behaviour | Files |
|:---|:---|:---|
| **managed** | overwritten on every install/update | skills (`.claude/`, `.agents/`), tool configs (`.gemini/`, `.cursor/`, `.aiassistant/`, `.mcp.json`), `.gitmessage`, `.commitlintrc.json`, `docs/COMMIT_CONVENTION.md`, doc templates (ADR/TASK/MILESTONE), `scripts/check-*.sh`, `GEMINI.md` |
| **seed** | written only if missing — project-owned afterwards | `AGENTS.md`, `CLAUDE.md`, `docs/PROJECT-MAP.md`, `docs/GLOSSARY.md`, `docs/tasks/TASK-INDEX.md`, `docs/milestones/CHANGELOG.md`, `.husky/*`, `scripts/gh_create_issues.py` |

The rule of thumb: **managed = pure workflow logic, seed = workflow logic that
embeds project decisions.** `--force` re-seeds everything (destroys project edits).

Improvements to seed files don't auto-propagate by design. After an update, diff
your copies against `template/`:

```bash
diff template/AGENTS.md /path/to/project/AGENTS.md
diff template/.husky/commit-msg /path/to/project/.husky/commit-msg
```

## Post-install (per project, once)

The installer prints a checklist; the short version:

1. Fill the `<!-- PROJECT: ... -->` blocks: `AGENTS.md` (principles, per-area
   instructions), `docs/PROJECT-MAP.md` (domains, scopes, test commands),
   `.husky/*` (keep only your stacks), `scripts/gh_create_issues.py` (label map).
2. Install the enforcement deps: `pnpm add -D @commitlint/cli @commitlint/config-conventional husky && npx husky init`
3. `git config commit.template .gitmessage`
4. Optional but recommended: [graft](https://github.com/nanonets/graft) (`graft build`) — the statusline, hooks, and MCP config shipped here assume it.

## Repo layout

```
template/            the universal layer (installed into target projects)
install.mjs          installer/updater — plain node, zero dependencies
workflow.config.json default config; per-project configs go anywhere (see examples/)
examples/            real-world configs (lokalaku = the origin project)
VERSION              semver of the workflow itself
```

## What stays project-specific (not templated)

`PRD.md`, per-app `PRD.md`/`AGENTS.md`, `docs/GLOSSARY.md` content,
`docs/WHY.md`, `docs/PROCESSES.md`, `docs/ARCHITECTURE.md`,
`docs/decisions/ADR-*` records, `docs/milestones/M*` records,
`docs/tasks/**` task records, `docs/design/*`, CI workflows (`.github/`),
and the build system (`.moon/`, `package.json`, …).
