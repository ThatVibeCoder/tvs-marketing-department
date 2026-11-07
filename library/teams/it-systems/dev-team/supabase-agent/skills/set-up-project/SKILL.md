---
name: set-up-project
description: Stand up the owner's Supabase project the first time something needs online storage. Use when a build actually calls for a database, not before.
---

# set-up-project

Only runs the day something real needs it. Until then, the account just exists.

## Steps
1. Say plainly WHAT is about to be stored and why a file in the repo isn't enough for it. If a file would do, use the file and stop here.
2. Create the project on the free plan, name it after the department, nothing cute.
3. Store the connection details through the keys agent: they're keys, and they live in the env file like every other key.
4. Store one real test row, read it back, show the owner it's there. Then delete the test.

## Rules
- Free tier until a one-plan says otherwise.
- The database never becomes the second brain. The repo's files stay the truth about the business; the database holds working data (leads, submissions, logs).
