import React from 'react'
import {
  Clock, Eye, CheckCircle, XCircle, Zap, Archive, FileEdit,
  Flame, AlertTriangle, AlertCircle, Minus,
  Bug, Lightbulb, ClipboardList, MessageSquare, Headphones,
  Search, UserCheck, MoreHorizontal
} from 'lucide-react'

// ─── STATUS ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  open:        { label: 'Open',      icon: Clock,        cls: 'bg-ocean-500/15 text-ocean-300 border-ocean-500/30',  dot: 'bg-ocean-400' },
  'in-review': { label: 'In Review', icon: Eye,          cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  resolved:    { label: 'Resolved',  icon: CheckCircle,  cls: 'bg-mint-500/15 text-mint-300 border-mint-500/30',    dot: 'bg-mint-400' },
  closed:      { label: 'Closed',    icon: XCircle,      cls: 'bg-ink-600/30 text-ink-400 border-ink-600/40',       dot: 'bg-ink-500' },
  active:      { label: 'Active',    icon: Zap,          cls: 'bg-mint-500/15 text-mint-300 border-mint-500/30',    dot: 'bg-mint-400' },
  archived:    { label: 'Archived',  icon: Archive,      cls: 'bg-ink-600/30 text-ink-400 border-ink-600/40',       dot: 'bg-ink-500' },
  draft:       { label: 'Draft',     icon: FileEdit,     cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
}

// ─── PRIORITY ─────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  critical: { label: 'Critical', icon: Flame,         cls: 'bg-red-500/15 text-red-300 border-red-500/30',       dot: 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]' },
  high:     { label: 'High',     icon: AlertTriangle, cls: 'bg-coral-500/15 text-coral-300 border-coral-500/30', dot: 'bg-coral-400' },
  medium:   { label: 'Medium',   icon: AlertCircle,   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  low:      { label: 'Low',      icon: Minus,         cls: 'bg-ink-600/25 text-ink-400 border-ink-600/35',       dot: 'bg-ink-500' },
}

// ─── CATEGORY ─────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  'Bug Report':      { icon: Bug,           cls: 'bg-red-500/12 text-red-300 border-red-500/25' },
  'Feature Request': { icon: Lightbulb,     cls: 'bg-violet-500/12 text-violet-300 border-violet-500/25' },
  'Survey':          { icon: ClipboardList, cls: 'bg-ocean-500/12 text-ocean-300 border-ocean-500/25' },
  'Feedback':        { icon: MessageSquare, cls: 'bg-walrus-500/12 text-walrus-300 border-walrus-500/25' },
  'Support':         { icon: Headphones,    cls: 'bg-amber-500/12 text-amber-300 border-amber-500/25' },
  'Research':        { icon: Search,        cls: 'bg-mint-500/12 text-mint-300 border-mint-500/25' },
  'Application':     { icon: UserCheck,     cls: 'bg-coral-500/12 text-coral-300 border-coral-500/25' },
  'Other':           { icon: MoreHorizontal,cls: 'bg-ink-600/25 text-ink-400 border-ink-600/35' },
}

export function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.open
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${c.cls}`}>
      <Icon className="w-2.5 h-2.5" />
      {c.label}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const c = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  )
}

export function CategoryBadge({ category }) {
  const c = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other']
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${c.cls}`}>
      <Icon className="w-2.5 h-2.5" />
      {category || 'Other'}
    </span>
  )
}

// Light-theme variants (for FillForm page which has a light bg)
export function StatusBadgeLight({ status }) {
  const LIGHT = {
    open:        'bg-blue-50 text-blue-700 border-blue-200',
    'in-review': 'bg-amber-50 text-amber-700 border-amber-200',
    resolved:    'bg-green-50 text-green-700 border-green-200',
    closed:      'bg-gray-100 text-gray-600 border-gray-200',
    active:      'bg-green-50 text-green-700 border-green-200',
    archived:    'bg-gray-100 text-gray-600 border-gray-200',
    draft:       'bg-amber-50 text-amber-700 border-amber-200',
  }
  const LABELS = { open:'Open','in-review':'In Review',resolved:'Resolved',closed:'Closed',active:'Active',archived:'Archived',draft:'Draft' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${LIGHT[status] || LIGHT.open}`}>
      {LABELS[status] || status}
    </span>
  )
}
