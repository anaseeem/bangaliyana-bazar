# Production plan

Written 2026-11-11 on the `production-flow` branch (cut from `redesign`). This is the detailed design behind ROADMAP.md phases 5 to 12. JOURNAL.md records what actually happened.

## 1. Where the site stands

The look is finished and should not change: maroon, turmeric and paper tones, kantha stitch frames, alpana, mela stalls, Tiro Bangla headings, Baloo Da 2 body, plain Bangla, Bengali digits, weight 400 only, and the uncle (মামা) who carries the jhuri home.

What is not real yet:

| Area | Today | Problem in production |
| --- | --- | --- |
| Accounts | SHA-256 in localStorage | Not shared between devices, no real security |
| Sellers, their products, photos | localStorage, photos as data URLs | Nobody else can see a new seller's shop |
| Orders | Server appends to a JSON file; seller split only in the browser | Seller and admin never see real orders; file is wiped on Render restart |
| Stock | Never reduced | Overselling |
| Admin | One open page that approves sellers | No login, no orders, no products, no content control |
| Ratings | Fixed numbers in the bundle | No real reviews |
| Site text, fees, WhatsApp number | Hard-coded | Owner cannot change anything without a deploy |

## 2. Missing pages

Shopper side
- `/khoj` অর্ডার খুঁজুন: order number + phone, for people who ordered without an account. Shows the uncle on the road at the order's stage.
- `/golpo` and `/golpo/:slug`: the blog.
- `/amader-kotha` (about), `/sahajjo` (delivery, return, payment questions), `/niyom` (terms and privacy), `/jogajog` (contact form + WhatsApp).
- Forgotten password help on `/login`.
- Reviews on the product page.
- Loading screen, error screen, real 404, and empty states, all with the uncle.

Seller side
- Photos uploaded to the server.
- Hide a product, stock goes down by itself.
- পাওনা (what the bazar owes the seller) tab.

Admin side (everything new, behind login)
- সারাংশ, অর্ডার, পণ্য, বিক্রেতা, ক্রেতা, গল্প, পাতা, বার্তা, মতামত, টাকা, সাজানো (settings).

## 3. Server

Plain JS, Fastify, still small, but split into files under `server/`:

```
server/index.js        boot, cookie parsing, error handler, registers routes
server/store.js        storage (two drivers, see below)
server/auth.js         scrypt, JWT cookie, requireUser / requireAdmin, login rate limit
server/seed.js         first-boot seed from data/products.json + data/seed.json
server/validate.js     shared checks (phone, text lengths, digits)
server/routes/public.js    boot, products, posts, pages, messages, track, files, sitemap
server/routes/account.js   signup, login, logout, me, my orders, reviews
server/routes/orders.js    place, cancel, received
server/routes/seller.js    register, shop, products, orders, payouts, upload
server/routes/admin.js     everything under /api/admin
```

### Storage

One tiny interface, two drivers, picked at boot:

- `DATABASE_URL` set: Postgres through `pg`. Tables `docs(col text, id text, data jsonb, primary key (col, id))` and `files(id text primary key, mime text, bytes bytea, created_at timestamptz)`. Created automatically.
- Not set: `data/db.json` plus `data/uploads/` (both gitignored). Good for the laptop. On Render free this is wiped on restart, so `/api/health` reports `store: "file"` and the admin summary shows a warning.

All docs are loaded into memory at boot and every write goes through to the driver. One server process, a few thousand rows: this keeps stock checks atomic without transactions. Files are not kept in memory.

```js
store.all(col)            // array (copy)
store.get(col, id)        // doc or undefined
store.put(col, doc)       // upsert by doc.id, awaits the driver
store.del(col, id)
store.putFile(id, mime, buffer) / store.getFile(id) // { mime, bytes } or null
store.kind                // 'pg' | 'file'
```

Collections: `users`, `sellers`, `products`, `orders`, `reviews`, `posts`, `pages`, `messages`, `payouts`, `settings` (one doc, id `site`).

### Data shapes

