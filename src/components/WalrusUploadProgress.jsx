import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, CheckCircle, Wifi, Server, Shield, Zap } from 'lucide-react'

// Walrus seal SVG logo
function WalrusSeal({ size = 28, glow = false, pulse = false }) {
  return (
    <motion.div
      animate={pulse ? {
        scale: [1, 1.08, 1],
        opacity: [0.85, 1, 0.85],
      } : {}}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
    >
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-full bg-walrus-400/30 blur-md"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <ellipse cx="16" cy="20" rx="10" ry="9" fill="#14b8a6" fillOpacity="0.9" />
        {/* Head */}
        <circle cx="16" cy="11" r="7" fill="#14b8a6" />
        {/* Eyes */}
        <circle cx="13.5" cy="10" r="1.5" fill="white" />
        <circle cx="18.5" cy="10" r="1.5" fill="white" />
        <circle cx="13.8" cy="10.3" r="0.7" fill="#0f766e" />
        <circle cx="18.8" cy="10.3" r="0.7" fill="#0f766e" />
        {/* Whiskers */}
        <line x1="9" y1="12" x2="13" y2="12.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="9" y1="13.5" x2="13" y2="13" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="23" y1="12" x2="19" y2="12.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="23" y1="13.5" x2="19" y2="13" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
        {/* Nose */}
        <ellipse cx="16" cy="12.5" rx="1.2" ry="0.8" fill="#0f766e" />
        {/* Flippers */}
        <ellipse cx="7" cy="22" rx="2.5" ry="2" fill="#0d9488" transform="rotate(-20 7 22)" />
        <ellipse cx="25" cy="22" rx="2.5" ry="2" fill="#0d9488" transform="rotate(20 25 22)" />
        {/* Tail */}
        <ellipse cx="16" cy="29" rx="5" ry="2" fill="#0d9488" />
      </svg>
    </motion.div>
  )
}

// Animated node dots that represent Walrus storage nodes
function StorageNodes({ progress = 0 }) {
  const nodes = 8
  const activeNodes = Math.floor(progress * nodes)

  return (
    <div className="flex items-center justify-center gap-1.5 my-2">
      {Array.from({ length: nodes }, (_, i) => {
        const isActive = i < activeNodes
        const isCurrent = i === activeNodes
        return (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0.3 }}
            animate={isActive ? {
              scale: 1,
              opacity: 1,
              backgroundColor: '#14b8a6',
            } : isCurrent ? {
              scale: [0.8, 1.1, 0.8],
              opacity: [0.5, 1, 0.5],
              backgroundColor: '#0d9488',
            } : {
              scale: 0.7,
              opacity: 0.25,
              backgroundColor: '#1f2937',
            }}
            transition={isCurrent
              ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.3, delay: i * 0.05 }
            }
            className="w-2 h-2 rounded-full border border-walrus-500/30"
          />
        )
      })}
    </div>
  )
}

// The stages of a Walrus upload
const UPLOAD_STAGES = [
  { id: 'encode',   label: 'Encoding data…',            icon: Zap,      range: [0, 0.25] },
  { id: 'register', label: 'Registering on Sui chain…', icon: Shield,   range: [0.25, 0.45] },
  { id: 'upload',   label: 'Writing to storage nodes…', icon: Wifi,     range: [0.45, 0.8] },
  { id: 'certify',  label: 'Certifying on-chain…',      icon: Server,   range: [0.8, 0.95] },
  { id: 'done',     label: 'Stored on Walrus!',          icon: CheckCircle, range: [0.95, 1.0] },
]

function getCurrentStage(progress) {
  if (progress >= 1) return UPLOAD_STAGES[4]
  return UPLOAD_STAGES.find(s => progress >= s.range[0] && progress < s.range[1]) || UPLOAD_STAGES[0]
}

