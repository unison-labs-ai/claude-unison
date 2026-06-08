---
description: Update Unison brain project-level configuration
allowed-tools: ["Bash", "Read", "Edit", "AskUserQuestion"]
---

# Project Config

Update project-level config stored in `.claude/.unison-claude/config.json`.

## Steps

1. First, find the git root and read the current project config:

   ```bash
   git_root=$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")
   cat "$git_root/.claude/.unison-claude/config.json" 2>/dev/null || echo "{}"
   ```

2. Ask the user what they want to update using AskUserQuestion:
   - **API Token** (`apiToken`): Project-level `usk_...` token that overrides the global `UNISON_TOKEN`
   - **Personal Doc Path** (`personalDocPath`): Path prefix for personal session documents in the brain (default: `/private/sessions/`)
   - **Repo Doc Path** (`repoDocPath`): Path prefix for repo-level knowledge shared across team (default: `/tenant/projects/<repo>/`)

3. Ask the user for the new value. Confirm the value they provide.

4. Update the project config file:

   ```bash
   node -e "
     const fs = require('fs');
     const path = require('path');
     const { execSync } = require('child_process');
     let gitRoot;
     try { gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim(); } catch { gitRoot = process.cwd(); }
     const dir = path.join(gitRoot, '.claude', '.unison-claude');
     const file = path.join(dir, 'config.json');
     let data = {};
     try { data = JSON.parse(fs.readFileSync(file, 'utf-8')); } catch {}
     data['KEY_NAME'] = 'NEW_VALUE';
     fs.mkdirSync(dir, { recursive: true });
     fs.writeFileSync(file, JSON.stringify(data, null, 2));
     console.log('Updated: ' + file);
   "
   ```

   Replace `KEY_NAME` with `apiToken`, `personalDocPath`, or `repoDocPath` and `NEW_VALUE` with the user's provided value.

5. Confirm to the user the project configuration has been updated.
