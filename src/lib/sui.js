/**
 * WalrusForms — Sui Wallet Integration v6
 * ───────────────────────────────────────
 * Detects wallets via THREE layers:
 *  1. wallet-standard registry (getWallets API — most reliable, works for all modern wallets)
 *  2. window object inspection (OKX, Bitget, Phantom legacy paths)
 *  3. Deferred polling (some extensions inject AFTER page load; we poll for 3s)
 *
 * Wallets: Slush, Suiet, Nightly, Bitget, OKX, Martian, Ethos, Phantom, Surf, Backpack
 */

// ─── Wallet registry ─────────────────────────────────────────────────────────
export const WALLET_REGISTRY = [
  {
    id: 'slush',
    name: 'Slush',
    shortName: 'Slush',
    aliases: ['Slush', 'Sui Wallet', 'mysten/slush'],
    icon: 'https://slush.app/favicon.ico',
    iconFallback: '💧',
    installUrl: 'https://slush.app',
    description: 'The official Sui wallet by Mysten Labs',
    windowKeys: ['suiWallet', '__suiWalletAdapter', 'slush'],
  },
  {
    id: 'suiet',
    name: 'Suiet',
    aliases: ['Suiet'],
    icon: 'https://suiet.app/favicon.ico',
    iconFallback: '🦊',
    installUrl: 'https://suiet.app',
    description: 'Open-source Sui wallet',
    windowKeys: ['suiet'],
  },
  {
    id: 'nightly',
    name: 'Nightly',
    aliases: ['Nightly'],
    icon: 'https://nightly.app/favicon.ico',
    iconFallback: '🌙',
    installUrl: 'https://nightly.app',
    description: 'Multi-chain wallet with Sui support',
    windowKeys: ['nightly'],
  },
  {
    id: 'bitget',
    name: 'Bitget Wallet',
    aliases: ['Bitget Wallet', 'BitKeep', 'Bitget'],
    icon: 'https://web3.bitget.com/favicon.ico',
    iconFallback: '₿',
    installUrl: 'https://web3.bitget.com/en/wallet-download',
    description: 'Web3 DeFi wallet by Bitget exchange',
    windowKeys: ['bitkeep', 'bitgetWallet', 'BitKeep'],
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    aliases: ['OKX Wallet', 'OKX', 'okx'],
    icon: 'https://static.okx.com/cdn/assets/imgs/226/EB771FC0B1E3B4B3.png',
    iconFallback: '⭕',
    installUrl: 'https://www.okx.com/web3',
    description: 'Multi-chain wallet by OKX exchange',
    windowKeys: ['okxwallet', 'OKXWallet'],
  },
  {
    id: 'martian',
    name: 'Martian',
    aliases: ['Martian Sui Wallet', 'Martian'],
    icon: 'https://raw.githubusercontent.com/MartianWallet/martian-sui-wallet/main/assets/martian-logo.png',
    iconFallback: '🚀',
    installUrl: 'https://martianwallet.xyz',
    description: 'Sui & Aptos DeFi wallet',
    windowKeys: ['martian'],
  },
  {
    id: 'ethos',
    name: 'Ethos',
    aliases: ['Ethos Sui Wallet', 'Ethos'],
    icon: 'https://ethoswallet.xyz/favicon.ico',
    iconFallback: 'Ε',
    installUrl: 'https://ethoswallet.xyz',
    description: 'Sui wallet with built-in staking',
    windowKeys: ['ethosWallet'],
  },
  {
    id: 'phantom',
    name: 'Phantom',
    aliases: ['Phantom'],
    icon: 'https://phantom.app/favicon.ico',
    iconFallback: '👻',
    installUrl: 'https://phantom.app',
    description: 'Multi-chain wallet (Sui, Solana, ETH)',
    windowKeys: ['phantom'],
  },
  {
    id: 'surf',
    name: 'Surf Wallet',
    aliases: ['Surf Wallet', 'Surf'],
    icon: 'https://surf.tech/favicon.ico',
    iconFallback: '🏄',
    installUrl: 'https://surf.tech',
    description: 'NFT-focused Sui wallet',
    windowKeys: ['surfWallet'],
  },
  {
    id: 'backpack',
    name: 'Backpack',
    aliases: ['Backpack'],
    icon: 'https://backpack.app/favicon.ico',
    iconFallback: '🎒',
    installUrl: 'https://backpack.app',
    description: 'xNFT wallet — Sui & Solana',
    windowKeys: ['backpack'],
  },
]

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Read all registered wallets from wallet-standard's global registry */
function _readStandardRegistry() {
  if (typeof window === 'undefined') return []
  try {
    // The spec says the registry is on a global exposed by the wallet-standard package.
    // Different bundlers/versions expose it at slightly different paths.
    const candidates = [
      // Modern wallet-standard getWallets() helper
      () => {
        const fn = window.getWallets ?? window.__getWallets
        if (typeof fn === 'function') {
          const reg = fn()
          return Array.from(reg?.get?.() ?? [])
        }
        return []
      },
      // @mysten/wallet-standard package global
      () => Array.from(window['@mysten/wallet-standard']?.wallets?.get?.() ?? []),
      // Generic wallet-standard/app global
      () => Array.from(window['@wallet-standard/app']?.wallets?.get?.() ?? []),
      // __wallets is the internal store sometimes exposed
      () => Array.from(window.__wallets?.get?.() ?? []),
      // Sui-specific registry
      () => Array.from(window.__suiWalletRegistry?.get?.() ?? []),
    ]
    for (const fn of candidates) {
      try {
        const wallets = fn()
        if (Array.isArray(wallets) && wallets.length > 0) return wallets
      } catch { /* try next */ }
    }
    return []
  } catch { return [] }
}

