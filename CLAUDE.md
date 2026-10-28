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
- **The site works without the server.** Cart and wishlist live in localStorage (`bb-cart`, `bb-wishlist`) via `src/store/cart.tsx`. If `POST /api/orders` fails, Checkout saves the order to `bb-local-orders` so the demo flow still finishes.
- **The server is one file** (`server/index.js`, plain JS, no DB). It recomputes prices from products.json and never trusts client totals. It only accepts cash on delivery. Orders are appended to `data/orders.json`.
- **Product images are hand-drawn SVG**, chosen by `art` (an `ArtKind`) and `palette` in `src/components/ProductArt.tsx`. There are no photos. New kinds of goods need a new SVG drawing there.
- **Design tokens** (colours, fonts) live in the Tailwind 4 `@theme` block in `src/index.css`, along with the kantha stitch and alpana pattern classes. Fonts load in `index.html`.
- **Mascot reference:** `public/uncle-inspiration.png` is the character sheet for the jhuri-carrying uncle mascot.

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