```
user     { id, name, phone, passHash, role: 'customer'|'admin', district?, address?, blocked?, createdAt }
seller   { id, userId|null, shopName, ownerName, craft, district, story, phone,
           status: 'pending'|'approved'|'rejected'|'paused', years?, createdAt }
product  { id, nameBn, price, oldPrice?, category, district, artisan, story, description, stock,
           rating, badge?, art, palette, photo?, sellerId, hidden?, createdAt }
order    { id, userId|null, name, phone, district, address,
           items: [{ id, nameBn, price, qty, sellerId }],
           subtotal, deliveryFee, total, paymentMethod: 'ক্যাশ অন ডেলিভারি',
           status: 'placed'|'sent'|'delivered'|'cancelled', sentBy: [sellerId],
           confirmed?, courier?, note? (admin only), cancelReason?, createdAt, deliveredAt? }
review   { id, productId, userId, name, stars 1..5, text, hidden?, createdAt }
post     { id, slug, title, excerpt, body, cover?, kind: 'মানুষ'|'সংস্কৃতি'|'অন্য কথা', lang: 'bn'|'en',
           art: 'moyur'|'nouka'|'pakhi'|'shapla'|'jhalor', status: 'draft'|'published',
           publishedAt?, createdAt, updatedAt }
page     { id: 'amader-kotha'|'sahajjo'|'niyom', title, body, updatedAt }
message  { id, name, phone, text, read?, createdAt }
payout   { id, sellerId, amount, note, createdAt }
settings { id: 'site', announcement, heroBadge, heroTitle, heroText, heroProductId,
           whatsapp, feeDhaka, feeOutside, daysDhaka, daysOutside, commissionPercent,
           categories: [name], newIds: [id], roomIds: [id], featuredSellerId, footerLine }
```

Rules
- Seed sellers keep ids `k1..k9` and have `userId: null`. They are rural artisans without accounts, so the admin manages their products and marks their parts sent.
- Seed products get `sellerId` at seed time (matched by artisan name). After the first boot the database is the truth; `src/data/products.ts` is only the seed and the first paint.
- A product is public when `!hidden` and its seller is `approved`.
- Shown rating: average of visible reviews if any exist, otherwise the seed `rating`. The API also returns `ratingCount`.
- Order id: `BB` + six digits, unique.
- Placing an order checks stock for every line, then reduces it. Cancelling puts it back.
- `status` moves to `sent` when every seller in the order is in `sentBy`. Buyer or admin sets `delivered`. Buyer can cancel only while `sentBy` is empty; admin can cancel any order that is not delivered.
- Seller earnings: sum of the seller's lines in delivered orders, minus `commissionPercent`, minus payouts.

### Auth

- Password: `crypto.scrypt` with a per-user salt, stored as `scrypt$salt$hash`.
- Session: HS256 JWT made with `node:crypto` (no library) in an httpOnly cookie `bb_s`, `SameSite=Lax`, `Secure` on Render, 30 days. Secret from `JWT_SECRET`; on the laptop a random one is generated and kept in `data/db.json` meta.
- The site and API share an origin (Vite proxy on the laptop, Vercel rewrite online), so no CORS headers are needed. The old `Access-Control-Allow-Origin: *` goes away. Every non-GET request must be `application/json`.
- Login is limited to 8 wrong tries per phone per 15 minutes (in memory).
- Admin: on boot, if `ADMIN_PHONE` and `ADMIN_PASSWORD` are set, that user is created or made admin. On the laptop (no `RENDER`), the default is `01700000000` / `admin123` and the log says so.
- Forgotten password: there is no SMS. The login page tells the shopper to message the shop on WhatsApp from their own number. The admin opens that customer and presses নতুন পাসওয়ার্ড, which makes a six-digit temporary password to pass on.

### Endpoints

Errors are always `{ error: 'plain Bangla sentence' }` with 400, 401, 403, 404 or 429.

Public
- `GET /api/health` → `{ ok, service, store }`
- `GET /api/boot` → `{ settings, products, sellers, me }` (one call starts the whole shop; sellers have public fields only)
- `GET /api/products`, `GET /api/products/:id` (kept)
- `GET /api/products/:id/reviews`
- `POST /api/orders` (guest or logged in; same validation as today, plus stock)
- `GET /api/orders/track?id=&phone=` → order without `note`
- `GET /api/posts` (published, no body), `GET /api/posts/:slug`
- `GET /api/pages/:id`
- `POST /api/messages`
- `GET /api/files/:id` (cache one year, immutable)
- `GET /api/sitemap.xml`

