# 🦭 WalrusForms

> **Native decentralized feedback & form platform powered by [Walrus Protocol](https://walrus.xyz) and [Sui](https://sui.io).**  
> Every form schema and submission is stored as a permanent, content-addressed blob on Walrus mainnet — no servers, no databases.

---

## ✨ What It Does

| Feature | Details |
|---|---|
| **Visual Form Builder** | Drag-and-drop fields, live preview, per-field config |
| **Walrus Storage** | Forms & submissions stored as blobs on Walrus mainnet (5 epochs ≈ 2 years) |
| **Wallet Auth Gate** | Sui wallet required before submitting — stored as on-chain identity proof |
| **Media Uploads** | Images & videos stored as separate Walrus blobs, previewed inline |
| **Seal Encryption** | Optional threshold encryption via Walrus Seal (sensitive forms) |
| **Admin Dashboard** | Password-protected, filterable, with CSV export & media lightbox |
| **8 Field Types** | Short Text, Long Text, Dropdown, Star Rating, Checkbox, URL, Image, Video |
| **Live User Counter** | Real tab count via BroadcastChannel API |

---

## 🚀 Quick Start

```bash
# 1. Clone / unzip the project
cd walrus_project

# 2. Install dependencies
npm install

# 3. Configure environment (optional)
cp .env.example .env
# Edit .env to change admin password

# 4. Run dev server
npm run dev

# 5. Open http://localhost:5173
```

---

## 🗂️ Project Structure

```
walrus_project/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Fixed nav with wallet dropdown & mobile drawer
│   │   ├── WalletModal.jsx         # Multi-wallet connect modal (9 wallets supported)
│   │   ├── WalrusUploadProgress.jsx# Animated Walrus upload progress (SDK/HTTP modes)
│   │   ├── WalrusBadge.jsx         # Blob ID display with copy & external link
│   │   ├── StatusBadge.jsx         # Status, Priority & Category badges
│   │   ├── StarRating.jsx          # Interactive star rating input
│   │   ├── LiveCounter.jsx         # Real-time tab counter via BroadcastChannel
│   │   ├── Toast.jsx               # Toast notification system
│   │   └── WalrusLogo.jsx          # Animated SVG walrus logo
│   │
│   ├── pages/
│   │   ├── Landing.jsx             # Hero + features + how-it-works + CTA
│   │   ├── Guide.jsx               # Full documentation (sticky sidebar, FAQ accordion)
│   │   ├── FormsList.jsx           # Browse forms (search, category filter, sort)
│   │   ├── FormBuilder.jsx         # Drag-and-drop form creator → publish to Walrus
│   │   ├── FormDetail.jsx          # Form overview, field list, submission viewer
│   │   ├── FillForm.jsx            # Public fill page (wallet auth gate before submit)
│   │   └── Dashboard.jsx           # Admin dashboard (password protected)
│   │
│   ├── lib/
│   │   ├── walrus.js               # Walrus SDK + HTTP publisher fallback
│   │   └── sui.js                  # Sui wallet detection & connection (9 wallets)
│   │
│   ├── store/
│   │   └── useStore.js             # Zustand store (forms, submissions, wallet state)
│   │
│   ├── hooks/
│   │   └── useStoreData.js         # React hook wrapping the store
│   │
│   ├── App.jsx                     # Router + animated page transitions + top loader
│   └── index.css                   # Tailwind + custom design system
│
├── .env.example                    # Environment variable template
├── tailwind.config.js              # Custom color palette & animations
├── vite.config.js                  # Vite build config
└── package.json
```

---

## 🔗 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` or `/#/` | Landing | Marketing homepage |
| `/#/forms` | Forms List | Browse & search all forms |
| `/#/builder` | Form Builder | Create & publish a new form |
| `/#/forms/:id` | Form Detail | View stats, fields, submissions |
| `/#/forms/:id/fill` | Fill Form | Public submit page (wallet required) |
| `/#/dashboard` | Admin Dashboard | Password-protected management view |
| `/#/guide` | Guide | Full docs, FAQ, how-to |

---

## 🦭 Walrus Storage Architecture

```
Form schema (JSON)  ──► Walrus blob (blobId stored in app state)
                              │
                              ▼
                    aggregator.walrus.space/v1/blobs/<blobId>

Submission (JSON)   ──► Walrus blob (blobId stored with submission)
                              │
File attachment     ──► Walrus blob (blobId stored in field value)
```

### Upload Flow

1. **SDK Mode** *(wallet connected + WAL tokens)*  
   `encode → register on Sui → write to storage nodes → certify on-chain`

2. **HTTP Fallback** *(no wallet / no WAL tokens)*  
   Tries 4 community publisher endpoints in sequence:
   - `publisher.walrus.space`
   - `wal-publisher-mainnet.nodeinfra.com`
   - `walrus-mainnet-publisher-1.staketab.org`
   - `walrus-publisher.nodes.guru`

---

## 👛 Supported Wallets

| Wallet | Detection Method | Install |
|---|---|---|
| **Slush** (Sui Wallet) | wallet-standard + `window.suiWallet` | [slush.app](https://slush.app) |
| **Suiet** | wallet-standard + `window.suiet` | [suiet.app](https://suiet.app) |
| **Nightly** | wallet-standard + `window.nightly.sui` | [nightly.app](https://nightly.app) |
| **Bitget Wallet** | `window.bitkeep.sui` + `window.bitgetWallet.sui` | [web3.bitget.com](https://web3.bitget.com) |
| **OKX Wallet** | `window.okxwallet.sui` | [okx.com/web3](https://www.okx.com/web3) |
| **Martian** | `window.martian.sui` | [martianwallet.xyz](https://martianwallet.xyz) |
| **Ethos** | wallet-standard + `window.ethosWallet` | [ethoswallet.xyz](https://ethoswallet.xyz) |
| **Phantom** | `window.phantom.sui` | [phantom.app](https://phantom.app) |
| **Surf** | `window.surfWallet` | [surf.tech](https://surf.tech) |

All wallets are detected via **wallet-standard first** (modern path), falling back to window object inspection. The modal auto-refreshes when new extensions are detected.

---

## 🔐 Admin Dashboard

**URL:** `/#/dashboard`  
**Default password:** `walrus2025`

### Change the password

```env
# .env
VITE_ADMIN_PASSWORD=your_secure_password_here
```

The password is read from `import.meta.env.VITE_ADMIN_PASSWORD` at build time.

### Dashboard Features

- **Statistics** — total, open, in-review, critical counts (clickable filters)
- **Search** — full-text search across form title, ID, wallet address, field values, notes
- **Filters** — status, priority, form filter with active indicator
- **Sort** — by date, status, priority (click column headers)
- **Pagination** — 10 / 25 / 50 / 100 rows per page
- **Submission Drawer** — slide-in detail panel with:
  - Status & priority workflow (click to update)
  - Full field values with proper type rendering
  - **Image & video media preview** — tries 4 Walrus aggregator nodes automatically
  - Media lightbox (Esc to close)
  - Admin notes (inline edit)
  - Walrus blob link + Suiscan wallet link
- **CSV Export** — all fields, blob IDs, wallet addresses, status, priority, notes
- **Delete** — per-submission delete with confirmation

---

## 🏗️ Form Builder

### Fields

| Type | Input | Stored as |
|---|---|---|
| Short Text | `<input type="text">` | String |
| Long Text | `<textarea>` | String |
| Dropdown | Animated select | String (selected option) |
| Star Rating | Interactive stars (1–5) | Integer |
| Checkbox | Toggle | Boolean |
| URL | `<input type="url">` | String |
| Image Upload | Drag-and-drop | `{ blobId, name, size }` |
| Video Upload | Drag-and-drop | `{ blobId, name, size, isVideo }` |

### Settings

- **Category** — Bug Report, Feature Request, Survey, Feedback, Support, Research, Application, Other
- **Seal Encryption** — enables Walrus Seal threshold encryption on all submissions
- **Storage Epochs** — 5 epochs default (≈ 2 years on mainnet)

---

## 🎨 Design System

Built on **Tailwind CSS** with a custom design token layer:

```js
// tailwind.config.js
colors: {
  walrus: { 50–950 }   // teal-based primary brand
  ink:    { 50–950 }   // slate-based neutral
  coral:  { 400–600 }  // error / danger
  mint:   { 400–600 }  // success / positive
  amber:  { 400–600 }  // warning / encrypted
  ocean:  { 400–600 }  // info / Sui brand
}
```

**Key utility classes:**

| Class | Description |
|---|---|
| `.btn-primary` | Gradient walrus teal button with hover lift |
| `.btn-secondary` | Glass morphism button |
| `.btn-ghost` | Text-only hover button |
| `.btn-danger` | Coral danger button |
| `.input-dark` | Dark theme form input |
| `.input-light` | Light theme form input |
| `.glass` | Frosted glass card |
| `.glass-dark` | Dark frosted glass |
| `.card-light` | Light theme card with shadow |
| `.gradient-text` | Walrus→Ocean gradient text |
| `.grid-pattern` | Subtle grid background |
| `.dot-pattern` | Dot grid background |
| `.glow-walrus` | Walrus teal drop shadow glow |
| `.animate-pulse-ring` | Ripple pulse animation |
| `.animate-float` | Gentle float up-down |

---

## ⚙️ Environment Variables

```env
# .env (create from .env.example)

# Admin dashboard password
VITE_ADMIN_PASSWORD=walrus2025

# Walrus network (mainnet or testnet)
VITE_WALRUS_NETWORK=mainnet
```

---

## 🛠️ Development

```bash
# Install
npm install

# Dev server with HMR
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

**Requirements:** Node.js ≥ 18, npm ≥ 9

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `react` + `react-router-dom` | SPA routing with hash router |
| `framer-motion` | Page transitions, spring animations, AnimatePresence |
| `zustand` | Global state (forms, submissions, wallet) |
| `@mysten/walrus` | Walrus SDK for direct storage node writes |
| `@mysten/sui` | Sui blockchain client |
| `lucide-react` | Icon library |
| `tailwindcss` | Utility-first CSS |

---

## 🔄 Data Flow

```
User fills form
      │
      ▼
Wallet auth gate → WalletModal → connectWalletById()
      │
      ▼
validate() → field-level error display
      │
      ▼
uploadFileToWalrus(files) → { blobId } per media field
      │
      ▼
uploadToWalrus(submissionJSON) → { blobId } for submission
      │
      ▼
submitForm() → Zustand store (persisted via localStorage)
      │
      ▼
Success screen → WalrusBadge with blob link
```

---

## 🌐 Walrus Resources

- **Walrus Docs:** [docs.walrus.xyz](https://docs.walrus.xyz)
- **Walrus Explorer:** [walruscan.io](https://walruscan.io)
- **Blob Aggregator:** `https://aggregator.walrus.space/v1/blobs/<blobId>`
- **Sui Explorer:** [suiscan.xyz](https://suiscan.xyz)
- **Slush Wallet:** [slush.app](https://slush.app)

---

## 📄 License

MIT — build freely on top of this.

---

*Built for the Walrus Hackathon — native decentralized form infrastructure powered by Walrus Protocol.*
