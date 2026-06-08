---
name: unison-search
description: Search your coding memory in the Unison brain. Use when user asks about past work, previous sessions, how something was implemented, what they worked on before, or wants to recall information from earlier sessions.
allowed-tools: Bash(node:*)
---

# Unison Brain Search

Search the Unison brain for past coding sessions, decisions, and saved information.

## How to Search

Run the search script with the user's query and optional scope flag:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/search-memory.cjs" [--personal|--repo|--both] "USER_QUERY_HERE"
```

### Scope Flags

- `--both` (default): Search both personal session and project knowledge in parallel
- `--personal`: Search personal/user memories across sessions
- `--repo`: Search project/repo knowledge shared across team

## Examples

- User asks "what did I work on yesterday":

  ```bash
  node "${CLAUDE_PLUGIN_ROOT}/scripts/search-memory.cjs" "work yesterday recent activity"
  ```

- User asks "how did we implement auth" (project-specific):

  ```bash
  node "${CLAUDE_PLUGIN_ROOT}/scripts/search-memory.cjs" --repo "authentication implementation"
  ```

- User asks "what are my coding preferences":
  ```bash
  node "${CLAUDE_PLUGIN_ROOT}/scripts/search-memory.cjs" --personal "coding preferences style"
  ```

## Present Results

The script outputs formatted memory results with timestamps and relevance scores. Present them clearly to the user and offer to search again with different terms if needed.
