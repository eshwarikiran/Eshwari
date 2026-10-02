# Eshwari Charitable Foundation (R.) — Official Website

A complete, production-ready website built with **pure HTML5, CSS3, and vanilla JavaScript** — no frameworks, no build step, no dependencies.

> **Design preview notice:** founder details, contact information, products, prices, and payment rails are clearly-marked editable placeholders until the foundation supplies verified details. Nothing false is claimed anywhere on the site.

---

## 1. Running the website locally

No build step is needed. Choose any one option:

- **Simplest:** double-click `index.html` (works directly from the file system).
- **Recommended (local server):**

  ```bash
  # Python 3
  python3 -m http.server 8080
  # then open http://localhost:8080

  # or Node.js
  npx serve .
  ```

The site is fully static — upload the entire folder to any web host (Netlify, Vercel, GitHub Pages, cPanel, Apache/Nginx) and it will work as-is.

---

## 2. File structure

```
eshwari-foundation/
├── index.html          ← Single-page main site (all sections + anchors)
├── donate.html         ← Donation page (demo checkout with safeguards)
├── products.html       ← Ayurvedic products catalogue (filters/search/cart)
├── privacy.html        ← Basic privacy policy (editable)
├── css/
│   └── style.css       ← Complete design system (~1,100 lines, CSS variables)
├── js/
│   ├── main.js         ← Config block + nav, menu, lightbox, accordions,
│   │                      form validation, reveal animations, year
│   ├── donation.js     ← Amounts, purpose, donor validation, live summary,
│   │                      clearly-labelled demo payment states
│   └── products.js     ← Product catalogue data, filters, search, detail
│                          modal, demo enquiry cart
└── assets/
    ├── images/         ← logo.png (original, untouched) + optimized .jpg images
    └── icons/          ← reserved for extra icons (site uses inline SVG)
```

**Fonts:** Playfair Display (headings) + Poppins (body) are loaded from Google Fonts with system fallbacks — the site remains fully readable offline.

---

## 3. ★ Replace placeholder content (main checklist)

### 3.1 The foundation's contact details — `js/main.js`

Open `js/main.js` and edit the `window.ECF_CONFIG` block at the top:

```js
window.ECF_CONFIG = {
  email: '',      // ← official email, e.g. 'office@yourdomain.org'
  phone: '',      // ← official phone, e.g. '+91 98765 43210'
  address: '',    // ← registered office address
  socials: { facebook: '', instagram: '', youtube: '', twitter: '' }, // page URLs
  ...
};
```

Anything left as `''` renders as an elegant "To be updated" chip on all pages — no fake data is ever shown. Filled values automatically appear in the Contact section and footers, and the social icons appear only when their URL is set.

### 3.2 The founder — `index.html` (search for "EDITABLE FOUNDER PLACEHOLDERS")

The Founder section contains four clearly bracketed placeholders:

| Placeholder | What to put there |
|---|---|
| `[FOUNDER NAME]` (appears twice) | The founder's verified name |
| `[FOUNDER BIOGRAPHY]` | A short verified biography |
| Founder's message blockquote | The founder's own words (a clearly-labelled suggested draft is provided — replace or get approval) |
| `assets/images/founder-placeholder.jpg` | Replace with a real portrait photo (keep the same file name, or update the `src` in index.html). The portrait sits in an ornamental arch frame; a portrait-orientation photo (approx. 4:5) works best. |

Remove the small "Placeholder" chips once real content is in place.

### 3.3 Images

All images live in `assets/images/`. Generated illustrative images are used throughout (hero, initiative cards, gallery, products, donate). To swap in real photographs, simply replace the matching file (keep the name) or edit the `src` in the HTML. Every image has meaningful `alt` text; update captions when you use real photos. Gallery and initiative images are labelled "(illustrative image)" — remove that note once real photos replace them.

---

## 4. ★ Adding the real Ayurvedic products — `js/products.js`

The catalogue is a simple editable array at the top of `js/products.js`:

```js
const PRODUCTS = [
  {
    id: 'sample-01',
    name: 'Product Name',
    category: 'Wellness Foods',        // also used by the filter pills
    desc: 'Short description.',
    image: 'assets/images/product-1.jpg',
    price: null,                        // ← set a number (e.g. 299) once real
    manufacturer: '...',               // verified manufacturer info
    ingredients: '...',                // verified ingredient list
    directions: '...',                 // manufacturer's own directions
    batch: '...'                       // licence / batch information
  },
  ...
];
```

Notes:

- `price: null` shows "Price on request" — the site never invents prices. Set real prices only when verified.
- Categories are defined in the `CATEGORIES` constant; the filter pills build themselves from it.
- Keep all manufacturer/regulatory fields truthful. Do not add therapeutic claims ("cures…", "treats…") — the site's compliance stance forbids them.
- Deep links work: `products.html?p=sample-01` opens that product's detail modal.

---

## 5. ★ Configuring the contact form

The form validates in the browser (no fake "message sent" state — the success panel says clearly that no backend is connected yet). To make it actually deliver messages, pick one:

1. **Form service (easiest):** sign up at a service like Formspree/Getform, point the form at their endpoint:

   ```html
   <form id="contact-form" action="https://formspree.io/f/YOUR_ID" method="POST">
   ```

   then in `js/main.js` remove the `e.preventDefault()` line from the submit handler (or set a flag) so the native submit happens.

2. **Your own backend:** POST the validated fields to your API and show the success panel only on a `200 OK` response.

Update `privacy.html` §3 with the delivery method you choose.

---

## 6. ★ Activating real payments (Razorpay)

The donation page runs in **demo mode** (`paymentsEnabled: false`): the Proceed button opens a clearly-labelled simulation where you can preview success / failure / pending states. No money moves, no fake receipts are produced, and no bank/UPI/QR details are displayed anywhere by design.

To activate real payments you need a backend. Recommended architecture:

```
Browser                        Your backend                    Razorpay
────────                       ────────────                    ────────
1. POST /api/create-order  →   create order via          →     orders API
   {amount(paise), purpose}     KEY_ID + KEY_SECRET             (server-side only)
2. open Razorpay Checkout ←   return order_id
   (user pays on RZP's PCI page)
3. checkout handler(resp)  →   POST /api/verify          →     verify
   razorpay_payment_id,         HMAC-SHA256 of                  signature
   order_id, signature          payment_id|order_id             server-side
4. show success ONLY after      record donation,
   your backend confirms        issue receipt by email
```

Implementation steps:

1. Create a Razorpay account, complete KYC, and keep **Key Secret on the server only** (never in this JavaScript).
2. Add two backend endpoints (`/api/create-order`, `/api/verify`) using the Razorpay Node/PHP/Python SDK.
3. In `donate.html`, load `https://checkout.razorpay.com/v1/checkout.js` and replace the demo branch in `js/donation.js` (`initProceed`) with a call to your endpoints — a commented code sketch already shows where.
4. Set `paymentsEnabled: true` in `js/main.js`.
5. Re-enable the tax-exemption note only after registration verification (`showTaxNote: true`).
6. Recommended: add Razorpay webhooks to reconcile async payments (UPI/netbanking can confirm late → the "pending" state in the UI already covers this flow).

Never put the Key Secret, bank account numbers, or UPI IDs in any frontend file.

---

## 7. Accessibility & performance

- Semantic HTML5, skip-link, keyboard-operable menu, lightbox, accordions, modals with focus traps, `aria-*` states, visible focus rings, `prefers-reduced-motion` support.
- Images use explicit `width`/`height` (no layout shift), `loading="lazy"` below the fold, and high-`fetchpriority` hero.
- Works from `file://` as well as any static host; cart persistence uses `localStorage` with graceful fallbacks.

---

## 8. Credits & content compliance

- Logo: official uploaded emblem, used **unmodified** (`assets/images/logo.png`).
- All other images are AI-generated illustrative visuals created for this design preview. They are not evidence of the foundation's activities and are labelled as illustrative in captions/alt text.
- Website copy is original. No testimonials, impact statistics, historical claims, or medical claims have been invented.

**Before going live, replace:** founder placeholders, contact details, product catalogue, suggested donation amounts, and the privacy policy placeholders — then remove the "design preview" notes from the footers.
