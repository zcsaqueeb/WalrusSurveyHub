import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, Shield, Database, Trash2, Copy, ExternalLink,
  Star, CheckSquare, Type, AlignLeft, ChevronDownSquare, Link as LinkIcon,
  Image, Eye, BarChart3, Download, FileText, Video, Globe, TrendingUp,
  CheckCircle, AlertCircle, Layers, Hash, ChevronRight, Inbox,
  Wallet, XCircle, Users, Share2, Zap, RefreshCw, ImageOff, Play, ZoomIn, X
} from 'lucide-react'
import { useStoreData } from '../hooks/useStoreData.js'
import { deleteForm, exportSubmissionsCSV } from '../store/useStore.js'
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/StatusBadge.jsx'
import WalrusBadge from '../components/WalrusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import { shortenAddress } from '../lib/sui.js'

const FIELD_ICONS = {
  text: Type, richtext: AlignLeft, dropdown: ChevronDownSquare,
  rating: Star, checkbox: CheckSquare, url: LinkIcon, screenshot: Image, video: Video,
}
const FIELD_LABELS = {
  text: 'Short Text', richtext: 'Long Text', dropdown: 'Dropdown',
  rating: 'Star Rating', checkbox: 'Checkbox', url: 'URL', screenshot: 'Image Upload', video: 'Video Upload',
}
const STATUS_CFG = {
  open:       { bg: 'bg-ocean-500/10',  text: 'text-ocean-400',  border: 'border-ocean-500/20',  dot: 'bg-ocean-400'  },
  'in-review':{ bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  dot: 'bg-amber-400'  },
  resolved:   { bg: 'bg-mint-500/10',   text: 'text-mint-400',   border: 'border-mint-500/20',   dot: 'bg-mint-400'   },
  closed:     { bg: 'bg-ink-700/30',    text: 'text-ink-400',    border: 'border-ink-600/30',    dot: 'bg-ink-500'    },
}
const PRIORITY_CFG = {
  critical: { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20'    },
  high:     { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  medium:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20'  },
  low:      { bg: 'bg-ink-700/30',    text: 'text-ink-400',    border: 'border-ink-600/30'    },
}

const AGGREGATORS = [
  'https://aggregator.walrus.space',
  'https://wal-aggregator-mainnet.nodeinfra.com',
  'https://walrus-aggregator.nodes.guru',
  'https://aggregator.walrus.mirai.cloud',
]

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}
function fmtFull(iso) {
  return new Date(iso).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })
}
function fmtRelative(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/* ── Media Lightbox ── */
function MediaLightbox({ src, type, name, onClose }) {
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

/* ── Media Thumbnail ── */
function MediaThumb({ blobId, preview, name, isVideo, onOpen }) {
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const aggIdx = Math.min(attempt, AGGREGATORS.length - 1)
  const src = blobId ? `${AGGREGATORS[aggIdx]}/v1/blobs/${blobId}` : (preview || null)

  if (!src) return (
    <div className="w-full h-32 rounded-xl bg-ink-800 border border-white/10 flex flex-col items-center justify-center gap-2 text-ink-600">
      <ImageOff className="w-5 h-5" />
      <span className="text-xs">No media</span>
    </div>
  )

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-ink-900 cursor-pointer group" onClick={onOpen}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-900 z-10 h-32">
          <RefreshCw className="w-5 h-5 text-walrus-400 animate-spin" />
        </div>
      )}
      {status === 'error' && (
        <div className="w-full h-32 flex flex-col items-center justify-center gap-2 text-ink-600">
          <ImageOff className="w-5 h-5" />
          <span className="text-xs">Failed to load</span>
          {attempt < AGGREGATORS.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setAttempt(a => a + 1) }}
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
      {isVideo ? (
        <video src={src} className={`w-full h-32 object-cover transition-opacity ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
          preload="metadata" muted playsInline
          onLoadedMetadata={() => setStatus('ok')}
          onError={() => { if (attempt < AGGREGATORS.length - 1) { setAttempt(a => a + 1) } else { setStatus('error') } }} />
      ) : (
        <img src={src} alt={name || 'Image'} className={`w-full h-32 object-cover transition-opacity ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setStatus('ok')}
          onError={() => { if (attempt < AGGREGATORS.length - 1) { setAttempt(a => a + 1) } else { setStatus('error') } }} />
      )}
      {status === 'ok' && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            {isVideo ? <Play className="w-4 h-4 text-white ml-0.5" /> : <ZoomIn className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Field Value Renderer ── */
function FieldValue({ val, fieldType }) {
  const [lightbox, setLightbox] = useState(null)

  if (val === null || val === undefined || val === '') {
    return <span className="text-ink-600 text-xs italic">—</span>
  }

  const isImgObj   = typeof val === 'object' && val?.blobId && !val?.isVideo
  const isVideoObj = typeof val === 'object' && val?.isVideo

  if (fieldType === 'screenshot' || isImgObj) {
    const blobId  = val?.blobId || null
    const preview = val?.preview || val?.walrusUrl || null
    return (
      <>
        <AnimatePresence>
          {lightbox && (
            <MediaLightbox src={lightbox} type="image" name={val?.name} onClose={() => setLightbox(null)} />
          )}
        </AnimatePresence>
        <div className="space-y-1.5">
          <MediaThumb blobId={blobId} preview={preview} name={val?.name} isVideo={false}
            onOpen={() => {
              const src = blobId ? `${AGGREGATORS[0]}/v1/blobs/${blobId}` : preview
              if (src) setLightbox(src)
            }} />
          <div className="flex items-center flex-wrap gap-2 text-xs text-ink-500">
            {val?.name && <span className="truncate max-w-[200px]">{val.name}</span>}
            {blobId && (
              <a href={`${AGGREGATORS[0]}/v1/blobs/${blobId}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-walrus-400 hover:text-walrus-300">
                <Database className="w-3 h-3" />{blobId.slice(0, 12)}…
              </a>
            )}
          </div>
        </div>
      </>
    )
  }

  if (fieldType === 'video' || isVideoObj) {
    const blobId  = val?.blobId || null
    const preview = val?.preview || val?.walrusUrl || null
    return (
      <>
        <AnimatePresence>
          {lightbox && (
            <MediaLightbox src={lightbox} type="video" name={val?.name} onClose={() => setLightbox(null)} />
          )}
        </AnimatePresence>
        <div className="space-y-1.5">
          <MediaThumb blobId={blobId} preview={preview} name={val?.name} isVideo
            onOpen={() => {
              const src = blobId ? `${AGGREGATORS[0]}/v1/blobs/${blobId}` : preview
              if (src) setLightbox(src)
            }} />
          <div className="flex items-center flex-wrap gap-2 text-xs text-ink-500">
            {val?.name && <span className="truncate max-w-[200px]">{val.name}</span>}
            {blobId && (
              <a href={`${AGGREGATORS[0]}/v1/blobs/${blobId}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-walrus-400 hover:text-walrus-300">
                <Database className="w-3 h-3" />{blobId.slice(0, 12)}…
              </a>
            )}
          </div>
        </div>
      </>
    )
  }

  if (fieldType === 'rating' || (typeof val === 'number' && val >= 0 && val <= 5)) {
    const stars = typeof val === 'number' ? val : parseInt(val) || 0
    return (
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(i => (
          <Star key={i} className={`w-3.5 h-3.5 ${i <= stars ? 'text-amber-400 fill-amber-400' : 'text-ink-700'}`} />
        ))}
        <span className="text-xs text-ink-400 ml-1">{stars}/5</span>
      </div>
    )
  }

  if (typeof val === 'boolean') {
    return (
      <span className={`flex items-center gap-1 text-xs font-medium ${val ? 'text-mint-400' : 'text-ink-500'}`}>
        {val ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
        {val ? 'Yes' : 'No'}
      </span>
    )
  }

  if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
    return (
      <a href={val} target="_blank" rel="noopener noreferrer"
        className="text-xs text-ocean-400 hover:text-ocean-300 truncate flex items-center gap-1">
        <LinkIcon className="w-3 h-3 flex-shrink-0" />{val}
        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />
      </a>
    )
  }

  return <p className="text-xs text-ink-300 break-words leading-relaxed">{String(val || '—')}</p>
}

/* ── Stat card ── */
function StatCard({ icon: Icon, value, label, color, bg, border }) {
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
      className={`${bg} border ${border} rounded-2xl p-4 flex flex-col gap-2`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} border ${border}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
        <p className="text-[11px] text-ink-500 font-medium mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

/* ── Submission row ── */
function SubmissionRow({ sub, index, form }) {
  const [open, setOpen] = useState(false)
  const sc = STATUS_CFG[sub.status] || STATUS_CFG.open
  const pc = PRIORITY_CFG[sub.priority] || PRIORITY_CFG.medium
  const entries = Object.entries(sub.data || {})

  // Build field label map from form definition
  const fieldsMap = {}
  if (form?.fields) form.fields.forEach(f => { fieldsMap[f.id] = f })
  const getFieldLabel = (key) => fieldsMap[key]?.label || key.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())
  const getFieldType  = (key) => {
    if (fieldsMap[key]) return fieldsMap[key].type
    return null
  }

  return (
    <motion.div
      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: index * 0.05 }}
      className="bg-ink-900/60 border border-white/[0.07] hover:border-white/15 rounded-2xl overflow-hidden transition-all duration-200"
    >
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${sc.dot}`} />

        <div className="flex-1 min-w-0">
          {/* Row 1 — badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${sc.bg} ${sc.text} border ${sc.border}`}>
              {(sub.status || 'open').replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${pc.bg} ${pc.text} border ${pc.border}`}>
              {(sub.priority || 'medium').charAt(0).toUpperCase() + (sub.priority || 'medium').slice(1)}
            </span>
            {sub.isEncrypted && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Shield className="w-2.5 h-2.5" /> Sealed
              </span>
            )}
          </div>

          {/* Row 2 — wallet + date */}
          <div className="flex items-center gap-3 flex-wrap text-[11px] text-ink-500">
            {sub.walletAddress ? (
              <span className="flex items-center gap-1 text-walrus-500/70">
                <Wallet className="w-3 h-3" />
                <span className="font-mono">{shortenAddress(sub.walletAddress, 4)}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-ink-700">
                <XCircle className="w-3 h-3" /> Anonymous
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {fmtRelative(sub.submittedAt)} · {fmt(sub.submittedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span className="font-mono">{sub.id?.slice(0,12)}…</span>
            </span>
          </div>

          {/* Preview text */}
          {!open && entries.length > 0 && (
            <p className="text-xs text-ink-500 mt-2 line-clamp-1">
              {entries.slice(0,2).map(([k,v]) =>
                `${getFieldLabel(k)}: ${typeof v === 'string' ? v.slice(0,40) : typeof v === 'number' ? '★'.repeat(v) : typeof v === 'boolean' ? (v?'Yes':'No') : typeof v === 'object' && v?.name ? v.name : '…'}`
              ).join(' · ')}
            </p>
          )}
        </div>

        {/* Expand icon */}
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight className="w-4 h-4 text-ink-600" />
        </motion.div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.05] space-y-3">

              {/* Submission ID */}
              <div className="flex items-center gap-2 p-2.5 bg-ink-800/50 border border-white/[0.05] rounded-xl">
                <Hash className="w-3.5 h-3.5 text-ink-500 flex-shrink-0" />
                <p className="text-[11px] font-mono text-ink-400 flex-1 truncate">{sub.id}</p>
                <span className="text-[10px] text-ink-600 flex-shrink-0">{fmtFull(sub.submittedAt)}</span>
              </div>

              {/* Walrus blob */}
              {sub.walrusBlobId && (
                <div className="flex items-center gap-2 p-2.5 bg-walrus-500/5 border border-walrus-500/15 rounded-xl">
                  <Database className="w-3.5 h-3.5 text-walrus-400 flex-shrink-0" />
                  <p className="text-[11px] font-mono text-walrus-300 flex-1 truncate">{sub.walrusBlobId}</p>
                  <a href={`${AGGREGATORS[0]}/v1/blobs/${sub.walrusBlobId}`} target="_blank" rel="noopener noreferrer"
                    className="text-ink-600 hover:text-walrus-400 transition-colors flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Full wallet address */}
              {sub.walletAddress && (
                <div className="flex items-center gap-2 p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  <Wallet className="w-3.5 h-3.5 text-walrus-400 flex-shrink-0" />
                  <p className="text-[11px] font-mono text-ink-400 flex-1 truncate">{sub.walletAddress}</p>
                  <a href={`https://suiscan.xyz/mainnet/account/${sub.walletAddress}`} target="_blank" rel="noopener noreferrer"
                    className="text-ink-600 hover:text-ocean-400 transition-colors flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Field values — now with real media rendering */}
              <div className="space-y-3">
                {entries.map(([key, val]) => {
                  const fieldType = getFieldType(key)
                  const label     = getFieldLabel(key)
                  const isMedia   = (fieldType === 'screenshot' || fieldType === 'video') ||
                    (typeof val === 'object' && val?.blobId)
                  return (
                    <div key={key} className={`p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl`}>
                      <p className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">{label}</p>
                      <FieldValue val={val} fieldType={fieldType || (typeof val === 'object' && val?.isVideo ? 'video' : typeof val === 'object' && val?.blobId ? 'screenshot' : null)} />
                    </div>
                  )
                })}
              </div>

              {/* Notes */}
              {sub.notes && (
                <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Admin Note</p>
                  <p className="text-xs text-amber-200 leading-relaxed">{sub.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FormDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { forms, submissions } = useStoreData()
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)

  const form = forms.find(f => f.id === id)
  const formSubs = submissions.filter(s => s.formId === id)

  if (!form) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center pt-16">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-ink-800 flex items-center justify-center">
          <FileText className="w-7 h-7 text-ink-600" />
        </div>
        <h2 className="text-xl font-bold text-ink-400 mb-2">Form not found</h2>
        <p className="text-sm text-ink-600 mb-5">It may have been deleted or the ID is invalid.</p>
        <Link to="/forms" className="btn-secondary text-sm px-5">← Back to Forms</Link>
      </div>
    </div>
  )

  const handleDelete = () => {
    if (!window.confirm('Delete this form and all its submissions? This cannot be undone.')) return
    deleteForm(id); toast('Form deleted.', 'success'); navigate('/forms')
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}#/forms/${id}/fill`
    await navigator.clipboard.writeText(url)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast('Form link copied to clipboard!', 'success')
  }

  const handleExport = () => {
    const csv = exportSubmissionsCSV(id)
    if (!csv) { toast('No submissions to export.', 'warning'); return }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${form.title.replace(/\s+/g, '_')}_submissions.csv`; a.click()
    URL.revokeObjectURL(url); toast('CSV exported!', 'success')
  }

  const statusCounts = { open: 0, 'in-review': 0, resolved: 0, closed: 0 }
  formSubs.forEach(s => { if (statusCounts[s.status] !== undefined) statusCounts[s.status]++ })

  const TABS = [
    { id: 'overview',    label: 'Overview',    count: null },
    { id: 'fields',      label: 'Fields',      count: form.fields?.length || 0 },
    { id: 'submissions', label: 'Submissions',  count: formSubs.length },
  ]

  return (
    <div className="min-h-screen bg-ink-950 pb-20 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">

        {/* ── Back ── */}
        <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}>
          <Link to="/forms"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-walrus-400 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Forms
          </Link>
        </motion.div>

        {/* ── Hero header ── */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          className="relative bg-gradient-to-br from-ink-900/90 to-ink-900/60 border border-white/[0.08] rounded-3xl p-6 sm:p-8 mb-6 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-walrus-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-ocean-500/6 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <CategoryBadge category={form.category} />
                {form.isEncrypted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Shield className="w-3 h-3" /> Seal Encrypted
                  </span>
                )}
                {form.walrusBlobId ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-mint-500/10 text-mint-400 border border-mint-500/20">
                    <Database className="w-3 h-3" /> On Walrus Mainnet
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-ink-700/30 text-ink-500 border border-ink-600/30">
                    <Globe className="w-3 h-3" /> Local Only
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">{form.title}</h1>
              {form.description && (
                <p className="text-ink-400 text-sm leading-relaxed mb-4 max-w-xl">{form.description}</p>
              )}

              <div className="flex items-center gap-5 flex-wrap text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Created {fmtFull(form.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> {form.fields?.length || 0} fields
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> {form.views || 0} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> {formSubs.length} submissions
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <Link to={`/forms/${id}/fill`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-walrus-400 to-walrus-600 hover:from-walrus-300 hover:to-walrus-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-walrus-500/25 hover:-translate-y-0.5 active:scale-[0.97]">
                <Zap className="w-4 h-4" /> Fill Form
              </Link>
              <button onClick={handleCopyLink}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white text-sm font-medium rounded-xl transition-all">
                {copied ? <CheckCircle className="w-4 h-4 text-mint-400" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Share'}
              </button>
              <button onClick={handleExport}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white text-sm font-medium rounded-xl transition-all">
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={handleDelete}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-coral-500/10 hover:bg-coral-500/20 border border-coral-500/20 text-coral-400 text-sm font-medium rounded-xl transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {form.walrusBlobId && (
            <div className="relative mt-5 pt-5 border-t border-white/[0.06]">
              <WalrusBadge blobId={form.walrusBlobId} encrypted={form.isEncrypted} />
            </div>
          )}
        </motion.div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={BarChart3} value={formSubs.length} label="Total Responses"
            color="text-walrus-400" bg="bg-walrus-500/8" border="border-walrus-500/20" />
          <StatCard icon={TrendingUp} value={statusCounts.open} label="Open"
            color="text-ocean-400" bg="bg-ocean-500/8" border="border-ocean-500/20" />
          <StatCard icon={Eye} value={statusCounts['in-review']} label="In Review"
            color="text-amber-400" bg="bg-amber-500/8" border="border-amber-500/20" />
          <StatCard icon={CheckCircle} value={statusCounts.resolved} label="Resolved"
            color="text-mint-400" bg="bg-mint-500/8" border="border-mint-500/20" />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 p-1 bg-ink-900/60 border border-white/[0.06] rounded-2xl w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all capitalize ${
                activeTab === tab.id
                  ? 'bg-walrus-500/15 text-walrus-300 border border-walrus-500/30 shadow-sm'
                  : 'text-ink-500 hover:text-white hover:bg-white/[0.05]'
              }`}>
              {tab.label}
              {tab.count !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-walrus-500/20 text-walrus-300' : 'bg-white/[0.06] text-ink-600'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* Overview */}
          {activeTab === 'overview' && (
            <motion.div key="ov" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="space-y-5">
              {/* Quick share */}
              <div className="bg-ink-900/60 border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="w-4 h-4 text-walrus-400" />
                  <h3 className="text-sm font-bold text-white">Share Form</h3>
                </div>
                <div className="flex items-center gap-2 p-3 bg-ink-800/60 border border-white/[0.07] rounded-xl mb-3">
                  <Globe className="w-3.5 h-3.5 text-ink-500 flex-shrink-0" />
                  <p className="text-xs font-mono text-ink-400 flex-1 truncate">
                    {`${window.location.origin}#/forms/${id}/fill`}
                  </p>
                  <button onClick={handleCopyLink}
                    className="flex items-center gap-1 text-xs text-walrus-400 hover:text-walrus-300 flex-shrink-0 transition-colors">
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <Link to={`/forms/${id}/fill`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-walrus-400 to-walrus-600 text-white text-sm font-semibold rounded-xl hover:from-walrus-300 hover:to-walrus-500 transition-all">
                  <Zap className="w-4 h-4" /> Preview / Fill Form
                </Link>
              </div>

              {/* Status breakdown */}
              <div className="bg-ink-900/60 border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-walrus-400" />
                  <h3 className="text-sm font-bold text-white">Status Breakdown</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const cfg = STATUS_CFG[status]
                    const pct = formSubs.length > 0 ? Math.round((count / formSubs.length) * 100) : 0
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className={`w-20 text-[11px] font-semibold ${cfg.text} flex-shrink-0 capitalize`}>
                          {status.replace('-',' ')}
                        </span>
                        <div className="flex-1 h-1.5 bg-ink-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${cfg.dot}`} />
                        </div>
                        <span className="text-xs text-ink-500 w-10 text-right font-mono">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent submissions preview */}
              {formSubs.length > 0 && (
                <div className="bg-ink-900/60 border border-white/[0.07] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-walrus-400" />
                      <h3 className="text-sm font-bold text-white">Recent Submissions</h3>
                    </div>
                    <button onClick={() => setActiveTab('submissions')}
                      className="text-xs text-walrus-400 hover:text-walrus-300 transition-colors flex items-center gap-1">
                      View all <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formSubs.slice(0, 3).map((sub, i) => {
                      const sc = STATUS_CFG[sub.status] || STATUS_CFG.open
                      return (
                        <div key={sub.id} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} border ${sc.border}`}>
                            {(sub.status || 'open').replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}
                          </span>
                          <span className="text-xs text-ink-500 flex-1">{fmtRelative(sub.submittedAt)}</span>
                          {sub.walletAddress && (
                            <span className="text-[11px] font-mono text-walrus-500/60">{shortenAddress(sub.walletAddress, 3)}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Fields */}
          {activeTab === 'fields' && (
            <motion.div key="fi" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="space-y-2">
                {(form.fields || []).map((field, i) => {
                  const Icon = FIELD_ICONS[field.type] || Type
                  return (
                    <motion.div key={field.id}
                      initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.05 }}
                      className="bg-ink-900/60 border border-white/[0.07] rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-6 text-center text-[11px] text-ink-600 font-mono font-black">{i + 1}</span>
                        <div className="w-9 h-9 flex items-center justify-center bg-walrus-500/10 border border-walrus-500/20 rounded-xl flex-shrink-0">
                          <Icon className="w-4 h-4 text-walrus-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-white">{field.label || 'Untitled'}</p>
                            {field.required && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-coral-500/10 text-coral-400 border border-coral-500/20">Required</span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-500">{FIELD_LABELS[field.type] || field.type}</p>
                        </div>
                      </div>
                      <div className="pl-9 space-y-2">
                        {field.placeholder && (
                          <div className="flex items-start gap-2 text-xs">
                            <span className="text-ink-600 font-medium flex-shrink-0">Placeholder:</span>
                            <span className="text-ink-400 italic">"{field.placeholder}"</span>
                          </div>
                        )}
                        {(field.type === 'screenshot' || field.type === 'video') && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Files stored as Walrus blobs · Max 100MB</span>
                          </div>
                        )}
                        {field.options && field.options.length > 0 && (
                          <div>
                            <p className="text-[10px] text-ink-600 font-bold uppercase tracking-wider mb-1.5">Options ({field.options.length})</p>
                            <div className="flex flex-wrap gap-1.5">
                              {field.options.map((opt, oi) => (
                                <span key={oi} className="text-xs px-2.5 py-1 bg-white/[0.05] border border-white/[0.08] rounded-lg text-ink-300">{opt}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Submissions */}
          {activeTab === 'submissions' && (
            <motion.div key="su" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              {formSubs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/[0.08] rounded-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-ink-800 flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-ink-600" />
                  </div>
                  <p className="font-bold text-ink-400 mb-1">No submissions yet</p>
                  <p className="text-sm text-ink-600 mb-6">Share the form link to start collecting responses</p>
                  <button onClick={handleCopyLink} className="btn-primary text-sm px-5">
                    <Share2 className="w-4 h-4" /> Copy Form Link
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-ink-400 font-medium">{formSubs.length} submission{formSubs.length !== 1 ? 's' : ''}</p>
                    <button onClick={handleExport}
                      className="flex items-center gap-1.5 text-xs text-walrus-400 hover:text-walrus-300 font-medium transition-colors">
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>
                  {formSubs.map((sub, i) => <SubmissionRow key={sub.id} sub={sub} index={i} form={form} />)}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
