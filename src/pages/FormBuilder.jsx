import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Eye, Database,
  Type, AlignLeft, ChevronDownSquare, Star, CheckSquare, Link as LinkIcon,
  Image, Shield, ArrowLeft, X, Video, AlertCircle, Loader2, Zap, Layers,
  Info, CheckCircle, Sparkles, FileText
} from 'lucide-react'
import { createForm } from '../store/useStore.js'
import { uploadToWalrus } from '../lib/walrus.js'
import { useToast } from '../components/Toast.jsx'
import WalrusBadge from '../components/WalrusBadge.jsx'
import WalrusUploadProgress from '../components/WalrusUploadProgress.jsx'
import { CategoryBadge } from '../components/StatusBadge.jsx'

const FIELD_TYPES = [
  { type:'text',       label:'Short Text',   icon:Type,             desc:'Single-line text answer',      color:'walrus' },
  { type:'richtext',   label:'Long Text',    icon:AlignLeft,        desc:'Multi-line rich text editor',   color:'ocean'  },
  { type:'dropdown',   label:'Dropdown',     icon:ChevronDownSquare,desc:'Select from a list of options', color:'amber'  },
  { type:'rating',     label:'Star Rating',  icon:Star,             desc:'1–5 star visual rating',        color:'coral'  },
  { type:'checkbox',   label:'Checkbox',     icon:CheckSquare,      desc:'Yes / No boolean toggle',       color:'mint'   },
  { type:'url',        label:'URL',          icon:LinkIcon,         desc:'Website or resource link',      color:'ocean'  },
  { type:'screenshot', label:'Image Upload', icon:Image,            desc:'Photo or screenshot (Walrus)',  color:'walrus' },
  { type:'video',      label:'Video Upload', icon:Video,            desc:'Video file (Walrus blob)',      color:'coral'  },
]

const CATEGORIES = ['Bug Report','Feature Request','Survey','Feedback','Support','Research','Application','Other']

function newField(type) {
  return {
    id: 'field-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
    type, label:'', placeholder:'', required:false,
    options: type === 'dropdown' ? ['Option 1','Option 2'] : undefined,
  }
}

const COLOR_MAP = {
  walrus:{ bg:'bg-walrus-500/10', border:'border-walrus-500/20', icon:'text-walrus-400', hover:'hover:bg-walrus-500/15 hover:border-walrus-500/30' },
  ocean: { bg:'bg-ocean-500/10',  border:'border-ocean-500/20',  icon:'text-ocean-400',  hover:'hover:bg-ocean-500/15 hover:border-ocean-500/30'  },
  amber: { bg:'bg-amber-500/10',  border:'border-amber-500/20',  icon:'text-amber-400',  hover:'hover:bg-amber-500/15 hover:border-amber-500/30'  },
  coral: { bg:'bg-coral-500/10',  border:'border-coral-500/20',  icon:'text-coral-400',  hover:'hover:bg-coral-500/15 hover:border-coral-500/30'  },
  mint:  { bg:'bg-mint-500/10',   border:'border-mint-500/20',   icon:'text-mint-400',   hover:'hover:bg-mint-500/15 hover:border-mint-500/30'   },
}

/* ── Toggle ── */
function Toggle({ on, onToggle, label, sublabel, color = 'walrus' }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none" onClick={onToggle}>
      <div className={`relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0 ${on ? (color==='amber'?'bg-amber-500':'bg-walrus-500') : 'bg-ink-700'}`}
        style={{ height:'22px' }}>
        <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-white leading-tight">{label}</p>
        {sublabel && <p className="text-[11px] text-ink-500 mt-0.5">{sublabel}</p>}
      </div>
    </label>
  )
}