Account
- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET /api/me`, `PATCH /api/me` (name, district, address), `POST /api/me/password`
- `GET /api/me/orders`
- `POST /api/orders/:id/received`, `POST /api/orders/:id/cancel`
- `POST /api/products/:id/reviews` (only if the user has a delivered order with that product; one review per product per user)

Seller
- `POST /api/seller` (register, pending), `PATCH /api/seller`
- `GET /api/seller/products`, `POST /api/seller/products`, `PATCH /api/seller/products/:id`, `DELETE /api/seller/products/:id`
- `GET /api/seller/orders` (only this seller's lines), `POST /api/seller/orders/:id/sent`
- `GET /api/seller/payouts` → `{ earned, commission, paid, due, payouts }`
- `POST /api/files` `{ dataUrl }` (JPEG, PNG or WebP, at most 1.5 MB) → `{ url: '/api/files/<id>' }`; sellers and admins only

Admin, all under `/api/admin`, admin only
- `GET summary` → counts and sums for the summary page, plus `store`
- `GET orders`, `PATCH orders/:id` (`status`, `confirmed`, `courier`, `note`, `sent: sellerId`)
- `GET products`, `POST products`, `PATCH products/:id`, `DELETE products/:id` (any seller)
- `GET sellers`, `POST sellers` (an artisan without an account), `PATCH sellers/:id`
- `GET users`, `PATCH users/:id` (`blocked`, `role`), `POST users/:id/reset-password` → `{ password }`
- `GET posts`, `POST posts`, `PATCH posts/:id`, `DELETE posts/:id`
- `PUT pages/:id`
- `GET messages`, `PATCH messages/:id`, `DELETE messages/:id`
- `GET reviews`, `PATCH reviews/:id` (`hidden`)
- `GET payouts` (per-seller dues), `POST payouts`
- `GET settings`, `PUT settings`

### Tests

`pnpm test:api` runs `node --test server/test/` against the file driver in a temp folder: signup and login, order with stock, cancel, seller flow, admin guard. The Postgres driver is checked by hand against a throwaway Docker container.

## 4. Client

- `src/lib/api.ts`: `api.get/post/patch/put/del`, throws `ApiError(message, status)` with the server's Bangla sentence, `credentials: 'same-origin'`.
- `src/store/market.tsx` keeps its shape (`user`, `sellers`, `mySeller`, `catalog`, …) so pages change little, but it is fed by `/api/boot` and its actions call the API and return `Promise<string | null>` (error sentence or null).
- First paint never waits for the server: the catalog starts from the last boot saved in localStorage (`bb-boot`), or the bundled products on a first visit, and is replaced when `/api/boot` answers. Render's free server can take a minute to wake; the shop must still open at once.
- Pages that truly need the server (login, account, seller, admin, order tracking, blog) show the uncle loading scene while they wait.
- The cart and wishlist stay in localStorage.
- `/jhuri` always posts to the server now. The dev-only fake order and the "new seller products stay local" exception are removed.
- Old demo keys (`bb-users`, `bb-session`, `bb-sellers`, `bb-seller-products`, `bb-orders`) are deleted on first load.
- Admin, seller dashboard and blog are lazy-loaded chunks.
- Settings from the server drive: announcement bar, hero badge and text, delivery fees everywhere they are printed, WhatsApp number, home page picks, footer line, categories.

## 5. Admin panel

Route `/admin/*`, admin only (others see the login or a plain "এই পাতা আপনার জন্য নয়"). Same paper and stitch look, built for a phone first because the owner will often use one.

Layout: a title row, then a row of round tab pills that scrolls sideways (same pattern as `/amar`), each a nested route.

| Tab | Route | What it does |
| --- | --- | --- |
| সারাংশ | `/admin` | Today's and this month's orders and sales, orders waiting to be confirmed, sellers waiting, low stock, unread messages, storage warning |
| অর্ডার | `/admin/order` | Filter by state, search by number or phone. Open one: lines grouped by seller, "ফোনে কথা হয়েছে", mark a seller's part sent, courier line, private note, delivered, cancel |
| পণ্য | `/admin/ponno` | All products, search, filter by seller. Add or edit for any seller (same form as the seller's), hide, delete, stock, badge, old price |
| বিক্রেতা | `/admin/bikreta` | Waiting list first. Approve, reject, pause. Add an artisan who has no account. Edit shop details |
| ক্রেতা | `/admin/kreta` | Search by phone or name, order count, block, temporary password, make admin |
| গল্প | `/admin/golpo` | Blog posts: list, write, draft or publish, cover photo, art theme, language |
| পাতা | `/admin/pata` | Edit আমাদের কথা, সাহায্য, নিয়ম with the same editor |
| বার্তা | `/admin/barta` | Contact messages, mark read, WhatsApp reply link, delete |
| মতামত | `/admin/motamot` | Reviews, hide or show |
| টাকা | `/admin/taka` | What each seller is owed, record a payout |
| সাজানো | `/admin/sajano` | Announcement, hero text, hero product, new arrivals, room picks, featured artisan, fees and days, WhatsApp, commission, categories, footer line |

## 6. The uncle (মামা) in more places

The mascot library gets a `pose` prop. Poses are made only by rotating the existing cut parts; no new art is needed.

| Pose | Looks like | Used for |
| --- | --- | --- |
| `jhuri` (default) | Both arms up holding the jhuri | `/jhuri` road, order tracking |
| `haat` | Arms down, swing when walking | Loading walk |
| `machi` | Sitting on a mora, waving the gamchha at flies | A wait that drags on, server waking up |
| `khoj` | Hand over the eyes, looking left and right | 404, search with no result |
| `dekhano` | One open hand out, presenting | About page, how-it-works strip, blog intro |
| `haat-nara` | Waving | Welcome on login, order done |

Scenes (`src/components/MamaScenes.tsx`)
- `MamaLoader`: the uncle walks in place while the village road slides past (a tree, a stall, a hut, a tubewell). If the wait passes four seconds he sits on a mora and swats flies with his gamchha, and the line under him changes from "আসছি…" to "একটু জিরিয়ে নিচ্ছি, এখনই আসছি". Used as the route fallback, on pages waiting for the server, and on the order button wait.
- `MamaLost`: 404. He shades his eyes and looks both ways.
- `MamaEmpty`: empty jhuri, no orders, empty wishlist, nothing found. He sits with the empty jhuri beside him.
- Order tracking reuses `MascotRoad` with three stops: নেওয়া হয়েছে, পাঠানো হয়েছে, পৌঁছেছে.
- All scenes respect reduced motion (static pose, text still changes).

## 7. Blog (গল্প)

Purpose: stories about one artisan, a bit of culture, anything else the owner wants to say. Bangla or English per post; the page chrome stays Bangla.

Writing: one textarea with a very small markup, with a live preview beside it.

```
blank line        new paragraph
# text            section heading
> text            pull quote
![caption](url)   photo (the ছবি বসান button uploads and inserts this)
---               an art break (a wide animated band)
```

Reading page
- A tall opening band with the chosen art theme, the title in Tiro Bangla, kind, date in Bengali digits, reading time.
- Text sits on a paper column about 65 characters wide with a stitch frame. Body text is larger than the shop's (about 1.2rem, line height 1.9).
- Art lives only in the top band, the side gutters (shown from 1280px wide) and the `---` breaks. It never sits behind or over text.
- The first letter of the story is drawn large inside an alpana flower.
- Pull quotes are indigo cards with alpana corners.
- At the end: share on WhatsApp and Facebook, two more stories, and a link to the artisan's shop when the story is about a seller.

Art themes (`src/components/art/`), each a large hand-drawn SVG built like layered cut paper (flat shapes, a darker offset layer under each for depth, paper grain), with slow looping motion:
- `moyur`: a peacock whose tail fans open and closes a little, eye spots shimmer, the neck dips.
- `nouka`: a pal-tola boat rocking on three layers of waves, a sun, birds.
- `pakhi`: paper kites and birds drifting on strings across the band.
- `shapla`: a pond of water lilies bobbing, a fish jumps now and then, a dragonfly.
- `jhalor`: rows of cut-paper bunting swaying, as at a mela.

List page `/golpo`: a masthead with the peacock, the newest story large, the rest as stitched cards with their own small art in the theme colour, filter pills by kind.

Seeded with three stories so the page is never empty: one artisan (ফাতেমা বেগম and the kantha), one culture piece (the haat), one in English (why handmade).

## 8. Brand and reach

- Home gets three short additions, without touching the hero: a "কীভাবে আসে" strip (বাছুন → মামা নিয়ে আসেন → হাতে পেয়ে টাকা দিন) with the uncle, a row of real reviews once any exist, and the two newest stories.
- Footer: links to the new pages, order tracking, WhatsApp.
- Product and story pages: share on WhatsApp and Facebook.
- Each page sets its own title. `index.html` gets Open Graph tags and a share image drawn in the site's style. `robots.txt` and a sitemap from the API.
- Limit to know: this is a client-rendered app, so link previews show the general site card, not the single product. Fixing that needs server rendering and is left for later.

## 9. Going live (owner steps, not done by Claude)

1. Create a Postgres database (Neon free tier works; Render's free Postgres expires after 30 days).
2. On Render set `DATABASE_URL`, `JWT_SECRET` (long random text), `ADMIN_PHONE`, `ADMIN_PASSWORD`.
3. Merge `production-flow` into `redesign` (Vercel builds from it) and push. Render redeploys the API.
4. Log in at `/admin` and change the password.
5. Replace the demo product photos before selling for real: they came from Wikimedia and other shops.

## 10. How the work is split

The owner asked for a careful plan first and suggested a cheaper model for the building. Server, API-backed client and admin screens are mechanical once this document exists, so they are handed to helper agents and reviewed here. The mascot poses, loading scenes and blog art are drawn directly, because they are judgement work. Every phase ends with `pnpm build`, `pnpm lint`, the API tests, and a Playwright pass at 1366px and 390px.
