---
description: Show a link to the current session document in the Unison brain
allowed-tools: ["Bash", "Read"]
---

# Current Session Document

Show a direct link to the current Claude Code session's brain document.

## Steps

1. Read the session data:
   ```bash
   cat ~/.unison-claude/last-session.json 2>/dev/null || echo ""
   ```

2. If data exists, build a link:
   `https://app.unisonlabs.ai/?view=doc&path=<docPath>`

3. Output a clean link:
   ```
   **Unison brain session document:**
   [View in Unison](THE_CORRECT_URL)
   ```

4. (Optional on macOS) Also run:
   ```bash
   open "THE_CORRECT_URL" 2>/dev/null || true
   ```

5. If nothing is saved yet:
   ```
   No Unison brain document yet for this session.
   Keep chatting — it will be created automatically when the session ends.
   ```

Always produce a real working Markdown link (no placeholders).