/* ── Field type picker button ── */
function TypeButton({ ft, onClick }) {
  const Icon = ft.icon
  const c = COLOR_MAP[ft.color] || COLOR_MAP.walrus
  return (
    <motion.button
      whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 ${c.bg} border ${c.border} ${c.hover} rounded-2xl transition-all group text-center`}
    >
      <div className={`w-9 h-9 flex items-center justify-center bg-white/[0.07] rounded-xl flex-shrink-0`}>
        <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
      </div>
      <div>
        <p className={`text-[12px] font-bold ${c.icon} leading-tight`}>{ft.label}</p>
        <p className="text-[10px] text-ink-500 leading-snug mt-0.5">{ft.desc}</p>
      </div>
    </motion.button>
  )
}

/* ── Single field editor ── */
function FieldEditor({ field, onUpdate, onDelete }) {
  const [open, setOpen] = useState(true)
  const typeInfo = FIELD_TYPES.find(t => t.type === field.type)
  const Icon = typeInfo?.icon || Type
  const c = COLOR_MAP[typeInfo?.color || 'walrus']

  const updateOption = (i, val) => {
    const opts = [...(field.options||[])]
    opts[i] = val; onUpdate({ options: opts })
  }
  const addOption = () => onUpdate({ options:[...(field.options||[]),`Option ${(field.options?.length||0)+1}`] })
  const removeOption = (i) => onUpdate({ options:(field.options||[]).filter((_,j)=>j!==i) })

  return (
    <div className="bg-ink-900/80 border border-white/[0.08] hover:border-white/[0.14] rounded-2xl overflow-hidden transition-all duration-200 group/card">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
        <div className="cursor-grab active:cursor-grabbing text-ink-700 hover:text-ink-500 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className={`w-8 h-8 flex items-center justify-center ${c.bg} border ${c.border} rounded-xl flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {field.label || <span className="text-ink-500 italic font-normal text-sm">Untitled {typeInfo?.label}</span>}
          </p>
          <p className="text-[11px] text-ink-500">{typeInfo?.label}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {field.required && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-500/10 text-coral-400 border border-coral-500/20">Required</span>
          )}
          <button onClick={() => setOpen(o => !o)}
            className="w-7 h-7 flex items-center justify-center text-ink-500 hover:text-white rounded-lg hover:bg-white/8 transition-colors">
            {open ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
          </button>
          <button onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center text-ink-600 hover:text-coral-400 rounded-lg hover:bg-coral-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
                    Label <span className="text-coral-400 normal-case font-normal">* required</span>
                  </label>
                  <input type="text" value={field.label} onChange={e => onUpdate({ label: e.target.value })}
                    placeholder={`e.g. ${typeInfo?.label || 'Field name'}`}
                    className="input-dark text-sm" />
                </div>
                {(field.type === 'text' || field.type === 'url' || field.type === 'richtext') && (
                  <div>
                    <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">Placeholder</label>
                    <input type="text" value={field.placeholder || ''} onChange={e => onUpdate({ placeholder: e.target.value })}
                      placeholder="Hint text shown to respondent…"
                      className="input-dark text-sm" />
                  </div>
                )}
              </div>

              {field.type === 'dropdown' && (
                <div>
                  <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-2">
                    Options <span className="text-ink-600 font-normal normal-case">({field.options?.length || 0})</span>
                  </label>
                  <div className="space-y-2">
                    {(field.options||[]).map((opt,i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-6 text-center text-[11px] text-ink-600 font-mono font-bold flex-shrink-0">{i+1}</span>
                        <input type="text" value={opt} onChange={e => updateOption(i,e.target.value)}
                          placeholder={`Option ${i+1}`}
                          className="flex-1 px-3 py-2 text-sm bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-ink-600 focus:outline-none focus:ring-2 focus:ring-walrus-500/30 transition-all" />
                        <button onClick={() => removeOption(i)}
                          className="w-7 h-7 flex items-center justify-center text-ink-600 hover:text-coral-400 rounded-lg hover:bg-coral-500/10 transition-colors flex-shrink-0">
                          <X className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    ))}
                    <button onClick={addOption}
                      className="flex items-center gap-1.5 text-sm text-walrus-400 hover:text-walrus-300 font-medium transition-colors">
                      <Plus className="w-4 h-4"/> Add option
                    </button>
                  </div>
                </div>
              )}

              {(field.type === 'screenshot' || field.type === 'video') && (
                <div className="flex items-start gap-2.5 p-3 bg-ocean-500/8 border border-ocean-500/20 rounded-xl">
                  <Info className="w-4 h-4 text-ocean-400 flex-shrink-0 mt-0.5"/>
                  <p className="text-xs text-ocean-300 leading-relaxed">
                    {field.type === 'video'
                      ? 'Video files are stored as Walrus blobs (MP4, WebM, MOV). Max 100MB recommended.'
                      : 'Images are stored as Walrus blobs (JPEG, PNG, GIF, WebP). Displayed inline in dashboard.'}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                <Toggle on={field.required} onToggle={() => onUpdate({ required:!field.required })}
                  label="Required field" sublabel="Respondent must fill this" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Summary row item ── */
function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
      <span className="text-xs text-ink-500">{label}</span>
      <span className={`text-xs font-semibold ${highlight || 'text-white'}`}>{value}</span>
    </div>
  )
}

export default function FormBuilder() {
  const navigate = useNavigate()
  const toast = useToast()
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]     = useState('Feedback')
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [fields, setFields]         = useState([])
  const [saving, setSaving]         = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadDone, setUploadDone] = useState(false)
  const [preview, setPreview]       = useState(false)
  const [addingField, setAddingField] = useState(false)

  const addField = (type) => { setFields(f => [...f, newField(type)]); setAddingField(false) }
  const updateField = useCallback((id, updates) => {
    setFields(fs => fs.map(f => f.id === id ? { ...f, ...updates } : f))
  }, [])
  const deleteField = useCallback((id) => { setFields(fs => fs.filter(f => f.id !== id)) }, [])

  const handleSave = async () => {
    if (!title.trim()) { toast('Please enter a form title.', 'error'); return }
    if (fields.length === 0) { toast('Add at least one field before publishing.', 'error'); return }
    const bad = fields.filter(f => !f.label.trim())
    if (bad.length > 0) { toast(`${bad.length} field(s) need a label.`, 'error'); return }

    setSaving(true); setUploadProgress(0); setUploadDone(false)
    let walrusBlobId = null
    try {
      const result = await uploadToWalrus({ title:title.trim(), description:description.trim(), category, isEncrypted, fields, publishedAt:new Date().toISOString(), network:'mainnet' }, { epochs:5, onProgress:p=>setUploadProgress(p) })
      walrusBlobId = result.blobId
      setUploadDone(true)
      await new Promise(r => setTimeout(r, 400))
    } catch(e) { console.warn('[Walrus] form upload failed:', e.message); setUploadDone(true) }

    try {
      const form = createForm({ title:title.trim(), description:description.trim(), category, isEncrypted, fields, walrusBlobId, network:'mainnet', syncPending:!walrusBlobId })
      walrusBlobId
        ? toast(`Published to Walrus — ${walrusBlobId.slice(0,16)}…`, 'success', 5000)
        : toast('Form published and ready!', 'success')
      navigate(`/forms/${form.id}`)
    } catch(err) { toast('Save failed: ' + err.message, 'error') }
    finally { setSaving(false) }
  }

  const canPublish = title.trim() && fields.length > 0 && fields.every(f => f.label.trim())
  const requiredCount = fields.filter(f => f.required).length

  return (
    <div className="min-h-screen bg-ink-950">

      {/* ── Fixed toolbar ── */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-ink-950/97 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}
              className="w-8 h-8 flex items-center justify-center text-ink-400 hover:text-white rounded-xl hover:bg-white/8 transition-colors">
              <ArrowLeft className="w-4 h-4"/>
            </button>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-walrus-500/20 border border-walrus-500/30 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-walrus-400"/>
                </div>
                <h1 className="text-sm font-bold text-white">Form Builder</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-walrus-500/10 text-walrus-400 border border-walrus-500/20 font-semibold">→ Walrus</span>
              </div>
            </div>
          </div>

          {/* Progress bar inline */}
          {title.trim() && (
            <div className="flex-1 max-w-xs hidden md:flex items-center gap-2">
              <div className="flex-1 h-1 bg-ink-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-walrus-500 to-walrus-400 rounded-full"
                  animate={{ width: `${Math.min(100, (fields.length / 5) * 100)}%` }}
                  transition={{ type:'spring', stiffness:200, damping:25 }} />
              </div>
              <span className="text-[11px] text-ink-500 font-medium whitespace-nowrap">{fields.length} field{fields.length!==1?'s':''}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${
                preview ? 'bg-walrus-500/15 text-walrus-300 border border-walrus-500/25' : 'text-ink-400 hover:text-white hover:bg-white/8'
              }`}>
              <Eye className="w-4 h-4"/> {preview ? 'Edit' : 'Preview'}
            </button>
            <motion.button onClick={handleSave} disabled={saving || !canPublish}
              whileHover={saving || !canPublish ? {} : { scale:1.02 }} whileTap={{ scale:0.97 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-walrus-400 to-walrus-600 hover:from-walrus-300 hover:to-walrus-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-walrus-500/25">
              {saving
                ? <><motion.div animate={{ rotate:360 }} transition={{ duration:0.8,repeat:Infinity,ease:'linear' }}><Loader2 className="w-4 h-4"/></motion.div> Publishing…</>
                : <><Database className="w-4 h-4"/> Publish to Walrus</>}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mt-6">

          {/* ── Left: Form editor ── */}
          <div className="space-y-5">

            {/* Form metadata card */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              className="bg-ink-900/70 border border-white/[0.08] rounded-3xl p-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-walrus-500/15 border border-walrus-500/25 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-walrus-400"/>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Form Details</h2>
                  <p className="text-[11px] text-ink-500">Title, description and settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
                    Form Title <span className="text-coral-400 normal-case font-normal">*</span>
                  </label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Product Feedback · Bug Report · User Survey"
                    className="input-dark text-sm w-full" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
                    Description <span className="text-ink-600 normal-case font-normal">(optional)</span>
                  </label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Give respondents context about this form's purpose…"
                    rows={2} className="input-dark text-sm w-full resize-none" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-ink-800 border border-white/[0.09] rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-walrus-500/30 transition-all cursor-pointer">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {category && <div className="mt-2"><CategoryBadge category={category}/></div>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">Encryption</label>
                    <div className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isEncrypted
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-white/15'
                    }`} onClick={() => setIsEncrypted(e => !e)}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isEncrypted ? 'bg-amber-500/20' : 'bg-white/[0.06]'}`}>
                          <Shield className={`w-4 h-4 ${isEncrypted ? 'text-amber-400' : 'text-ink-500'}`}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${isEncrypted ? 'text-amber-400' : 'text-ink-400'}`}>
                            {isEncrypted ? '🔐 Seal Encrypted' : 'No Encryption'}
                          </p>
                          <p className="text-[10px] text-ink-600 leading-tight">
                            {isEncrypted ? 'Submissions encrypted via Walrus Seal' : 'Submissions stored as plaintext blobs'}
                          </p>
                        </div>
                        <div className={`w-9 h-5 rounded-full flex-shrink-0 transition-all ${isEncrypted ? 'bg-amber-500' : 'bg-ink-700'}`} style={{height:'20px',position:'relative'}}>
                          <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform ${isEncrypted?'translate-x-[18px]':'translate-x-[2px]'}`}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Upload progress */}
            <AnimatePresence>
              {saving && <WalrusUploadProgress progress={uploadProgress} done={uploadDone} label="Publishing form schema to Walrus…"/>}
            </AnimatePresence>

            {/* Fields section */}
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-walrus-400"/>
                  <h2 className="text-sm font-bold text-white">Form Fields</h2>
                  <span className="text-[11px] text-ink-600 bg-ink-800 px-2 py-0.5 rounded-full font-mono">{fields.length}</span>
                </div>
                {fields.length > 0 && (
                  <button onClick={() => setAddingField(true)}
                    className="flex items-center gap-1.5 text-xs text-walrus-400 hover:text-walrus-300 font-semibold transition-colors">
                    <Plus className="w-3.5 h-3.5"/> Add Field
                  </button>
                )}
              </div>

              {fields.length === 0 && !addingField && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="text-center py-16 bg-ink-900/40 border-2 border-dashed border-white/[0.07] rounded-3xl">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-walrus-500/8 border border-walrus-500/15 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-walrus-500"/>
                  </div>
                  <p className="text-sm font-semibold text-ink-400 mb-1">No fields yet</p>
                  <p className="text-xs text-ink-600 mb-5">Add fields to build your form</p>
                  <button onClick={() => setAddingField(true)}
                    className="px-5 py-2.5 text-sm font-semibold text-walrus-300 bg-walrus-500/10 hover:bg-walrus-500/20 border border-walrus-500/25 rounded-xl transition-all">
                    + Add First Field
                  </button>
                </motion.div>
              )}

              {/* Reorderable field list */}
              <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-3">
                <AnimatePresence>
                  {fields.map(field => (
                    <Reorder.Item key={field.id} value={field} className="list-none">
                      <FieldEditor field={field} onUpdate={u => updateField(field.id,u)} onDelete={() => deleteField(field.id)}/>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>

              {/* Add field picker */}
              <AnimatePresence>
                {addingField ? (
                  <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                    className="mt-3 bg-ink-900/80 border border-white/[0.10] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-white">Choose field type</p>
                        <p className="text-[11px] text-ink-500">Click a type to add it to your form</p>
                      </div>
                      <button onClick={() => setAddingField(false)}
                        className="w-7 h-7 flex items-center justify-center text-ink-500 hover:text-white rounded-lg hover:bg-white/8 transition-colors">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {FIELD_TYPES.map(ft => <TypeButton key={ft.type} ft={ft} onClick={() => addField(ft.type)}/>)}
                    </div>
                  </motion.div>
                ) : fields.length > 0 && (
                  <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} onClick={() => setAddingField(true)}
                    className="w-full mt-3 py-3.5 border-2 border-dashed border-white/[0.07] hover:border-walrus-500/30 text-ink-500 hover:text-walrus-400 text-sm font-medium rounded-2xl transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4"/> Add Another Field
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-4">

            {/* Publish card */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
              className="bg-ink-900/70 border border-white/[0.08] rounded-3xl p-5 sticky top-20 shadow-xl shadow-black/10">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-walrus-400"/>
                <h3 className="text-sm font-bold text-white">Publish Summary</h3>
              </div>

              <div className="space-y-0 mb-5 bg-ink-950/40 rounded-xl overflow-hidden border border-white/[0.05] px-3">
                <SummaryRow label="Fields" value={fields.length} />
                <SummaryRow label="Required" value={requiredCount} highlight={requiredCount>0?'text-coral-400':undefined} />
                <SummaryRow label="Category" value={category} />
                <SummaryRow label="Encryption"
                  value={isEncrypted ? '🔐 Seal' : 'None'}
                  highlight={isEncrypted ? 'text-amber-400' : undefined} />
                <SummaryRow label="Storage"
                  value="Walrus (5 epochs)"
                  highlight="text-walrus-400" />
                <SummaryRow label="Network" value="Sui Mainnet" highlight="text-ocean-400" />
              </div>

              {/* Validation hints */}
              <div className="space-y-2 mb-4">
                {[
                  { ok:!!title.trim(), label:'Form title set' },
                  { ok:fields.length>0, label:'At least one field' },
                  { ok:fields.every(f=>f.label.trim()), label:'All fields have labels' },
                ].map(({ ok, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    {ok
                      ? <CheckCircle className="w-3.5 h-3.5 text-mint-400 flex-shrink-0"/>
                      : <div className="w-3.5 h-3.5 rounded-full border-2 border-ink-600 flex-shrink-0"/>}
                    <span className={ok ? 'text-ink-300' : 'text-ink-600'}>{label}</span>
                  </div>
                ))}
              </div>

              <motion.button onClick={handleSave} disabled={saving || !canPublish}
                whileHover={saving || !canPublish ? {} : { scale:1.01 }} whileTap={{ scale:0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-walrus-400 to-walrus-600 hover:from-walrus-300 hover:to-walrus-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-lg shadow-walrus-500/25 text-sm">
                {saving
                  ? <><motion.div animate={{ rotate:360 }} transition={{ duration:0.8,repeat:Infinity,ease:'linear' }}><Loader2 className="w-4 h-4"/></motion.div> Publishing…</>
                  : <><Zap className="w-4 h-4"/> Publish Form</>}
              </motion.button>
              <p className="text-center text-[10px] text-ink-600 mt-2">Schema stored on Walrus · 5 epochs</p>
            </motion.div>

            {/* Field types guide */}
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
              className="bg-ink-900/50 border border-white/[0.06] rounded-2xl p-4">
              <p className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-3">Available Field Types</p>
              <div className="space-y-2">
                {FIELD_TYPES.map(ft => {
                  const Icon = ft.icon
                  const c = COLOR_MAP[ft.color] || COLOR_MAP.walrus
                  return (
                    <div key={ft.type} className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 flex items-center justify-center ${c.bg} rounded-lg flex-shrink-0`}>
                        <Icon className={`w-3 h-3 ${c.icon}`}/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink-300 leading-tight">{ft.label}</p>
                        <p className="text-[10px] text-ink-600 truncate">{ft.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
