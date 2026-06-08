---
description: Show Unison brain authentication status and connection info
allowed-tools: ["Bash"]
---

# Unison Brain Status

Run the bundled status checker and show the output to the user.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/status.cjs"
```

If the command fails, show the error and suggest setting `UNISON_TOKEN` or restarting Claude Code after reinstalling the plugin.