/** Does a wallet-standard entry support Sui chains? */
function _isSuiWallet(w) {
  const chains = w.chains ?? []
  return chains.length === 0 || chains.some(c =>
    typeof c === 'string' && (c.startsWith('sui:') || c === 'sui')
  )
}

/** Match a wallet-standard name to our registry entry */
function _matchRegistry(wsName) {
  if (!wsName) return null
  const lower = wsName.toLowerCase()
  return WALLET_REGISTRY.find(r =>
    r.aliases.some(alias => {
      const a = alias.toLowerCase()
      return lower === a || lower.includes(a) || a.includes(lower)
    })
  ) ?? null
}

/** Safely read a window key, handling errors */
function _win(key) {
  try { return window[key] } catch { return undefined }
}

/** Get the Sui provider from a window object for a given registry entry */
function _windowProvider(reg) {
  if (typeof window === 'undefined') return null
  for (const key of reg.windowKeys ?? []) {
    const obj = _win(key)
    if (!obj) continue
    switch (reg.id) {
      case 'okx':
        // OKX exposes window.okxwallet.sui
        if (obj.sui) return obj.sui
        // Newer versions expose it directly with connect()
        if (typeof obj.connect === 'function') return obj
        break
      case 'bitget':
        if (obj.sui) return obj.sui
        if (obj.isBitKeep || obj.isBitget || obj.isBitgetWallet) return obj
        if (typeof obj.connect === 'function') return obj
        break
      case 'phantom':
        if (obj.sui) return obj.sui
        break
      case 'martian':
        if (obj.sui) return obj.sui
        if (obj.hasSuiWallet) return obj
        if (obj.connect) return obj
        break
      case 'nightly':
        if (obj.sui) return obj.sui
        if (obj.connect) return obj
        break
      case 'backpack':
        if (obj.sui) return obj.sui
        if (obj.isSui || obj.chains?.includes?.('sui:mainnet')) return obj
        break
      default:
        return obj
    }
  }
  return null
}

// ─── Public: detect all available wallets ─────────────────────────────────────
export function detectAllWallets() {
  if (typeof window === 'undefined') return []

  const seen = new Map() // id → wallet object

  // ── Layer 1: wallet-standard registry ──────────────────────────────────────
  const stdWallets = _readStandardRegistry()
  for (const w of stdWallets) {
    if (!_isSuiWallet(w)) continue
    const reg = _matchRegistry(w.name)
    const id = reg?.id ?? w.name?.toLowerCase().replace(/\s+/g, '-') ?? `std-${seen.size}`

    if (!seen.has(id)) {
      // Prefer our high-res icon over data: URIs (which can be tiny)
      const icon = (w.icon && !w.icon.startsWith('data:')) ? w.icon : (reg?.icon ?? w.icon ?? '')
      seen.set(id, {
        id,
        name: w.name ?? reg?.name ?? 'Unknown',
        icon,
        iconFallback: reg?.iconFallback ?? w.name?.[0]?.toUpperCase() ?? '?',
        installUrl: reg?.installUrl ?? '#',
        description: reg?.description ?? '',
        provider: w,
        source: 'standard',
      })
    }
  }

  // ── Layer 2: window object inspection ──────────────────────────────────────
  for (const reg of WALLET_REGISTRY) {
    if (seen.has(reg.id)) continue // already found via wallet-standard
    const provider = _windowProvider(reg)
    if (provider) {
      seen.set(reg.id, {
        id: reg.id,
        name: reg.name,
        icon: reg.icon,
        iconFallback: reg.iconFallback,
        installUrl: reg.installUrl,
        description: reg.description,
        provider,
        source: 'window',
      })
    }
  }

  return Array.from(seen.values())
}

