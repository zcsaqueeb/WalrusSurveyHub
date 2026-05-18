import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Search, Download, Trash2, Shield, Database,
  MessageSquare, TrendingUp, CheckCircle, AlertCircle, FileText,
  BarChart3, Globe, Filter, X, Eye, EyeOff, Lock, LogOut,
  ChevronUp, ChevronDown, ArrowUpDown, Star, RefreshCw,
  Inbox, Clock, Flame, AlertTriangle, SlidersHorizontal,
  Users, Copy, ExternalLink, ChevronLeft, ChevronRight,
  Wallet, Package, Edit2, Image, FileVideo,
  ZoomIn, Play, Link as LinkIcon, ImageOff, Loader2
} from 'lucide-react'
import { useStoreData } from '../hooks/useStoreData.js'
import { updateSubmission, deleteSubmission, exportSubmissionsCSV } from '../store/useStore.js'
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/StatusBadge.jsx'
import WalrusBadge from '../components/WalrusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import { formatBlobId, getWalrusBlobUrl } from '../lib/walrus.js'
import { shortenAddress } from '../lib/sui.js'

/* ── Admin password config ───────────────────────────────────────────────────
   Change this to any string, or read from import.meta.env.VITE_ADMIN_PASSWORD.
   In production, set VITE_ADMIN_PASSWORD in your .env file.
─────────────────────────────────────────────────────────────────────────── */
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'walrus2025'
const STATUSES   = ['all', 'open', 'in-review', 'resolved', 'closed']
const PRIORITIES = ['all', 'critical', 'high', 'medium', 'low']
const STATUS_LABELS   = { open: 'Open', 'in-review': 'In Review', resolved: 'Resolved', closed: 'Closed' }
const PRIORITY_LABELS = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }
const PRIORITY_COLORS = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  high:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
  medium:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low:      'text-ink-400 bg-ink-700/30 border-ink-600/30',
}
const PRIORITY_ICONS = { critical: Flame, high: AlertTriangle, medium: AlertCircle, low: CheckCircle }
const STATUS_COLORS  = {
  open:       'text-ocean-400 bg-ocean-500/10 border-ocean-500/20',
  'in-review':'text-amber-400 bg-amber-500/10 border-amber-500/20',
  resolved:   'text-mint-400 bg-mint-500/10 border-mint-500/20',
  closed:     'text-ink-500 bg-ink-700/30 border-ink-600/30',
}
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function fmtDate(iso)     { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
function fmtTime(iso)     { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
function fmtRelative(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/* ─── Admin Login Gate ────────────────────────────────────────────────── */
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState(''); const [show, setShow] = useState(false)
  const [error, setError] = useState(''); const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    await new Promise(r => setTimeout(r, 350))
    if (pw === ADMIN_PASSWORD) { onLogin() }
    else { setError('Incorrect password. Try again.'); setShake(true); setTimeout(() => setShake(false), 600); setPw('') }
    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute w-96 h-96 bg-walrus-500/8 rounded-full blur-3xl -top-20 -left-20"
          animate={{ scale: [1,1.1,1], opacity: [0.4,0.6,0.4] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute w-80 h-80 bg-ocean-500/6 rounded-full blur-3xl top-1/2 -right-20"
          animate={{ scale: [1,1.15,1], opacity: [0.3,0.5,0.3] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} />
      </div>
      <motion.div initial={{ opacity:0, y:30, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ type:'spring', stiffness:260, damping:24 }} className="relative w-full max-w-sm">
        <motion.div animate={shake ? { x:[-10,10,-8,8,-5,5,-3,3,0] } : {}} transition={{ duration:0.5 }}
          className="bg-ink-900/95 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
          <div className="flex justify-center mb-6">
            <motion.div className="w-16 h-16 rounded-2xl bg-walrus-500/15 border border-walrus-500/30 flex items-center justify-center animate-pulse-ring">
              <Lock className="w-7 h-7 text-walrus-400" />
            </motion.div>
          </div>
          <h1 className="text-xl font-black text-white text-center mb-1">Admin Dashboard</h1>
          <p className="text-sm text-ink-500 text-center mb-8">Enter admin password to continue</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={pw}
                onChange={e => { setPw(e.target.value); setError('') }}
                placeholder="Admin password" autoFocus disabled={loading}
                className="input-dark text-sm pr-11 w-full disabled:opacity-60" />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.p key="err" initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="text-xs text-coral-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
                </motion.p>
              )}
            </AnimatePresence>
            <button type="submit" disabled={loading || !pw}
              className="btn-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <><motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate:360 }} transition={{ duration:0.8, repeat:Infinity, ease:'linear' }} /> Verifying…</> : <><Lock className="w-4 h-4" /> Access Dashboard</>}
            </button>
          </form>
          <p className="text-center text-xs text-ink-600 mt-5">
            Default password:{' '}
            <code className="text-walrus-400 font-mono bg-walrus-500/10 px-1.5 py-0.5 rounded">walrus2025</code>
          </p>
          <p className="text-center text-[11px] text-ink-700 mt-2 leading-relaxed">
            Set <code className="text-ink-500 font-mono">VITE_ADMIN_PASSWORD</code> in <code className="text-ink-500 font-mono">.env</code> to change.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ─── Media Lightbox ────────────────────────────────────────────────────── */
function MediaLightbox({ src, type, name, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.85, opacity:0 }}
        transition={{ type:'spring', stiffness:300, damping:28 }}
        className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          {name && <p className="text-sm text-white/60 truncate max-w-xs font-medium">{name}</p>}
          <button onClick={onClose}
            className="ml-auto flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm bg-white/10 px-3 py-1.5 rounded-xl">
            <X className="w-4 h-4" /> Close (Esc)
          </button>
        </div>
        {type === 'video'
          ? <video src={src} className="w-full max-h-[80vh] rounded-2xl shadow-2xl" controls autoPlay />
          : <img src={src} alt={name} className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
        }
        <a href={src} target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-walrus-400 hover:text-walrus-300 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
        </a>
      </motion.div>
    </motion.div>
  )
}

/* ─── Fixed Media Thumbnail ─────────────────────────────────────────────── */
function MediaThumb({ blobId, preview, name, isVideo, onOpen }) {
  const [status, setStatus] = useState('loading') // loading | ok | error
  const [attempt, setAttempt] = useState(0)

  // Build src from blobId (primary) or preview fallback
  const AGGREGATORS = [
    'https://aggregator.walrus.space',
    'https://wal-aggregator-mainnet.nodeinfra.com',
    'https://walrus-aggregator.nodes.guru',
    'https://aggregator.walrus.mirai.cloud',
  ]
  const aggIdx = Math.min(attempt, AGGREGATORS.length - 1)
  const src = blobId ? `${AGGREGATORS[aggIdx]}/v1/blobs/${blobId}` : (preview || null)

  useEffect(() => { if (src) setStatus('loading') }, [src])

  if (!src) return (
    <div className="w-full h-36 rounded-xl bg-ink-800 border border-white/10 flex flex-col items-center justify-center gap-2 text-ink-600">
      <ImageOff className="w-6 h-6" />
      <span className="text-xs">No media URL</span>
    </div>
  )

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-ink-900 max-w-xs cursor-pointer group" onClick={onOpen}>
      {/* Loading indicator */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-900 z-10">
          <Loader2 className="w-6 h-6 text-walrus-400 animate-spin" />
        </div>
      )}
      {/* Error state */}
      {status === 'error' && (
        <div className="w-full h-36 flex flex-col items-center justify-center gap-2 text-ink-600">
          <ImageOff className="w-6 h-6" />
          <span className="text-xs">Failed to load</span>
          {attempt < AGGREGATORS.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setAttempt(a => a + 1) }}
              className="text-xs text-walrus-400 hover:text-walrus-300 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Try another node
            </button>
          )}
          {blobId && (
            <a href={`${AGGREGATORS[0]}/v1/blobs/${blobId}`} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-xs text-walrus-400 hover:text-walrus-300 flex items-center gap-1 mt-1">
              <ExternalLink className="w-3 h-3" /> Open directly
            </a>
          )}
        </div>
      )}
      {/* Media element */}
      {isVideo ? (
        <video src={src} className={`w-full h-36 object-cover transition-opacity ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
          preload="metadata" muted playsInline
          onLoadedMetadata={() => setStatus('ok')}
          onError={() => { if (attempt < AGGREGATORS.length - 1) { setAttempt(a => a + 1) } else { setStatus('error') } }} />
      ) : (
        <img src={src} alt={name || 'Image'} className={`w-full h-36 object-cover transition-opacity ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setStatus('ok')}
          onError={() => { if (attempt < AGGREGATORS.length - 1) { setAttempt(a => a + 1) } else { setStatus('error') } }} />
      )}
      {/* Hover overlay */}
      {status === 'ok' && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
          <motion.div initial={{ opacity:0, scale:0.7 }} whileHover={{ scale:1.1 }}
            className="opacity-0 group-hover:opacity-100 w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            {isVideo ? <Play className="w-5 h-5 text-white ml-0.5" /> : <ZoomIn className="w-5 h-5 text-white" />}
          </motion.div>
        </div>
      )}
    </div>
  )
}

