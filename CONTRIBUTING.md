# Contributing to claude-unison

Thanks for helping improve the Claude Code plugin for Unison brain memory.

## Repo layout

```
src/
  lib/              shared helpers (BrainClient, auth, settings, …)
  context-hook.js   SessionStart hook — brain recall at session open
  summary-hook.js   Stop hook — transcript capture at session close
  search-memory.js  unison-search skill entry point
  write-memory.js   unison-save skill entry point
  auth-provision.js /claude-unison:auth command
  status.js         /claude-unison:status command
plugin/
  hooks/hooks.json  hook wiring
  skills/           unison-search, unison-save
  commands/         /claude-unison:* command docs (rendered by Claude Code)
scripts/build.js    esbuild bundler (src → plugin/scripts/*.cjs)
```

## Development

```bash
bun install
bun run build      # bundle src/*.js → plugin/scripts/*.cjs
bun run lint       # Biome check (lint + format)
bun run lint:fix   # auto-fix Biome issues
```

## Before opening a PR

1. `bun run build` and `bun run lint` must pass (CI runs both).
2. One logical change per PR.
3. If you change hook or skill behaviour, test against a real brain:
   ```bash
   export UNISON_TOKEN=usk_...
   export UNISON_API_URL=http://localhost:4001   # or https://brain.unisonlabs.ai
   node src/search-memory.js "test query"
   node src/write-memory.js "test content"
   ```

## Conventions

- JavaScript (CommonJS), Node ≥ 18. Biome: 2-space indent, single quotes, 100 cols.
- `BrainClient` (`src/lib/brain-client.js`) is the single HTTP layer — do not add
  duplicate fetch calls elsewhere.
- Hook output must use `writeOutput()` from `src/lib/stdin.js`. Raw `console.log` in
  hook scripts breaks the JSON contract with Claude Code.
- Human-readable messages go to **stderr**; machine / skill data goes to **stdout**.

## Reporting bugs / proposing features

Use the issue templates. For security issues, see [`SECURITY.md`](./SECURITY.md) —
do **not** open a public issue.
