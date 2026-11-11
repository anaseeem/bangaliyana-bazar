# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bangaliyana Bazar is the owner's personal marketplace for handmade Bangladeshi goods; most sellers are rural artisans. It is an experiment, so a pure Bengali aesthetic beats e-commerce convention. The README is in Bangla.

## Commands

Package manager is pnpm (package-lock.json was removed).

```bash
pnpm install
pnpm dev:full      # Fastify API on 127.0.0.1:3001 + Vite on localhost:5173
pnpm server        # API only
pnpm dev           # Vite only; /api is proxied to :3001 (vite.config.ts)
pnpm build         # tsc -b && vite build -> dist/
pnpm lint          # oxlint (.oxlintrc.json)
pnpm test:api      # node --test against the file store in a temp folder
pnpm sync:products # regenerate data/products.json and data/seed.json from src/data
```

The site needs the API for login, orders, seller, admin and blog, so use `pnpm dev:full`. Local admin: 01700000000 / admin123 (only when not live). Local data is `data/db.json` and `data/uploads/` (gitignored); delete them to start fresh.

There is no UI test suite. Verify UI changes in a real browser with the Playwright MCP at desktop (1366px) and phone (390px) widths. Screenshots go in `.playwright-mcp/` (gitignored). `/mama` (dev only) shows every mascot pose, scene and blog art theme.

## Branches

- `snapshot/original` is a frozen copy of the site before the redesign. Read it for reference. Never commit to it.
- `redesign` is what Vercel deploys. `production-flow` holds the real backend, admin panel, blog and VPS setup; ask before merging it.
- `main` has not been touched since the first storefront commit.

## Docs

`ROADMAP.md` is the phase checklist, `docs/production-plan.md` the design (data shapes, every endpoint, admin tabs, mascot poses, blog), `JOURNAL.md` the dated log of decisions, `docs/deploy-vps.md` the server guide.

## Architecture

