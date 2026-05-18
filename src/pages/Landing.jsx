import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Database, Shield, Zap, Globe, ArrowRight, CheckCircle,
  LayoutDashboard, PlusCircle, Lock, FileText, BarChart3,
  Star, Image, Type, AlignLeft, Link as LinkIcon, ChevronDown,
  Users, TrendingUp, Sparkles, Video, CheckSquare, Play,
  BookOpen, ExternalLink, ChevronRight
} from 'lucide-react'
import LiveCounter from '../components/LiveCounter.jsx'

/* ── Floating animated blob ── */
function Blob({ className, delay = 0, duration = 22 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ x: [0, 50, -30, 0], y: [0, -40, 25, 0], scale: [1, 1.12, 0.94, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* ── Animated counter ── */
function Counter({ target, suffix = '', duration = 2 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const steps = 50
      const inc = target / steps
      let cur = 0
      const t = setInterval(() => {
        cur += inc
        if (cur >= target) { setVal(target); clearInterval(t) }
        else setVal(Math.floor(cur))
      }, (duration * 1000) / steps)
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ── Section label pill ── */
function SectionPill({ icon: Icon, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-flex items-center gap-2 px-4 py-1.5 bg-walrus-500/10 border border-walrus-500/25 rounded-full text-walrus-300 text-sm font-semibold mb-5"
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </motion.div>
  )
}

const FEATURES = [
  { icon: Database, title: 'Native Walrus Storage', desc: 'Every form schema and response is a cryptographically-addressed blob on Walrus decentralized storage — permanent, censorship-resistant.', gradient: 'from-walrus-500/20 to-walrus-700/5', border: 'border-walrus-500/25', iconBg: 'bg-walrus-500/15', iconColor: 'text-walrus-400' },
  { icon: Shield, title: 'Seal Encryption', desc: 'Sensitive submissions protected by Walrus Seal threshold encryption — only authorized parties with Sui keys can decrypt responses.', gradient: 'from-amber-500/20 to-amber-700/5', border: 'border-amber-500/25', iconBg: 'bg-amber-500/15', iconColor: 'text-amber-400' },
  { icon: Zap, title: 'Visual Form Builder', desc: 'Drag-and-drop fields, star ratings, file uploads, rich text — all configurable in a slick live-preview builder.', gradient: 'from-ocean-500/20 to-ocean-700/5', border: 'border-ocean-500/25', iconBg: 'bg-ocean-500/15', iconColor: 'text-ocean-400' },
  { icon: Globe, title: 'Shareable Links', desc: 'Each form gets a unique public URL. Respondents fill in a clean mobile-friendly interface — no wallet required.', gradient: 'from-mint-500/20 to-mint-700/5', border: 'border-mint-500/25', iconBg: 'bg-mint-500/15', iconColor: 'text-mint-400' },
  { icon: BarChart3, title: 'Admin Dashboard', desc: 'Filter, review, prioritize and export submissions. Full status workflow with CSV export, inline notes, and media previews.', gradient: 'from-coral-500/20 to-coral-700/5', border: 'border-coral-500/25', iconBg: 'bg-coral-500/15', iconColor: 'text-coral-400' },
  { icon: Lock, title: 'Sui Wallet Auth', desc: 'Connect your Sui wallet to sign submissions. Associate responses with on-chain identity. Fully non-custodial.', gradient: 'from-walrus-500/20 to-ocean-500/5', border: 'border-walrus-500/20', iconBg: 'bg-walrus-500/10', iconColor: 'text-walrus-300' },
]

const FIELD_TYPES = [
  { icon: Type,        label: 'Short Text',   desc: 'Single-line answer' },
  { icon: AlignLeft,   label: 'Long Text',    desc: 'Rich multi-line editor' },
  { icon: ChevronDown, label: 'Dropdown',     desc: 'Select from options' },
  { icon: Star,        label: 'Star Rating',  desc: '1–5 star rating' },
  { icon: CheckSquare, label: 'Checkbox',     desc: 'Yes / No toggle' },
  { icon: LinkIcon,    label: 'URL Field',    desc: 'Website link input' },
  { icon: Image,       label: 'Image Upload', desc: 'Photo / screenshot' },
  { icon: Video,       label: 'Video Upload', desc: 'Video file upload' },
]

const HOW_STEPS = [
  { n: '01', title: 'Build your form', desc: 'Use the drag-and-drop builder to add fields. Configure validation, placeholders, and optionally enable Seal encryption.', icon: PlusCircle, color: 'from-walrus-400 to-walrus-600', glow: 'shadow-walrus-500/30' },
  { n: '02', title: 'Publish to Walrus', desc: 'Hit Publish — your form schema is encoded as JSON and stored as a permanent blob on Walrus decentralized storage.', icon: Database, color: 'from-ocean-400 to-walrus-500', glow: 'shadow-ocean-500/30' },
  { n: '03', title: 'Share & collect', desc: 'Share your unique link. Every submission is independently stored as a new Walrus blob with optional wallet signature.', icon: Globe, color: 'from-mint-400 to-ocean-500', glow: 'shadow-mint-500/30' },
  { n: '04', title: 'Manage & export', desc: 'Review submissions in the admin dashboard. Filter, update status, add notes, view media inline, and export CSV.', icon: LayoutDashboard, color: 'from-coral-400 to-walrus-500', glow: 'shadow-coral-500/30' },
]

const STATS = [
  { value: 100, suffix: '%', label: 'On-chain storage', icon: Database, color: 'text-walrus-400' },
  { value: 4,   suffix: '+', label: 'Publisher nodes',  icon: Globe,    color: 'text-ocean-400' },
  { value: 8,   suffix: '',  label: 'Field types',      icon: FileText, color: 'text-amber-400' },
  { value: 5,   suffix: 'y', label: 'Default epochs',   icon: Shield,   color: 'text-mint-400' },
]

export default function Landing() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -60])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3])

  return (
    <div className="min-h-screen bg-ink-950 text-white overflow-hidden">

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-20">
        {/* Background */}
        <Blob className="w-[700px] h-[700px] bg-walrus-500/12 -top-40 -left-60" delay={0} duration={28} />
        <Blob className="w-[500px] h-[500px] bg-ocean-500/10 top-32 -right-40" delay={6} duration={22} />
        <Blob className="w-[400px] h-[400px] bg-walrus-700/10 bottom-0 left-1/3" delay={10} duration={25} />
        <div className="absolute inset-0 grid-pattern opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'backOut' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-walrus-500/10 border border-walrus-500/25 rounded-full text-walrus-300 text-sm font-semibold mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Feedback infrastructure for Web3 — powered by Walrus
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'backOut' }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] mb-6 text-balance"
          >
            Forms that live
            <br />
            <span className="gradient-text">on Walrus.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="text-lg sm:text-xl text-ink-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Build forms. Store submissions as Walrus blobs. Never worry about servers.
            <br className="hidden sm:block" />
            Native decentralized storage with optional Seal encryption.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link to="/builder" className="btn-primary text-base px-7 py-3.5 rounded-2xl group">
              <PlusCircle className="w-5 h-5" />
              Build a Form
              <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/guide" className="btn-secondary text-base px-7 py-3.5 rounded-2xl">
              <BookOpen className="w-5 h-5 text-ink-400" />
              Read the Guide
            </Link>
          </motion.div>

          {/* Live counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <LiveCounter />
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-600"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════ */}
      <section className="relative py-16 border-y border-white/[0.05] bg-ink-900/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className={`text-4xl font-black mb-1 ${s.color}`}>
                  <Counter target={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-ink-400 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════ */}
      <section className="relative py-24 px-4">
        <Blob className="w-[500px] h-[500px] bg-walrus-500/8 -right-40 top-0" delay={2} duration={20} />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionPill icon={Zap} label="How it works" />
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              Four steps to decentralized forms
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-ink-400 text-lg max-w-xl mx-auto"
            >
              No servers. No databases. Just Walrus blobs and Sui.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {HOW_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="relative bg-ink-900/60 border border-white/[0.07] hover:border-walrus-500/30 rounded-2xl p-6 group transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg ${step.glow} flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black text-ink-600 font-mono">{step.n}</span>
                        <h3 className="font-bold text-white text-lg">{step.title}</h3>
                      </div>
                      <p className="text-ink-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                  {i < 3 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      {i % 2 === 0 && <ChevronRight className="w-5 h-5 text-ink-700" />}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 bg-ink-900/20">
        <Blob className="w-[600px] h-[600px] bg-ocean-500/6 -left-60 top-0" delay={4} duration={26} />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionPill icon={Sparkles} label="Features" />
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              Everything you need
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-ink-400 text-lg max-w-xl mx-auto"
            >
              Built natively on Walrus — no compromises on decentralization.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className={`bg-gradient-to-br ${f.gradient} border ${f.border} rounded-2xl p-6 group cursor-default transition-all duration-300`}
                >
                  <div className={`w-11 h-11 rounded-xl ${f.iconBg} border ${f.border} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
                  <p className="text-ink-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ FIELD TYPES ══════════════════════════════════════════ */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <SectionPill icon={FileText} label="Field types" />
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              8 powerful field types
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FIELD_TYPES.map((ft, i) => {
              const Icon = ft.icon
              return (
                <motion.div
                  key={ft.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
                  whileHover={{ scale: 1.04, y: -3 }}
                  className="bg-ink-900/60 border border-white/[0.07] hover:border-walrus-500/30 rounded-2xl p-4 text-center group transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-walrus-500/10 border border-walrus-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-walrus-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-walrus-400" />
                  </div>
                  <p className="text-sm font-semibold text-white">{ft.label}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{ft.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-gradient-to-br from-walrus-500/20 via-ink-900/80 to-ocean-500/10 border border-walrus-500/25 rounded-3xl p-10 md:p-16 text-center"
          >
            <Blob className="w-96 h-96 bg-walrus-500/20 -top-20 -left-20" delay={0} duration={18} />
            <Blob className="w-80 h-80 bg-ocean-500/15 -bottom-20 -right-20" delay={4} duration={22} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-walrus-400 to-walrus-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-walrus-500/30 animate-pulse-ring">
                <Database className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Start building <span className="gradient-text">for free</span>
              </h2>
              <p className="text-ink-300 text-lg mb-8 max-w-lg mx-auto">
                No sign-up. Connect your Sui wallet and publish your first form to Walrus mainnet in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/builder" className="btn-primary text-base px-8 py-3.5 rounded-2xl">
                  <PlusCircle className="w-5 h-5" /> Create First Form
                </Link>
                <Link to="/guide" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
                  <BookOpen className="w-5 h-5 text-ink-400" /> Read Guide
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8 px-4 text-center">
        <p className="text-ink-600 text-sm">
          Built on <a href="https://walrus.xyz" target="_blank" rel="noopener noreferrer" className="text-walrus-500 hover:text-walrus-400 transition-colors">Walrus</a> decentralized storage &amp; <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="text-ocean-500 hover:text-ocean-400 transition-colors">Sui</a> blockchain.
          <span className="mx-2 text-ink-700">·</span>
          <Link to="/guide" className="text-ink-500 hover:text-white transition-colors">Docs & Guide</Link>
        </p>
      </footer>
    </div>
  )
}
