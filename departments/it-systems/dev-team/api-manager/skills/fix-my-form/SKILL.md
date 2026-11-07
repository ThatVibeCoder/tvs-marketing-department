---
name: fix-my-form
description: "Find out why a form on the owner's site isn't sending, fix the one thing that's broken, and prove it with a real test answer that lands in their inbox. Free form services only. Use when the owner says my form isn't sending, my contact form doesn't work, leads aren't coming in from my site, I'm not getting form emails, the button does nothing, or wire up my form. Not for connecting a new tool (wire-a-tool)."
---

# fix-my-form

A form is a door: the stranger types their name, and their answer has to come out the other side, in the owner's inbox. When leads stop arriving, the page usually looks fine and the door behind it is the thing that's shut. This skill finds the one thing that's shut, fixes only that, and proves it with a real answer arriving.

It runs on free tools. A form needs a free form service (Formspree's free plan, which needs only an address in the page and no key) or the form tool the owner's site builder already has. No paid tools, no server to build and no database. Any AI that can read the repo and open a web page can run it. One that can't open the page has the owner send the test answer and say what they saw.

## Read first
1. `business.md`: the tools (where the live site is built and hosted, and which email the owner reads every day) and What You Sell, so the test answer looks like a real one.
2. `knowledge/landing-pages.json`: which pages exist, which one has the form (an entry with `kind: "form"`, or the page itself), its `route`, its `file` under `site/` and its `domain`.
3. The page's own file in `site/` if it lives there: find the `<form>` tag, its `action` and `method`, and any script that sends it.
4. This team member's file, `api-manager.md`: if a line there already names this form's door (the service and the inbox it sends to), start from it.

**If the site isn't in `site/`** (business.md names Wix, Squarespace, Webflow, Shopify or another builder): the form lives in that builder, not in this repo. Run the same steps there, giving the owner plain clicks for that builder's form settings. Never rebuild their page in `site/` to fix a form.

**If no page has a form yet:** say so in one line. That's not a broken form, it's one that was never built: the Page Builder's build-a-page adds it (it arrives with the Website Team, which its lesson builds). Stop there.

## Say this first
"I'll find where your form sends its answers, send one test answer like a stranger would, fix the one thing that's stopping it, then send another to prove it lands in your inbox. Nothing on the page changes except what's broken. Which page is the form on, and which email should the answers go to?"

Wait for the answer. The email they name is the one the proof has to land in.

## Steps
1. **Find the door.** Name the page, then where its answers go, in one line each: "The form on `/` sends to Formspree, form `xabcdwq`, which emails `hello@...`". In `site/`, that's the form's `action` (or the address its script posts to). In a site builder, it's the form's notification settings. If the action is empty, `#`, or missing, the form was never wired: go to step 4.
2. **Send one test answer, like a stranger.** On the live page, not a copy, with a real-shaped answer: a real name, the owner's own email, and "Test from fix-my-form, <date>" as the message. Write down exactly what happened: an error, a thank-you page, nothing at all, or a page that wouldn't load.
3. **Match what happened to the cause.** Check the inbox the owner named, its spam folder and its promotions tab, then check them in this order and stop at the first one that's true:
   - **The button does nothing.** The button isn't inside the `<form>`, isn't `type="submit"`, or the page's script stops it with an error (open the browser's console). Fix the button or the script line.
   - **It never left the page.** The action is empty, `#` or a placeholder: never wired. Go to step 4.
   - **The service is waiting on the owner.** A new Formspree form sends one "confirm your email" message before it delivers anything. Find that email (spam too) and have the owner click it.
   - **It went to the wrong inbox.** The service, or the builder's notification setting, still sends to an old address, a test address or nobody. Change it to the one the owner named.
   - **It's sitting in spam.** Mark it "not spam" and add the sender to the owner's contacts, so the next one lands.
   - **The free plan ran out.** The service's dashboard says the monthly limit was reached. Say so plainly, and the date it resets. Moving to another free service is a fix; paying is the owner's call.
   - **The thank-you page is missing.** The answer arrived, but the stranger saw an error because the redirect points at a page that isn't there. Point it at a real page, or drop the redirect.
   - **It arrived.** The form works. The problem is people, not the door: go to The ending.
