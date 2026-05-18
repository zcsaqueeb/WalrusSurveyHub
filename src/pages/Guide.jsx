import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BookOpen, Database, Shield, Globe, Zap, ArrowRight,
  PlusCircle, FileText, BarChart3, ChevronDown, ChevronRight,
  CheckCircle, AlertTriangle, Copy, ExternalLink, Wallet,
  Play, Star, Image, Video, AlignLeft, Type, Link as LinkIcon,
  CheckSquare, Lock, Terminal, Code, Info, Sparkles, LayoutDashboard,
  Trash2, RefreshCw
} from 'lucide-react'

function Blob({ className, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* ── Accordion FAQ item ── */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="font-semibold text-white text-sm pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown className="w-4 h-4 text-ink-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-ink-400 leading-relaxed border-t border-white/[0.05] pt-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Step card ── */
function Step({ n, title, desc, children, icon: Icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex gap-5"
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="w-0.5 flex-1 bg-gradient-to-b from-walrus-500/30 to-transparent mt-3 min-h-[2rem]" />
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black text-ink-600 font-mono">{n}</span>
          <h3 className="font-bold text-white text-lg">{title}</h3>
        </div>
        <p className="text-ink-400 text-sm leading-relaxed mb-4">{desc}</p>
        {children}
      </div>
    </motion.div>
  )
}

/* ── Code snippet ── */
function CodeBlock({ label, code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="bg-ink-950 border border-white/[0.08] rounded-xl overflow-hidden text-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
        <span className="text-ink-500 font-mono text-[11px]">{label}</span>
        <button onClick={copy} className="flex items-center gap-1 text-ink-500 hover:text-white transition-colors">
          <Copy className="w-3 h-3" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-walrus-300 font-mono leading-relaxed">{code}</pre>
    </div>
  )
}

/* ── Field type card ── */
function FieldCard({ icon: Icon, label, desc, color }) {
  return (
    <div className={`flex items-start gap-3 p-3 bg-${color}-500/5 border border-${color}-500/15 rounded-xl`}>
      <div className={`w-8 h-8 rounded-lg bg-${color}-500/15 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 text-${color}-400`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-ink-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

/* ── Progress bar nav ── */
const SECTIONS = [
  { id: 'overview',   label: 'Overview',       icon: BookOpen },
  { id: 'quickstart', label: 'Quick Start',     icon: Zap },
  { id: 'builder',    label: 'Form Builder',    icon: PlusCircle },
  { id: 'walrus',     label: 'Walrus Storage',  icon: Database },
  { id: 'dashboard',  label: 'Admin Dashboard', icon: LayoutDashboard },
  { id: 'encryption', label: 'Seal Encryption', icon: Shield },
  { id: 'faq',        label: 'FAQ',             icon: Info },
  { id: 'cleardata',  label: 'Clear Data',      icon: Trash2 },
]

export default function Guide() {
  const [activeSection, setActiveSection] = useState('overview')

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setActiveSection(id) }
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white pt-16">

      {/* Hero */}
      <div className="relative py-16 px-4 border-b border-white/[0.05] overflow-hidden">
        <Blob className="w-96 h-96 bg-walrus-500/10 -top-20 -left-20 opacity-60" />
        <Blob className="w-80 h-80 bg-ocean-500/8 top-10 -right-20 opacity-50" delay={3} />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-walrus-500/10 border border-walrus-500/25 rounded-full text-walrus-300 text-sm font-semibold mb-5"
          >
            <BookOpen className="w-3.5 h-3.5" /> Documentation & Guide
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-4"
          >
            WalrusForms <span className="gradient-text">Guide</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-ink-400 text-lg max-w-2xl mx-auto"
          >
            Everything you need to build, deploy, and manage decentralized forms — powered by Walrus storage and the Sui blockchain.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 flex gap-10">

        {/* ── Sticky sidebar nav ── */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="text-[10px] font-bold text-ink-600 uppercase tracking-widest mb-3 px-3">Contents</p>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                  activeSection === id
                    ? 'bg-walrus-500/12 text-walrus-300 border border-walrus-500/25'
                    : 'text-ink-500 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-2">
              <Link to="/builder" className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-walrus-400 to-walrus-600 text-white text-xs font-semibold rounded-xl">
                <PlusCircle className="w-3.5 h-3.5" /> New Form
              </Link>
              <a href="https://docs.walrus.xyz" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center gap-2 px-3 py-2 bg-white/[0.05] text-ink-400 hover:text-white text-xs font-medium rounded-xl transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Walrus Docs
              </a>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 space-y-20">

          {/* OVERVIEW */}
          <section id="overview">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-walrus-500/15 border border-walrus-500/25 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-walrus-400" />
                </div>
                <h2 className="text-2xl font-black text-white">Overview</h2>
              </div>
              <p className="text-ink-300 leading-relaxed mb-5">
                <strong className="text-white">WalrusForms</strong> is a fully decentralized form and feedback platform. Unlike traditional platforms that store your data on centralized servers, WalrusForms uses <strong className="text-walrus-300">Walrus Protocol</strong> — a decentralized blob storage network built on Sui — to persist every form schema and submission permanently on-chain.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Database, color: 'walrus', title: 'Walrus Storage', desc: 'All data stored as blobs on Walrus decentralized storage network' },
                  { icon: Globe, color: 'ocean', title: 'No Backend', desc: 'Entirely frontend + Walrus. No servers, databases, or APIs to maintain' },
                  { icon: Shield, color: 'amber', title: 'Seal Encryption', desc: 'Optional threshold encryption for sensitive submissions via Walrus Seal' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className={`p-4 bg-${color}-500/8 border border-${color}-500/20 rounded-2xl`}>
                    <Icon className={`w-5 h-5 text-${color}-400 mb-2`} />
                    <p className="font-semibold text-white text-sm mb-1">{title}</p>
                    <p className="text-xs text-ink-400 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-ink-300">
                  <strong className="text-amber-300">Important:</strong> Walrus blobs are public by default. For sensitive data, always enable Seal encryption. Forms are stored using Walrus mainnet by default (5 epochs ≈ ~2 years).
                </p>
              </div>
            </motion.div>
          </section>

          {/* QUICK START */}
          <section id="quickstart">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-ocean-500/15 border border-ocean-500/25 flex items-center justify-center">
                <Zap className="w-5 h-5 text-ocean-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Quick Start</h2>
            </div>

            <div className="space-y-2">
              <Step n="01" title="Open the Form Builder" icon={PlusCircle} color="from-walrus-400 to-walrus-600"
                desc="Click 'New Form' in the top navbar or visit /builder. No account or wallet required to start building.">
                <Link to="/builder" className="inline-flex items-center gap-2 text-sm text-walrus-400 hover:text-walrus-300 font-medium transition-colors">
                  Open Form Builder <ArrowRight className="w-4 h-4" />
                </Link>
              </Step>

              <Step n="02" title="Add your fields" icon={FileText} color="from-ocean-400 to-walrus-500"
                desc="Use the field type picker to add Short Text, Long Text, Dropdowns, Star Ratings, Checkboxes, URLs, Image uploads, and Video uploads. Drag to reorder.">
              </Step>

              <Step n="03" title="Publish to Walrus" icon={Database} color="from-mint-400 to-ocean-500"
                desc="Click Publish. The form schema is serialized to JSON and uploaded to Walrus via the HTTP publisher fallback (no wallet needed) or SDK mode (with wallet + WAL tokens).">
                <CodeBlock label="What gets stored" code={`// Form schema stored as Walrus blob
{
  "id": "form-1234567890",
  "title": "Product Feedback",
  "description": "Tell us what you think",
  "fields": [...],
  "isEncrypted": false,
  "createdAt": "2025-01-01T00:00:00Z"
}`} />
              </Step>

              <Step n="04" title="Share your form link" icon={Globe} color="from-coral-400 to-walrus-500"
                desc="Copy the unique URL from the form detail page. Anyone with the link can fill out your form — no wallet required for respondents.">
                <CodeBlock label="Example form URL" code={`https://yourapp.com/#/forms/form-1234567890/fill`} />
              </Step>

              <Step n="05" title="View in Admin Dashboard" icon={LayoutDashboard} color="from-amber-400 to-coral-500"
                desc="Navigate to /dashboard. Enter the admin password (default: walrus2025). All submissions from all forms appear here with filtering, status management, and CSV export.">
              </Step>
            </div>
          </section>

          {/* FORM BUILDER */}
          <section id="builder">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-walrus-500/15 border border-walrus-500/25 flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-walrus-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Form Builder</h2>
            </div>
            <p className="text-ink-400 mb-6 leading-relaxed">The visual form builder lets you create and configure forms with a live preview. Drag fields to reorder them, configure validation, and preview exactly how respondents will see your form.</p>

            <h3 className="text-lg font-bold text-white mb-4">Available Field Types</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              <FieldCard icon={Type}        label="Short Text"   desc="Single-line text. Good for names, emails, short answers."      color="walrus" />
              <FieldCard icon={AlignLeft}   label="Long Text"    desc="Multi-line rich text editor. Good for detailed feedback."       color="ocean" />
              <FieldCard icon={ChevronDown} label="Dropdown"     desc="Select from a predefined list. Configure options in builder."   color="amber" />
              <FieldCard icon={Star}        label="Star Rating"  desc="1–5 star visual rating input. Stored as integer."               color="coral" />
              <FieldCard icon={CheckSquare} label="Checkbox"     desc="Yes/No boolean toggle. Rendered as checkbox."                   color="mint" />
              <FieldCard icon={LinkIcon}    label="URL Field"    desc="Validated URL input. Shows as clickable link in dashboard."     color="ocean" />
              <FieldCard icon={Image}       label="Image Upload" desc="Photo/screenshot upload. File stored as separate Walrus blob."  color="walrus" />
              <FieldCard icon={Video}       label="Video Upload" desc="Video file upload. Stored as blob, playable in dashboard."      color="coral" />
            </div>

            <div className="p-4 bg-ink-900/60 border border-white/[0.07] rounded-2xl mb-4">
              <p className="text-sm font-bold text-white mb-2">Form settings</p>
              <ul className="text-sm text-ink-400 space-y-1.5">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-mint-400 flex-shrink-0 mt-0.5" /> <span><strong className="text-white">Title & Description</strong> — shown at top of the fill form</span></li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-mint-400 flex-shrink-0 mt-0.5" /> <span><strong className="text-white">Category</strong> — Bug Report, Feature Request, Survey, etc.</span></li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-mint-400 flex-shrink-0 mt-0.5" /> <span><strong className="text-white">Required fields</strong> — toggle per-field required validation</span></li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-mint-400 flex-shrink-0 mt-0.5" /> <span><strong className="text-white">Seal encryption</strong> — encrypt submission data (requires Sui wallet)</span></li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-mint-400 flex-shrink-0 mt-0.5" /> <span><strong className="text-white">Storage epochs</strong> — how long to store on Walrus (default 5 epochs)</span></li>
              </ul>
            </div>
          </section>

          {/* WALRUS STORAGE */}
          <section id="walrus">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-walrus-500/15 border border-walrus-500/25 flex items-center justify-center">
                <Database className="w-5 h-5 text-walrus-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Walrus Storage</h2>
            </div>

            <p className="text-ink-400 mb-5 leading-relaxed">WalrusForms uses the <strong className="text-white">@mysten/walrus SDK</strong> for direct storage node writes (SDK mode) and falls back to public HTTP publisher endpoints when no wallet is connected.</p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-5 bg-walrus-500/8 border border-walrus-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-walrus-400" />
                  <p className="font-bold text-white text-sm">SDK Mode (Recommended)</p>
                </div>
                <ul className="text-xs text-ink-400 space-y-1.5">
                  <li className="flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-mint-400 flex-shrink-0 mt-0.5" /> Requires Sui wallet + WAL tokens</li>
                  <li className="flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-mint-400 flex-shrink-0 mt-0.5" /> Direct write to storage nodes</li>
                  <li className="flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-mint-400 flex-shrink-0 mt-0.5" /> Full decentralization guarantee</li>
                  <li className="flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-mint-400 flex-shrink-0 mt-0.5" /> 3-step: encode → register → certify</li>
                </ul>
              </div>
              <div className="p-5 bg-ocean-500/8 border border-ocean-500/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-ocean-400" />
                  <p className="font-bold text-white text-sm">HTTP Fallback</p>
                </div>
                <ul className="text-xs text-ink-400 space-y-1.5">
                  <li className="flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-mint-400 flex-shrink-0 mt-0.5" /> No wallet required</li>
                  <li className="flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-mint-400 flex-shrink-0 mt-0.5" /> Uses public community publisher nodes</li>
                  <li className="flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-mint-400 flex-shrink-0 mt-0.5" /> Auto-retries across 4 publishers</li>
                  <li className="flex gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-mint-400 flex-shrink-0 mt-0.5" /> Good for testing and respondents</li>
                </ul>
              </div>
            </div>

            <CodeBlock label="Blob lifecycle" code={`// 1. Form schema → JSON → Walrus blob
const { blobId } = await uploadToWalrus(formSchema, { epochs: 5 })

// 2. Submission data → JSON → Walrus blob
const { blobId } = await uploadToWalrus(submissionData, { epochs: 5 })

// 3. File attachment → binary → Walrus blob
const { blobId } = await uploadFileToWalrus(file, { epochs: 5 })

// 4. Read back any blob
const data = await getFromWalrus(blobId)

// 5. CDN URL for media
const url = getWalrusBlobUrl(blobId)
// → https://aggregator.walrus.space/v1/blobs/<blobId>`} />
          </section>

          {/* ADMIN DASHBOARD */}
          <section id="dashboard">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-coral-500/15 border border-coral-500/25 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-coral-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Admin Dashboard</h2>
            </div>

            <p className="text-ink-400 mb-5 leading-relaxed">The admin dashboard at <code className="text-walrus-300 bg-walrus-500/10 px-1.5 py-0.5 rounded text-sm">/dashboard</code> is protected by a password (default: <code className="text-walrus-300 bg-walrus-500/10 px-1.5 py-0.5 rounded text-sm font-mono">walrus2025</code>). It shows all submissions across all your forms.</p>

            <div className="space-y-3 mb-6">
              {[
                { icon: BarChart3, color: 'walrus', title: 'Statistics overview', desc: 'See total submissions, open/in-review/resolved counts and trend cards at a glance.' },
                { icon: FileText, color: 'ocean', title: 'Submission table', desc: 'Paginated, sortable table with search and multi-filter (status, priority, form, date range).' },
                { icon: Image, color: 'amber', title: 'Media preview (images & video)', desc: 'Images and videos stored as Walrus blobs render inline in the detail drawer — click to open in lightbox.' },
                { icon: CheckCircle, color: 'mint', title: 'Status & priority workflow', desc: 'Update each submission\'s status (Open → In Review → Resolved → Closed) and priority (Critical → Low).' },
                { icon: Terminal, color: 'coral', title: 'CSV export', desc: 'Export all or filtered submissions as CSV. Field values, Walrus blob IDs, and wallet addresses included.' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 bg-ink-900/50 border border-white/[0.06] rounded-xl">
                  <div className={`w-8 h-8 rounded-lg bg-${color}-500/12 border border-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 text-${color}-400`} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{title}</p>
                    <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl flex gap-3">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-ink-300">
                <strong className="text-amber-300">Media display:</strong> Images and videos require a valid Walrus blob URL. The dashboard automatically constructs <code className="text-walrus-300">aggregator.walrus.space/v1/blobs/&lt;blobId&gt;</code> URLs and renders them inline. If a blob is not yet propagated, the thumbnail shows a placeholder.
              </p>
            </div>
          </section>

          {/* SEAL ENCRYPTION */}
          <section id="encryption">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Seal Encryption</h2>
            </div>

            <p className="text-ink-400 mb-5 leading-relaxed"><strong className="text-white">Walrus Seal</strong> is threshold encryption powered by Sui validator keys. When enabled on a form, each submission is encrypted before being stored on Walrus. Only parties with the correct Sui access policy can decrypt.</p>

            <div className="p-5 bg-amber-500/8 border border-amber-500/20 rounded-2xl mb-5">
              <p className="font-bold text-amber-300 mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> How Seal works</p>
              <ol className="text-sm text-ink-300 space-y-2">
                {[
                  'Form creator enables "Seal Encryption" in the builder',
                  'A Seal policy is created on-chain linking to allowed Sui addresses',
                  'When a submission is made, data is encrypted with the policy key before upload',
                  'Encrypted blob is stored on Walrus — unreadable without decryption',
                  'Admin with correct Sui key can request threshold decryption from validators',
                ].map((s, i) => (
                  <li key={i} className="flex gap-2.5"><span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>{s}</li>
                ))}
              </ol>
            </div>

            <div className="p-4 bg-ink-900/60 border border-white/[0.06] rounded-xl">
              <p className="text-xs text-ink-500 leading-relaxed">
                <strong className="text-white">Note:</strong> Seal encryption requires the form creator to have a Sui wallet connected. Respondents do not need a wallet to submit to encrypted forms — their data is encrypted automatically client-side before upload.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-ocean-500/15 border border-ocean-500/25 flex items-center justify-center">
                <Info className="w-5 h-5 text-ocean-400" />
              </div>
              <h2 className="text-2xl font-black text-white">FAQ</h2>
            </div>

            <div className="space-y-2">
              <FAQ q="Do respondents need a Sui wallet?" a="No. Respondents can fill out any form without a wallet. Walrus HTTP publisher endpoints are used for upload. If the respondent has a wallet connected, their address is stored with the submission for on-chain identity." />
              <FAQ q="How long are forms and submissions stored?" a="By default, 5 Walrus epochs. Each epoch is approximately 146 days on mainnet, so 5 epochs ≈ 2 years. You can configure up to 200 epochs in the advanced settings. Note that WAL tokens are required to pay for extended storage." />
              <FAQ q="Can I edit a form after publishing?" a="Currently the form schema is immutable once uploaded to Walrus (blobs are content-addressed). To make changes, re-publish as a new form. Previous submissions remain linked to the old form ID." />
              <FAQ q="Why can't I see images/video in the dashboard?" a="Media blobs need to propagate across Walrus storage nodes. This typically takes 1–30 seconds after upload. If media still doesn't appear, verify the blob was successfully uploaded (check the blobId in submission details) and open the Walrus aggregator URL directly in your browser." />
              <FAQ q="Is the admin password secure?" a="The default password 'walrus2025' should be changed before production use. The dashboard password is stored in the component source — for production, use environment variables and a proper authentication system." />
              <FAQ q="What file types can I upload?" a="Images: JPEG, PNG, GIF, WebP. Videos: MP4, WebM, MOV. Files are stored as binary blobs on Walrus and retrieved via the aggregator CDN URL. Max file size is limited by Walrus blob size limits (~14MB per blob)." />
              <FAQ q="Can I export submissions?" a="Yes. The admin dashboard has a CSV export button that exports all submissions (or filtered results) including all field values, Walrus blob IDs, wallet addresses, status, priority, and notes." />
            </div>
          </section>


          {/* Clear local data */}
          <section id="cleardata">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-coral-500/15 border border-coral-500/25 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-coral-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Clear Local Data</h2>
            </div>

            <p className="text-ink-400 mb-5 leading-relaxed">
              WalrusForms stores form schemas, submissions, and wallet state in your browser's <code className="text-walrus-300 bg-walrus-500/10 px-1.5 py-0.5 rounded text-sm">localStorage</code>.
              Clearing this data only removes the local copy — blobs on Walrus mainnet are not affected.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {[
                { key:'walforms_forms_v2',       color:'walrus', label:'Form Schemas',    desc:'All form definitions and field configs' },
                { key:'walforms_submissions_v2',  color:'ocean',  label:'Submissions',     desc:'All collected form responses' },
                { key:'walforms_wallet_v2',       color:'amber',  label:'Wallet State',    desc:'Connected wallet address and session' },
              ].map(({ key, color, label, desc }) => (
                <div key={key} className={`p-3.5 bg-${color}-500/8 border border-${color}-500/20 rounded-xl`}>
                  <p className={`text-xs font-bold text-${color}-400 mb-1`}>{label}</p>
                  <p className="text-[10px] text-ink-500 mb-2">{desc}</p>
                  <code className="text-[10px] font-mono text-ink-600 break-all">{key}</code>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {/* One-click clear */}
              <div className="bg-ink-900/60 border border-white/[0.07] rounded-2xl p-5">
                <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-walrus-400" /> One-click clear (in-browser)
                </p>
                <button
                  onClick={() => {
                    const keys = ['walforms_forms_v2','walforms_submissions_v2','walforms_wallet_v2']
                    keys.forEach(k => localStorage.removeItem(k))
                    sessionStorage.removeItem('wf_admin')
                    alert('✓ All WalrusForms local data cleared. The page will reload.')
                    window.location.reload()
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-coral-500/10 hover:bg-coral-500/20 border border-coral-500/25 text-coral-400 hover:text-coral-300 text-sm font-semibold rounded-xl transition-all active:scale-[0.97]"
                >
                  <Trash2 className="w-4 h-4" /> Clear All Local Data
                </button>
                <p className="text-[11px] text-ink-600 mt-2">This reloads the page. Walrus blobs are NOT deleted.</p>
              </div>

              {/* Manual console command */}
              <CodeBlock label="DevTools Console — manual clear" code={`// Paste in browser DevTools Console (F12)
['walforms_forms_v2','walforms_submissions_v2','walforms_wallet_v2']
  .forEach(k => { localStorage.removeItem(k); console.log('Removed:', k) });
sessionStorage.removeItem('wf_admin');
console.log('✓ All WalrusForms data cleared');
location.reload();`} />

              <CodeBlock label="Dev server shortcut" code={`# In the WalrusForms dev server terminal, press:
x + enter   → Clear data instructions
d + enter   → Show stored data summary
h + enter   → Show all shortcuts`} />
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="pt-8 border-t border-white/[0.06]">
            <div className="bg-gradient-to-br from-walrus-500/15 to-ocean-500/10 border border-walrus-500/25 rounded-2xl p-8 text-center">
              <Sparkles className="w-8 h-8 text-walrus-400 mx-auto mb-3" />
              <h3 className="text-xl font-black text-white mb-2">Ready to build?</h3>
              <p className="text-ink-400 text-sm mb-5">Create your first decentralized form in minutes.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/builder" className="btn-primary px-6 py-2.5 text-sm rounded-xl">
                  <PlusCircle className="w-4 h-4" /> Start Building
                </Link>
                <Link to="/forms" className="btn-secondary px-6 py-2.5 text-sm rounded-xl">
                  <FileText className="w-4 h-4 text-ink-400" /> Browse Forms
                </Link>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
