# WalrusForms — Complete Setup & Deployment Guide

## 1. What's Inside

WalrusForms is a decentralized form builder that stores form schemas and
submissions on **Walrus Mainnet** (Sui-based decentralized storage).

### Key Features
- **Form Builder** — drag-and-drop field types (text, dropdown, rating, image upload, etc.)
- **Walrus Mainnet Storage** — all forms and submissions stored as on-chain blobs
- **Multi-wallet Connect** — Suiet, Slush, Martian, Ethos, Nightly, Bitget, OKX, Surf
- **Admin Dashboard** — gated by password, full submission management
- **Offline Fallback** — if Walrus is unreachable, saves locally and shows status
- **Fully Responsive** — iPhone, iPad, Android, desktop, all screen sizes

---

## 2. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 8+ | bundled with Node |
| A Sui wallet | any | see Wallet section |

---

## 3. Local Development

```bash
# 1. Extract the zip
unzip WalForms_v2_production.zip
cd walrus_project

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# Opens at http://localhost:5173
```

---

## 4. Production Build

```bash
npm run build
# Output in ./dist/
```

The `dist/` folder is a static site — deploy it anywhere.

---

## 5. Deployment Options

### Option A — Vercel (recommended, free)
```bash
npm install -g vercel
vercel --prod
# or connect your GitHub repo at vercel.com
```
Add `vercel.json` for SPA routing:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Option B — Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```
Add `dist/_redirects`:
```
/*  /index.html  200
```

### Option C — GitHub Pages
```bash
# In package.json, set "homepage": "https://yourusername.github.io/walrusforms"
npm run build
npx gh-pages -d dist
```

### Option D — AWS S3 + CloudFront / Any Static Host
Upload contents of `dist/` to your bucket. Enable SPA (index.html fallback).

### Option E — Walrus Sites (fully decentralized)
```bash
# Install Walrus CLI
# https://docs.walrus.site/walrus-sites/publishing.html
walrus site-builder publish dist/
```
This makes your entire app live on Walrus — fully on-chain!

---

## 6. Wallet Setup

### Supported wallets (auto-detected)
| Wallet | Install |
|--------|---------|
| Suiet  | https://suiet.app |
| Slush  | https://slush.app |
| Martian Sui | https://martianwallet.xyz |
| Ethos  | https://ethoswallet.xyz |
| Nightly | https://nightly.app |
| Bitget | https://web3.bitget.com/en/wallet-download |
| OKX    | https://www.okx.com/web3 |
| Surf   | https://surf.tech |

Connect by clicking **"Connect Wallet"** in the navbar — the modal will show
which wallets are installed vs. which need to be installed.

---

## 7. Admin Dashboard

1. Navigate to `/dashboard` (or click **Dashboard** in the navbar)
2. Enter the admin password: **`walrus2025`**

### Changing the admin password
Edit `src/pages/Dashboard.jsx`, line 1 of `AdminContent`:
```js
const ADMIN_PASSWORD = 'your_new_password'
```
Then rebuild.

### Dashboard features
- 📊 Stats cards (total, open, critical, on-chain, etc.)
- 🔍 Full-text search across forms, submissions, wallets
- 🏷️ Filter by status, priority, form, Walrus/encrypted/wallet
- 📋 Table view + Cards view
- 📁 CSV export of all submissions
- 🗂️ Submission drawer — update status, priority, notes, delete
- 📄 Pagination (10/25/50/100 per page)

---

## 8. Walrus Storage

### How it works
- Form schemas → uploaded as JSON blobs on Walrus Mainnet
- Submissions → each submission uploaded as a separate blob
- File uploads (images/video) → uploaded as binary blobs

### If Walrus is unreachable
The app **does not crash**. It:
1. Tries 3 different Walrus publishers automatically
2. If all fail → saves data to `localStorage` with a `syncPending` flag
3. Shows a warning toast to the user
4. All data is still accessible in the app normally

### Walrus endpoints
```
Publisher:  https://publisher.walrus.space
Aggregator: https://aggregator.walrus.space
Fallbacks:  https://walrus-publisher.nodes.guru
            https://walrus-publish.mysten.io
```

### Storage epochs
Default = 5 epochs. Each epoch is ~1 week on mainnet. Adjust in
`src/lib/walrus.js` — change `epochs: 5` to your desired value.

---

## 9. Category / Status / Priority Colors

### Category badges (colored by type)
| Category | Color |
|----------|-------|
| Bug Report | 🔴 Red |
| Feature Request | 🟣 Violet |
| Survey | 🔵 Blue |
| Feedback | 🟩 Teal (Walrus) |
| Support | 🟡 Amber |
| Research | 🟢 Mint |
| Application | 🟠 Coral |
| Other | ⚫ Gray |

### Status badges
| Status | Color |
|--------|-------|
| Open | 🔵 Blue |
| In Review | 🟡 Amber |
| Resolved | 🟢 Mint |
| Closed | ⚫ Gray |
| Active | 🟢 Mint |
| Draft | 🟡 Amber |

### Priority badges
| Priority | Color |
|----------|-------|
| Critical | 🔴 Red (pulsing dot) |
| High | 🟠 Coral |
| Medium | 🟡 Amber |
| Low | ⚫ Gray |

---

## 10. Customization

### Change brand colors
Edit `tailwind.config.js` → `theme.extend.colors.walrus` to use your palette.

### Add new field types
Edit `src/pages/FormBuilder.jsx` → `FIELD_TYPES` array.
Add the renderer in `src/pages/FillForm.jsx` → `FormField` switch statement.

### Add new categories
Edit `CATEGORIES` array in `src/pages/FormBuilder.jsx` and `src/pages/FormsList.jsx`.
Add color config in `src/components/StatusBadge.jsx` → `CATEGORY_CONFIG`.

### Modify storage epochs
`src/lib/walrus.js` → change `epochs: 5`

---

## 11. Project Structure

```
walrus_project/
├── src/
│   ├── App.jsx                    # Router + providers
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Global styles + Tailwind
│   ├── lib/
│   │   ├── walrus.js              # Walrus storage (upload/download + fallback)
│   │   └── sui.js                 # Multi-wallet detection + connection
│   ├── store/
│   │   └── useStore.js            # Global state (localStorage-backed)
│   ├── hooks/
│   │   └── useStoreData.js        # React hook for reactive store
│   ├── components/
│   │   ├── Navbar.jsx             # Responsive navbar + wallet button
│   │   ├── WalletModal.jsx        # Multi-wallet connect modal
│   │   ├── StatusBadge.jsx        # Status / Priority / Category colored badges
│   │   ├── Toast.jsx              # Toast notifications
│   │   ├── WalrusUploadProgress.jsx
│   │   ├── WalrusBadge.jsx
│   │   ├── StarRating.jsx
│   │   └── LiveCounter.jsx
│   └── pages/
│       ├── Landing.jsx            # Home page
│       ├── FormsList.jsx          # Browse all forms
│       ├── FormBuilder.jsx        # Create a new form
│       ├── FormDetail.jsx         # Form overview + submissions
│       ├── FillForm.jsx           # Public form fill page
│       └── Dashboard.jsx          # Admin dashboard (password-gated)
├── package.json
├── tailwind.config.js
├── vite.config.js
└── index.html
```

---

## 12. Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to fetch" on publish | Walrus network is temporarily down. Form saves locally automatically. Try again later. |
| Wallet not detected | Make sure your wallet extension is installed and enabled for the site. Click "Refresh wallet list" in the connect modal. |
| Form not found | The form may have been deleted or localStorage was cleared. |
| Blank page after deploy | Enable SPA fallback (see deployment section). |
| Build errors | Run `npm install` first. Requires Node 18+. |
| Admin password not working | Default is `walrus2025`. Check `src/pages/Dashboard.jsx`. |

---

## 13. Security Notes

- The admin password is stored in the source code and `sessionStorage`. For production, replace it with proper auth (JWT, wallet-signature based auth, etc.).
- Submission data is public on Walrus (not encrypted by default). Enable the "Seal" option per-form for encrypted submissions.
- Private keys are never touched — wallet connections are read-only (address only).

---

*WalrusForms v2.0 — Built for Walrus Mainnet*
