# Journal

Newest entry first. Short notes on what was done, what was decided and why, and what is still open. The plan is in ROADMAP.md and docs/production-plan.md.

## 2026-11-11

Start of the production work. The owner is away and asked for: find the missing pages, plan, then build; keep the look exactly; show the uncle in more places (loading above all); everything controllable from an admin panel; a rich blog; work on a new branch with small commits.

Done
- Branch `production-flow` cut from `redesign`. The uncommitted deck files in `presentation/` are left alone.
- Read every page, the server, the stores and the mascot rig. Looked at the site in the browser at 1366px.
- Wrote docs/production-plan.md and ROADMAP phases 5 to 12.

Decisions (the owner can overturn any of these)
- Storage is Postgres in production and a JSON file on the laptop, behind one small interface. The deck already says PostgreSQL and JWT. No database was created online: that needs the owner's account, so it is listed under "Going live" in the plan.
- The server keeps all rows in memory and writes through. Simple and safe for one small server; it would need rethinking with more than one instance.
- Sessions are an httpOnly cookie, not a token in localStorage.
- No SMS exists, so a forgotten password is fixed by the admin giving a temporary one after a WhatsApp message.
- The nine seed artisans stay account-less. The admin runs their shops for them, which matches how a rural artisan would really be onboarded.
- The shop still opens instantly from bundled or saved data, because Render's free server takes up to a minute to wake.
- Nothing is pushed or merged. `redesign` is what Vercel deploys, so it stays untouched until the owner has looked.
- Commits are made as the owner, with no co-author line, as asked.
