// বাঙালিয়ানা বাজারের প্রেজেন্টেশন। চালাতে: NODE_PATH=<pptxgenjs, sharp, react-icons, jszip যেখানে আছে>/node_modules node presentation/build.cjs
const path = require('path')
const fs = require('fs')
const pptxgen = require('pptxgenjs')
const sharp = require('sharp')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const pi = require('react-icons/pi')
const JSZip = require('jszip')
const { applyTheme } = require(process.env.APPLY_THEME || path.join(process.env.HOME, '.claude/skills/synced/0d945669-51e6-486f-bf74-1c34c95d8182_be40d226-6487-4889-8206-28c93991cd5f/pptx/scripts/apply_theme.js'))

const OUT = path.join(__dirname, 'BangaliyanaBazar.pptx')
const SHOT = (n) => path.join(__dirname, 'shots', n)

// Site palette (src/index.css)
const K = {
  red: 'B91C1C', maroon: '7F1D1D', holud: 'F59E0B', holudSoft: 'FDE68A', leaf: '166534',
  cream: 'FFF7E6', creamDeep: 'FDEECB', paper: 'FFFBF2', nil: '1F3B73', kolapata: '2F6B3A',
  shapla: 'BE185D', terra: 'C2410C', ink: '2A1A14', muted: '6B5446',
}
const FT = 'Tiro Bangla'
const FB = 'Baloo Da 2'

const THEME = {
  name: 'Bangaliyana Bazar',
  headFontFace: FT,
  bodyFontFace: FB,
  colors: {
    dk1: K.ink, lt1: K.paper, dk2: K.maroon, lt2: K.cream,
    accent1: K.red, accent2: K.holud, accent3: K.nil, accent4: K.kolapata, accent5: K.shapla, accent6: K.terra,
    hlink: K.nil, folHlink: K.shapla,
  },
}

// ---------- artwork (from src/components) ----------
const png = async (svg, w) => 'image/png;base64,' + (await sharp(Buffer.from(svg)).resize(w).png().toBuffer()).toString('base64')

const sunSvg = (ring = '#fff7e6') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  ${Array.from({ length: 12 }).map((_, i) => `<line x1="100" y1="6" x2="100" y2="28" stroke="#f59e0b" stroke-width="7" stroke-linecap="round" transform="rotate(${i * 30} 100 100)"/>`).join('')}
  <circle cx="100" cy="100" r="52" fill="#f59e0b"/><circle cx="100" cy="100" r="38" fill="${ring}"/><circle cx="100" cy="100" r="22" fill="#b91c1c"/></svg>`

const cornerSvg = (rot, color) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><g transform="rotate(${rot} 30 30)" fill="${color}" opacity="0.85">
  <path d="M6,6 C20,8 28,16 26,26 C16,28 8,20 6,6 Z"/><path d="M30,8 C38,10 42,16 40,22 C34,22 30,16 30,8 Z" opacity="0.75"/>
  <path d="M8,30 C10,38 16,42 22,40 C22,34 16,30 8,30 Z" opacity="0.75"/>
  <circle cx="48" cy="8" r="2"/><circle cx="54" cy="16" r="1.4"/><circle cx="8" cy="48" r="2"/><circle cx="16" cy="54" r="1.4"/><circle cx="36" cy="36" r="2.2"/></g></svg>`

