/**
 * Global state store — localStorage-backed, reactive
 * No seed data. All data is real, stored on Walrus mainnet.
 */

const LS_FORMS       = 'walforms_forms_v2'
const LS_SUBMISSIONS = 'walforms_submissions_v2'
const LS_WALLET      = 'walforms_wallet_v2'

function loadFromLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

let _forms       = loadFromLS(LS_FORMS, [])
let _submissions = loadFromLS(LS_SUBMISSIONS, [])
let _wallet      = loadFromLS(LS_WALLET, { address: null, connected: false })

const listeners = new Set()
function notify() { listeners.forEach(fn => fn()) }

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export function getWallet() { return _wallet }

export function setWallet(wallet) {
  _wallet = wallet
  saveToLS(LS_WALLET, _wallet)
  notify()
}

// ─── Forms ────────────────────────────────────────────────────────────────────
export function getForms() { return _forms }

export function getFormById(id) {
  return _forms.find(f => f.id === id) || null
}

export function createForm(data) {
  const id  = 'form-' + Date.now()
  const now = new Date().toISOString()
  const form = {
    id,
    ...data,
    createdAt:    now,
    updatedAt:    now,
    submissions:  0,
    views:        0,
    status:       'active',
    walrusBlobId: data.walrusBlobId || null,
    network:      'mainnet',
  }
  _forms = [form, ..._forms]
  saveToLS(LS_FORMS, _forms)
  notify()
  return form
}

export function updateForm(id, updates) {
  _forms = _forms.map(f =>
    f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
  )
  saveToLS(LS_FORMS, _forms)
  notify()
}

export function deleteForm(id) {
  _forms       = _forms.filter(f => f.id !== id)
  _submissions = _submissions.filter(s => s.formId !== id)
  saveToLS(LS_FORMS, _forms)
  saveToLS(LS_SUBMISSIONS, _submissions)
  notify()
}

export function incrementFormViews(id) {
  _forms = _forms.map(f =>
    f.id === id ? { ...f, views: (f.views || 0) + 1 } : f
  )
  saveToLS(LS_FORMS, _forms)
}

// ─── Submissions ──────────────────────────────────────────────────────────────
export function getSubmissions() { return _submissions }

export function getSubmissionsForForm(formId) {
  return _submissions.filter(s => s.formId === formId)
}

export function submitForm(formId, data, opts = {}) {
  const form = getFormById(formId)
  if (!form) throw new Error('Form not found')

  const id  = 'sub-' + Date.now()
  const now = new Date().toISOString()
  const sub = {
    id,
    formId,
    formTitle:     form.title,
    submittedAt:   now,
    walrusBlobId:  opts.walrusBlobId || null,
    isEncrypted:   form.isEncrypted,
    network:       'mainnet',
    status:        'open',
    priority:      'medium',
    notes:         '',
    walletAddress: opts.walletAddress || null,
    data,
  }
  _submissions = [sub, ..._submissions]
  _forms = _forms.map(f =>
    f.id === formId ? { ...f, submissions: (f.submissions || 0) + 1 } : f
  )
  saveToLS(LS_SUBMISSIONS, _submissions)
  saveToLS(LS_FORMS, _forms)
  notify()
  return sub
}

export function updateSubmission(id, updates) {
  _submissions = _submissions.map(s =>
    s.id === id ? { ...s, ...updates } : s
  )
  saveToLS(LS_SUBMISSIONS, _submissions)
  notify()
}

export function deleteSubmission(id) {
  const sub = _submissions.find(s => s.id === id)
  _submissions = _submissions.filter(s => s.id !== id)
  if (sub) {
    _forms = _forms.map(f =>
      f.id === sub.formId
        ? { ...f, submissions: Math.max(0, (f.submissions || 1) - 1) }
        : f
    )
    saveToLS(LS_FORMS, _forms)
  }
  saveToLS(LS_SUBMISSIONS, _submissions)
  notify()
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
export function exportSubmissionsCSV(formId) {
  const subs = formId
    ? _submissions.filter(s => s.formId === formId)
    : _submissions

  if (!subs.length) return null

  const dataKeys = [...new Set(subs.flatMap(s => Object.keys(s.data || {})))]
  const headers  = [
    'ID', 'Form', 'Submitted At', 'Status', 'Priority',
    'Walrus Blob ID', 'Encrypted', 'Wallet', ...dataKeys, 'Notes',
  ]

  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const rows = subs.map(s => [
    s.id,
    s.formTitle,
    s.submittedAt,
    s.status,
    s.priority,
    s.walrusBlobId || '',
    s.isEncrypted ? 'Yes' : 'No',
    s.walletAddress || '',
    ...dataKeys.map(k => {
      const v = s.data?.[k]
      if (typeof v === 'boolean') return v ? 'Yes' : 'No'
      if (typeof v === 'number')  return String(v)
      return v || ''
    }),
    s.notes || '',
  ].map(escape).join(','))

  return [headers.join(','), ...rows].join('\n')
}
