---
description: Authenticate with the Unison brain via email OTP (headless, no browser required)
allowed-tools: ["Bash", "AskUserQuestion"]
---

# Authenticate with Unison Brain

Set up machine authentication to connect this Claude Code session to the Unison brain.

## Steps

1. Ask for the user's email address using AskUserQuestion if not already known.

2. Provision an account (or recover a key for an existing account):

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/auth-provision.cjs" "<EMAIL>"
   ```

   This will:
   - Create a new account if the email is new → prints an `usk_...` token and notes it needs verification
   - Return instructions for existing accounts (409) → then run the recovery flow instead

3. Check your email inbox for a 6-digit OTP code from Unison.

4. Ask the user for the OTP code using AskUserQuestion.

5. Verify the OTP to make the account durable:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/auth-verify.cjs" "<EMAIL>" "<OTP_CODE>"
   ```

   This prints the verified `usk_...` token and saves credentials to `~/.unison-claude/credentials.json`.

6. Confirm to the user:
   ```
   Successfully authenticated with Unison brain.
   Your token has been saved. Memory capture and recall are now active.

   You can also set UNISON_TOKEN=usk_... in your environment for CI/non-interactive use.
   ```
