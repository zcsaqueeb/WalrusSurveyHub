import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Wallet, ExternalLink, CheckCircle, Loader2,
  AlertCircle, RefreshCw, Wifi, WifiOff,
  Shield, Info, Search, ArrowRight
} from 'lucide-react'
import {
  WALLET_REGISTRY, detectAllWallets, detectWalletsWithRetry,
  connectWalletById, onWalletRegistered
} from '../lib/sui.js'

/* ── Wallet icon with emoji/image fallback ── */
function WalletIcon({ icon, iconFallback, name, size = 40 }) {
  const [err, setErr] = useState(false)
  const s = `${size}px`

  if (!err && icon && (icon.startsWith('data:') || icon.startsWith('http'))) {
    return (
      <img src={icon} alt={name} width={size} height={size} onError={() => setErr(true)}
        className="rounded-xl object-cover flex-shrink-0"
        style={{ width: s, height: s }} />
    )
  }
  const fallback = iconFallback || name?.[0]?.toUpperCase() || '?'
  return (
    <div className="rounded-xl bg-gradient-to-br from-walrus-500/20 to-walrus-700/10 border border-walrus-500/20 flex items-center justify-center flex-shrink-0 text-lg font-bold text-walrus-300 select-none"
      style={{ width: s, height: s }}>
      {fallback.length <= 2 ? fallback : fallback[0]}
    </div>
  )
}

