---
name: Dev Team
command: /dev-team
department: IT / Systems
status: live
purpose: "Keeps the machine under everything running: your repo, your live site, your database, your keys, and the checks that keep them safe."
---
# Dev Team

What this team owns: the machine under everything else. The repo, the live site, the database, the keys, and the checks that keep them honest. The content team writes the words; this team keeps the lights on.

This team comes pre-built. You don't design it, you summon it. Each team member already knows its job. The only thing they need from you is a connection to your own accounts, once.

## Members
- **Planner** (`planner/`): writes a one-page plan before anything gets built.
- **GitHub Agent** (`github-agent/`): saves your work with history you can undo to.
- **API Manager** (`api-manager/`): picks the right connection for every tool.
- **Keys Agent** (`keys-agent/`): keeps every key in the `.env` file, off GitHub.
- **Supabase Agent** (`supabase-agent/`): your online storage, when something needs it.
- **Vercel Agent** (`vercel-agent/`): puts pages on the live internet.
- **Test Agent** (`test-agent/`): clicks what a stranger would click.
- **Code Reviewer** (`code-reviewer/`): reads the changes before they're saved.
- **Security Checker** (`security-checker/`): sweeps for leaks before anything goes public.
- **Payments Agent** (`payments-agent/`): waiting for the day you take money.

## Workflow: set up my code base
Say: "set up my code base"
Also say: connect my accounts, wire up my repo, get my dev environment ready
When: The one-time setup that connects your repo, hosting, database and tools. Everything else in IT / Systems depends on it.
### Plan
1. **Planner** · one-plan · writes the one-page plan of what's about to happen. You say go. [you approve]
### Connect
2. **GitHub Agent** · set-up-repo · confirms your repo is cloned, connected and saving. save-work is your end-of-session habit from here on.
3. **API Manager** · pick-the-door · picks the right connection for each tool: a connector beats a command line tool beats a key.
4. **Keys Agent** · add-a-key · stores anything secret in the `.env` file and proves the save skips it.
5. **Supabase Agent** · set-up-project · connects your free Supabase account so it's ready the day something needs storing.
6. **Vercel Agent** · ship-a-page · connects your free Vercel account to GitHub so shipping is ready.
### Check
7. **Test Agent** · pre-ship-check · runs the check on the whole setup and reports in plain words.

## Workflow: ship my landing page
Say: "ship my landing page"
Also say: deploy my site, put my page live, push this to production
When: The Website Team finished a page and it's ready to go live. If "set up my code base" never ran, run that first.
### Plan
1. **Planner** · one-plan · turns the website team's build into a one-page ship plan. You say go. [you approve]
### Save
2. **Code Reviewer** · review-changes · reads every change before it's saved.
3. **GitHub Agent** · save-work · saves it with history you can undo to.
### Ship
4. **Vercel Agent** · ship-a-page · puts it on the live internet and hands you the URL.
### Check
5. **Test Agent** · pre-ship-check · clicks what a stranger would click and reports what broke.
6. **Security Checker** · security-sweep · sweeps for anything leaking (keys, form endpoints) before you share the link.

## Memory
Habits every team member on this team should share land here. A correction about one team member goes in that member's own file instead.