/* ─── Field Value Display ───────────────────────────────────────────────── */
function FieldValueDisplay({ fieldType, value }) {
  const [lightbox, setLightbox] = useState(null)
  if (value === null || value === undefined || value === '') {
    return <span className="text-ink-600 text-xs italic">—</span>
  }
  const isImgObj   = typeof value === 'object' && value?.blobId && !value?.isVideo
  const isVideoObj = typeof value === 'object' && value?.isVideo

  if (fieldType === 'screenshot' || isImgObj) {
    const blobId  = value?.blobId || null
    const preview = value?.preview || value?.walrusUrl || null
    return (
      <>
        <AnimatePresence>
          {lightbox && (
            <MediaLightbox src={lightbox.src} type="image" name={value?.name} onClose={() => setLightbox(null)} />
          )}
        </AnimatePresence>
        <div className="space-y-2">
          <MediaThumb blobId={blobId} preview={preview} name={value?.name} isVideo={false}
            onOpen={() => {
              const src = blobId ? `https://aggregator.walrus.space/v1/blobs/${blobId}` : preview
              if (src) setLightbox({ src })
            }} />
          <div className="flex flex-wrap gap-2 text-xs text-ink-500">
            {value?.name && <span className="truncate max-w-[200px]">{value.name}</span>}
            {blobId && (
              <a href={`https://aggregator.walrus.space/v1/blobs/${blobId}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-walrus-400 hover:text-walrus-300 transition-colors">
                <Database className="w-3 h-3" />{blobId.slice(0, 12)}…
              </a>
            )}
            {value?.localOnly && <span className="text-amber-400 text-[10px]">local only</span>}
          </div>
        </div>
      </>
    )
  }

  if (fieldType === 'video' || isVideoObj) {
    const blobId  = value?.blobId || null
    const preview = value?.preview || value?.walrusUrl || null
    return (
      <>
        <AnimatePresence>
          {lightbox && (
            <MediaLightbox src={lightbox.src} type="video" name={value?.name} onClose={() => setLightbox(null)} />
          )}
        </AnimatePresence>
        <div className="space-y-2">
          <MediaThumb blobId={blobId} preview={preview} name={value?.name} isVideo
            onOpen={() => {
              const src = blobId ? `https://aggregator.walrus.space/v1/blobs/${blobId}` : preview
              if (src) setLightbox({ src })
            }} />
          <div className="flex flex-wrap gap-2 text-xs text-ink-500">
            {value?.name && <span className="truncate max-w-[200px]">{value.name}</span>}
            {blobId && (
              <a href={`https://aggregator.walrus.space/v1/blobs/${blobId}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-walrus-400 hover:text-walrus-300 transition-colors">
                <Database className="w-3 h-3" />{blobId.slice(0, 12)}…
              </a>
            )}
          </div>
        </div>
      </>
    )
  }

  if (fieldType === 'rating' || (typeof value === 'number' && value >= 0 && value <= 5)) {
    const stars = typeof value === 'number' ? value : parseInt(value) || 0
    return (
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-4 h-4 ${i <= stars ? 'text-amber-400 fill-amber-400' : 'text-ink-700'}`} />
        ))}
        <span className="text-xs text-ink-400 ml-1">{stars}/5</span>
      </div>
    )
  }

  if (fieldType === 'checkbox' || typeof value === 'boolean') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${value ? 'text-mint-400' : 'text-ink-500'}`}>
        {value ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
        {value ? 'Yes' : 'No'}
      </span>
    )
  }

  if (fieldType === 'url' || (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')))) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-ocean-400 hover:text-ocean-300 transition-colors max-w-xs truncate">
        <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{value}</span>
        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />
      </a>
    )
  }

  if (fieldType === 'richtext') {
    return <p className="text-sm text-ink-300 whitespace-pre-wrap leading-relaxed max-w-sm">{value}</p>
  }

  // Catch-all: any object with blobId that wasn't caught by fieldType checks above
  if (typeof value === 'object' && value !== null && value?.blobId) {
    const blobId  = value.blobId
    const preview = value?.preview || value?.walrusUrl || null
    const isVid   = value?.isVideo || fieldType === 'video'
    const blobSrc = blobId ? `https://aggregator.walrus.space/v1/blobs/${blobId}` : preview
    return (
      <>
        <AnimatePresence>
          {lightbox && (
            <MediaLightbox src={lightbox.src} type={isVid ? 'video' : 'image'} name={value?.name} onClose={() => setLightbox(null)} />
          )}
        </AnimatePresence>
        <div className="space-y-2">
          <MediaThumb blobId={blobId} preview={preview} name={value?.name} isVideo={isVid}
            onOpen={() => { if (blobSrc) setLightbox({ src: blobSrc }) }} />
          <div className="flex flex-wrap gap-2 text-xs text-ink-500">
            {value?.name && <span className="truncate max-w-[200px]">{value.name}</span>}
            {blobId && (
              <a href={`https://aggregator.walrus.space/v1/blobs/${blobId}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-walrus-400 hover:text-walrus-300 transition-colors">
                <Database className="w-3 h-3" />{blobId.slice(0, 12)}…
              </a>
            )}
          </div>
        </div>
      </>
    )
  }

  // If it's any other object, show nothing useful
  if (typeof value === 'object' && value !== null) {
    return <span className="text-ink-600 text-xs italic">—</span>
  }

  return <span className="text-sm text-ink-200 break-words">{String(value)}</span>
}

/* ─── Animated Count ────────────────────────────────────────────────────── */
function AnimatedCount({ value }) {
  const [displayed, setDisplayed] = useState(value)
  useEffect(() => {
    if (displayed === value) return
    const diff = value - displayed
    const steps = Math.min(Math.abs(diff), 12)
    let cur = 0
    const iv = setInterval(() => {
      cur++
      setDisplayed(prev => { const n = Math.round(prev + diff / steps); return cur >= steps ? value : n })
      if (cur >= steps) clearInterval(iv)
    }, 35)
    return () => clearInterval(iv)
  }, [value])
  return <>{displayed}</>
}

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color = 'walrus', onClick, active }) {
  const map = {
    walrus: { icon: 'text-walrus-400 bg-walrus-500/10 border-walrus-500/20', active: 'bg-walrus-500/12 border-walrus-500/40 shadow-lg shadow-walrus-500/10' },
    ocean:  { icon: 'text-ocean-400 bg-ocean-500/10 border-ocean-500/20',   active: 'bg-ocean-500/12 border-ocean-500/40 shadow-lg shadow-ocean-500/10' },
    amber:  { icon: 'text-amber-400 bg-amber-500/10 border-amber-500/20',   active: 'bg-amber-500/12 border-amber-500/40 shadow-lg shadow-amber-500/10' },
    coral:  { icon: 'text-coral-400 bg-coral-500/10 border-coral-500/20',   active: 'bg-coral-500/12 border-coral-500/40 shadow-lg shadow-coral-500/10' },
    mint:   { icon: 'text-mint-400 bg-mint-500/10 border-mint-500/20',      active: 'bg-mint-500/12 border-mint-500/40 shadow-lg shadow-mint-500/10' },
  }
  const c = map[color] || map.walrus
  return (
    <motion.button whileHover={{ y:-3, scale:1.01 }} whileTap={{ scale:0.96 }} onClick={onClick}
      transition={{ type:'spring', stiffness:400, damping:22 }}
      className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
        active ? c.active : 'bg-ink-900/60 border-white/[0.07] hover:border-white/15 hover:bg-ink-900/80'
      }`}>
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${c.icon}`}>
        <Icon className="w-5 h-5" />
      </div>
      <motion.p key={value} initial={{ scale:0.7, opacity:0.3 }} animate={{ scale:1, opacity:1 }}
        transition={{ type:'spring', stiffness:500, damping:25 }}
        className="text-2xl font-black text-white mb-0.5 tabular-nums">
        <AnimatedCount value={value} />
      </motion.p>
      <p className="text-xs font-semibold text-ink-400">{label}</p>
    </motion.button>
  )
}

/* ─── Submission Detail Drawer ──────────────────────────────────────────── */
function SubmissionDrawer({ sub, forms, onClose, onUpdateStatus, onUpdatePriority, onAddNote, onDelete }) {
  const [note, setNote]           = useState(sub.notes || '')
  const [editingNote, setEditingNote] = useState(false)
  const form = forms.find(f => f.id === sub.formId)

  const fieldsMap = useMemo(() => {
    const m = {}
    if (form?.fields) form.fields.forEach(f => { m[f.id] = f })
    return m
  }, [form])

  const getFieldType  = (key) => {
    if (fieldsMap[key]) return fieldsMap[key].type
    if (form?.fields) {
      const match = form.fields.find(f => f.id === key)
      if (match) return match.type
    }
    return null
  }
  const getFieldLabel = (key) => {
    if (fieldsMap[key]) return fieldsMap[key].label
    if (form?.fields) {
      const match = form.fields.find(f => f.id === key)
      if (match) return match.label
    }
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  const dataEntries = Object.entries(sub.data || {})

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
        transition={{ type:'spring', stiffness:320, damping:32 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-ink-900 border-l border-white/[0.08] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0 bg-ink-900/90 backdrop-blur">
          <div>
            <h2 className="font-bold text-white text-sm">Submission Detail</h2>
            <p className="text-xs text-ink-500 mt-0.5 font-mono">{sub.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale:0.95 }} onClick={() => onDelete(sub.id)}
              className="w-8 h-8 flex items-center justify-center text-ink-500 hover:text-coral-400 rounded-lg hover:bg-coral-500/10 transition-colors">
              <Trash2 className="w-4 h-4" />
            </motion.button>
            <motion.button whileTap={{ scale:0.95 }} onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-ink-500 hover:text-white rounded-lg hover:bg-white/8 transition-colors">
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll">
          {/* Meta */}
          <div className="p-5 border-b border-white/[0.06] bg-ink-950/30">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-ink-800/60 rounded-xl p-3">
                <p className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold mb-1">Form</p>
                <p className="text-sm text-white font-medium truncate">{form?.title || sub.formTitle}</p>
              </div>
              <div className="bg-ink-800/60 rounded-xl p-3">
                <p className="text-[10px] text-ink-500 uppercase tracking-wider font-semibold mb-1">Submitted</p>
                <p className="text-sm text-white">{fmtDate(sub.submittedAt)}</p>
                <p className="text-[11px] text-ink-500">{fmtTime(sub.submittedAt)}</p>
              </div>
            </div>
            {sub.walletAddress && (
              <div className="flex items-center gap-2 p-2.5 bg-walrus-500/5 border border-walrus-500/15 rounded-xl">
                <Wallet className="w-3.5 h-3.5 text-walrus-400 flex-shrink-0" />
                <p className="text-xs font-mono text-walrus-300 truncate flex-1">{sub.walletAddress}</p>
                <a href={`https://suiscan.xyz/mainnet/account/${sub.walletAddress}`} target="_blank" rel="noopener noreferrer"
                  className="text-ink-500 hover:text-walrus-400 transition-colors flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Status + Priority */}
          <div className="p-5 border-b border-white/[0.06]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-2">Status</label>
                <div className="flex flex-col gap-1.5">
                  {STATUSES.filter(s => s !== 'all').map(s => (
                    <motion.button key={s} whileTap={{ scale:0.97 }} onClick={() => onUpdateStatus(sub.id, s)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left ${
                        sub.status === s ? STATUS_COLORS[s] : 'text-ink-500 border-transparent hover:bg-white/5 hover:text-ink-300'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        s==='open'?'bg-ocean-400':s==='in-review'?'bg-amber-400':s==='resolved'?'bg-mint-400':'bg-ink-600'
                      }`} />
                      {STATUS_LABELS[s]}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-2">Priority</label>
                <div className="flex flex-col gap-1.5">
                  {PRIORITIES.filter(p => p !== 'all').map(p => {
                    const PIcon = PRIORITY_ICONS[p]
                    return (
                      <motion.button key={p} whileTap={{ scale:0.97 }} onClick={() => onUpdatePriority(sub.id, p)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all text-left ${
                          sub.priority === p ? PRIORITY_COLORS[p] : 'text-ink-500 border-transparent hover:bg-white/5 hover:text-ink-300'
                        }`}>
                        <PIcon className="w-3 h-3 flex-shrink-0" />{PRIORITY_LABELS[p]}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Walrus Blob */}
          {sub.walrusBlobId && (
            <div className="px-5 py-3.5 border-b border-white/[0.06]">
              <label className="block text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-2">Walrus Blob</label>
              <div className="flex items-center gap-2 p-2.5 bg-walrus-500/5 border border-walrus-500/15 rounded-xl">
                <Database className="w-3.5 h-3.5 text-walrus-400 flex-shrink-0" />
                <p className="text-xs font-mono text-walrus-300 flex-1 truncate">{sub.walrusBlobId}</p>
                <a href={`https://aggregator.walrus.space/v1/blobs/${sub.walrusBlobId}`} target="_blank" rel="noopener noreferrer"
                  className="text-ink-500 hover:text-walrus-400 transition-colors flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Submission Data */}
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-4">
              Submission Data ({dataEntries.length} field{dataEntries.length !== 1 ? 's' : ''})
            </h3>
            {dataEntries.length === 0 ? (
              <p className="text-xs text-ink-600 italic">No data submitted</p>
            ) : (
              <div className="space-y-5">
                {dataEntries.map(([key, value]) => {
                  const fieldType = getFieldType(key)
                  const label     = getFieldLabel(key)
                  // Derive media flag & effective fieldType
                  const isObjWithBlob = typeof value === 'object' && value !== null && value?.blobId
                  const effectiveType = fieldType ||
                    (isObjWithBlob && value?.isVideo ? 'video' : isObjWithBlob ? 'screenshot' : null)
                  const isMedia   = effectiveType === 'screenshot' || effectiveType === 'video' || isObjWithBlob
                  return (
                    <motion.div key={key} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.05 }}
                      className={isMedia ? 'space-y-1.5' : 'flex items-start gap-3'}>
                      {isMedia ? (
                        <>
                          <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">{label}</p>
                          <FieldValueDisplay fieldType={effectiveType} value={value} />
                        </>
                      ) : (
                        <>
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-walrus-500/50 mt-1.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider mb-1">{label}</p>
                            <FieldValueDisplay fieldType={effectiveType} value={value} />
                          </div>
                        </>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">Admin Notes</label>
              {!editingNote && (
                <button onClick={() => setEditingNote(true)} className="text-xs text-walrus-400 hover:text-walrus-300 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              )}
            </div>
            <AnimatePresence mode="wait">
              {editingNote ? (
                <motion.div key="edit" initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-2">
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
                    placeholder="Add private admin notes…"
                    className="w-full px-3 py-2.5 bg-ink-800 border border-white/10 rounded-xl text-sm text-white placeholder-ink-600 focus:outline-none focus:ring-2 focus:ring-walrus-500/30 resize-none" />
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale:0.97 }} onClick={() => { onAddNote(sub.id, note); setEditingNote(false) }}
                      className="flex-1 py-1.5 bg-gradient-to-br from-walrus-400 to-walrus-600 text-white text-xs font-semibold rounded-lg">
                      Save
                    </motion.button>
                    <motion.button whileTap={{ scale:0.97 }} onClick={() => { setNote(sub.notes || ''); setEditingNote(false) }}
                      className="flex-1 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-400 text-xs font-semibold rounded-lg transition-colors">
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="view" initial={{ opacity:0 }} animate={{ opacity:1 }}
                  onClick={() => setEditingNote(true)}
                  className="min-h-[60px] p-3 bg-ink-800/50 border border-white/[0.06] rounded-xl cursor-pointer hover:bg-ink-800 transition-colors">
                  {note
                    ? <p className="text-sm text-ink-300 whitespace-pre-wrap">{note}</p>
                    : <p className="text-xs text-ink-600 italic">Click to add notes…</p>
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Main Dashboard ─────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { forms, submissions } = useStoreData()
  const toast = useToast()

  const [isAdmin, setIsAdmin] = useState(() => {
    try { return sessionStorage.getItem('wf_admin') === '1' } catch { return false }
  })
  const [selectedId, setSelectedId]         = useState(null)
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [formFilter, setFormFilter]         = useState('all')
  const [sortField, setSortField]           = useState('submittedAt')
  const [sortDir, setSortDir]               = useState('desc')
  const [page, setPage]                     = useState(1)
  const [pageSize, setPageSize]             = useState(25)
  const [showFilters, setShowFilters]       = useState(false)

  const handleLogin = useCallback(() => {
    try { sessionStorage.setItem('wf_admin', '1') } catch {}
    setIsAdmin(true)
  }, [])
  const handleLogout = useCallback(() => {
    try { sessionStorage.removeItem('wf_admin') } catch {}
    setIsAdmin(false); setSelectedId(null)
  }, [])

  const filtered = useMemo(() => {
    if (!isAdmin) return []
    let list = [...submissions]
    if (statusFilter !== 'all')   list = list.filter(s => s.status === statusFilter)
    if (priorityFilter !== 'all') list = list.filter(s => s.priority === priorityFilter)
    if (formFilter !== 'all')     list = list.filter(s => s.formId === formFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.formTitle?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q) ||
        s.walletAddress?.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q) ||
        Object.values(s.data || {}).some(v => typeof v === 'string' && v.toLowerCase().includes(q))
      )
    }
    list.sort((a, b) => {
      let av = a[sortField], bv = b[sortField]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    return list
  }, [isAdmin, submissions, statusFilter, priorityFilter, formFilter, search, sortField, sortDir])

  const stats = useMemo(() => ({
    total:    submissions.length,
    open:     submissions.filter(s => s.status === 'open').length,
    inReview: submissions.filter(s => s.status === 'in-review').length,
    critical: submissions.filter(s => s.priority === 'critical').length,
  }), [submissions])

  const selectedSub = useMemo(() => submissions.find(s => s.id === selectedId), [submissions, selectedId])

  if (!isAdmin) return <AdminLogin onLogin={handleLogin} />

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
    setPage(1)
  }
  const handleUpdateStatus   = (id, s) => { updateSubmission(id, { status: s });   toast(`Status → ${STATUS_LABELS[s]}`, 'success') }
  const handleUpdatePriority = (id, p) => { updateSubmission(id, { priority: p }); toast(`Priority → ${PRIORITY_LABELS[p]}`, 'success') }
  const handleAddNote        = (id, n) => { updateSubmission(id, { notes: n });    toast('Note saved', 'success') }
  const handleDelete = (id) => {
    if (!window.confirm('Delete this submission? This cannot be undone.')) return
    deleteSubmission(id); if (selectedId === id) setSelectedId(null)
    toast('Submission deleted', 'success')
  }
  const handleExport = () => {
    const csv = exportSubmissionsCSV(formFilter !== 'all' ? formFilter : null)
    if (!csv) { toast('No submissions to export', 'warning'); return }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `walrusforms_${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url); toast('CSV exported!', 'success')
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-ink-600" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-walrus-400" /> : <ChevronDown className="w-3 h-3 text-walrus-400" />
  }

  return (
    <div className="min-h-screen bg-ink-950 pb-16 pt-16">
      <div className="max-w-screen-xl mx-auto px-4 pt-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-walrus-400/20 to-walrus-600/10 border border-walrus-500/30 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-walrus-400" />
              </div>
              <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-ink-500 ml-11">Manage all submissions across your forms</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale:0.97 }} onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-sm font-medium text-white rounded-xl transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </motion.button>
            <motion.button whileTap={{ scale:0.97 }} onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-coral-500/10 hover:bg-coral-500/20 border border-coral-500/20 text-sm font-medium text-coral-400 rounded-xl transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total Submissions', value:stats.total,    icon:Inbox, color:'walrus',
              filter:()=>{ setStatusFilter('all'); setPriorityFilter('all'); setSearch(''); setFormFilter('all'); setPage(1) },
              active: statusFilter==='all' && priorityFilter==='all' && !search },
            { label:'Open', value:stats.open, icon:Globe, color:'ocean',
              filter:()=>{ setStatusFilter('open'); setPriorityFilter('all'); setPage(1) },
              active: statusFilter==='open' && priorityFilter==='all' },
            { label:'In Review', value:stats.inReview, icon:Clock, color:'amber',
              filter:()=>{ setStatusFilter('in-review'); setPriorityFilter('all'); setPage(1) },
              active: statusFilter==='in-review' && priorityFilter==='all' },
            { label:'Critical', value:stats.critical, icon:Flame, color:'coral',
              filter:()=>{ setPriorityFilter('critical'); setStatusFilter('all'); setPage(1) },
              active: priorityFilter==='critical' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
              <StatCard label={s.label} value={s.value} icon={s.icon} color={s.color} onClick={s.filter} active={s.active} />
            </motion.div>
          ))}
        </div>

        {/* Search + filter bar */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
          className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search submissions…" className="input-dark pl-9 text-sm w-full" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <motion.button whileTap={{ scale:0.97 }} onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm font-medium transition-all ${
              showFilters ? 'bg-walrus-500/15 border-walrus-500/30 text-walrus-300' : 'bg-ink-900/60 border-white/[0.07] text-ink-400 hover:text-white'
            }`}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {(statusFilter !== 'all' || priorityFilter !== 'all' || formFilter !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-walrus-400 animate-pulse" />
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:0.2 }} className="overflow-hidden mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-ink-900/60 border border-white/[0.07] rounded-2xl">
                {[
                  { label:'Status',   value:statusFilter,   options:STATUSES.map(s=>({value:s,label:s==='all'?'All Statuses':STATUS_LABELS[s]})),   onChange:v=>{ setStatusFilter(v); setPage(1) } },
                  { label:'Priority', value:priorityFilter, options:PRIORITIES.map(p=>({value:p,label:p==='all'?'All Priorities':PRIORITY_LABELS[p]})), onChange:v=>{ setPriorityFilter(v); setPage(1) } },
                  { label:'Form',     value:formFilter,     options:[{value:'all',label:'All Forms'},...forms.map(f=>({value:f.id,label:f.title}))], onChange:v=>{ setFormFilter(v); setPage(1) } },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider block mb-1.5">{f.label}</label>
                    <select value={f.value} onChange={e => f.onChange(e.target.value)} className="input-dark text-sm w-full">
                      {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
          className="bg-ink-900/60 border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
            <p className="text-sm font-semibold text-white">
              {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
              {search && <span className="text-ink-500 font-normal ml-2">for "{search}"</span>}
            </p>
            <div className="flex items-center gap-2 text-xs text-ink-500">
              Show
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                className="bg-ink-800 border border-white/10 text-white rounded-lg px-2 py-1 text-xs">
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-white/[0.05] text-[10px] font-semibold text-ink-500 uppercase tracking-wider">
            {['formTitle','status','priority','submittedAt',''].map((field, i) => (
              field ? (
                <button key={field} className="flex items-center gap-1 text-left hover:text-ink-300 transition-colors" onClick={() => handleSort(field)}>
                  {['Form / ID','Status','Priority','Date'][i]} <SortIcon field={field} />
                </button>
              ) : <div key="act" />
            ))}
          </div>

          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Inbox className="w-10 h-10 text-ink-700" />
              <p className="text-sm text-ink-500">No submissions found</p>
              {(search || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <button onClick={() => { setSearch(''); setStatusFilter('all'); setPriorityFilter('all'); setFormFilter('all') }}
                  className="text-xs text-walrus-400 hover:text-walrus-300 transition-colors">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              <AnimatePresence initial={false}>
                {paginated.map((sub, idx) => {
                  const PIcon = PRIORITY_ICONS[sub.priority] || AlertCircle
                  const hasMedia = Object.values(sub.data || {}).some(v => typeof v === 'object' && v?.blobId)
                  return (
                    <motion.div key={sub.id}
                      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:idx*0.03 }}
                      onClick={() => setSelectedId(sub.id)}
                      className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 hover:bg-white/[0.03] cursor-pointer transition-all group">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate mb-0.5 group-hover:text-walrus-300 transition-colors">{sub.formTitle}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-mono text-ink-600">{sub.id.slice(0,14)}…</p>
                          {sub.walletAddress && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-walrus-500 bg-walrus-500/8 px-1.5 py-0.5 rounded border border-walrus-500/15">
                              <Wallet className="w-2.5 h-2.5" />{shortenAddress(sub.walletAddress, 3)}
                            </span>
                          )}
                          {hasMedia && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-violet-400 bg-violet-500/8 px-1.5 py-0.5 rounded border border-violet-500/15">
                              <Image className="w-2.5 h-2.5" /> media
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${STATUS_COLORS[sub.status] || STATUS_COLORS.open}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sub.status==='open'?'bg-ocean-400':sub.status==='in-review'?'bg-amber-400':sub.status==='resolved'?'bg-mint-400':'bg-ink-500'}`} />
                          {STATUS_LABELS[sub.status] || sub.status}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${PRIORITY_COLORS[sub.priority] || PRIORITY_COLORS.medium}`}>
                          <PIcon className="w-3 h-3" />{PRIORITY_LABELS[sub.priority] || sub.priority}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-xs text-ink-300">{fmtDate(sub.submittedAt)}</p>
                        <p className="text-[11px] text-ink-600">{fmtRelative(sub.submittedAt)}</p>
                      </div>
                      <div className="hidden md:flex items-center">
                        <ChevronRight className="w-4 h-4 text-ink-700 group-hover:text-walrus-400 transition-colors" />
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.07]">
              <p className="text-xs text-ink-500">{(page-1)*pageSize+1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-1">
                <motion.button whileTap={{ scale:0.9 }} disabled={page===1} onClick={() => setPage(p=>p-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-ink-400 hover:text-white hover:bg-white/8 disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                {Array.from({ length:Math.min(5,totalPages) }, (_,i) => {
                  let p = i+1
                  if (totalPages>5) {
                    if (page<=3) p=i+1
                    else if (page>=totalPages-2) p=totalPages-4+i
                    else p=page-2+i
                  }
                  return (
                    <motion.button key={p} whileTap={{ scale:0.9 }} onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                        page===p ? 'bg-gradient-to-br from-walrus-400 to-walrus-600 text-white border border-walrus-500' : 'border border-white/10 text-ink-400 hover:text-white hover:bg-white/8'
                      }`}>{p}
                    </motion.button>
                  )
                })}
                <motion.button whileTap={{ scale:0.9 }} disabled={page===totalPages} onClick={() => setPage(p=>p+1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-ink-400 hover:text-white hover:bg-white/8 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedSub && (
          <SubmissionDrawer sub={selectedSub} forms={forms} onClose={() => setSelectedId(null)}
            onUpdateStatus={handleUpdateStatus} onUpdatePriority={handleUpdatePriority}
            onAddNote={handleAddNote} onDelete={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  )
}