/* ── Individual wallet row ── */
function WalletRow({ wallet, installed, loading, disabled, onClick, error }) {
  if (!installed) {
    return (
      <a href={wallet.installUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.10] transition-all group">
        <div className="opacity-50 group-hover:opacity-70 transition-opacity">
          <WalletIcon icon={wallet.icon} iconFallback={wallet.iconFallback} name={wallet.name} size={38} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-ink-500 group-hover:text-ink-300 transition-colors truncate">{wallet.name}</p>
          <p className="text-[10px] text-ink-700 font-medium">Not installed · Click to install</p>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-ink-700 group-hover:text-ink-500 transition-colors flex-shrink-0" />
      </a>
    )
  }

  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border transition-all active:scale-[0.98] text-left group ${
        error
          ? 'bg-coral-500/8 border-coral-500/25 hover:bg-coral-500/12'
          : loading
          ? 'bg-walrus-500/12 border-walrus-500/30 cursor-wait'
          : 'bg-walrus-500/8 border-walrus-500/20 hover:bg-walrus-500/15 hover:border-walrus-500/40 hover:shadow-lg hover:shadow-walrus-500/10'
      } disabled:cursor-not-allowed`}
    >
      <div className={`transition-opacity ${disabled && !loading ? 'opacity-50' : 'opacity-100'}`}>
        <WalletIcon icon={wallet.icon} iconFallback={wallet.iconFallback} name={wallet.name} size={40} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{wallet.name}</p>
          {wallet.source === 'standard' && (
            <span className="text-[9px] font-bold text-walrus-500 bg-walrus-500/10 px-1.5 py-0.5 rounded-full border border-walrus-500/20 flex-shrink-0">WS</span>
          )}
        </div>
        <p className={`text-[11px] font-medium mt-0.5 truncate ${error ? 'text-coral-400' : 'text-mint-500'}`}>
          {loading ? 'Connecting… approve in wallet' : error ? error : (wallet.description || 'Ready to connect')}
        </p>
      </div>
      {loading
        ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="w-4 h-4 text-walrus-400" />
          </motion.div>
        : error
        ? <AlertCircle className="w-4 h-4 text-coral-400 flex-shrink-0" />
        : <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.2 }}>
            <div className="w-2 h-2 rounded-full bg-mint-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </motion.div>
      }
    </button>
  )
}

/* ── Browser compatibility check ── */
function isSupportedBrowser() {
  if (typeof window === 'undefined') return false
  // Brave, Chrome, Firefox, Edge all support extensions
  // Safari on iOS/macOS has limited support
  const ua = navigator.userAgent
  const isChromium = !!(window.chrome || ua.includes('Chrome') || ua.includes('Chromium') || ua.includes('Edg') || ua.includes('Brave'))
  const isFirefox = ua.includes('Firefox')
  return isChromium || isFirefox
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/* ── Main Modal ── */
export default function WalletModal({ open, onClose, onConnected, requireConnect = false, reason = '' }) {
  const [available, setAvailable]     = useState([])
  const [connecting, setConnecting]   = useState(null)
  const [errors, setErrors]           = useState({})
  const [globalError, setGlobalError] = useState('')
  const [refreshing, setRefreshing]   = useState(false)
  const [search, setSearch]           = useState('')
  const [scanAttempts, setScanAttempts] = useState(0)
  const offRef = useRef(null)

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true)
    setGlobalError('')
    // Extended retry for slow-injecting extensions
    const found = await detectWalletsWithRetry(quiet ? 2000 : 3500, 250)
    setAvailable(found)
    setScanAttempts(a => a + 1)
    if (!quiet) setRefreshing(false)
  }, [])

  useEffect(() => {
    if (!open) return
    setConnecting(null); setErrors({}); setGlobalError(''); setSearch(''); setScanAttempts(0)
    refresh()
    offRef.current = onWalletRegistered(() => refresh(true))
    return () => { offRef.current?.(); offRef.current = null }
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape' && !requireConnect) onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, requireConnect, onClose])

  const handleConnect = async (walletId) => {
    setConnecting(walletId)
    setErrors(e => ({ ...e, [walletId]: '' }))
    setGlobalError('')
    try {
      const result = await connectWalletById(walletId)
      onConnected(result)
      onClose()
    } catch (err) {
      const msg = err.message || 'Connection failed'
      setErrors(e => ({ ...e, [walletId]: msg }))
      if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('cancelled') || msg.toLowerCase().includes('cancel')) {
        setGlobalError('Connection cancelled. Please approve the request in your wallet extension.')
      }
    } finally {
      setConnecting(null)
    }
  }

  const availableIds = new Set(available.map(w => w.id))
  const notInstalled = WALLET_REGISTRY.filter(r => !availableIds.has(r.id))

  const filteredAvailable = search
    ? available.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
    : available
  const filteredNotInstalled = search
    ? notInstalled.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    : notInstalled

  const mobile = isMobile()
  const goodBrowser = isSupportedBrowser()
  const noWalletsFound = !refreshing && filteredAvailable.length === 0 && !search

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

          {/* Backdrop */}
          <motion.div className="absolute inset-0 bg-ink-950/85 backdrop-blur-md"
            onClick={requireConnect ? undefined : onClose} />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="relative w-full max-w-sm bg-ink-900 border border-white/[0.10] rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className="h-0.5 bg-gradient-to-r from-walrus-500 via-walrus-400 to-ocean-400" />

            {/* Drag handle mobile */}
            <div className="flex justify-center pt-3 pb-0.5 sm:hidden">
              <div className="w-10 h-1 bg-white/15 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-walrus-500/15 border border-walrus-500/25 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-walrus-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight">
                    {requireConnect ? 'Connect to Submit' : 'Connect Wallet'}
                  </h2>
                  <p className="text-[11px] text-ink-500">
                    {requireConnect ? 'A Sui wallet is required' : 'Choose your Sui wallet'}
                  </p>
                </div>
              </div>
              {!requireConnect && (
                <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-ink-500 hover:text-white hover:bg-white/8 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Reason banner */}
            {reason && (
              <div className="mx-5 mb-4 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl flex gap-2.5">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200 leading-relaxed">{reason}</p>
              </div>
            )}

            {/* Mobile / unsupported browser warning */}
            {mobile && (
              <div className="mx-5 mb-3 p-3 bg-blue-500/8 border border-blue-500/20 rounded-xl flex gap-2.5">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-200 leading-relaxed font-semibold">Mobile detected</p>
                  <p className="text-[11px] text-blue-300/70 mt-0.5">Use the Slush or Nightly mobile app and open this page from their built-in browser for best results.</p>
                </div>
              </div>
            )}

            {!goodBrowser && !mobile && (
              <div className="mx-5 mb-3 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl flex gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200 leading-relaxed">Wallet extensions work best in Chrome, Brave, or Firefox. Please switch browsers if wallets aren't detected.</p>
              </div>
            )}

            {/* Search — show if ≥ 3 wallets */}
            {(available.length + notInstalled.length) >= 3 && (
              <div className="px-5 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-600 pointer-events-none" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search wallets…"
                    className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-ink-600 focus:outline-none focus:ring-1 focus:ring-walrus-500/40 focus:border-walrus-500/40 transition-all" />
                </div>
              </div>
            )}

            <div className="px-5 pb-5 space-y-3 max-h-[70vh] overflow-y-auto custom-scroll">

              {/* Global error */}
              <AnimatePresence>
                {globalError && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 p-3 bg-coral-500/10 border border-coral-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-coral-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-coral-300 leading-relaxed">{globalError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading state */}
              {refreshing && (
                <div className="flex items-center justify-center py-6 gap-2 text-ink-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Scanning for wallets…</span>
                </div>
              )}

              {/* Detected wallets */}
              {!refreshing && filteredAvailable.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-mint-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                      <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">
                        Detected ({filteredAvailable.length})
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-white/[0.05]" />
                  </div>
                  {filteredAvailable.map(wallet => (
                    <WalletRow key={wallet.id} wallet={wallet} installed
                      loading={connecting === wallet.id}
                      disabled={!!connecting}
                      error={errors[wallet.id] || ''}
                      onClick={() => handleConnect(wallet.id)}
                    />
                  ))}
                </div>
              )}

              {/* No wallets empty state */}
              {noWalletsFound && (
                <div className="text-center py-5">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-walrus-500/10 border border-walrus-500/20 flex items-center justify-center">
                    <WifiOff className="w-5 h-5 text-walrus-500" />
                  </div>
                  <p className="text-sm font-semibold text-ink-400 mb-1">No wallets detected</p>
                  {scanAttempts > 1 ? (
                    <div className="text-xs text-ink-600 mb-3 max-w-[240px] mx-auto space-y-1.5 text-left bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                      <p className="font-semibold text-ink-500 mb-1">Troubleshooting:</p>
                      <p>1. Install a Sui wallet (Slush, Suiet, or Nightly)</p>
                      <p>2. Pin the extension in your browser toolbar</p>
                      <p>3. Unlock the wallet and set it to Sui Mainnet</p>
                      <p>4. <strong className="text-walrus-400">Refresh this page</strong> after installing</p>
                      {!goodBrowser && <p>5. Use Chrome or Brave for best compatibility</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-600 mb-3 max-w-[220px] mx-auto">
                      Install a Sui wallet extension and refresh this page.
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => refresh()} disabled={refreshing}
                      className="inline-flex items-center gap-1.5 text-xs text-walrus-400 hover:text-walrus-300 font-medium transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" /> Scan again
                    </button>
                    <span className="text-ink-700">·</span>
                    <button onClick={() => window.location.reload()}
                      className="inline-flex items-center gap-1.5 text-xs text-ocean-400 hover:text-ocean-300 font-medium transition-colors">
                      Reload page
                    </button>
                  </div>
                </div>
              )}

              {/* Not installed */}
              {!refreshing && filteredNotInstalled.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <p className="text-[10px] font-bold text-ink-600 uppercase tracking-widest whitespace-nowrap">
                      {filteredAvailable.length > 0 ? 'Install more' : 'Install a wallet'}
                    </p>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                  </div>
                  {filteredNotInstalled.map(reg => (
                    <WalletRow key={reg.id}
                      wallet={{ id: reg.id, name: reg.name, icon: reg.icon, iconFallback: reg.iconFallback, installUrl: reg.installUrl, description: reg.description }}
                      installed={false} loading={false} disabled={!!connecting}
                    />
                  ))}
                </div>
              )}

              {/* Refresh button */}
              <button onClick={() => refresh()} disabled={refreshing}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-ink-600 hover:text-ink-400 transition-colors disabled:opacity-50 rounded-xl hover:bg-white/[0.03]">
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Scanning…' : 'Refresh wallet list'}
              </button>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-white/[0.05] bg-ink-950/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-ink-600">
                <Shield className="w-3 h-3" />
                <span>Non-custodial · Your keys only</span>
              </div>
              <a href="https://slush.app" target="_blank" rel="noopener noreferrer"
                className="text-xs text-walrus-500 hover:text-walrus-400 font-medium transition-colors flex items-center gap-1">
                Get Slush <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
