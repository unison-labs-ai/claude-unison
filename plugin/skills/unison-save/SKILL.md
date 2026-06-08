---
name: unison-save
description: Save important project knowledge to the Unison brain. Use when user wants to preserve architectural decisions, significant bug fixes, design patterns, or important implementation details for team reference.
allowed-tools: Bash(node *)
---

# Unison Brain Save

Save important project knowledge based on what the user wants to preserve.

## Step 1: Understand User Request

Analyze what the user is asking to save from the conversation.

## Step 2: Format Content

```
[SAVE:<username>:<date>]

<Username> wanted to <goal/problem>.

Claude suggested <approach/solution>.

<Username> decided to <decision made>.

<key details, files if relevant>

[/SAVE]
```

Example:
```
[SAVE:daniel:2026-06-08]

Daniel wanted to add real-time collaboration to the canvas.

Claude suggested using a CRDT with Yjs, with a shared WebSocket provider.

Daniel decided to use Yjs + y-websocket, keeping the shared provider in a singleton module.

Files: src/collab/provider.ts, src/collab/awareness.ts

[/SAVE]
```

Keep it natural. Capture the conversation flow.

## Step 3: Save

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/write-project-memory.cjs" "FORMATTED_CONTENT"
```
