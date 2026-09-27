#!/usr/bin/env node
/**
 * workflow-kit installer — copies the universal AI-workflow layer into a project.
 *
 * Usage:
 *   node install.mjs [target-dir] [options]
 *
 * Options:
 *   --config <file>   Workflow config JSON (default: ./workflow.config.json)
 *   --force           Also overwrite "seed" files that already exist (destroys project edits!)
 *   --check           Report installed version / drift; change nothing
 *   --dry-run         Print planned actions without writing
 *
 * File classes:
 *   managed — workflow-canonical; overwritten on every install/update
 *   seed    — project-owned after first install (AGENTS.md, PROJECT-MAP, task index,
 *             husky hooks...); only written if missing, unless --force
 *
 * The set of installed files + their class is recorded in <target>/.workflow-kit.json
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, chmodSync } from "node:fs";
import { join, dirname, resolve, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";

const KIT_ROOT = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(KIT_ROOT, "template");
const VERSION = readFileSync(join(KIT_ROOT, "VERSION"), "utf8").trim();
const MANIFEST_NAME = ".workflow-kit.json";

// ── args ─────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const flagValue = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
if (flags.has("--help") || flags.has("-h")) {
  console.log(readFileSync(import.meta.url.replace("file://", ""), "utf8").split("*/")[0] + "*/");
  process.exit(0);
}

const targetArg = argv.find((a) => !a.startsWith("--") && a !== flagValue("--config"));
const target = resolve(targetArg || process.cwd());
const configPath = resolve(flagValue("--config") || join(target, "workflow.config.json") || "workflow.config.json");
const DRY = flags.has("--dry-run");
const FORCE = flags.has("--force");
const CHECK = flags.has("--check");

if (!existsSync(TEMPLATE_DIR)) {
  console.error(`✗ template/ not found next to install.mjs (${TEMPLATE_DIR})`);
  process.exit(1);
}

// ── config ───────────────────────────────────────────────────────────────────

function loadConfig() {
  const fallback = {
    name: basename(target),
    id: slug(basename(target)),
    description: "",
    scopes: [
      { name: "infra", path: "docker/, .github/, scripts/", notes: "Build, deploy, CI/CD" },
      { name: "docs", path: "docs/", notes: "Documentation" },
      { name: "workspace", path: "root config files", notes: "Tooling, workspace config" },
    ],
  };
  if (!existsSync(configPath)) {
    if (flags.has("--config")) {
      console.error(`✗ config not found: ${configPath}`);
      process.exit(1);
    }
    console.log(`ℹ no workflow.config.json — using defaults (name: ${fallback.name})`);
    return fallback;
  }
  const cfg = JSON.parse(readFileSync(configPath, "utf8"));
  return {
    name: cfg.name || fallback.name,
    id: cfg.id || slug(cfg.name || fallback.name),
    description: cfg.description || "",
    scopes: cfg.scopes?.length ? cfg.scopes : fallback.scopes,
  };
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const cfg = loadConfig();

// ── substitution ─────────────────────────────────────────────────────────────

function substitutions() {
  const names = cfg.scopes.map((s) => s.name);
  return new Map([
    ["{{PROJECT_NAME}}", cfg.name],
    ["{{PROJECT_ID}}", cfg.id],
    ["{{PROJECT_ID_UPPER}}", cfg.id.toUpperCase()],
    ["{{PROJECT_DESCRIPTION}}", cfg.description || "_(add a one-line product description to AGENTS.md)_"],
    ["{{SCOPES_COMMA}}", names.join(", ")],
    ["{{SCOPES_PIPE}}", names.join(" | ")],
    [
      "{{SCOPES_TABLE}}",
      cfg.scopes.map((s) => `| \`${s.name}\` | \`${s.path}\` | ${s.notes || ""} |`).join("\n"),
    ],
  ]);
}

function substitute(content) {
  let out = content;
  for (const [k, v] of substitutions()) out = out.split(k).join(v);
  return out;
}

/** .commitlintrc.json — swap the scope-enum array for the configured scopes */
function substituteCommitlint(content) {
  const names = cfg.scopes.map((s) => `                "${s.name}"`).join(",\n");
  return content.replace(
    /("scope-enum":\s*\[\s*2,\s*"always",\s*\[)([\s\S]*?)(\]\s*\])/,
    `$1\n${names}\n            $3`
  );
}

// ── file classes ─────────────────────────────────────────────────────────────

const MANAGED = [
  /^\.claude\//,
  /^\.agents\//,
  /^\.gemini\//,
  /^\.aiassistant\//,
  /^\.cursor\//,
  /^\.mcp\.json$/,
  /^GEMINI\.md$/,
  /^\.gitmessage$/,
  /^\.commitlintrc\.json$/,
  /^docs\/COMMIT_CONVENTION\.md$/,
  /^docs\/decisions\/ADR-TEMPLATE\.md$/,
  /^docs\/tasks\/TASK-TEMPLATE\.md$/,
  /^docs\/milestones\/MILESTONE-TEMPLATE\.md$/,
  /^scripts\/check-commit-footers\.sh$/,
  /^scripts\/check-test-files\.sh$/,
];
const isManaged = (rel) => MANAGED.some((re) => re.test(rel));
const isSeed = (rel) => !isManaged(rel);

// ── walk template ────────────────────────────────────────────────────────────

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(relative(TEMPLATE_DIR, full));
  }
  return out.sort();
}

