---
description: Log out from Unison brain and clear saved credentials
allowed-tools: ["Bash"]
---

# Logout from Unison Brain

Remove saved Unison credentials to allow re-authentication.

## Steps

1. Use Bash to remove the credentials file:
   ```bash
   rm -f ~/.unison-claude/credentials.json
   ```

2. Confirm to the user:
   ```
   Successfully logged out from Unison brain.

   Your credentials have been removed. The next time a Unison hook runs,
   you'll be prompted to authenticate again.

   You can also set UNISON_TOKEN in your environment to skip interactive auth.
   ```