/**
 * Poll for wallet detection. Useful when extensions inject after DOMContentLoaded.
 * Returns detected wallets after up to `maxMs` ms.
 */
export async function detectWalletsWithRetry(maxMs = 3000, intervalMs = 300) {
  const start = Date.now()
  let found = detectAllWallets()
  while (found.length === 0 && Date.now() - start < maxMs) {
    await new Promise(r => setTimeout(r, intervalMs))
    found = detectAllWallets()
  }
  return found
}

// ─── wallet-standard connect path ─────────────────────────────────────────────
async function _connectViaStandard(provider, name) {
  const feat = provider.features?.['standard:connect']
  if (!feat?.connect) throw new Error(`${name} does not expose standard:connect feature.`)
  const res = await feat.connect({ silent: false })
  const accounts = res?.accounts ?? []
  if (accounts.length === 0) {
    throw new Error(`${name} connected but returned no accounts. Make sure your wallet is unlocked and has a Sui account.`)
  }
  return accounts[0].address
}

// ─── Public: connect a wallet by ID ───────────────────────────────────────────
export async function connectWalletById(walletId) {
  if (typeof window === 'undefined') throw new Error('Not in browser environment.')

  // Retry detection — extensions can be slow
  const detected = await detectWalletsWithRetry(2000)
  const wallet = detected.find(w => w.id === walletId)

  if (!wallet) {
    const reg = WALLET_REGISTRY.find(r => r.id === walletId)
    throw new Error(
      `${reg?.name ?? walletId} extension not detected. ` +
      `Make sure it's installed, enabled, and the page has been refreshed after installation.`
    )
  }

  const { provider, source, name } = wallet

  try {
    let address = ''

    // ── wallet-standard path (works for all modern wallets) ─────────────────
    if (source === 'standard') {
      address = await _connectViaStandard(provider, name)
      return { address, connected: true, walletId, walletName: name }
    }

    // ── Per-wallet window-object paths ──────────────────────────────────────

    // OKX Wallet
    if (walletId === 'okx') {
      const p = window.okxwallet?.sui ?? window.OKXWallet?.sui ?? window.okxwallet
      if (!p) throw new Error('OKX Wallet Sui provider not found. Enable Sui network in OKX Wallet settings.')
      // Try standard:connect feature first (newer OKX versions)
      if (p.features?.['standard:connect']) {
        address = await _connectViaStandard(p, 'OKX Wallet')
      } else if (typeof p.connect === 'function') {
        const res = await p.connect()
        const accs = res?.accounts ?? await p.getAccounts?.() ?? []
        address = accs[0]?.address ?? accs[0] ?? ''
      } else if (typeof p.requestAccounts === 'function') {
        const accs = await p.requestAccounts()
        address = accs[0]?.address ?? accs[0] ?? ''
      } else if (typeof p.getAccounts === 'function') {
        const accs = await p.getAccounts()
        address = accs[0]?.address ?? accs[0] ?? ''
      }
      if (!address) throw new Error('OKX Wallet: no address returned. Make sure Sui is selected and the wallet is unlocked.')
    }

    // Bitget Wallet
    else if (walletId === 'bitget') {
      const p = window.bitkeep?.sui ?? window.bitgetWallet?.sui ?? window.bitkeep ?? window.BitKeep
      if (!p) throw new Error('Bitget Wallet not found. Install from web3.bitget.com and refresh.')
      if (p.features?.['standard:connect']) {
        address = await _connectViaStandard(p, 'Bitget Wallet')
      } else if (typeof p.connect === 'function') {
        const res = await p.connect()
        const accs = res?.accounts ?? await p.getAccounts?.() ?? []
        address = accs[0]?.address ?? accs[0] ?? ''
      } else if (typeof p.enable === 'function') {
        await p.enable()
        const accs = await p.getAccounts?.() ?? []
        address = accs[0]?.address ?? accs[0] ?? ''
      }
      if (!address) throw new Error('Bitget: could not get address. Select Sui network in Bitget Wallet.')
    }

    // Slush / Sui Wallet
    else if (walletId === 'slush') {
      const p = window.suiWallet ?? window.__suiWalletAdapter ?? window.slush
      if (!p) throw new Error('Slush wallet not found. Install from slush.app and refresh.')
      const hasPerm = await p.hasPermissions?.(['viewAccount', 'suggestTransactions']).catch(() => false)
      if (!hasPerm) await p.requestPermissions?.({ permissions: ['viewAccount', 'suggestTransactions'] })
      const accs = await p.getAccounts?.() ?? []
      address = accs[0]?.address ?? (typeof accs[0] === 'string' ? accs[0] : '')
      if (!address) throw new Error('Slush: no address returned. Unlock your wallet and try again.')
    }

    // Phantom (Sui tab)
    else if (walletId === 'phantom') {
      const p = window.phantom?.sui
      if (!p) throw new Error('Phantom Sui not found. Enable the Sui network in Phantom settings.')
      const res = await p.connect()
      address = res?.publicKey?.toString?.() ?? res?.accounts?.[0]?.address ?? ''
      if (!address) throw new Error('Phantom: no address. Disconnect and reconnect from Phantom settings.')
    }

    // Nightly
    else if (walletId === 'nightly') {
      const p = provider?.sui ?? provider
      await p.connect?.({
        appMetadata: {
          name: 'WalrusForms',
          url: window.location.origin,
          icon: window.location.origin + '/favicon.ico',
        }
      })
      const accs = p.accounts ?? await p.getAccounts?.() ?? []
      address = accs[0]?.address ?? (typeof accs[0] === 'string' ? accs[0] : '')
    }

    // Martian
    else if (walletId === 'martian') {
      const res = await provider.connect?.()
      const accs = res?.accounts ?? await provider.getAccounts?.() ?? []
      address = accs[0]?.address ?? accs[0] ?? ''
    }

    // Backpack
    else if (walletId === 'backpack') {
      const p = window.backpack?.sui ?? window.backpack
      if (!p) throw new Error('Backpack wallet not found. Install from backpack.app.')
      if (p.features?.['standard:connect']) {
        address = await _connectViaStandard(p, 'Backpack')
      } else {
        const res = await p.connect?.()
        const accs = res?.accounts ?? await p.getAccounts?.() ?? []
        address = accs[0]?.address ?? accs[0] ?? ''
      }
    }

    // Generic window-object fallback
    else if (provider) {
      if (typeof provider.connect === 'function') {
        const res = await provider.connect()
        const accs = res?.accounts ?? await provider.getAccounts?.() ?? []
        address = accs[0]?.address ?? (typeof accs[0] === 'string' ? accs[0] : '')
      } else if (typeof provider.getAccounts === 'function') {
        const accs = await provider.getAccounts()
        address = accs[0]?.address ?? accs[0] ?? ''
      }
    }

    if (!address) {
      throw new Error(
        `${name}: Could not retrieve wallet address.\n` +
        'Please ensure your wallet is:\n' +
        '• Unlocked\n• Set to Sui Mainnet\n• Approved the connection popup'
      )
    }

    return { address, connected: true, walletId, walletName: name }

  } catch (err) {
    const msg = err?.message ?? String(err)
    // Normalize user-rejection errors
    if (
      msg.toLowerCase().includes('user rejected') ||
      msg.toLowerCase().includes('user cancelled') ||
      msg.toLowerCase().includes('cancelled') ||
      err?.code === 4001
    ) {
      throw new Error('Connection cancelled. Please approve the connection request in your wallet extension.')
    }
    throw new Error(msg || `${name} connection failed. Please try again.`)
  }
}