const files = walk(TEMPLATE_DIR);
const existingManifest = join(target, MANIFEST_NAME);
const prevManifest = existsSync(existingManifest)
  ? JSON.parse(readFileSync(existingManifest, "utf8"))
  : null;

// ── --check ──────────────────────────────────────────────────────────────────

if (CHECK) {
  if (!prevManifest) {
    console.log(`✗ no ${MANIFEST_NAME} in ${target} — workflow-kit not installed here`);
    process.exit(1);
  }
  console.log(`workflow-kit  installed: ${prevManifest.version}  current: ${VERSION}`);
  console.log(prevManifest.version === VERSION ? "✓ up to date" : "↑ update available — run install.mjs again");
  const newFiles = files.filter((f) => !(f in prevManifest.files));
  if (newFiles.length) console.log(`new in ${VERSION}: ${newFiles.join(", ")}`);
  const unresolved = files.filter((f) => {
    const p = join(target, f);
    return existsSync(p) && /\{\{[A-Z_]+\}\}/.test(readFileSync(p, "utf8"));
  });
  if (unresolved.length) console.log(`⚠ unresolved placeholders in: ${unresolved.join(", ")}`);
  process.exit(0);
}

// ── install ──────────────────────────────────────────────────────────────────

if (!DRY) {
  console.log(`workflow-kit ${VERSION} → ${target}`);
  console.log(`  project: ${cfg.name} (${cfg.id}), scopes: ${cfg.scopes.map((s) => s.name).join(", ")}`);
}

const manifest = { version: VERSION, installedAt: new Date().toISOString(), config: cfg, files: {} };
let written = 0;
let skipped = 0;
const placeholderFiles = [];

for (const rel of files) {
  const dest = join(target, rel);
  const base = basename(rel);
  let action;

  if (base === ".gitkeep") {
    if (existsSync(dest)) { skipped++; continue; }
    action = "seed";
  } else if (isManaged(rel)) {
    action = "managed";
  } else {
    if (existsSync(dest) && !FORCE) {
      skipped++;
      manifest.files[rel] = prevManifest?.files?.[rel] || "seed-kept";
      continue;
    }
    action = "seed";
  }

  let content = readFileSync(join(TEMPLATE_DIR, rel), "utf8");
  content = rel === ".commitlintrc.json" ? substituteCommitlint(content) : substitute(content);
  if (/\{\{[A-Z_]+\}\}/.test(content)) placeholderFiles.push(rel);

  manifest.files[rel] = action;
  if (!DRY) {
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, content);
    if (rel.startsWith("scripts/") || rel.startsWith(".husky/")) chmodSync(dest, 0o755);
  }
  written++;
  console.log(`  ${DRY ? "[dry] " : ""}${action.padEnd(7)} ${rel}`);
}

// preserve files installed by a previous run that no longer exist in template
for (const [rel, cls] of Object.entries(prevManifest?.files || {})) {
  if (!manifest.files[rel] && cls) manifest.files[rel] = cls;
}

if (!DRY) {
  writeFileSync(existingManifest, JSON.stringify(manifest, null, 2) + "\n");
}

console.log(`
${DRY ? "Dry run: " : ""}${written} file(s) ${DRY ? "would be" : ""} written, ${skipped} kept as-is.
Manifest: ${MANIFEST_NAME}${DRY ? " (not written in dry-run)" : ""}`);

if (placeholderFiles.length) {
  console.log(`⚠ still contains {{PLACEHOLDER}} markers (edit by hand): ${placeholderFiles.join(", ")}`);
}

console.log(`
Post-install checklist:
  1. Edit AGENTS.md          → fill Global Principles + Context-Specific Instructions sections
  2. Edit docs/PROJECT-MAP.md → domain codes, commit scopes, test commands
  3. Edit .husky/*           → keep only the stacks you use (marked PROJECT CONFIG)
  4. Edit scripts/gh_create_issues.py → DOMAIN_TO_LABEL map
  5. Wire up tooling if not present:
       pnpm add -D @commitlint/cli @commitlint/config-conventional husky
       npx husky init          (then confirm .husky/ hooks are in place)
       git config commit.template .gitmessage
  6. Commit: git add -A && git commit -m "chore(workspace): install workflow-kit ${VERSION}"`);
