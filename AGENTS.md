# AGENTS.md

Guidance for AI agents. This file covers two jobs — jump to yours:

- **Use this plugin** — you're an agent helping someone set up claude-unison →
  [Install and authenticate](#install-and-authenticate)
- **Contribute to this repo** — you're changing this plugin's code →
  [Working in this repo](#working-in-this-repo)

Follows the [AGENTS.md](https://agents.md/) convention. Human contributors: see
[`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## Install and authenticate

### 1. Install the plugin

```bash
/plugin marketplace add unison-labs-ai/claude-unison
/plugin install claude-unison
```

### 2. Authenticate (needs the human — you cannot mint a key yourself)

- **Headless / env var (preferred for CI and automation):**
  Ask the user for a `usk_...` key from [app.unisonlabs.ai](https://app.unisonlabs.ai), then:
  ```bash
  export UNISON_TOKEN=usk_...
  export UNISON_API_URL=https://brain.unisonlabs.ai   # optional; this is the default
  ```
- **Interactive OTP (no browser, no pre-existing key):**
  Run `/claude-unison:auth` inside Claude Code and follow the prompts.

The token is stored at `~/.unison-claude/credentials.json` (0600 permissions).
Priority: `UNISON_TOKEN` env > global settings > project config > credentials file.

### 3. Verify

Run `/claude-unison:status` — it prints your email, masked token, and brain connectivity.

### The loop — happens automatically

- **SessionStart hook** — on every session open, the plugin searches the Unison brain
  for memories relevant to the current project and injects them as context.
- **Stop hook** — on every session close, the new transcript turns are saved to your
  private brain namespace under `/private/sessions/<project-hash>/`.

To trigger manually:

```bash
# Search your brain for a topic
/unison-search "database migration strategy"

# Save something to team knowledge
/unison-save "We use Supabase + PowerSync; Electric was removed in May 2026."
```

### API contract (direct calls, no CLI)

The plugin's `BrainClient` (`src/lib/brain-client.js`) hits these endpoints:

```
GET  /v1/auth/whoami
GET  /v1/brain/search?q=<query>&k=<n>
PUT  /v1/brain/doc          body: { path, bodyMd, kind, title, tags, visibility }
GET  /v1/brain/doc?path=<p>
GET  /v1/brain/list?prefix=<p>&limit=<n>
GET  /v1/brain/status
```

Auth header: `Authorization: Bearer usk_...`

To provision a throwaway key for testing:

```bash
curl -s -X POST https://brain.unisonlabs.ai/v1/auth/provision \
  -H 'Content-Type: application/json' \
  -d '{"email":"your@email.com"}'
# returns { apiKey: "usk_...", workspaceId: "...", status: "unverified" }
```

---

## Working in this repo

A single-package Claude Code plugin. Source lives in `src/`, gets bundled by esbuild
to `plugin/scripts/*.cjs`, and is wired into Claude Code via `plugin/hooks/hooks.json`
and the skills in `plugin/skills/`.

### Build, lint, test (run before every PR)

```bash
bun install
bun run build    # esbuild bundles src/*.js → plugin/scripts/*.cjs
bun run lint     # Biome lint + format check; `bun run lint:fix` to auto-fix
```

CI runs `bun install && bun run build && bun run lint` on every PR.

### Layout

```
src/
  lib/              shared helpers (brain-client, auth, settings, …)
  context-hook.js   SessionStart hook — recall
  summary-hook.js   Stop hook — capture
  search-memory.js  /unison-search skill entry point
  write-memory.js   /unison-save skill entry point
  auth-provision.js /claude-unison:auth command
  status.js         /claude-unison:status command
  …
plugin/
  hooks/hooks.json  hook wiring (SessionStart → context-hook, Stop → summary-hook)
  skills/           unison-search, unison-save skill definitions
  commands/         /claude-unison:* command docs
scripts/build.js    esbuild bundler
```

### Conventions

- JavaScript (CommonJS, Node ≥ 18). Biome formatting: 2-space indent, single quotes,
  100 cols (see `biome.json`).
- `BrainClient` in `src/lib/brain-client.js` is the only HTTP layer. Do not add
  duplicate fetch calls elsewhere.
- Human-readable output goes to **stderr**; machine / skill data goes to **stdout**.
- Hook outputs must use `writeOutput()` from `src/lib/stdin.js` — raw `console.log`
  in hook scripts breaks the JSON contract with Claude Code.

### PRs

One logical change per PR. Never push to `main` directly. Security issues: see
[`SECURITY.md`](./SECURITY.md).
