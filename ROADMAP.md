# Roadmap

The redesign happens on the `redesign` branch. `snapshot/original` keeps the site as it was before.

Goal: a store that looks and feels Bengali everywhere, not only in the hero. The culture comes through in the materials: kantha running stitch, alpana, handmade paper, craft colours. No literal theme decoration, no filler text, no fade-in delays.

## Decisions

- Cart to confirmation is one page, `/jhuri`, with four tabs: ঝুড়ি → ঠিকানা → হিসাব → হয়ে গেল. হিসাব is the order review step with the "অর্ডার পাকা করুন" button.
- The mascot is clean, sharp, layered SVG with medium detail. For now he only appears on `/jhuri`.
- Mascot moods for now: walking, happy and sad. Sad is enough; no big drama.
- Ratings stay, shown in Bengali digits.
- Headings (h1, h2) use Tiro Bangla. Everything else uses Baloo Da 2. Galada was tried and dropped because it reads as bold italic.
- The announcement bar stays, made shorter and better.
- No scroll-reveal fade-ins. Animations must be quick, visible and fun.
- Defaults the owner can still change:
  - The artisans page shows craft emblems instead of drawn faces.
  - Visual work (phases 0–2) comes before the Jhuri flow.
  - One commit per phase.

## Phase 0: Cleanup
- [x] Add a `bn()` digit helper and remove every English digit from the UI.
- [x] Remove the scroll-reveal hook and its CSS.
- [x] Remove rickshaw art written as text (hero card, scrolling strip, category blurb).
- [x] Cut filler text: hero stats, second hero sub-line, logo tagline, "কেন হাতে তৈরি", stock line on cards, art note on the product page, browser storage note, duplicate ঝুড়ি link in the header.
- [x] Make the announcement bar short and evergreen, and stop the footer repeating it.

## Phase 1: Visual language
- [x] Palette: keep maroon, red and turmeric yellow; add indigo (`nil`), banana leaf (`kolapata`), shapla pink and a paper tone. The mint goes with the Home rework in Phase 2.
- [x] Display font for headings: Tiro Bangla.
- [x] Make the kantha stitch look like real thread: uneven stitches, two-colour divider (`StitchLine`, `StitchFrame`).
- [x] Alpana corner and flower as reusable components (`Alpana.tsx`).
- [x] New product card: paper surface, inset stitch, alpana corners on the art, ribbon badge, rating, one main button plus a heart. A separate price tag was dropped to keep it calm.
- [x] Remove the label text above section headings, and the → on buttons.
- [x] Motion: card art swings on hover, stitch moves on hover, an item flies into the header ঝুড়ি and it bounces. Respects reduced motion.

## Phase 2: Page passes
- [x] Home: hero unchanged (headline pinned to Baloo Da 2); mela stalls with striped awnings; popular products; one artisan story on indigo; the mint festival section is gone.
- [x] Shop: one slim filter row, scrolls sideways on phones. Search and category live in the URL, so header search works on the shop page too.
- [x] Product: stitched art frame, the story as the artisan's quote, a Bengali-digit quantity stepper, a short low-stock note.
- [x] Artisans: stitched cards with a round craft medallion and their products as small tiles. The "how artisans join" box is cut (not for shoppers, and it pointed to a Facebook page that doesn't exist).
- [x] 404 page restyle. Also fixed: scroll to top on page change, and the product page resets when you open another product.

## Phase 3: Jhuri flow
- [x] One `/jhuri` route with tabs. The current step goes in the URL (`?dhap=`), so phone back works. Redirect `/cart` and `/checkout` to it.
- [x] ঝুড়ি: items and quantities.
- [x] ঠিকানা: name, phone, district, address, delivery area. The phone field must accept both Bengali and English digits, and quantity inputs need Bengali digits (a stepper, not `type=number`).
- [x] হিসাব: review, totals, the cash-on-delivery note, the order button.
- [x] হয়ে গেল: order number and total.
- [x] Bottom progress road with the mascot.
  - He walks forward on next and back on previous.
  - Jhuri fill: 0 empty, 1–2 a little, 3–5 half, 6+ almost full.
  - Sad on remove, lowering a quantity, going back or emptying the jhuri.
  - Happy on হয়ে গেল.

## Phase 4: Mascot library
- [x] `src/libs/mascot/`: `<Mascot mood fill walking direction />`, built as layered SVG from `design/uncle-inspiration.png`.
- [x] Only the rigging he needs: walk cycle, head droop, arm holding the jhuri.
- [x] Reduced motion support.

## Each phase ends with
- [ ] `pnpm build` and `pnpm lint` pass.
- [ ] Playwright check at 1366px and 390px, including the full jhuri flow once it exists.
- [ ] Screenshots shown to the owner, then a commit.

## Notes from building it
- The road runs from a haat stall to a thatched home, so the order is complete when the uncle reaches home with a full jhuri.
- Delivery area is picked automatically from the district; there's no separate radio.
- Fixed along the way: the old checkout turned server validation errors into fake local orders; Vite reloaded the page on every order.

## Later
- Seasonal themes (Boishakh, Nobanno, Eid, Puja).
- Shop filter chips.
- Mascot on other pages (empty states, 404).
- Bargaining modal ("দাঁড়ান ভাই, কত হইলে নিবেন") with similar products, voices, and a soft haat bazar sound.
- A district map on the artisans page.
