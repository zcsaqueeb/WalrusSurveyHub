import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Database, Shield, Clock, Eye,
  ChevronRight, Trash2, Copy, MoreVertical,
  FileText, BarChart3, Globe, Layers, Sparkles,
  TrendingUp, Filter, X
} from 'lucide-react'
import { useStoreData } from '../hooks/useStoreData.js'
import { deleteForm } from '../store/useStore.js'
import { StatusBadge, CategoryBadge } from '../components/StatusBadge.jsx'
import WalrusBadge from '../components/WalrusBadge.jsx'
import { useToast } from '../components/Toast.jsx'

const CATEGORIES = ['All', 'Bug Report', 'Feature Request', 'Survey', 'Feedback', 'Support', 'Research', 'Other']

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Stat pill ── */
function StatPill({ icon: Icon, value, label, color = 'text-ink-400' }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-xs text-ink-400 font-medium">
        <span className="text-ink-300 font-semibold">{value}</span> {label}
      </span>
    </div>
  )
}

/* ── Form Card ── */
function FormCard({ form, onDelete, index }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleCopyLink = async (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}${window.location.pathname.replace(/\/$/, '')}#/forms/${form.id}/fill`
    await navigator.clipboard.writeText(url)
    toast('Link copied!', 'success')
    setMenuOpen(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ y: -3 }}
      className="group relative bg-ink-900/70 border border-white/[0.07] hover:border-walrus-500/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-walrus-500/5"
    >
      {/* Top accent */}
      <div className="h-0.5 bg-gradient-to-r from-walrus-500/40 via-walrus-400/60 to-ocean-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5">
        {/* Row 1 — badges + menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={form.category} />
            {form.isEncrypted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Shield className="w-2.5 h-2.5" /> Sealed
              </span>
            )}
            {form.walrusBlobId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-walrus-500/10 text-walrus-400 border border-walrus-500/20">
                <Database className="w-2.5 h-2.5" /> On-chain
              </span>
            )}
          </div>

          {/* Menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
              className="w-7 h-7 flex items-center justify-center text-ink-600 hover:text-white rounded-lg hover:bg-white/8 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -6 }}
                    transition={{ duration: 0.13 }}
                    className="absolute right-0 top-8 z-20 bg-ink-900 border border-white/10 rounded-2xl shadow-2xl w-44 py-2 overflow-hidden"
                  >
                    <button onClick={() => { navigate(`/forms/${form.id}`); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-300 hover:text-white hover:bg-white/[0.07] transition-colors">
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                    <Link to={`/forms/${form.id}/fill`} onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-300 hover:text-white hover:bg-white/[0.07] transition-colors">
                      <FileText className="w-4 h-4" /> Fill Form
                    </Link>
                    <button onClick={handleCopyLink}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-300 hover:text-white hover:bg-white/[0.07] transition-colors">
                      <Copy className="w-4 h-4" /> Copy Link
                    </button>
                    <div className="h-px bg-white/[0.06] my-1 mx-2" />
                    <button onClick={e => { e.stopPropagation(); onDelete(form.id); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-coral-400 hover:bg-coral-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete Form
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 2 — title & description */}
        <div className="mb-4">
          <h3 className="font-bold text-white text-[15px] leading-snug group-hover:text-walrus-300 transition-colors duration-200 line-clamp-2 mb-1.5">
            {form.title}
          </h3>
          {form.description && (
            <p className="text-sm text-ink-500 line-clamp-2 leading-relaxed">{form.description}</p>
          )}
        </div>

        {/* Row 3 — Walrus badge */}
        <WalrusBadge blobId={form.walrusBlobId} encrypted={form.isEncrypted} small network={form.network} />

        {/* Row 4 — stats */}
        <div className="flex items-center gap-4 mt-4 pt-3.5 border-t border-white/[0.05]">
          <StatPill icon={Layers} value={form.fields?.length || 0} label="fields" color="text-walrus-500" />
          <StatPill icon={BarChart3} value={form.submissions || 0} label="responses" color="text-ocean-500" />
          <StatPill icon={Eye} value={form.views || 0} label="views" color="text-ink-500" />
          <div className="ml-auto flex items-center gap-1 text-ink-600">
            <Clock className="w-3 h-3" />
            <span className="text-[11px]">{formatDate(form.createdAt)}</span>
          </div>
        </div>

        {/* Row 5 — actions */}
        <div className="flex gap-2 mt-4">
          <Link to={`/forms/${form.id}/fill`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-gradient-to-br from-walrus-500/20 to-walrus-600/20 hover:from-walrus-500/35 hover:to-walrus-600/35 border border-walrus-500/30 hover:border-walrus-400/50 rounded-xl transition-all active:scale-[0.97]"
          >
            <FileText className="w-3.5 h-3.5" /> Fill Form
          </Link>
          <Link to={`/forms/${form.id}`}
            className="flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-semibold text-ink-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.07] hover:border-white/15 rounded-xl transition-all active:scale-[0.97]"
          >
            Details <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Summary top bar ── */
function SummaryBar({ forms, submissions }) {
  const items = [
    { icon: FileText,  label: 'Total Forms',    value: forms.length,       color: 'text-walrus-400' },
    { icon: BarChart3, label: 'Responses',       value: submissions.length, color: 'text-ocean-400' },
    { icon: Database,  label: 'On Walrus',       value: forms.filter(f => f.walrusBlobId).length, color: 'text-mint-400' },
    { icon: Shield,    label: 'Seal Encrypted',  value: forms.filter(f => f.isEncrypted).length,  color: 'text-amber-400' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {items.map((item, i) => (
        <motion.div key={item.label}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
          className="bg-ink-900/60 border border-white/[0.06] rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0`}>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>
          <div>
            <p className="text-xl font-black text-white tabular-nums">{item.value}</p>
            <p className="text-[11px] text-ink-500 font-medium leading-tight">{item.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function FormsList() {
  const { forms, submissions } = useStoreData()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  const handleDelete = (id) => {
    if (!window.confirm('Delete this form and all its submissions?')) return
    deleteForm(id)
    toast('Form deleted.', 'success')
  }

  let filtered = forms.filter(f => {
    const q = search.toLowerCase()
    const matchSearch = !search || f.title.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q)
    const matchCat = category === 'All' || f.category === category
    return matchSearch && matchCat
  })

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'newest')    return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest')    return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'responses') return (b.submissions || 0) - (a.submissions || 0)
    if (sortBy === 'views')     return (b.views || 0) - (a.views || 0)
    return 0
  })

  return (
    <div className="min-h-screen bg-ink-950 pb-20 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-walrus-400/20 to-walrus-600/10 border border-walrus-500/30 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-walrus-400" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Your Forms</h1>
            </div>
            <p className="text-sm text-ink-500 ml-11">
              {forms.length === 0
                ? 'Build your first decentralized form'
                : `${forms.length} form${forms.length !== 1 ? 's' : ''} · ${submissions.length} total submissions`}
            </p>
          </div>
          <Link to="/builder"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-walrus-400 to-walrus-600 hover:from-walrus-300 hover:to-walrus-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-walrus-500/25 hover:-translate-y-0.5 active:scale-[0.97]">
            <Plus className="w-4 h-4" /> New Form
          </Link>
        </motion.div>

        {/* ── Summary Bar ── */}
        {forms.length > 0 && <SummaryBar forms={forms} submissions={submissions} />}

        {/* ── Search + Sort ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
            <input type="text" placeholder="Search forms by title or description…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-dark pl-10 pr-10 text-sm w-full" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="input-dark text-sm w-full sm:w-44 appearance-none cursor-pointer">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="responses">Most responses</option>
            <option value="views">Most views</option>
          </select>
        </motion.div>

        {/* ── Category pills ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
          className="flex gap-2 overflow-x-auto pb-3 mb-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 border ${
                category === cat
                  ? 'bg-walrus-500/15 text-walrus-300 border-walrus-500/35 shadow-sm'
                  : 'bg-white/[0.04] text-ink-500 border-white/[0.06] hover:text-ink-200 hover:bg-white/[0.08]'
              }`}>
              {cat}
            </button>
          ))}
        </motion.div>

        {/* ── Results label ── */}
        {(search || category !== 'All') && (
          <p className="text-xs text-ink-600 mb-4">
            Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            {search && <> for "<span className="text-ink-400">{search}</span>"</>}
            {category !== 'All' && <> in <span className="text-ink-400">{category}</span></>}
            <button onClick={() => { setSearch(''); setCategory('All') }}
              className="ml-2 text-walrus-500 hover:text-walrus-400 transition-colors">clear</button>
          </p>
        )}

        {/* ── Grid or Empty ── */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-28 border border-dashed border-white/[0.08] rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-walrus-500/8 border border-walrus-500/15 flex items-center justify-center">
              {search || category !== 'All'
                ? <Filter className="w-7 h-7 text-walrus-600" />
                : <Sparkles className="w-7 h-7 text-walrus-500" />}
            </div>
            <h3 className="text-lg font-bold text-ink-400 mb-2">
              {search || category !== 'All' ? 'No matches found' : 'No forms yet'}
            </h3>
            <p className="text-sm text-ink-600 mb-7 max-w-xs mx-auto">
              {search || category !== 'All'
                ? 'Try adjusting your search or category filter.'
                : 'Create your first form to start collecting responses stored on Walrus.'}
            </p>
            {search || category !== 'All'
              ? <button onClick={() => { setSearch(''); setCategory('All') }}
                  className="btn-secondary text-sm px-5">Clear filters</button>
              : <Link to="/builder" className="btn-primary text-sm px-5">
                  <Plus className="w-4 h-4" /> Create First Form
                </Link>
            }
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((form, i) => (
                <FormCard key={form.id} form={form} index={i} onDelete={handleDelete} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
