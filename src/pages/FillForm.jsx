import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Database, Shield, CheckCircle, Star,
  Link as LinkIcon, ChevronDown, ExternalLink, Upload, X,
  Loader2, Globe, Video, AlertCircle, Image, FileVideo,
  Check, Play, ZoomIn, Wallet, XCircle, Sparkles, Clock
} from 'lucide-react'
import { useStoreData } from '../hooks/useStoreData.js'
import { submitForm, incrementFormViews, setWallet } from '../store/useStore.js'
import { uploadToWalrus, uploadFileToWalrus, formatBytes, getWalrusBlobUrl } from '../lib/walrus.js'
import WalrusBadge from '../components/WalrusBadge.jsx'
import WalrusUploadProgress from '../components/WalrusUploadProgress.jsx'
import StarRating from '../components/StarRating.jsx'
import { CategoryBadge } from '../components/StatusBadge.jsx'
import { useToast } from '../components/Toast.jsx'
import WalletModal from '../components/WalletModal.jsx'
import { shortenAddress } from '../lib/sui.js'

/* ─── Styled dropdown ────────────────────────────────────────────────────── */
function StyledSelect({ field, value, onChange, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = value || ''
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-xl text-sm transition-all text-left ${
          error ? 'border-red-300 ring-1 ring-red-200' : open ? 'border-walrus-400 ring-2 ring-walrus-100' : 'border-ink-200 hover:border-ink-300'
        }`}>
        <span className={selected ? 'text-ink-800 font-medium' : 'text-ink-400'}>
          {selected || field.placeholder || 'Select an option…'}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="w-4 h-4 text-ink-400 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-4, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-4, scale:0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-20 top-full mt-1.5 left-0 right-0 bg-white border border-ink-200 rounded-2xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
            {(field.options || []).map((opt, i) => (
              <button key={i} type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${
                  selected === opt
                    ? 'bg-walrus-50 text-walrus-700 font-semibold'
                    : 'text-ink-700 hover:bg-ink-50 hover:text-ink-900'
                }`}>
                {selected === opt && <Check className="w-4 h-4 text-walrus-500 flex-shrink-0"/>}
                <span className={selected === opt ? '' : 'ml-6'}>{opt}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── File upload field ────────────────────────────────────────────────────── */
function FileUploadField({ field, value, onChange, error, accept, isVideo }) {
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [dragOver, setDragOver]   = useState(false)
  const [preview, setPreview]     = useState(null)
  const fileRef = useRef(null)
  const Icon = isVideo ? FileVideo : Image

  const processFile = useCallback(async (file) => {
    if (!file) return
    const maxMB = isVideo ? 200 : 20
    if (file.size > maxMB * 1024 * 1024) {
      onChange(null)
      return
    }
    setUploading(true); setUploadPct(0)
    if (!isVideo) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target.result)
      reader.readAsDataURL(file)
    }
    try {
      const result = await uploadFileToWalrus(file, { epochs: 5, onProgress: p => setUploadPct(Math.round(p * 100)) })
      onChange({ blobId: result.blobId, name: file.name, size: file.size, type: file.type, isVideo, walrusUrl: getWalrusBlobUrl(result.blobId) })
    } catch {
      onChange({ localOnly: true, name: file.name, size: file.size, type: file.type, preview: preview, isVideo })
    } finally { setUploading(false) }
  }, [isVideo, onChange, preview])

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }

  const cls = `relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
    error ? 'border-red-300 bg-red-50' : dragOver ? 'border-walrus-400 bg-walrus-50/50 scale-[1.01]' : 'border-ink-200 hover:border-walrus-300 hover:bg-walrus-50/30'
  }`

  if (value && !uploading) {
    return (
      <div className="border-2 border-mint-200 bg-mint-50/50 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-mint-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-mint-500"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-800 truncate">{value.name}</p>
            <p className="text-xs text-ink-500 mt-0.5">
              {formatBytes(value.size)} · {value.blobId ? <><span className="text-mint-600 font-medium">Stored on Walrus</span></> : 'Local fallback'}
            </p>
          </div>
          <button type="button" onClick={() => { onChange(null); setPreview(null) }}
            className="w-7 h-7 flex items-center justify-center text-ink-400 hover:text-coral-500 rounded-lg hover:bg-coral-50 transition-colors flex-shrink-0">
            <X className="w-4 h-4"/>
          </button>
        </div>
        {preview && !isVideo && (
          <img src={preview} alt="Preview" className="mt-3 w-full max-h-48 object-cover rounded-xl border border-ink-100"/>
        )}
        {value.blobId && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-walrus-600">
            <Database className="w-3 h-3"/>
            <span className="font-mono truncate">{value.blobId.slice(0,20)}…</span>
            <a href={`https://aggregator.walrus.space/v1/blobs/${value.blobId}`} target="_blank" rel="noopener noreferrer"
              className="ml-auto text-walrus-500 hover:text-walrus-700 flex-shrink-0">
              <ExternalLink className="w-3 h-3"/>
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cls} onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}>
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={e => processFile(e.target.files[0])}/>
      {uploading ? (
        <div className="p-6 text-center">
          <Loader2 className="w-8 h-8 text-walrus-500 mx-auto mb-2 animate-spin"/>
          <p className="text-sm text-walrus-600 font-semibold mb-2">Uploading to Walrus… {uploadPct}%</p>
          <div className="w-full h-1.5 bg-walrus-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-walrus-500 rounded-full" style={{ width:`${uploadPct}%` }} transition={{ duration:0.2 }}/>
          </div>
        </div>
      ) : (
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-walrus-50 border border-walrus-200 flex items-center justify-center mb-3">
            <Upload className="w-5 h-5 text-walrus-400"/>
          </div>
          <p className="text-sm font-semibold text-ink-700 mb-1">
            {isVideo ? 'Drop a video file here' : 'Drop an image here'}
          </p>
          <p className="text-xs text-ink-400 mb-1">or click to browse</p>
          <p className="text-[10px] text-ink-400">
            {isVideo ? 'MP4, WebM, MOV · max 200MB' : 'JPEG, PNG, GIF, WebP · max 20MB'}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Individual form field renderer ─────────────────────────────────────── */
function FormField({ field, value, onChange, error }) {
  const inputCls = `w-full px-4 py-3 bg-white border rounded-xl text-sm text-ink-900 placeholder-ink-400 transition-all focus:outline-none focus:ring-2 ${
    error ? 'border-red-300 ring-red-100' : 'border-ink-200 focus:border-walrus-400 focus:ring-walrus-100'
  }`
  switch (field.type) {
    case 'dropdown': return <StyledSelect field={field} value={value} onChange={onChange} error={error}/>
    case 'rating':   return <StarRating value={value || 0} onChange={onChange} error={error}/>
    case 'checkbox': return (
      <label className="flex items-center gap-3 cursor-pointer select-none group w-fit">
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
          value ? 'bg-walrus-500 border-walrus-500 shadow-sm' : error ? 'border-red-300' : 'border-ink-300 group-hover:border-walrus-400'
        }`} onClick={() => onChange(!value)}>
          {value && <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:500,damping:25}}><Check className="w-3.5 h-3.5 text-white"/></motion.div>}
        </div>
        <span className="text-sm text-ink-700 font-medium">{value ? 'Yes' : 'No — click to toggle'}</span>
      </label>
    )
    case 'screenshot': return <FileUploadField field={field} value={value} onChange={onChange} error={error} accept="image/*" isVideo={false}/>
    case 'video':      return <FileUploadField field={field} value={value} onChange={onChange} error={error} accept="video/*" isVideo/>
    case 'richtext':   return (
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={4}
        placeholder={field.placeholder || 'Write your detailed answer here…'}
        className={`${inputCls} resize-none leading-relaxed`}/>
    )
    case 'url': return (
      <div className="relative">
        <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none"/>
        <input type="url" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || 'https://example.com'}
          className={`${inputCls} pl-10`}/>
      </div>
    )
    default: return (
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder || 'Type your answer…'}
        className={inputCls}/>
    )
  }
}

/* ─── Success screen ─────────────────────────────────────────────────────── */
function SuccessScreen({ result, form, wallet, onReset }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-walrus-50/20 to-ocean-50/10 flex items-center justify-center px-4 pt-20 pb-16">
      <motion.div
        initial={{ opacity:0, scale:0.88, y:30 }}
        animate={{ opacity:1, scale:1, y:0 }}
        transition={{ type:'spring', stiffness:280, damping:26 }}
        className="bg-white border border-ink-200 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale:0, rotate:-10 }}
          animate={{ scale:1, rotate:0 }}
          transition={{ delay:0.15, type:'spring', stiffness:400, damping:20 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-mint-400 to-walrus-500 flex items-center justify-center shadow-xl shadow-mint-400/30"
        >
          <CheckCircle className="w-10 h-10 text-white"/>
        </motion.div>

        <h2 className="text-2xl font-black text-ink-900 mb-2">Submitted!</h2>
        <p className="text-ink-500 text-sm leading-relaxed mb-6">
          {result?.blobId
            ? 'Your response is permanently stored on the Walrus decentralized storage network.'
            : 'Your response has been recorded and saved successfully.'}
        </p>

        {/* Walrus blob info */}
        <div className="mb-5">
          <WalrusBadge blobId={result?.blobId} encrypted={form?.isEncrypted}/>
        </div>

        {/* Wallet */}
        {wallet?.address && (
          <div className="mb-5 p-3 bg-ink-50 border border-ink-200 rounded-2xl text-left">
            <p className="text-[10px] text-ink-400 font-bold uppercase tracking-wider mb-1">Submitted as</p>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-walrus-400 to-ocean-500 flex-shrink-0"/>
              <p className="text-xs font-mono text-ink-600 truncate">{wallet.address}</p>
              <a href={`https://suiscan.xyz/mainnet/account/${wallet.address}`} target="_blank" rel="noopener noreferrer"
                className="text-ink-400 hover:text-walrus-500 flex-shrink-0 ml-auto">
                <ExternalLink className="w-3.5 h-3.5"/>
              </a>
            </div>
          </div>
        )}

        {/* Submission details */}
        <div className="text-left p-3 bg-walrus-50 border border-walrus-100 rounded-xl mb-5">
          <div className="flex items-center gap-2 text-xs text-walrus-700">
            <Clock className="w-3.5 h-3.5 flex-shrink-0"/>
            <span>{new Date().toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })}</span>
          </div>
          {result?.id && (
            <div className="flex items-center gap-2 text-xs text-walrus-600 mt-1">
              <Database className="w-3.5 h-3.5 flex-shrink-0"/>
              <span className="font-mono">{result.id?.slice(0,24)}…</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <Link to="/forms"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-walrus-400 to-walrus-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-walrus-500/25 transition-all hover:-translate-y-0.5">
            <Sparkles className="w-4 h-4"/> Browse More Forms
          </Link>
          <button onClick={onReset}
            className="text-sm text-ink-400 hover:text-walrus-600 transition-colors py-2 font-medium">
            ↩ Submit another response
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function FillForm() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const toast    = useToast()
  const { forms, wallet } = useStoreData()

  const form = forms.find(f => f.id === id)
  const [values, setValues]                         = useState({})
  const [errors, setErrors]                         = useState({})
  const [submitting, setSubmitting]                 = useState(false)
  const [uploadProgress, setProgress]               = useState(0)
  const [submitted, setSubmitted]                   = useState(false)
  const [submissionResult, setResult]               = useState(null)
  const [uploadStep, setUploadStep]                 = useState('')
  const [walletModalOpen, setWalletModalOpen]       = useState(false)
  const [walletModalReason, setWalletModalReason]   = useState('')

  useEffect(() => { if (form) incrementFormViews(form.id) }, [form?.id])

  if (!form) return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ink-100 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-ink-400"/>
        </div>
        <h2 className="text-xl font-bold text-ink-800 mb-2">Form not found</h2>
        <p className="text-sm text-ink-500 mb-6">This form may have been deleted or the link is incorrect.</p>
        <Link to="/forms" className="btn-primary-light text-sm">Browse forms →</Link>
      </div>
    </div>
  )

  const setVal = (fieldId, val) => {
    setValues(v => ({ ...v, [fieldId]: val }))
    if (errors[fieldId]) setErrors(e => ({ ...e, [fieldId]: null }))
  }

  const validate = () => {
    const errs = {}
    form.fields.forEach(f => {
      if (!f.required) return
      const v = values[f.id]
      if (v === undefined || v === null || v === '') { errs[f.id] = 'This field is required.'; return }
      if (f.type === 'rating' && (!v || v === 0)) errs[f.id] = 'Please select a star rating.'
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) { toast('Please fill in all required fields.', 'error'); return }
    // ── WALLET AUTH GATE ─────────────────────────────────────────────────────
    if (!wallet?.connected) {
      setWalletModalReason('A Sui wallet connection is required to sign and submit this form. Your wallet address will be stored as proof of identity on Walrus.')
      setWalletModalOpen(true)
      return
    }
    setSubmitting(true); setProgress(0)
    try {
      const labelledData = {}
      form.fields.forEach(f => {
        const val = values[f.id]
        if (val === undefined || val === null) return
        const key = f.label || f.id
        if (val && typeof val === 'object' && val.blobId)
          labelledData[key] = { type:'walrus_blob', blobId:val.blobId, name:val.name, size:val.size }
        else if (val && typeof val === 'object' && val.localOnly)
          labelledData[key] = { type:'local_file', name:val.name, size:val.size }
        else
          labelledData[key] = val
      })

      const payload = {
        formId: form.id, formTitle: form.title, formCategory: form.category,
        submittedAt: new Date().toISOString(),
        walletAddress: wallet?.address || null,
        network: 'mainnet', data: labelledData,
      }

      setUploadStep('Uploading to Walrus…')
      let walrusBlobId = null
      try {
        const r = await uploadToWalrus(payload, { epochs:5, onProgress:setProgress })
        walrusBlobId = r.blobId
      } catch(e) { console.warn('[Walrus] submission upload failed:', e.message) }

      setUploadStep('')
      const sub = submitForm(id, labelledData, { walrusBlobId, network:'mainnet', walletAddress:wallet?.address||null })
      setResult({ ...sub, blobId:walrusBlobId })
      setSubmitted(true)
    } catch(err) {
      toast('Submission failed: ' + err.message, 'error')
    } finally { setSubmitting(false); setUploadStep('') }
  }

  if (submitted && submissionResult)
    return <SuccessScreen result={submissionResult} form={form} wallet={wallet}
      onReset={() => { setSubmitted(false); setValues({}); setErrors({}) }} />

  const filledCount   = form.fields.filter(f => values[f.id] !== undefined && values[f.id] !== '' && values[f.id] !== null).length
  const progressPct   = form.fields.length > 0 ? Math.round((filledCount / form.fields.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-walrus-50/20 pt-16 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">

        {/* ── Back ── */}
        <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}>
          <Link to="/forms"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-walrus-600 mb-8 group transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"/> Back to Forms
          </Link>
        </motion.div>

        {/* ── Form header card ── */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          className="bg-white border border-ink-200 rounded-3xl p-6 mb-5 shadow-card overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-walrus-100/50 rounded-full blur-2xl pointer-events-none"/>
          <div className="relative">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <CategoryBadge category={form.category}/>
              {form.isEncrypted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  <Shield className="w-3 h-3"/> Seal Encrypted
                </span>
              )}
              {form.walrusBlobId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-mint-50 text-mint-700 border border-mint-200 rounded-full">
                  <Database className="w-3 h-3"/> Stored on Walrus
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-ink-900 leading-tight mb-2">{form.title}</h1>
            {form.description && <p className="text-sm text-ink-500 leading-relaxed mb-4">{form.description}</p>}

            {/* Progress bar */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-ink-100">
              <div className="flex-1 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-walrus-400 to-walrus-500 rounded-full"
                  animate={{ width:`${progressPct}%` }} transition={{ duration:0.4, ease:'easeOut' }}/>
              </div>
              <span className="text-[11px] text-ink-400 font-medium whitespace-nowrap flex-shrink-0">
                {filledCount}/{form.fields.length} filled
              </span>
            </div>
            <div className="mt-3">
              <WalrusBadge blobId={form.walrusBlobId} encrypted={form.isEncrypted} small/>
            </div>
          </div>
        </motion.div>

        {/* ── Wallet auth gate ── */}
        <AnimatePresence mode="wait">
          {wallet?.connected ? (
            <motion.div key="connected"
              initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              className="flex items-center gap-3 p-3.5 bg-white border border-mint-200 rounded-2xl mb-4 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-walrus-400 to-ocean-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <CheckCircle className="w-4 h-4 text-white"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-mint-600 uppercase tracking-wider leading-tight">Wallet Connected</p>
                <p className="text-xs font-mono text-ink-500 truncate mt-0.5">{shortenAddress(wallet.address, 6)}</p>
              </div>
              <span className="text-[10px] font-bold text-mint-600 bg-mint-50 border border-mint-200 px-2.5 py-1 rounded-full flex-shrink-0">
                ✓ Ready
              </span>
            </motion.div>
          ) : (
            <motion.div key="disconnected"
              initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="bg-white border border-walrus-200 rounded-2xl mb-4 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-walrus-50 to-ocean-50/40 px-5 py-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-walrus-100 border border-walrus-200 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4 text-walrus-600"/>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-800">Wallet required to submit</p>
                    <p className="text-xs text-ink-500 leading-relaxed mt-0.5">
                      Connect your Sui wallet to sign and submit. Your address is stored as on-chain proof of identity.
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => { setWalletModalReason(''); setWalletModalOpen(true) }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-br from-walrus-500 to-walrus-600 hover:from-walrus-400 hover:to-walrus-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-walrus-500/20 active:scale-[0.98]">
                  <Wallet className="w-4 h-4"/> Connect Sui Wallet
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Fields ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {form.fields.map((field, i) => (
            <motion.div key={field.id}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.04 }}
              className={`bg-white border rounded-2xl p-5 shadow-card transition-all duration-200 ${
                errors[field.id] ? 'border-red-200 shadow-red-100' : 'border-ink-200 hover:border-ink-300'
              }`}
            >
              {/* Field label */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <label className="text-sm font-bold text-ink-800 leading-snug">
                  {field.label}
                  {field.required
                    ? <span className="text-coral-500 ml-1">*</span>
                    : <span className="text-ink-400 text-xs font-normal ml-2">(optional)</span>}
                </label>
                {/* Filled checkmark */}
                <AnimatePresence>
                  {values[field.id] !== undefined && values[field.id] !== '' && values[field.id] !== null && !errors[field.id] && (
                    <motion.div initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0, opacity:0 }}
                      className="flex-shrink-0 w-5 h-5 rounded-full bg-mint-500 flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 text-white"/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <FormField field={field} value={values[field.id]} onChange={val => setVal(field.id, val)} error={errors[field.id]}/>

              <AnimatePresence>
                {errors[field.id] && (
                  <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    className="text-xs text-red-500 mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0"/> {errors[field.id]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Upload progress */}
          <AnimatePresence>
            {submitting && <WalrusUploadProgress progress={uploadProgress} label={uploadStep || 'Storing on Walrus…'} done={false}/>}
          </AnimatePresence>

          {/* ── Submit ── */}
          <div className="pt-1 space-y-3">
            <motion.button type="submit" disabled={submitting}
              whileHover={submitting ? {} : { scale:1.01 }} whileTap={{ scale:0.98 }}
              className={`w-full flex items-center justify-center gap-3 py-4 font-bold rounded-2xl transition-all shadow-lg text-base text-white ${
                submitting ? 'bg-walrus-600 cursor-wait opacity-80'
                : wallet?.connected
                  ? 'bg-gradient-to-br from-walrus-400 to-walrus-600 hover:from-walrus-300 hover:to-walrus-500 shadow-walrus-500/30 hover:shadow-walrus-500/50'
                  : 'bg-gradient-to-br from-ink-600 to-ink-700 hover:from-ink-500 hover:to-ink-600 shadow-ink-900/20'
              }`}
            >
              {submitting ? (
                <><motion.div animate={{ rotate:360 }} transition={{ duration:0.8,repeat:Infinity,ease:'linear' }}><Loader2 className="w-5 h-5"/></motion.div>{uploadStep || 'Storing on Walrus…'}</>
              ) : !wallet?.connected ? (
                <><Wallet className="w-5 h-5"/> Connect Wallet to Submit</>
              ) : (
                <><Database className="w-5 h-5"/> Submit to Walrus</>
              )}
            </motion.button>

            {/* Trust footer */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
                <Database className="w-3 h-3 text-walrus-400"/>
                <span>Stored on Walrus</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-ink-300"/>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
                <Shield className="w-3 h-3 text-ocean-400"/>
                <span>Non-custodial</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-ink-300"/>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
                <Globe className="w-3 h-3 text-mint-500"/>
                <span>Mainnet</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ── Wallet Modal ── */}
      <WalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        reason={walletModalReason}
        requireConnect={false}
        onConnected={(result) => { setWallet({ ...result }); setWalletModalOpen(false) }}
      />
    </div>
  )
}
