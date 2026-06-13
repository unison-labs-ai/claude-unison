<div align="center">

<img src="https://raw.githubusercontent.com/unison-labs-ai/unison-brain/main/assets/brain.svg" width="140" />

# claude-unison

**Your Claude Code has the memory of a goldfish. This fixes that.**

Persistent, cross-session memory for Claude Code — powered by the [Unison brain](https://unisonlabs.ai).

[![CI](https://github.com/unison-labs-ai/claude-unison/actions/workflows/ci.yml/badge.svg)](https://github.com/unison-labs-ai/claude-unison/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Stars](https://img.shields.io/github/stars/unison-labs-ai/claude-unison?style=social)](https://github.com/unison-labs-ai/claude-unison)

[**Why**](#with-unison-vs-without) • [**Install**](#installation) • [**Auth**](#authentication) • [**Commands**](#commands) • [**Config**](#configuration) • [**How it works**](#how-it-works)

</div>

---

### With Unison vs. without

| Without | With Unison |
|---|---|
| Every Claude Code session starts blank | Relevant memories injected automatically at session start |
| Hard-won context lost the moment you close the terminal | Sessions captured to your private brain namespace on stop |
| Architecture decisions re-explained to Claude every time | Team knowledge shared across every session and teammate |
| `CLAUDE.md` goes stale and you forget to update it | Claude writes back what it learns; brain stays current |

---

## Installation

```bash
/plugin marketplace add unison-labs-ai/claude-unison
/plugin install claude-unison
```

Then authenticate with your Unison account:

```bash
/claude-unison:auth
```

Or set your token directly (get one at [app.unisonlabs.ai](https://app.unisonlabs.ai)):

```bash
export UNISON_TOKEN="usk_live_..."
```

## Authentication

Authentication uses a three-step headless flow — no browser required:

1. Run `/claude-unison:auth` and enter your email
2. Check your inbox for a 6-digit OTP
3. Enter the OTP — credentials are saved to `~/.unison-claude/credentials.json`

For CI or non-interactive environments, set `UNISON_TOKEN` directly.

Token priority: `UNISON_TOKEN` env var > `~/.unison-claude/settings.json` > `.claude/.unison-claude/config.json` > `~/.unison-claude/credentials.json`.

## Features

- **Auto Capture** — sessions are saved to the brain when Claude Code stops
- **Auto Recall** — relevant memories are injected at session start
- **Team Memory** — project knowledge shared across your team (tenant-visible docs)
- **Personal Memory** — session transcripts stored privately in your brain namespace
- **Headless Auth** — machine-auth via email OTP, no browser required

## Commands

| Command | Description |
| --- | --- |
| `/claude-unison:index` | Index codebase architecture and patterns into the brain |
| `/claude-unison:auth` | Authenticate via email OTP (headless, no browser) |
| `/claude-unison:project-config` | Configure project-level settings |
| `/claude-unison:logout` | Clear saved credentials |
| `/claude-unison:session` | Show a link to the current session document in the brain |
| `/claude-unison:status` | Show authentication status and brain connection info |

## How It Works

On session start, the `SessionStart` hook queries the Unison brain for memories relevant to the current project and injects them as context. On session end, the `Stop` hook saves the new conversation turns to your private brain namespace as a structured document.

- **unison-search** — Ask about past work or previous sessions; Claude searches your brain
- **unison-save** — Ask to save something important; Claude writes it as team knowledge

## Configuration

### Environment Variables

```bash
UNISON_TOKEN=usk_live_...        # Required: your Unison API token
UNISON_API_URL=https://...       # Optional: override API base URL (default: https://brain.unisonlabs.ai)
UNISON_DEBUG=true                # Optional: enable debug logging
UNISON_ISOLATE_WORKTREES=true    # Optional: treat git worktrees as separate projects
```

### Global Settings — `~/.unison-claude/settings.json`

```json
{
  "maxSearchResults": 5,
  "signalExtraction": false,
  "signalKeywords": ["remember", "architecture", "decision", "bug", "fix"],
  "signalTurnsBefore": 3,
  "includeTools": ["Edit", "Write"]
}
```

| Option | Description |
| --- | --- |
| `maxSearchResults` | Max memories injected into context (default: 5) |
| `signalExtraction` | Only capture turns containing signal keywords (default: false) |
| `signalKeywords` | Keywords that trigger capture when signalExtraction is on |
| `signalTurnsBefore` | Context turns captured before each signal (default: 3) |
| `includeTools` | Tool calls to include in transcript capture |

### Project Config — `.claude/.unison-claude/config.json`

Per-repo overrides. Run `/claude-unison:project-config` or create manually:

```json
{
  "apiToken": "usk_live_...",
  "personalDocPath": "/private/notes/session-my-project-",
  "repoDocPath": "/tenant/projects/my-project-"
}
```

| Option | Description |
| --- | --- |
| `apiToken` | Project-specific token (overrides global `UNISON_TOKEN`) |
| `personalDocPath` | Slug prefix for personal session documents (appended with `<sessionId>.md`) |
| `repoDocPath` | Slug prefix for team-shared project knowledge (appended with `<slug>.md`) |

## Brain Document Paths

Session transcripts are saved as flat documents under `/private/notes/`, with each
file named `session-<project-hash>-<session-id>.md`. The project hash ensures docs
from different repos don't collide.

Project knowledge (saved via `unison-save`) goes to `/tenant/projects/<repo-name>-<slug>.md` —
a single flat slug under the `projects` kind, visible to everyone in your workspace.

Both layouts use the one-slug-segment format required by the brain FS contract;
nested subfolders are not used.

---

## Star history

If this saved you from explaining your codebase to Claude for the fourth time, drop a ⭐ — it helps others find it.

<a href="https://star-history.com/#unison-labs-ai/claude-unison&Date">
  <img src="https://api.star-history.com/svg?repos=unison-labs-ai/claude-unison&type=Date" width="600" />
</a>

---

## Part of the Unison Labs constellation

**One brain, every agent.** Every repo below reads from _and writes to_ the same [Unison brain](https://unisonlabs.ai) — no per-tool memory silos.

| Repo | What it does |
|---|---|
| [unison-brain](https://github.com/unison-labs-ai/unison-brain) | CLI · SDK · MCP server — the core |
| **[claude-unison](https://github.com/unison-labs-ai/claude-unison)** | **Memory for Claude Code** ← you are here |
| [cursor-unison](https://github.com/unison-labs-ai/cursor-unison) | Memory for Cursor |
| [codex-unison](https://github.com/unison-labs-ai/codex-unison) | Memory for OpenAI Codex CLI |
| [opencode-unison](https://github.com/unison-labs-ai/opencode-unison) | Memory for OpenCode |
| [openclaw-unison](https://github.com/unison-labs-ai/openclaw-unison) | Memory for OpenClaw |
| [pipecat-unison](https://github.com/unison-labs-ai/pipecat-unison) | Memory for Pipecat voice agents |
| [python-sdk](https://github.com/unison-labs-ai/python-sdk) | Python SDK for the brain |
| [install-mcp](https://github.com/unison-labs-ai/install-mcp) | One-command MCP installer |
| [code-chunk](https://github.com/unison-labs-ai/code-chunk) | AST-aware code chunking |
| [unison-fs](https://github.com/unison-labs-ai/unison-fs) | Mount the brain as a filesystem |
| [backchannel](https://github.com/unison-labs-ai/backchannel) | Async messaging between agents |
| [Unison-evals](https://github.com/unison-labs-ai/Unison-evals) | Open memory benchmark suite |
