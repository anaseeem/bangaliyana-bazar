# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bangaliyana Bazar is the owner's personal storefront for handmade Bangladeshi goods. It is an experiment, so a pure Bengali aesthetic beats e-commerce convention. The README is in Bangla and is the source of truth for API and validation rules. ROADMAP.md tracks the redesign.

## Commands

Package manager is pnpm (package-lock.json was removed).

```bash
pnpm install
pnpm dev:full      # Fastify API on 127.0.0.1:3001 + Vite on localhost:5173
pnpm server        # API only
pnpm dev           # Vite only; /api is proxied to :3001 (vite.config.ts)
pnpm build         # tsc -b && vite build -> dist/
pnpm lint          # oxlint (.oxlintrc.json)
pnpm sync:products # regenerate data/products.json from src/data/products.ts
```

There is no test suite. Verify UI changes in a real browser with the Playwright MCP at desktop (1366px) and phone (390px) widths. Screenshots go in `.playwright-mcp/` (gitignored).

## Branches

- `snapshot/original` is a frozen copy of the site before the redesign. Read it for reference. Never commit to it.
- `redesign` is the working branch. `main` has not been touched since the first storefront commit.

## Architecture

- **Two copies of product data.** The server reads `data/products.json`. The client bundles `src/data/products.ts` (types, `CATEGORIES`, `formatBDT`, `bn`). The client reads only the bundled copy; `/api/products` exists but the UI does not call it. `src/data/products.ts` is the source: edit it, then run `pnpm sync:products`. Never hand-edit the JSON.
- **Cart and wishlist** live in localStorage (`bb-cart`, `bb-wishlist`) via `src/store/cart.tsx`. The browser keeps them even without a server.
- **The server is one file** (`server/index.js`, plain JS, no DB). It recomputes prices from products.json and never trusts client totals. It only accepts cash on delivery. Orders are appended to `data/orders.json`.
- **Product images are photos** in `public/products/<id>.webp` (max 1000px, WebP), set as `photo` on each bundled product. They were taken from Wikimedia Commons and other shops' public pages for the class demo, so they are not ours to sell under. `ProductPicture` falls back to the hand-drawn SVG chosen by `art` (an `ArtKind`) and `palette` in `src/components/ProductArt.tsx` when a product has no photo.
- **Design tokens** (colours, fonts) live in the Tailwind 4 `@theme` block in `src/index.css`, along with the kantha stitch and alpana pattern classes. Fonts load in `index.html`.
- **Jhuri flow** (`src/pages/Jhuri.tsx`) is cart, address, review and confirmation on one route, `/jhuri`. The step is the `?dhap=` search param, so the browser back button moves between steps. `/cart` and `/checkout` redirect there. A user can only reach steps they have unlocked (`reachable`). The delivery fee follows the district (`src/data/districts.ts`), matching the server.
- **Demo marketplace (faked, browser only)** lives in `src/store/market.tsx`: accounts (SHA-256 of the password, no server), sellers, seller products and orders, all in localStorage (`bb-users`, `bb-session`, `bb-sellers`, `bb-seller-products`, `bb-orders`). The original artisans are seeded as approved sellers in `src/data/sellers.ts`; `sellerIdOf` maps a product to its seller. `catalog` = bundled products + approved sellers' products, and the cart, shop, product page and artisans page read from it. New sellers start `pending` and are approved on `/admin` (demo page). Seller photos are shrunk to data URLs (`ProductPicture` falls back to the SVG art). Sellers edit products and shop info on `/bikreta/dokan` and mark their part of an order sent (`sentBy`); the buyer marks it received. `orderStatus` (`src/lib/orders.ts`) turns that into নেওয়া হয়েছে → পাঠানো হয়েছে → পৌঁছেছে on `/amar`, which also saves the buyer's address for the jhuri. Nothing here is shared between browsers.
- **Orders:** a 400 from `POST /api/orders` is shown to the user. In dev, a network failure or 5xx falls back to a local demo order; in production it shows an error, so nobody sees a fake confirmation. Exception: a jhuri with any new-seller product is always placed locally, because the server does not know those products. Every placed order is also saved to `bb-orders` (buyer history on `/amar`, per-seller split on `/bikreta/dokan`). The last order is kept in sessionStorage so the confirmation survives a refresh. Vite ignores `data/orders.json` (`vite.config.ts`); otherwise every order reloads the page in dev.
- **Mascot library** (`src/libs/mascot`) is a self-contained `<Mascot mood fill walking facing />`: WebP parts cut from the character sheet `design/uncle-inspiration.png` (cutting scripts in `design/mascot-tools/`), posed in an SVG with CSS rigging in `mascot.css`. The jhuri is drawn in SVG. `MascotRoad` places him on the haat-to-home road and makes him walk back sad when the step goes backwards. The page flashes `sad` on remove, lower quantity or empty jhuri, and `happy` on raising a quantity.
- **Visual primitives:** `StitchFrame` and `StitchLine` (kantha running stitch), `AlpanaCorner` and `AlpanaFlower`, `Stall`, `QtyStepper`. Reuse them rather than adding new border or divider styles.

## Deployment

- The frontend is on Vercel. `vercel.json` rewrites `/api/*` to the Render API and sends every other path to `index.html` for client routing.
- The API is on Render (`render.yaml` Blueprint, free plan). The server binds `0.0.0.0` when `RENDER` is set, otherwise `127.0.0.1`.
- On Render's free plan, `data/orders.json` resets on every restart, and the service sleeps after 15 minutes idle.

## Content and style rules (strict)

- All UI text is simple, plain Bangla: short sentences, no hard words, no hype or AI buzzwords.
- Every number shown to users uses Bengali digits (৳৮,৫০০, ১টি, ৪.৯).
- Font weight is always 400. No bold, no italic. Hyphenation is disabled in CSS.
- Body font is Baloo Da 2 (Hind Siliguri fallback). h1/h2 use Tiro Bangla via `--font-display`. Never use slanted or script display fonts.
- Rickshaw art, nakshi kantha and alpana are visual inspiration only. Never write "রিকশা আর্ট" as decoration text.
- Cut any text the shopper doesn't need.
- Payment is a cash-on-delivery demo. Never add bKash, Nagad or card flows.
- The cart is called ঝুড়ি (jhuri).
- Code comments in this repo are often in Bangla. Match the surrounding file.
