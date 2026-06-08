---
description: Index codebase into Unison brain for persistent context
allowed-tools: ["Read", "Glob", "Grep", "Bash", "Task"]
---

# Codebase Indexing

Explore this codebase deeply and compile findings into the Unison brain.

## Phase 0: Detect Ecosystem

Before anything else, determine the primary tech stack by checking which manifest files exist:

```
Glob for these patterns at the repo root (and one level deep):
*.sln, *.csproj, Directory.Build.props, global.json    → .NET/C#
package.json                                            → JS/TS
Cargo.toml                                              → Rust
pyproject.toml, setup.py, requirements.txt              → Python
go.mod                                                  → Go
pom.xml, build.gradle, build.gradle.kts                 → Java/Kotlin
Gemfile                                                 → Ruby
composer.json                                           → PHP
Package.swift                                           → Swift
mix.exs                                                 → Elixir
```

Note the detected ecosystem(s). A repo may use multiple (e.g., a JS frontend + Go backend).

---

## Phase 1: Project Overview

Read and note:
- Manifest and config files for the detected ecosystem
- `README.md`
- CI/CD config (`.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`, etc.)
- Docker files

Gather: project name, purpose, tech stack, how to run/build/test.

## Phase 2: Architecture

Explore and note:
- Use Glob to understand folder structure
- Find entry points for the detected ecosystem
- Identify key architectural patterns

Gather: architecture, key modules, data flow.

## Phase 3: Conventions

Analyze and note:
- Naming conventions (files, classes, functions, variables)
- File organization and project structure patterns
- Git history: `git log --oneline -20`

Gather: coding conventions, patterns to follow.

## Phase 4: Key Files

Read and note:
- Auth logic
- Database connections / ORM setup
- API clients
- Shared utilities and helpers

Gather: where important logic lives.

## Final Step: Save to Unison Brain

After exploring all phases, compile everything into one comprehensive summary and save:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/write-memory.cjs" "YOUR COMPILED FINDINGS HERE"
```

Include: detected ecosystem, tech stack, architecture, conventions, key files, important patterns.

## Instructions

- Make ~20-50 tool calls to explore thoroughly
- Skip dependency/package folders (`node_modules`, `bin`, `obj`, `target`, `vendor`, `__pycache__`, `.gradle`, `build`, `.build`, `_build`, `deps`), generated files, and lock files
- Compile all findings at the end into one save

Start now.
