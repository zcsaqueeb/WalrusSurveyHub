import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, Plus, Menu, X,
  Wallet, LogOut, ChevronDown, Copy, ExternalLink, Globe, BookOpen
} from 'lucide-react'
import { useStoreData } from '../hooks/useStoreData.js'
import { setWallet } from '../store/useStore.js'
import { disconnectWallet, shortenAddress } from '../lib/sui.js'
import { useToast } from './Toast.jsx'
import LiveCounter from './LiveCounter.jsx'
import WalletModal from './WalletModal.jsx'

/* ── Real W logo mark using the provided PNG ── */
function WalrusLogoMark({ size = 36 }) {
  return (
    <img
      src="/walrus-w-logo.png"
      alt="WalrusForms"
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: '10px', objectFit: 'cover', display: 'block' }}
    />
  )
}

const NAV_LINKS = [
  { to: '/',          label: 'Home',      icon: Globe },
  { to: '/forms',     label: 'Forms',     icon: FileText },
  { to: '/guide',     label: 'Guide',     icon: BookOpen },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export default function Navbar() {
  const location  = useLocation()
  const toast     = useToast()
  const { wallet } = useStoreData()
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [scrolled, setScrolled]         = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setWalletMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!walletMenuOpen) return
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setWalletMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [walletMenuOpen])

  const handleConnected = (result) => { setWallet({ ...result }); toast(`${result.walletName} connected!`, 'success') }
  const handleDisconnect = async () => {
    await disconnectWallet(wallet?.walletId)
    setWallet({ address: null, connected: false, walletId: null, walletName: null })
    setWalletMenuOpen(false); toast('Wallet disconnected', 'info')
  }
  const handleCopyAddress = async () => {
    if (!wallet?.address) return
    await navigator.clipboard.writeText(wallet.address)
    toast('Address copied!', 'success'); setWalletMenuOpen(false)
  }

  const isLanding = location.pathname === '/'

  return (
    <>
      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} onConnected={handleConnected} />

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isLanding
          ? 'bg-ink-950/95 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/30'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <div className="absolute inset-0 rounded-xl bg-walrus-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <WalrusLogoMark size={36} />
              </motion.div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-white text-[15px] tracking-tight">WalrusForms</span>
                <span className="text-[10px] text-walrus-400 font-medium hidden sm:block tracking-wide">Decentralized Storage</span>
              </div>
            </Link>

            {/* Center nav — desktop */}
            <nav className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                return (
                  <Link key={to} to={to}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-walrus-300'
                        : 'text-ink-400 hover:text-white hover:bg-white/[0.07]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-walrus-500/12 border border-walrus-500/25 rounded-xl"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-2.5">
              <LiveCounter />

              <Link to="/builder"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-walrus-400 to-walrus-600 hover:from-walrus-300 hover:to-walrus-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-walrus-500/25 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                New Form
              </Link>

              {wallet?.connected ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setWalletMenuOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.10] text-sm font-medium text-white rounded-xl transition-all"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-walrus-400 to-ocean-500 flex-shrink-0" />
                    <span className="font-mono text-xs">{shortenAddress(wallet.address)}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-ink-400 transition-transform duration-200 ${walletMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {walletMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 z-20 w-56 bg-ink-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/[0.07]">
                          <p className="text-[10px] text-ink-500 mb-1 uppercase tracking-wider font-semibold">{wallet.walletName || 'Connected'}</p>
                          <p className="text-xs font-mono text-ink-200 truncate">{wallet.address}</p>
                        </div>
                        <div className="p-2">
                          <button onClick={handleCopyAddress} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors">
                            <Copy className="w-4 h-4" /> Copy address
                          </button>
                          <a href={`https://suiscan.xyz/mainnet/account/${wallet.address}`} target="_blank" rel="noopener noreferrer"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-300 hover:text-white hover:bg-white/[0.08] rounded-xl transition-colors">
                            <ExternalLink className="w-4 h-4" /> View on Suiscan
                          </a>
                          <button onClick={handleDisconnect} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coral-400 hover:bg-coral-500/10 rounded-xl transition-colors">
                            <LogOut className="w-4 h-4" /> Disconnect
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.10] text-sm font-medium text-white rounded-xl transition-all"
                >
                  <Wallet className="w-4 h-4 text-ink-400" />
                  Connect Wallet
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.08] text-ink-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                <motion.div key={mobileOpen ? 'x' : 'm'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/[0.06] bg-ink-950/98 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1.5">
                {NAV_LINKS.map(({ to, label, icon: Icon }) => {
                  const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                  return (
                    <Link key={to} to={to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-walrus-500/12 text-walrus-300 border border-walrus-500/25' : 'text-ink-300 hover:text-white hover:bg-white/[0.07]'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </Link>
                  )
                })}
                <Link to="/builder" className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-walrus-400 to-walrus-600 text-white text-sm font-semibold rounded-xl mt-1">
                  <Plus className="w-4 h-4" /> New Form
                </Link>
                <div className="pt-2 border-t border-white/[0.07]">
                  {wallet?.connected ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-walrus-400 to-ocean-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-ink-500 font-semibold uppercase tracking-wider">{wallet.walletName || 'Connected'}</p>
                          <p className="text-xs font-mono text-ink-300 truncate">{shortenAddress(wallet.address, 6)}</p>
                        </div>
                      </div>
                      <button onClick={handleCopyAddress} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-300 hover:text-white hover:bg-white/[0.07] rounded-xl transition-colors">
                        <Copy className="w-4 h-4" /> Copy Address
                      </button>
                      <button onClick={handleDisconnect} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-coral-400 hover:bg-coral-500/10 rounded-xl transition-colors">
                        <LogOut className="w-4 h-4" /> Disconnect Wallet
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setMobileOpen(false); setWalletModalOpen(true) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-white/[0.07] hover:bg-white/[0.12] rounded-xl transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-walrus-400" />
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