// ─── Disconnect ────────────────────────────────────────────────────────────────
export async function disconnectWallet(walletId) {
  if (!walletId || typeof window === 'undefined') return
  try {
    const detected = detectAllWallets()
    const w = detected.find(x => x.id === walletId)
    if (!w) return
    const { provider, source } = w
    if (source === 'standard') {
      const feat = provider.features?.['standard:disconnect']
      await feat?.disconnect?.()
    } else if (walletId === 'phantom') {
      await window.phantom?.sui?.disconnect?.()
    } else {
      await provider.disconnect?.()
    }
  } catch { /* disconnect errors are non-fatal */ }
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
export function shortenAddress(address, chars = 4) {
  if (!address) return ''
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`
}

export function isValidSuiAddress(addr) {
  return typeof addr === 'string' && /^0x[0-9a-fA-F]{1,64}$/.test(addr)
}

/** Subscribe to new wallets registering via wallet-standard */
export function onWalletRegistered(callback) {
  if (typeof window === 'undefined') return () => {}
  const sources = [
    window['@mysten/wallet-standard']?.wallets,
    window['@wallet-standard/app']?.wallets,
    window.__wallets,
  ]
  const cleanups = []
  for (const src of sources) {
    if (!src?.on) continue
    try {
      const off = src.on('register', callback)
      if (typeof off === 'function') cleanups.push(off)
    } catch {}
  }
  // Also poll — for wallets that don't fire events
  let stopped = false
  let prev = detectAllWallets().length
  const iv = setInterval(() => {
    if (stopped) return
    const now = detectAllWallets().length
    if (now !== prev) { prev = now; callback() }
  }, 500)
  cleanups.push(() => { stopped = true; clearInterval(iv) })
  return () => cleanups.forEach(fn => fn())
}
