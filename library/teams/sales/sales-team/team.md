---
name: Sales Team
command: /sales-team
department: Sales
status: live
purpose: "The path from stranger to booked call: the assessment, the calendar, and the record."
---
# Sales Team

What this team owns: the path from stranger to booked call. The assessment that qualifies them, the calendar that books them, the record that remembers them.

## Members
- **Assessment Agent** (`assessment-agent/`): the questions that tell you whether a lead fits.
- **Calendar Agent** (`calendar-agent/`): gets qualified people onto your calendar.
- **CRM Agent** (`crm-agent/`): remembers every lead.

## Workflow: work my new lead
Say: "work my new lead"
Also say: a new lead came in, someone took my assessment, book this lead
When: A new assessment, DM or form fill lands. If you don't have an assessment yet, run the Assessment Agent's build-your-assessment first.
### Sort
1. **CRM Agent** · log-a-lead · makes the lead's file from what came in.
2. **You** read the file and decide if it's a fit. [you approve]
### Book
3. **Calendar Agent** · book-the-call · two booking messages with a time you pick. [you approve]
4. **You** send it yourself.
### Keep
5. **CRM Agent** adds a dated line to the lead's file when you say it went out. If they reply, the Follow-Up Team's draft-a-reply takes the next message.

## Memory
Habits every team member on this team should share land here. A correction about one team member goes in that member's own file instead.