- **Server** (`server/`, plain JS, Fastify). `index.js` exports `buildApp()`; routes are in `routes/{public,account,orders,seller,admin}.js`, shared rules in `domain.js`, checks in `validate.js`. Errors are always `{ error: 'Bangla sentence' }`.
- **Storage** (`server/store.js`): Postgres when `DATABASE_URL` is set (tables `docs` and `files`), otherwise `data/db.json`. All rows are held in memory and written through, so one server process only. Collections: users, sellers, products, orders, reviews, posts, pages, messages, payouts, settings.
- **Seed** (`server/seed.js`): on first boot, products from `data/products.json`, the nine artisans from `data/seed.json` (sellers `k1..k9`, no accounts, run by the admin), stories and pages from `data/content-seed.json`. After that the database is the truth. `src/data/products.ts` is still the source for the seed: edit it, run `pnpm sync:products`, never hand-edit the JSON.
- **Auth** (`server/auth.js`): scrypt passwords, HS256 JWT in the httpOnly cookie `bb_s`. Site and API share an origin, so there is no CORS. Admin comes from `ADMIN_PHONE` / `ADMIN_PASSWORD`. There is no SMS: a forgotten password is reset by the admin (ক্রেতা tab) after a WhatsApp message.
- **Orders**: the server recomputes prices, checks and reduces stock, and only accepts cash on delivery. Status is placed → sent (every seller in the order has sent) → delivered, or cancelled (stock goes back). Guests track by order number + phone on `/khoj`.
- **Client state** (`src/store/market.tsx`): fed by one call, `/api/boot` (settings, public products, approved sellers, me). First paint uses the last boot saved in localStorage (`bb-boot`) or the bundled products, so the shop opens before the server answers. Actions return `Promise<string | null>` (Bangla error or null). Pages fetch their own lists with `useApi` (`src/lib/useApi.ts`) and `api` (`src/lib/api.ts`).
- **Settings** (`src/data/settings.ts`, edited on `/admin/sajano`): announcement, hero text and product, delivery fees and days, WhatsApp number, categories, home picks, footer line, commission. Never hard-code these.
- **Cart and wishlist** stay in localStorage (`bb-cart`, `bb-wishlist`) via `src/store/cart.tsx`.
- **Product images** are photos in `public/products/<id>.webp` for seed products and `/api/files/<id>` for uploads. The seed photos came from Wikimedia Commons and other shops' pages for the class demo, so they are not ours to sell under. `ProductPicture` falls back to the hand-drawn SVG chosen by `art` and `palette` (`src/components/ProductArt.tsx`).
- **Design tokens** (colours, fonts) live in the Tailwind 4 `@theme` block in `src/index.css`, along with the kantha stitch and alpana pattern classes. Fonts load in `index.html`.
- **Jhuri flow** (`src/pages/Jhuri.tsx`) is cart, address, review and confirmation on one route, `/jhuri`. The step is the `?dhap=` search param, so the browser back button moves between steps. A user can only reach steps they have unlocked (`reachable`).
- **Admin** (`src/pages/Admin.tsx` shell + `src/pages/admin/*`), route `/admin/*`, admin role only: সারাংশ, অর্ডার, পণ্য, বিক্রেতা, ক্রেতা, গল্প, পাতা, বার্তা, মতামত, টাকা, সাজানো.
- **Mascot library** (`src/libs/mascot`): `<Mascot mood fill walking facing pose jhuri />`. WebP parts cut from `design/uncle-inspiration.png`, posed in an SVG with CSS rigging in `mascot.css`. Poses are only joint angles: `jhuri`, `haat`, `machi` (sitting on a mora swatting flies), `khoj`, `dekhano`, `haat-nara`. Scenes are in `src/components/MamaScenes.tsx`: `MamaLoader` (walks, sits down after four seconds) for every wait, `MamaScene` for empty, lost and welcome states. `MascotRoad` is the haat-to-home road on `/jhuri` and `/khoj`.
- **Blog** (`/golpo`, `/golpo/:slug`): body is a tiny markup parsed by `src/lib/golpo.ts` (blank line, `# `, `> `, `![caption](url)`, `---`) and drawn by `GolpoBody`, which also renders the text pages (`/amader-kotha`, `/sahajjo`, `/niyom`). Art themes are in `src/components/art/` (moyur, nouka, pakhi, shapla, jhalor). Art goes in the top band, the side gutters and the `---` breaks, never behind text. Post content may be Bangla or English; page chrome stays Bangla.
- **Visual primitives:** `StitchFrame` and `StitchLine` (kantha running stitch), `AlpanaCorner` and `AlpanaFlower`, `Stall`, `QtyStepper`, `Panel` / `Field` / `INPUT` / `BTN` (`src/components/Form.tsx`). Reuse them rather than adding new border or divider styles.

## Deployment

- Today: frontend on Vercel (`vercel.json` rewrites `/api/*` and `/sitemap.xml` to the Render API, everything else to `index.html`), API on Render (`render.yaml`, free plan, sleeps after 15 minutes, loses file data on restart unless `DATABASE_URL` is set).
- VPS: `docker compose up -d --build` runs the app, Postgres and Caddy (see `docs/deploy-vps.md`). With `SERVE_DIST=1` the Node server also serves `dist/` and writes per-page title, description, share image and JSON-LD into the HTML (`server/static.js`).
- "Live" means `RENDER` is set or `NODE_ENV=production`: the cookie is `Secure` and there is no default admin.

## Content and style rules (strict)

- All UI text is simple, plain Bangla: short sentences, no hard words, no hype or AI buzzwords.
- Every number shown to users uses Bengali digits (৳৮,৫০০, ১টি, ৪.৯).
- Font weight is always 400. No bold, no italic. Hyphenation is disabled in CSS.
- Body font is Baloo Da 2 (Hind Siliguri fallback). h1/h2 use Tiro Bangla via `--font-display`. Never use slanted or script display fonts.
- Rickshaw art, nakshi kantha and alpana are visual inspiration only. Never write "রিকশা আর্ট" as decoration text.
- Cut any text the shopper doesn't need.
- Payment is cash on delivery only. Never add bKash, Nagad or card flows.
- The cart is called ঝুড়ি (jhuri).
- Code comments in this repo are often in Bangla. Match the surrounding file.
