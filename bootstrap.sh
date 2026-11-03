#!/usr/bin/env bash
#
# workflow-kit bootstrap — install the AI-workflow layer into a project, one command.
#
#   curl -fsSL https://raw.githubusercontent.com/yanmii-inc/workflow-kit/main/bootstrap.sh | bash
#
# Run inside the target project (or pass --dir). It fetches the kit to a temp dir,
# runs the installer, installs commitlint/husky deps, sets git commit.template,
# then prints what is left to do by hand.
#
# Options (after `bash -s --`):
#   --dir <path>            target project dir (default: $PWD)
#   --name <name>           project display name (default: folder name)
#   --id <slug>             project slug (default: slugified name)
#   --description <text>    one-liner injected into AGENTS.md
#   --scope <n=p[:notes]>   repeatable, e.g. --scope api=apps/api:Backend
#   --pm <pnpm|npm|yarn|bun>  package manager for dep install (default: auto-detect)
#   --no-deps               skip commitlint/husky install
#   --dry-run               preview installer actions, change nothing
#   --ref <ref>             kit git ref to fetch (default: main); e.g. --ref v1.0.0
#
# Inline flags win over a workflow.config.json in the target dir.
# For development/testing: WORKFLOW_KIT_LOCAL=/path/to/workflow-kit skips the download.

set -euo pipefail

REPO="yanmii-inc/workflow-kit"
REF="main"
TARGET="$PWD"
PM=""
NO_DEPS=0
PASSTHROUGH=()

usage() {
  cat <<'HELP'
workflow-kit bootstrap — install the AI-workflow layer into a project, one command.

  curl -fsSL https://raw.githubusercontent.com/yanmii-inc/workflow-kit/main/bootstrap.sh | bash

Options (after `bash -s --`):
  --dir <path>            target project dir (default: $PWD)
  --name <name>           project display name (default: folder name)
  --id <slug>             project slug (default: slugified name)
  --description <text>    one-liner injected into AGENTS.md
  --scope <n=p[:notes]>   repeatable, e.g. --scope api=apps/api:Backend
  --pm <pnpm|npm|yarn|bun>  package manager for dep install (default: auto-detect)
  --no-deps               skip commitlint/husky install
  --dry-run               preview installer actions, change nothing
  --ref <ref>             kit git ref to fetch (default: main); e.g. --ref v1.0.0

Inline flags win over a workflow.config.json in the target dir.
HELP
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir) TARGET="$2"; shift 2 ;;
    --ref) REF="$2"; shift 2 ;;
    --pm) PM="$2"; shift 2 ;;
    --no-deps) NO_DEPS=1; shift ;;
    --dry-run) PASSTHROUGH+=("--dry-run"); shift ;;
    --help|-h) usage; exit 0 ;;
    *) PASSTHROUGH+=("$1"); shift ;;
  esac
done

say()  { printf '%s\n' "$*"; }
warn() { printf '⚠ %s\n' "$*" >&2; }
die()  { printf '✗ %s\n' "$*" >&2; exit 1; }

for bin in curl tar node; do
  command -v "$bin" >/dev/null 2>&1 || die "$bin not found in PATH — install it first"
done
[[ -d "$TARGET" ]] || die "target dir not found: $TARGET"

# ── fetch kit ────────────────────────────────────────────────────────────────

KIT_TMP=""
if [[ -n "${WORKFLOW_KIT_LOCAL:-}" ]]; then
  KIT_ROOT="$WORKFLOW_KIT_LOCAL"
  say "ℹ using local kit: $KIT_ROOT"
else
  KIT_TMP="$(mktemp -d "${TMPDIR:-/tmp}/workflow-kit.XXXXXX")"
  trap 'rm -rf "$KIT_TMP"' EXIT
  say "ℹ fetching workflow-kit@$REF ..."
  curl -fsSL "https://codeload.github.com/${REPO}/tar.gz/refs/heads/${REF}" \
    | tar -xz -C "$KIT_TMP" --strip-components=1
  KIT_ROOT="$KIT_TMP"
fi
[[ -f "$KIT_ROOT/install.mjs" ]] || die "install.mjs not found in kit ($KIT_ROOT)"

# ── install ──────────────────────────────────────────────────────────────────

node "$KIT_ROOT/install.mjs" "$TARGET" ${PASSTHROUGH[@]+"${PASSTHROUGH[@]}"}

DRY=0
for a in ${PASSTHROUGH[@]+"${PASSTHROUGH[@]}"}; do
  [[ "$a" == "--dry-run" ]] && DRY=1
done
if [[ $DRY -eq 1 ]]; then
  say ""
  say "Dry run — skipped deps/git wiring. Re-run without --dry-run to apply."
  exit 0
fi

# ── dep install: commitlint + husky ──────────────────────────────────────────

detect_pm() {
  if [[ -f "$TARGET/pnpm-lock.yaml" ]]; then echo pnpm
  elif [[ -f "$TARGET/yarn.lock" ]]; then echo yarn
  elif [[ -f "$TARGET/bun.lockb" || -f "$TARGET/bun.lock" ]]; then echo bun
  else echo npm; fi
}

if [[ $NO_DEPS -eq 1 ]]; then
  say "ℹ --no-deps: skipped commitlint/husky install"
elif [[ -f "$TARGET/package.json" ]]; then
  PM="${PM:-$(detect_pm)}"
  if ! command -v "$PM" >/dev/null 2>&1; then
    warn "package manager '$PM' not found — install deps manually: $PM add -D @commitlint/cli @commitlint/config-conventional husky"
  else
    say "ℹ installing commitlint + husky via $PM ..."
    (cd "$TARGET" && "$PM" add -D @commitlint/cli @commitlint/config-conventional husky >/dev/null) \
      || warn "dep install failed — run: $PM add -D @commitlint/cli @commitlint/config-conventional husky"

    case "$PM" in
      pnpm) RUNNER="pnpm exec husky init" ;;
      yarn) RUNNER="yarn husky init" ;;
      bun)  RUNNER="bunx husky init" ;;
      *)    RUNNER="npx --yes husky init" ;;
    esac
    if (cd "$TARGET" && $RUNNER >/dev/null 2>&1); then
      say "✓ husky init"
    else
      warn "husky init failed — run manually: $RUNNER"
    fi
  fi
else
  say "ℹ no package.json — skipped commitlint/husky (wire up later if needed)"
fi

# ── git commit template ──────────────────────────────────────────────────────

if git -C "$TARGET" rev-parse --git-dir >/dev/null 2>&1; then
  git -C "$TARGET" config commit.template .gitmessage
  say "✓ git config commit.template .gitmessage"
else
  warn "not a git repo — skipped commit.template (run: git init, then git config commit.template .gitmessage)"
fi

# ── what's left ──────────────────────────────────────────────────────────────

cat <<'EOF'

Done. Remaining (manual, project decisions — the installer marked them):
  1. Edit AGENTS.md            → fill <!-- PROJECT: ... --> blocks (principles, per-area instructions)
  2. Edit docs/PROJECT-MAP.md  → domain codes, test commands per scope
  3. Edit .husky/*             → keep only the stacks you use (marked PROJECT CONFIG)
  4. Edit scripts/gh_create_issues.py → DOMAIN_TO_LABEL map
  5. Commit: git add -A && git commit
EOF