const flowerSvg = (petal) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g transform="translate(24 24)">
  ${Array.from({ length: 8 }).map((_, i) => `<path d="M0,-4 C5,-9 4,-17 0,-21 C-4,-17 -5,-9 0,-4 Z" fill="${petal}" transform="rotate(${i * 45})"/>`).join('')}
  ${Array.from({ length: 8 }).map((_, i) => `<circle cx="0" cy="-14" r="1.6" fill="#fffdf5" transform="rotate(${i * 45 + 22.5})"/>`).join('')}
  <circle r="5" fill="#f59e0b"/><circle r="2" fill="#fffdf5"/></g></svg>`

// Hero-style dotted ground
const dotsSvg = (bg, dot) => `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs>
  <pattern id="d" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="2.6" fill="${dot}"/></pattern></defs>
  <rect width="1920" height="1080" fill="${bg}"/><rect width="1920" height="1080" fill="url(#d)"/></svg>`

const icon = async (name, color) => {
  const svg = renderToStaticMarkup(React.createElement(pi[name], { size: 256, color: '#' + color }))
  return png(svg, 256)
}

;(async () => {
  const A = {
    sun: await png(sunSvg(), 600),
    flowerRed: await png(flowerSvg('#b91c1c'), 160),
    flowerHolud: await png(flowerSvg('#f59e0b'), 160),
    bgMaroon: await png(dotsSvg('#7f1d1d', '#9a3a37'), 1920),
    bgNil: await png(dotsSvg('#1f3b73', '#2d4c88'), 1920),
  }
  for (const [k, r] of Object.entries({ tl: 0, tr: 90, br: 180, bl: 270 })) {
    A['cCream_' + k] = await png(cornerSvg(r, '#fffaf0'), 300)
    A['cDeep_' + k] = await png(cornerSvg(r, '#f4d9a4'), 300)
  }

  const pres = new pptxgen()
  pres.layout = 'LAYOUT_WIDE' // 13.333 x 7.5
  pres.title = 'Bangaliyana Bazar'
  pres.author = 'Bangaliyana Bazar team'
  pres.theme = { headFontFace: FT, bodyFontFace: FB }
  const W = 13.333, H = 7.5

  // ---------- layouts ----------
  pres.defineSlideMaster({
    title: 'LH_DARK_MAROON',
    background: { data: A.bgMaroon },
    objects: [
      { image: { x: 0.25, y: 0.25, w: 0.9, h: 0.9, data: A.cCream_tl } },
      { image: { x: W - 1.15, y: 0.25, w: 0.9, h: 0.9, data: A.cCream_tr } },
      { image: { x: 0.25, y: H - 1.15, w: 0.9, h: 0.9, data: A.cCream_bl } },
      { image: { x: W - 1.15, y: H - 1.15, w: 0.9, h: 0.9, data: A.cCream_br } },
    ],
  })
  pres.defineSlideMaster({
    title: 'LH_CONTENT',
    background: { color: K.cream },
    objects: [
      { image: { x: 0.6, y: 0.5, w: 0.55, h: 0.55, data: A.flowerRed } },
      { image: { x: W - 1.0, y: H - 1.0, w: 0.75, h: 0.75, data: A.cDeep_br } },
      { placeholder: { options: { name: 'title', type: 'title', x: 1.3, y: 0.35, w: 11.4, h: 0.85, fontFace: FT, fontSize: 34, color: K.maroon, bold: false, valign: 'middle', align: 'left', margin: 0 }, text: '' } },
    ],
  })
  pres.defineSlideMaster({
    title: 'LH_DARK_NIL',
    background: { data: A.bgNil },
    objects: [
      { image: { x: 0.6, y: 0.5, w: 0.55, h: 0.55, data: A.flowerHolud } },
      { image: { x: W - 1.0, y: H - 1.0, w: 0.75, h: 0.75, data: A.cCream_br } },
      { placeholder: { options: { name: 'title', type: 'title', x: 1.3, y: 0.35, w: 11.4, h: 0.85, fontFace: FT, fontSize: 34, color: K.cream, bold: false, valign: 'middle', align: 'left', margin: 0 }, text: '' } },
    ],
  })

  // ---------- helpers ----------
  const T = (s, text, o) => s.addText(text, { isTextBox: true, fontFace: FB, bold: false, italic: false, color: K.ink, margin: 0, valign: 'top', ...o })
  const stitch = (s, x, y, w, h, o = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: o.r ?? 0.12, fill: { color: o.fill ?? K.paper },
    line: { color: o.line ?? K.red, width: o.lw ?? 1.75, dashType: 'dash' }, objectName: o.name,
  })
  const iconDot = async (s, name, x, y, d, bg, fg) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { color: bg, width: 0 } })
    const p = d * 0.22
    s.addImage({ data: await icon(name, fg), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p })
  }
  // Two-colour kantha running stitch, like StitchLine
  const stitchLine = (s, x, y, w, c1 = K.holud, c2 = K.cream) => {
    s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: c1, width: 2, dashType: 'dash' } })
    s.addShape(pres.shapes.LINE, { x: x + 0.08, y: y + 0.09, w: w - 0.08, h: 0, line: { color: c2, width: 2, dashType: 'dash' } })
  }
  const frameImg = (s, file, x, y, w, h) => {
    stitch(s, x - 0.14, y - 0.14, w + 0.28, h + 0.28, { fill: K.paper, r: 0.1 })
    s.addImage({ path: SHOT(file), x, y, w, h })
  }
  const mascotAR = 501 / 1042

  // =========== ১. কভার ===========
  pres.addSection({ title: 'শুরু' })
  let s = pres.addSlide({ masterName: 'LH_DARK_MAROON', sectionTitle: 'শুরু' })
  s.addImage({ data: A.sun, x: 1.0, y: 0.95, w: 0.95, h: 0.95 })
  T(s, 'Bangaliyana Bazar', { x: 2.12, y: 1.2, w: 5.5, h: 0.45, fontSize: 18, color: K.holud, charSpacing: 3 })
  T(s, 'বাঙালিয়ানা বাজার', { x: 1.0, y: 1.95, w: 7.2, h: 1.45, fontFace: FT, fontSize: 60, color: K.cream, valign: 'middle' })
  T(s, 'স্থানীয় পণ্যের ডিজিটাল বাজার', { x: 1.0, y: 3.4, w: 7.2, h: 0.6, fontSize: 26, color: K.holudSoft })
  stitchLine(s, 1.0, 4.3, 6.8)
  T(s, 'দলের সদস্য', { x: 1.0, y: 4.65, w: 3.6, h: 0.4, fontSize: 15, color: K.holud })
  const team = [['Nusrat Jahan', '22500831'], ['Zahir Sheikh', '22500039'], ['Shanzida Nishat', '22500709'], ['Nasim', '22501283']]
  T(s, team.flatMap(([n, r], i) => [
    { text: n, options: {} },
    { text: `  ${r}`, options: { fontSize: 13, color: K.holudSoft, breakLine: i < team.length - 1 } },
  ]), { x: 1.0, y: 5.05, w: 3.9, h: 1.65, fontSize: 18, color: K.cream, paraSpaceAfter: 2, objectName: 'Team names' })
  T(s, 'শিক্ষক', { x: 5.1, y: 4.65, w: 3.0, h: 0.4, fontSize: 15, color: K.holud })
  T(s, [
    { text: 'Md Nahid Hasan', options: { breakLine: true } },
    { text: 'dydaiproject', options: { fontSize: 13, color: K.holudSoft } },
  ], { x: 5.1, y: 5.05, w: 3.0, h: 0.8, fontSize: 18, color: K.cream, paraSpaceAfter: 2, objectName: 'Instructor names' })
  T(s, '২৯ অক্টোবর ২০২৬', { x: 5.1, y: 6.2, w: 3.0, h: 0.45, fontSize: 15, color: K.holud, objectName: 'Date' })
  s.addImage({ data: A.sun, x: 8.25, y: 0.7, w: 3.9, h: 3.9, transparency: 10 })
  s.addImage({ path: SHOT('mascot.png'), x: 9.15, y: 1.55, w: 5.6 * mascotAR, h: 5.6 })
  s.addNotes('সবাইকে শুভেচ্ছা। আমাদের প্রজেক্টের নাম বাঙালিয়ানা বাজার, স্থানীয় পণ্যের ডিজিটাল বাজার। আমাদের দলে আছেন নুসরাত জাহান, জাহির শেখ, শানজিদা নিশাত আর নাসিম। আমাদের শিক্ষক মোঃ নাহিদ হাসান।')

  // =========== ২. বাঙালিয়ানা বাজার কী ===========
  pres.addSection({ title: 'ভূমিকা' })
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'ভূমিকা' })
  s.addText('বাঙালিয়ানা বাজার কী', { placeholder: 'title' })
  T(s, 'স্থানীয় কারিগরের হাতের কাজ, এক জায়গায়, অনলাইনে।', { x: 0.6, y: 1.9, w: 5.5, h: 1.7, fontSize: 30, color: K.ink })
  const chips = [['PiHandHeart', 'হাতে তৈরি'], ['PiBookOpenText', 'কারিগরের গল্প'], ['PiTruck', 'ঘরে ডেলিভারি']]
  for (let i = 0; i < 3; i++) {
    const y = 3.95 + i * 0.95
    await iconDot(s, chips[i][0], 0.6, y, 0.7, K.holudSoft, K.red)
    T(s, chips[i][1], { x: 1.5, y, w: 4.5, h: 0.7, fontSize: 21, color: K.maroon, valign: 'middle' })
  }
  frameImg(s, 'home-desk.png', 6.65, 2.2, 6.0, 6.0 * 768 / 1366)
  s.addNotes('বাঙালিয়ানা বাজার একটা অনলাইন বাজার। এখানে গ্রামের কারিগর আর ছোট ব্যবসায়ীরা নিজের হাতে বানানো জিনিস বিক্রি করেন। প্রতিটি পণ্যের সাথে থাকে কারিগরের নাম, জেলা আর গল্প। ক্রেতা ঘরে বসে অর্ডার দেন, পণ্য হাতে পেয়ে টাকা দেন।')

  // =========== ৩. কেন বানালাম ===========
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'ভূমিকা' })
  s.addText('কেন বানালাম', { placeholder: 'title' })
  const probs = [
    ['PiShuffle', 'বিক্রি ছড়িয়ে আছে', 'ক্রেতা খুঁজে পান না'],
    ['PiHandCoins', 'লাভ যায় মাঝখানে', 'কারিগর পান কম'],
    ['PiBookOpenText', 'গল্প হারিয়ে যায়', 'কে বানালেন, কেউ জানে না'],
  ]
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.11
    stitch(s, x, 1.6, 3.85, 3.0)
    await iconDot(s, probs[i][0], x + 1.42, 1.9, 1.0, K.creamDeep, K.red)
    T(s, probs[i][1], { x: x + 0.2, y: 3.1, w: 3.45, h: 0.55, fontSize: 23, color: K.maroon, align: 'center' })
    T(s, probs[i][2], { x: x + 0.2, y: 3.7, w: 3.45, h: 0.5, fontSize: 17, color: K.muted, align: 'center' })
  }
  stitch(s, 0.6, 5.0, 12.07, 1.3, { fill: K.holudSoft, line: K.maroon })
  T(s, [
    { text: 'তাই বাঙালিয়ানা বাজার:  ', options: { color: K.red } },
    { text: 'কারিগরের নিজের অনলাইন দোকান' },
  ], { x: 0.6, y: 5.0, w: 12.07, h: 1.3, fontSize: 24, color: K.ink, valign: 'middle', align: 'center' })
  s.addNotes('তিনটা সমস্যা দেখে আমরা এটা বানিয়েছি। এক, কারিগরের পণ্য ফেসবুক পেজ আর হাটে ছড়িয়ে থাকে, ক্রেতা খুঁজে পান না। দুই, মাঝের লোকের হাতে দামের বড় অংশ চলে যায়। তিন, কে বানালেন, কোথায়, কীভাবে, ক্রেতা জানতে পারেন না। তাই বাঙালিয়ানা বাজার, যেখানে কারিগর নিজেই অনলাইনে দোকান খোলেন।')

  // =========== ৪. লক্ষ্য ===========
  s = pres.addSlide({ masterName: 'LH_DARK_NIL', sectionTitle: 'ভূমিকা' })
  s.addText('আমাদের লক্ষ্য', { placeholder: 'title' })
  const goals = ['কারিগর থেকে সরাসরি ক্রেতা', 'প্রতিটি পণ্যের গল্প', 'সহজ বাংলায়, মোবাইলে']
  for (let i = 0; i < 3; i++) {
    const y = 1.8 + i * 1.6
    T(s, ['১', '২', '৩'][i], { x: 0.6, y, w: 0.8, h: 1.0, fontFace: FT, fontSize: 54, color: K.holud, valign: 'middle' })
    T(s, goals[i], { x: 1.55, y, w: 6.0, h: 1.0, fontSize: 27, color: K.cream, valign: 'middle' })
  }
  const stats = [['৬৪', 'জেলায় ডেলিভারি'], ['১০০%', 'বাংলায়'], ['৳০', 'আগে দিতে হয় না']]
  for (let i = 0; i < 3; i++) {
    const y = 1.6 + i * 1.75
    stitch(s, 8.15, y, 4.5, 1.5, { fill: K.nil, line: K.holud })
    T(s, stats[i][0], { x: 8.5, y, w: 1.9, h: 1.5, fontFace: FT, fontSize: 44, color: K.holud, valign: 'middle' })
    T(s, stats[i][1], { x: 10.35, y, w: 2.15, h: 1.5, fontSize: 18, color: K.cream, valign: 'middle' })
  }
  s.addNotes('আমাদের তিনটা লক্ষ্য। কারিগরকে মাঝের লোক ছাড়া সরাসরি ক্রেতার কাছে আনা। প্রতিটি পণ্যের পেছনের মানুষটাকে চেনানো। আর সহজ বাংলায়, মোবাইলে কেনাকাটা। ৬৪ জেলায় ডেলিভারি, পুরো সাইট বাংলায়, আর ক্যাশ অন ডেলিভারি, তাই আগে টাকা দিতে হয় না।')

  // =========== ৫. কাদের জন্য ===========
  pres.addSection({ title: 'ব্যবহারকারী ও ফিচার' })
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'ব্যবহারকারী ও ফিচার' })
  s.addText('কাদের জন্য', { placeholder: 'title' })
  const aud = [
    { head: 'ক্রেতা', ic: 'PiShoppingBag', bg: K.red, rows: [['PiStorefront', 'শহরের ক্রেতা'], ['PiGift', 'উপহার খোঁজেন যাঁরা'], ['PiAirplaneTilt', 'প্রবাসী বাঙালি']] },
    { head: 'বিক্রেতা', ic: 'PiHandHeart', bg: K.kolapata, rows: [['PiScissors', 'গ্রামের কারিগর'], ['PiUsersThree', 'নারী উদ্যোক্তা'], ['PiStorefront', 'ছোট ব্যবসায়ী']] },
  ]
  for (let c = 0; c < 2; c++) {
    const x = 0.6 + c * 6.17, a = aud[c]
    stitch(s, x, 1.6, 5.9, 5.1, { line: a.bg })
    await iconDot(s, a.ic, x + 0.45, 1.95, 0.9, a.bg, K.cream)
    T(s, a.head, { x: x + 1.55, y: 1.95, w: 4, h: 0.9, fontFace: FT, fontSize: 32, color: a.bg, valign: 'middle' })
    for (let r = 0; r < 3; r++) {
      const y = 3.25 + r * 1.08
      await iconDot(s, a.rows[r][0], x + 0.55, y, 0.7, K.creamDeep, a.bg)
      T(s, a.rows[r][1], { x: x + 1.55, y, w: 4.1, h: 0.7, fontSize: 22, color: K.ink, valign: 'middle' })
    }
  }
  s.addNotes('দুই ধরনের মানুষের জন্য বাঙালিয়ানা বাজার। ক্রেতা: শহরের মানুষ যাঁরা দেশি হাতের কাজ ভালোবাসেন, বিয়ে-ঈদ-পূজায় উপহার খোঁজেন যাঁরা, আর প্রবাসী বাঙালি। বিক্রেতা: গ্রামের তাঁতি, কুমার, কাঁথার শিল্পী, ঘরে বসে কাজ করা নারী উদ্যোক্তা, আর ছোট ব্যবসায়ী যাঁদের নিজের ওয়েবসাইট নেই।')

  // =========== ৬. ক্রেতার ফিচার ===========
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'ব্যবহারকারী ও ফিচার' })
  s.addText('ক্রেতা যা পান', { placeholder: 'title' })
  const bf = [
    ['PiMagnifyingGlass', 'জেলা আর ধরনে খোঁজা'], ['PiBookOpenText', 'পণ্যের গল্প'],
    ['PiHeart', 'পছন্দের তালিকা'], ['PiBasket', 'এক পাতায় অর্ডার'],
    ['PiWhatsappLogo', 'WhatsApp-এ অর্ডার'], ['PiUserCircle', 'লগইন ও প্রোফাইল'],
  ]
  for (let i = 0; i < 6; i++) {
    const x = 0.6 + (i % 2) * 4.3, y = 1.6 + Math.floor(i / 2) * 1.78
    stitch(s, x, y, 4.05, 1.55)
    await iconDot(s, bf[i][0], x + 0.3, y + 0.35, 0.85, K.holudSoft, K.red)
    T(s, bf[i][1], { x: x + 1.35, y, w: 2.6, h: 1.55, fontSize: 20, color: K.maroon, valign: 'middle' })
  }
  frameImg(s, 'shop-phone.png', 9.95, 1.6, 5.1 * 390 / 844, 5.1)
  s.addNotes('ক্রেতার জন্য ছয়টা মূল ফিচার। জেলা, ধরন আর দাম দিয়ে খোঁজা। প্রতিটি পণ্যের পেছনের গল্প। ভালো লাগলে পছন্দের তালিকায় রাখা। ঝুড়ি থেকে এক পাতায় অর্ডার। এক চাপে WhatsApp-এ বিক্রেতাকে অর্ডার পাঠানো। আর ফোন নম্বরে লগইন করে আগের অর্ডার দেখা।')

  // =========== ৭. বিক্রেতার ফিচার ===========
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'ব্যবহারকারী ও ফিচার' })
  s.addText('বিক্রেতা যা পান', { placeholder: 'title' })
  const steps = [['PiUserPlus', 'নিবন্ধন'], ['PiSealCheck', 'অনুমোদন'], ['PiUploadSimple', 'পণ্য তোলা'], ['PiReceipt', 'অর্ডার পাওয়া']]
  s.addShape(pres.shapes.LINE, { x: 1.6, y: 2.32, w: 10.1, h: 0, line: { color: K.red, width: 2, dashType: 'dash' } })
  for (let i = 0; i < 4; i++) {
    const cx = 1.6 + i * 3.37
    await iconDot(s, steps[i][0], cx - 0.6, 1.72, 1.2, K.red, K.cream)
    T(s, `${['১', '২', '৩', '৪'][i]}. ${steps[i][1]}`, { x: cx - 1.3, y: 3.05, w: 2.6, h: 0.5, fontSize: 20, color: K.maroon, align: 'center' })
  }
  const sf = [['PiStorefront', 'নিজের দোকান'], ['PiChartBar', 'নিজের ড্যাশবোর্ড'], ['PiArrowsSplit', 'নিজের অর্ডার']]
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.11
    stitch(s, x, 4.3, 3.85, 1.9, { line: K.kolapata })
    await iconDot(s, sf[i][0], x + 0.35, 4.75, 1.0, K.creamDeep, K.kolapata)
    T(s, sf[i][1], { x: x + 1.55, y: 4.3, w: 2.2, h: 1.9, fontSize: 22, color: K.kolapata, valign: 'middle' })
  }
  s.addNotes('বাঙালিয়ানা বাজার মাল্টিভেন্ডর। যেকোনো কারিগর নিবন্ধন করেন, আমরা যাচাই করে অনুমোদন দিই, তারপর তিনি নিজের পণ্য তোলেন আর অর্ডার পান। প্রত্যেকের আছে নাম, এলাকা আর গল্পসহ নিজের দোকান; পণ্য, ছবি, দাম আর স্টক ঠিক করার ড্যাশবোর্ড। ক্রেতা এক ঝুড়িতে অনেক বিক্রেতার পণ্য নিলে অর্ডার ভাগ হয়ে যার যার কাছে যায়।')

  // =========== ৮. ঝুড়ি ===========
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'ব্যবহারকারী ও ফিচার' })
  s.addText('ঝুড়ি থেকে ঘরে, চার ধাপে', { placeholder: 'title' })
  const jsteps = ['ঝুড়ি', 'ঠিকানা', 'হিসাব', 'হয়ে গেল']
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.07
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.55, w: 2.8, h: 0.7, rectRadius: 0.35, fill: { color: i === 0 ? K.red : K.paper }, line: { color: K.red, width: 1.5 } })
    s.addShape(pres.shapes.OVAL, { x: x + 0.13, y: 1.66, w: 0.48, h: 0.48, fill: { color: K.holud }, line: { color: K.holud, width: 0 } })
    T(s, ['১', '২', '৩', '৪'][i], { x: x + 0.13, y: 1.66, w: 0.48, h: 0.48, fontSize: 16, color: K.maroon, align: 'center', valign: 'middle' })
    T(s, jsteps[i], { x: x + 0.75, y: 1.55, w: 1.95, h: 0.7, fontSize: 19, color: i === 0 ? K.cream : K.maroon, valign: 'middle' })
  }
  frameImg(s, 'jhuri-desk.png', 0.75, 2.85, 6.4, 6.4 * 768 / 1366)
  stitch(s, 7.75, 2.71, 4.92, 3.88, { fill: K.paper })
  T(s, 'প্রতি ধাপে চাচা বাড়ির দিকে এগোন', { x: 8.05, y: 2.71, w: 2.75, h: 3.88, fontSize: 22, color: K.maroon, valign: 'middle' })
  s.addImage({ path: SHOT('mascot.png'), x: 11.0, y: 2.95, w: 3.45 * mascotAR, h: 3.45 })
  s.addNotes('অর্ডার হয় এক পাতায়, চার ধাপে: ঝুড়ি, ঠিকানা, হিসাব, হয়ে গেল। নিচে একজন চাচা হাট থেকে বাড়ির পথে হাঁটেন। প্রতিটি ধাপে তিনি এগিয়ে যান, ঝুড়ি যত ভরে তত খুশি হন, আর পণ্য সরালে মন খারাপ করেন। ফোনের ব্যাক বাটনেও আগের ধাপে ফেরা যায়।')

  // =========== ৯. ডিজাইন ===========
  pres.addSection({ title: 'ডিজাইন ও প্রযুক্তি' })
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'ডিজাইন ও প্রযুক্তি' })
  s.addText('ডিজাইন: খাঁটি বাঙালিয়ানা', { placeholder: 'title' })
  stitch(s, 0.6, 1.6, 6.2, 2.35)
  T(s, 'রং', { x: 0.95, y: 1.78, w: 3, h: 0.45, fontSize: 19, color: K.maroon })
  const sw = [[K.red, 'লাল'], [K.holud, 'হলুদ'], [K.nil, 'নীল'], [K.kolapata, 'কলাপাতা'], [K.shapla, 'শাপলা'], [K.paper, 'কাগজ']]
  for (let i = 0; i < 6; i++) {
    const x = 0.95 + i * 0.95
    s.addShape(pres.shapes.OVAL, { x: x + 0.1, y: 2.4, w: 0.65, h: 0.65, fill: { color: sw[i][0] }, line: { color: K.muted, width: 0.75 } })
    T(s, sw[i][1], { x: x - 0.1, y: 3.12, w: 1.05, h: 0.5, fontSize: 13, color: K.muted, align: 'center' })
  }
  stitch(s, 0.6, 4.2, 6.2, 2.5)
  T(s, 'ফন্ট', { x: 0.95, y: 4.38, w: 3, h: 0.45, fontSize: 19, color: K.maroon })
  T(s, 'হাতের কাজ, বাংলার গল্প', { x: 0.95, y: 4.95, w: 5.6, h: 0.8, fontFace: FT, fontSize: 32, color: K.ink })
  T(s, 'Tiro Bangla  ·  Baloo Da 2', { x: 0.95, y: 5.85, w: 5.6, h: 0.45, fontSize: 16, color: K.muted })
  const motifs = [['নকশি কাঁথার সেলাই', 'stitch'], ['আলপনা', 'flower'], ['হাতে আঁকা ছবি', 'PiPalette'], ['সব সংখ্যা বাংলায়', 'PiTextAa']]
  for (let i = 0; i < 4; i++) {
    const y = 1.6 + i * 1.3
    stitch(s, 7.15, y, 5.52, 1.1)
    const mx = 7.45, my = y + 0.22
    if (motifs[i][1] === 'stitch') {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: mx, y: my, w: 0.66, h: 0.66, rectRadius: 0.08, fill: { color: K.holudSoft }, line: { color: K.red, width: 2, dashType: 'dash' } })
    } else if (motifs[i][1] === 'flower') {
      s.addImage({ data: A.flowerRed, x: mx, y: my, w: 0.66, h: 0.66 })
    } else {
      await iconDot(s, motifs[i][1], mx, my, 0.66, K.holudSoft, K.red)
    }
    T(s, motifs[i][0], { x: 8.4, y, w: 4.1, h: 1.1, fontSize: 21, color: K.maroon, valign: 'middle' })
  }
  s.addNotes('আমরা চেয়েছি সাইটটা দেখতে খাঁটি বাঙালি হোক। রং নিয়েছি লাল, হলুদ, জামদানির নীল, কলাপাতা আর শাপলা থেকে। শিরোনামে Tiro Bangla, বাকি লেখায় Baloo Da 2। কার্ডের চারপাশে নকশি কাঁথার সেলাই, কোণে আলপনা, পণ্যের ছবি হাতে আঁকা, আর সব সংখ্যা বাংলায়, যেমন ৳৮,৫০০।')

  // =========== ১০. রেসপন্সিভ ===========
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'ডিজাইন ও প্রযুক্তি' })
  s.addText('কম্পিউটারে আর মোবাইলে সমান সহজ', { placeholder: 'title' })
  const dw = 7.3, dh = dw * 768 / 1366
  frameImg(s, 'product-desk.png', 0.75, 1.85, dw, dh)
  await iconDot(s, 'PiDesktop', 0.75, 6.35, 0.5, K.holudSoft, K.red)
  T(s, 'কম্পিউটার', { x: 1.4, y: 6.35, w: 3, h: 0.5, fontSize: 16, color: K.muted, valign: 'middle' })
  const ph = dh, pw = ph * 390 / 844
  frameImg(s, 'home-phone.png', 8.55, 1.85, pw, ph)
  frameImg(s, 'jhuri-phone.png', 8.55 + pw + 0.45, 1.85, pw, ph)
  await iconDot(s, 'PiDeviceMobile', 8.45, 6.35, 0.5, K.holudSoft, K.red)
  T(s, 'মোবাইল', { x: 9.1, y: 6.35, w: 3, h: 0.5, fontSize: 16, color: K.muted, valign: 'middle' })
  s.addNotes('সাইটটা রেসপন্সিভ। কম্পিউটারে যেমন চলে, মোবাইলেও তেমন। মোবাইলে মেনু, খোঁজা আর ঝুড়ি সব হাতের নাগালে থাকে।')

  // =========== ১১. প্রযুক্তি ===========
  s = pres.addSlide({ masterName: 'LH_DARK_NIL', sectionTitle: 'ডিজাইন ও প্রযুক্তি' })
  s.addText('যে প্রযুক্তিতে বানানো', { placeholder: 'title' })
  const tiers = [
    ['PiDeviceMobile', 'ব্যবহারকারী', ['ফোন বা কম্পিউটার'], ''],
    ['PiCode', 'ফ্রন্টএন্ড', ['React, TypeScript', 'Tailwind CSS'], 'Vercel'],
    ['PiCloud', 'সার্ভার', ['Node.js, Fastify', 'JWT লগইন'], 'Render'],
    ['PiDatabase', 'ডাটাবেস', ['PostgreSQL'], ''],
  ]
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.1
    stitch(s, x, 1.8, 2.75, 4.2, { fill: K.nil, line: K.holud })
    await iconDot(s, tiers[i][0], x + 0.9, 2.2, 0.95, K.holud, K.nil)
    T(s, tiers[i][1], { x: x + 0.15, y: 3.35, w: 2.45, h: 0.55, fontSize: 23, color: K.holud, align: 'center' })
    T(s, tiers[i][2].map((t, j, a) => ({ text: t, options: { breakLine: j < a.length - 1 } })), { x: x + 0.15, y: 4.0, w: 2.45, h: 1.0, fontSize: 17, color: K.cream, align: 'center' })
    if (tiers[i][3]) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.62, y: 5.3, w: 1.5, h: 0.42, rectRadius: 0.21, fill: { color: K.cream }, line: { color: K.cream, width: 0 } })
      T(s, tiers[i][3], { x: x + 0.62, y: 5.3, w: 1.5, h: 0.42, fontSize: 14, color: K.nil, align: 'center', valign: 'middle' })
    }
    if (i < 3) s.addImage({ data: await icon('PiArrowRight', K.holud), x: x + 2.8, y: 3.75, w: 0.26, h: 0.26 })
  }
  s.addNotes('ফ্রন্টএন্ড React, TypeScript আর Tailwind CSS দিয়ে বানানো, Vercel-এ চলে। সার্ভার Node.js আর Fastify, Render-এ চলে, লগইনের জন্য JWT। ডাটাবেস PostgreSQL। নিরাপত্তার জন্য দাম সব সময় সার্ভারে হিসাব হয়, ব্রাউজারের পাঠানো দাম বিশ্বাস করা হয় না।')

  // =========== ১২. চ্যালেঞ্জ ===========
  pres.addSection({ title: 'প্রভাব ও ভবিষ্যৎ' })
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'প্রভাব ও ভবিষ্যৎ' })
  s.addText('চ্যালেঞ্জ আর সমাধান', { placeholder: 'title' })
  const ch = [
    ['সবখানে বাংলা সংখ্যা', 'নিজেদের ছোট ফাংশন'],
    ['কেউ দাম বদলালে', 'দাম হিসাব হয় সার্ভারে'],
    ['অর্ডারের মাঝে ব্যাক বাটন', 'ধাপ থাকে লিংকে'],
    ['অনেক বিক্রেতা, এক ঝুড়ি', 'অর্ডার ভাগ হয়ে যায়'],
  ]
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + (i % 2) * 6.17, y = 1.6 + Math.floor(i / 2) * 2.6
    stitch(s, x, y, 5.9, 2.3)
    T(s, ch[i][0], { x: x + 0.4, y: y + 0.3, w: 5.1, h: 0.7, fontSize: 22, color: K.red, valign: 'middle' })
    s.addImage({ data: await icon('PiArrowRight', K.holud), x: x + 0.4, y: y + 1.27, w: 0.4, h: 0.4 })
    T(s, ch[i][1], { x: x + 1.0, y: y + 1.12, w: 4.6, h: 0.7, fontSize: 22, color: K.kolapata, valign: 'middle' })
  }
  s.addNotes('বানাতে গিয়ে চারটা বড় সমস্যা। সব সংখ্যা বাংলায় দেখাতে নিজেদের ছোট ফাংশন লিখেছি, আর ফোন নম্বরে বাংলা-ইংরেজি দুই অঙ্কই চলে। কেউ যেন দাম বদলে অর্ডার না দিতে পারে, তাই সার্ভার নিজে দাম হিসাব করে। ব্যাক বাটনে আগের ধাপে ফিরতে ধাপটা লিংকে রাখি। আর অনেক বিক্রেতার পণ্য এক ঝুড়িতে থাকলে অর্ডার ভাগ করে যার যার কাছে পাঠাই।')

  // =========== ১৩. প্রভাব ===========
  s = pres.addSlide({ masterName: 'LH_DARK_NIL', sectionTitle: 'প্রভাব ও ভবিষ্যৎ' })
  s.addText('এর প্রভাব', { placeholder: 'title' })
  const imp = [
    ['PiHandCoins', 'কারিগরের আয় বাড়ে'],
    ['PiUsersThree', 'নারীরা ঘরে বসে আয় করেন'],
    ['PiScissors', 'হাতের কাজের ঐতিহ্য বাঁচে'],
    ['PiMapPin', 'টাকা যায় গ্রামে'],
  ]
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.1
    stitch(s, x, 1.7, 2.75, 3.4, { fill: K.nil, line: K.holud })
    await iconDot(s, imp[i][0], x + 0.8, 2.1, 1.15, K.holud, K.nil)
    T(s, imp[i][1], { x: x + 0.2, y: 3.5, w: 2.35, h: 1.3, fontSize: 21, color: K.cream, align: 'center', valign: 'middle' })
  }
  stitch(s, 0.6, 5.5, 12.07, 1.15, { fill: K.holud, line: K.cream })
  T(s, 'একটা কেনা মানে একজন কারিগরের পাশে দাঁড়ানো', { x: 0.6, y: 5.5, w: 12.07, h: 1.15, fontSize: 24, color: K.nil, align: 'center', valign: 'middle' })
  s.addNotes('বাঙালিয়ানা বাজার শুধু একটা দোকান না। মাঝের লোক না থাকায় কারিগরের আয় বাড়ে। গ্রামের নারীরা ঘরে বসেই নিজের কাজ বিক্রি করে আয় করতে পারেন। জামদানি, নকশি কাঁথা, মাটির কাজের মতো ঐতিহ্য টিকে থাকে, কারণ এগুলোর ক্রেতা বাড়ে। আর শহরের টাকা সরাসরি গ্রামে পৌঁছায়। তাই প্রতিটি কেনা মানে একজন কারিগরের পাশে দাঁড়ানো।')

  // =========== ১৪. ভবিষ্যৎ ===========
  s = pres.addSlide({ masterName: 'LH_CONTENT', sectionTitle: 'প্রভাব ও ভবিষ্যৎ' })
  s.addText('সামনের পরিকল্পনা', { placeholder: 'title' })
  const fut = [
    ['শীঘ্রই', K.red, [['PiBell', 'SMS-এ অর্ডারের খবর'], ['PiStar', 'রিভিউ ও রেটিং'], ['PiMapTrifold', 'জেলার মানচিত্র']]],
    ['পরের ধাপ', K.holud, [['PiSun', 'উৎসবের সাজ'], ['PiChatCircleText', 'হাটের মতো দরদাম'], ['PiTranslate', 'ইংরেজি ভাষা']]],
    ['বড় স্বপ্ন', K.kolapata, [['PiDeviceMobile', 'মোবাইল অ্যাপ'], ['PiGraduationCap', 'কারিগরদের প্রশিক্ষণ'], ['PiPackage', 'বিদেশে পাঠানো']]],
  ]
  for (let c = 0; c < 3; c++) {
    const x = 0.6 + c * 4.11, [head, col, items] = fut[c]
    s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: 1.7, w: 0.5, h: 0.5, fill: { color: col }, line: { color: K.cream, width: 3 } })
    T(s, head, { x: x + 0.8, y: 1.65, w: 3, h: 0.6, fontFace: FT, fontSize: 26, color: K.maroon, valign: 'middle' })
    stitch(s, x, 2.55, 3.85, 4.1, { line: col })
    for (let r = 0; r < 3; r++) {
      const y = 2.85 + r * 1.22
      await iconDot(s, items[r][0], x + 0.3, y, 0.75, K.creamDeep, col === K.holud ? K.terra : col)
      T(s, items[r][1], { x: x + 1.2, y, w: 2.5, h: 0.75, fontSize: 19, color: K.ink, valign: 'middle' })
    }
  }
  s.addNotes('সামনে আমরা আরও কিছু করতে চাই। শীঘ্রই: SMS-এ অর্ডারের খবর, ক্রেতার রিভিউ, আর মানচিত্রে কোন জেলায় কোন কারিগর। পরের ধাপে: বৈশাখ, নবান্ন, ঈদ, পূজায় সাইটের নতুন সাজ; হাটের মতো দরদাম করার মজা; আর প্রবাসীদের জন্য ইংরেজি। বড় স্বপ্ন: মোবাইল অ্যাপ, কারিগরদের অনলাইনে বিক্রির প্রশিক্ষণ, আর দেশের বাইরে পণ্য পাঠানো।')

  // =========== ১৫. ধন্যবাদ ===========
  pres.addSection({ title: 'শেষ' })
  s = pres.addSlide({ masterName: 'LH_DARK_MAROON', sectionTitle: 'শেষ' })
  s.addImage({ data: A.sun, x: 1.0, y: 1.25, w: 0.95, h: 0.95 })
  T(s, 'Bangaliyana Bazar', { x: 2.12, y: 1.5, w: 5.5, h: 0.45, fontSize: 18, color: K.holud, charSpacing: 3 })
  T(s, 'ধন্যবাদ', { x: 1.0, y: 2.4, w: 7.2, h: 1.6, fontFace: FT, fontSize: 80, color: K.cream, valign: 'middle' })
  stitchLine(s, 1.0, 4.3, 6.8)
  T(s, 'কোনো প্রশ্ন থাকলে নির্দ্বিধায় জিজ্ঞেস করুন।', { x: 1.0, y: 4.65, w: 7.2, h: 0.7, fontSize: 26, color: K.holudSoft })
  s.addImage({ data: A.sun, x: 8.25, y: 0.7, w: 3.9, h: 3.9, transparency: 10 })
  s.addImage({ path: SHOT('mascot.png'), x: 9.15, y: 1.55, w: 5.6 * mascotAR, h: 5.6 })
  s.addNotes('আমাদের কথা শোনার জন্য ধন্যবাদ। কোনো প্রশ্ন থাকলে জিজ্ঞেস করুন।')

  await pres.writeFile({ fileName: OUT })
  await applyTheme(OUT, THEME)

  // PowerPoint বাংলা লেখার ফন্ট নেয় থিমের "Beng" ঘর থেকে (ডিফল্ট Vrinda)। সেখানে আমাদের ফন্ট বসাই।
  const zip = await JSZip.loadAsync(fs.readFileSync(OUT))
  for (const f of Object.keys(zip.files).filter((f) => /^ppt\/theme\/theme\d+\.xml$/.test(f))) {
    let x = await zip.file(f).async('string')
    x = x.replace(/(<a:majorFont>[\s\S]*?<\/a:majorFont>)/, (m) => m.replace(/<a:cs typeface="[^"]*"\/>/, `<a:cs typeface="${FT}"/>`).replace(/<a:font script="Beng" typeface="[^"]*"\/>/, `<a:font script="Beng" typeface="${FT}"/>`))
    x = x.replace(/(<a:minorFont>[\s\S]*?<\/a:minorFont>)/, (m) => m.replace(/<a:cs typeface="[^"]*"\/>/, `<a:cs typeface="${FB}"/>`).replace(/<a:font script="Beng" typeface="[^"]*"\/>/, `<a:font script="Beng" typeface="${FB}"/>`))
    zip.file(f, x)
  }
  fs.writeFileSync(OUT, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
  console.log('wrote', OUT)
})().catch((e) => { console.error(e); process.exit(1) })
