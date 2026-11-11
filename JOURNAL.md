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

Later the same day
- Phase 8: the uncle has poses now (`pose` prop). No new drawings: the arms are the same cut parts at new angles, sitting is the body lowered onto a mora with a shorter lungi. Sitting and swatting flies doubles as the empty state, since "বসে বসে মাছি তাড়ানো" already means a shop with no customers.
- `/mama` (dev only) shows every pose and scene on one page.
- The owner wrote in: keep going, make it deployable on a VPS they will buy, SEO and speed matter, and they want to talk about Next.js or SvelteKit afterwards without it being built yet. VPS deploy is added to Phase 12. The framework question is left for the owner; notes for that talk go at the end of this journal.
- The server (Phase 5) is being built by a helper agent from the plan while the mascot work happens here.

End of the day: where things stand

Built and committed on `production-flow` (11 commits, none pushed)
- Server: storage (Postgres or file), accounts, orders with stock, seller and admin API, 13 API tests passing.
- Shop moved onto the API; the localStorage marketplace is gone.
- Admin panel with eleven tabs at `/admin`.
- The uncle: six poses, loading scene, empty and lost scenes, order tracking road, about and contact pages, blog gutter, home strip, share image.
- Blog with five animated art themes, an editor with live preview, three starter stories.
- New shopper pages: `/khoj`, `/jogajog`, `/amader-kotha`, `/sahajjo`, `/niyom`, reviews on the product page.
- VPS setup: Dockerfile, compose with Postgres and Caddy, and the Node server writing per-page meta tags and JSON-LD.

Checked in a real browser
- Signup, order, cancel, seller register, product with photo, sent, received (by the helper, 1366px and 390px).
- Every admin tab renders at both widths with no sideways scroll and no console errors. Order flow in admin: phone confirmed, both seller parts sent, delivered. Story written and published from the editor.
- Order tracking with Bengali digits, blog list and reading page, text pages, home strip, 404, empty jhuri.
- The Docker image: builds, starts, serves the site, injects product meta, returns 404 for a missing product, blocks path traversal.
- Postgres driver: data survived a server restart against a real Postgres container.

Only compiled, not clicked through
- Admin: customers (block, reset password), messages, reviews, payouts form, settings save, product form, seller forms, page editor.
- Seller: hide and delete product, rejected and paused screens.
- Review form on the product page, contact form submit, error screen.
- `docker compose up` as a whole (the app image and Postgres were tested separately; Caddy needs a real domain).

Things that went wrong and were fixed
- Seeding stories broke two API tests that assumed an empty blog; tests now compare against the starting count.
- The container would not start: `/data` belonged to root, and the site handler tried to set a second not-found handler.
- The first share image contained a product photo with another shop's watermark. It was redrawn with only the brand and the uncle. The same photos are still used for products and one story cover.

Known gaps
- No SMS, so no self-service password reset and no order notifications. The admin sees new orders only by opening the panel.
- Sellers cannot be deleted, only rejected or paused.
- On Vercel every link previews as the general site card; per-page previews only work when the Node server serves the HTML (VPS).
- `robots.txt` names the sitemap with a relative path.
- The server holds all rows in memory: fine for thousands of orders on one process, not for several processes.

Notes for the Next.js or SvelteKit talk (nothing built)
- What the owner wants from it: strong SEO and faster loading.
- What already covers part of that: on the VPS the server now sends real titles, descriptions, share images and product data per page, and the main bundle is about 92 kB gzipped with admin, seller and blog split out. What it does not do is send the page content itself as HTML, so the first paint still waits for JavaScript and crawlers that do not run scripts see an empty body.
- Next.js: same React components, so the mascot, stitch frames, art and pages carry over with moderate rewiring (routing, data loading, the two context stores become client components). Largest ecosystem. Heavier runtime and more moving parts on a small VPS.
- SvelteKit: smaller and faster output, pleasant on a cheap VPS, but every component is rewritten in Svelte, including the mascot rig and the art. That is most of the front end done twice.
- A third path: keep Vite and prerender or server-render only the public pages (home, shop, product, story) with the existing Fastify server.
- Leaning: Next.js if the move happens, because the React work is kept; but measure first on the VPS, since the cheap fixes (compressing the largest product photos, self-hosting the two fonts, the meta tags already added) may be most of the gain.