4. **Wire it, if it was never wired.** Pick the free form service the way pick-the-door picks any door: a form service beats building a server. Formspree's free plan works on a plain HTML page and emails the answers to the owner, with nothing secret in the page. The owner makes the free account on Formspree's own site with the email they read every day and gets the form's ID; give them plain directions for that one site. Another free service is fine only if the page needs nothing but an address from it. Then set the form's `action` to it and `method="post"`. Keep the fields the page already has; never add one (build-a-page's rule: every extra field costs real people). Add the service's hidden spam trap field, so the inbox doesn't fill with bots.
5. **Keep secrets off the page.** A Formspree form ID is made to sit in the page: it's an address, not a password. Anything a service calls a key, a secret or a token is different, and AGENTS.md's security rules say a key never goes in a page: it goes through the Keys Agent's add-a-key into `.env`, and a service that needs one in the page is the wrong service for a plain page.
6. **Fix only that, then put it live.** If the fix changed a file in `site/`, it isn't live until it ships: run the Code Reviewer's review-changes, then hand it to the Vercel Agent's ship-a-page. A fix inside a site builder is live once the owner hits its publish button.
7. **Prove it.** Send a second test answer from the live page, same as step 2. It counts only when it's seen in the owner's inbox. "It should work now" is not a result.
8. **Write down the door.** One line in this team member's file, `api-manager.md`, under its job: the page, the form service, and the inbox it sends to, dated. That's how connection-check knows the door exists and tries it next month.

## Worked example (a made-up dog groomer)
The owner says "my contact form isn't sending". `knowledge/landing-pages.json` has one landing page, `site/index.html`. Its form:
```
<form action="#">
  <input name="name" placeholder="Your name">
  <input name="email" type="email" placeholder="Your email">
  <button>Book a groom</button>
</form>
```
The test answer goes nowhere: the action is `#`, so it was never wired. The owner makes a free Formspree account with the email they read every day, and gets form `xabcdwq`. The form becomes:
```
<form action="https://formspree.io/f/xabcdwq" method="post">
  <input name="name" placeholder="Your name" required>
  <input name="email" type="email" placeholder="Your email" required>
  <input type="text" name="_gotcha" style="display:none">
  <button type="submit">Book a groom</button>
</form>
```
Same two fields, plus the hidden spam trap. Review-changes, then ship-a-page. The first test answer brings Formspree's "confirm your email" message, found in spam; the owner clicks it. The second test answer lands in the inbox at 2:14 PM. One line goes in `api-manager.md`: `- 2026-11-07: the form on / sends through Formspree (xabcdwq) to the owner's main inbox.`

## The ending
Tell the owner, in a few lines:
- what was broken, in plain words ("your form was never connected to anything");
- what changed, and where (the one file, or the one setting in their builder);
- the proof: the test answer that arrived, and when.

Then offer exactly one next step, never a menu. If the form was broken, the Test Agent's pre-ship-check on the whole page, so nothing else on it is quietly broken. If the form was working all along, the Traffic Agent's weekly-traffic-read (Website Team): it reads how many people reach the page, which says whether the page needs more visitors or better words.

## Rules
- Never call it fixed until a real test answer, sent from the live page, is seen in the owner's inbox.
- One cause, one fix. Don't redesign the page, rewrite its words or add fields while you're in there. Those belong to the Page Builder.
- Free form services first. Anything that can charge money gets said out loud before the owner signs up.
- Never put a key in a page. The form's address (its ID) is the only thing a form service puts there.
- Never send the test answer from a made-up stranger's email. Use the owner's own, so nobody real gets a reply.