export default function WalrusUploadProgress({
  progress = 0,
  done = false,
  label,
  mode = 'http',  // 'sdk' | 'http'
  compact = false,
}) {
  const p = done ? 1.0 : Math.min(progress, 0.99)
  const stage = getCurrentStage(done ? 1.0 : p)
  const StageIcon = stage.icon
  const pct = Math.round((done ? 1.0 : p) * 100)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (done || p >= 1) return
    const t = setInterval(() => setTick(n => n + 1), 80)
    return () => clearInterval(t)
  }, [done, p])

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 px-3 py-2 bg-walrus-500/8 border border-walrus-500/20 rounded-xl"
      >
        <WalrusSeal size={18} pulse={!done} />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-medium text-walrus-300 truncate">
              {done ? '✓ Stored on Walrus' : (label || stage.label)}
            </span>
            <span className="text-[10px] text-walrus-400 font-mono flex-shrink-0 ml-2">{pct}%</span>
          </div>
          <div className="w-full h-1 bg-ink-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${done ? 'bg-mint-400' : 'bg-gradient-to-r from-walrus-600 to-walrus-400'}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="bg-ink-900/95 border border-walrus-500/25 rounded-2xl overflow-hidden shadow-xl shadow-walrus-500/10"
    >
      {/* Top glow bar */}
      <motion.div
        className="h-0.5 bg-gradient-to-r from-transparent via-walrus-400 to-transparent"
        animate={{ opacity: done ? 0 : [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-walrus-500/15 border border-walrus-500/25 flex items-center justify-center">
              <WalrusSeal size={30} glow={!done} pulse={!done} />
            </div>
            {!done && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-walrus-400 rounded-full border-2 border-ink-900"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            {done && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-mint-500 rounded-full flex items-center justify-center border-2 border-ink-900"
              >
                <CheckCircle className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {done ? 'Stored on Walrus' : 'Uploading to Walrus'}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  mode === 'sdk'
                    ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                    : 'text-ocean-400 bg-ocean-500/10 border-ocean-500/20'
                }`}>
                  {mode === 'sdk' ? 'SDK' : 'HTTP'}
                </span>
                <span className="text-[10px] font-semibold text-walrus-400 bg-walrus-500/10 px-2 py-0.5 rounded-full border border-walrus-500/20">
                  MAINNET
                </span>
              </div>
            </div>
            <p className="text-xs text-ink-400 mt-0.5">Decentralized storage on Walrus Protocol</p>
          </div>
        </div>

        {/* Stage indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 mb-3"
          >
            <motion.div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                done ? 'bg-mint-500/20' : 'bg-walrus-500/20'
              }`}
              animate={!done ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.6, repeat: !done ? Infinity : 0, repeatDelay: 1 }}
            >
              <StageIcon className={`w-3.5 h-3.5 ${done ? 'text-mint-400' : 'text-walrus-400'}`} />
            </motion.div>
            <span className={`text-xs font-semibold ${done ? 'text-mint-300' : 'text-walrus-200'}`}>
              {done ? '✓ All data certified on Walrus mainnet' : (label || stage.label)}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Storage node visualization */}
        {!done && <StorageNodes progress={p} />}

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-ink-500">
              {done ? 'Complete' : 'Progress'}
            </span>
            <span className="text-xs font-mono font-bold text-walrus-400">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-ink-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full relative overflow-hidden ${done ? 'bg-mint-500' : 'bg-walrus-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            >
              {!done && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Stage steps row */}
        <div className="flex items-center gap-1 mt-3">
          {UPLOAD_STAGES.slice(0, 4).map((s, i) => {
            const stageProgress = (done ? 1 : p)
            const isComplete = stageProgress >= s.range[1]
            const isActive = stageProgress >= s.range[0] && stageProgress < s.range[1]
            const Icon = s.icon
            return (
              <React.Fragment key={s.id}>
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className={`flex items-center gap-1 flex-1 justify-center py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                    isComplete ? 'bg-mint-500/10 text-mint-400 border border-mint-500/20' :
                    isActive   ? 'bg-walrus-500/15 text-walrus-300 border border-walrus-500/30' :
                                 'bg-ink-800/50 text-ink-600 border border-transparent'
                  }`}
                >
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {isComplete ? '✓' : s.label.split(' ')[0]}
                  </span>
                </motion.div>
                {i < 3 && (
                  <div className={`w-3 h-px flex-shrink-0 ${
                    stageProgress >= UPLOAD_STAGES[i + 1].range[0] ? 'bg-walrus-500/60' : 'bg-ink-700'
                  }`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Done — blob ID */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 flex items-center gap-1.5 p-2 bg-walrus-500/5 border border-walrus-500/15 rounded-lg"
          >
            <Database className="w-3.5 h-3.5 text-walrus-400 flex-shrink-0" />
            <span className="text-[10px] text-walrus-300 font-mono">Blob certified on Walrus mainnet ✓</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
