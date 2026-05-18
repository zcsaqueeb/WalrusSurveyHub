import React, { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }
const COLORS = {
  success: 'bg-mint-500/15 border-mint-500/30 text-mint-200',
  error: 'bg-coral-500/15 border-coral-500/30 text-coral-200',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-200',
  info: 'bg-ocean-500/15 border-ocean-500/30 text-ocean-200',
}
const ICON_COLORS = { success: 'text-mint-400', error: 'text-coral-400', warning: 'text-amber-400', info: 'text-ocean-400' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
    return id
  }, [])
  const dismiss = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const Icon = ICONS[t.type] || Info
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl pointer-events-auto ${COLORS[t.type]}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ICON_COLORS[t.type]}`} />
                <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
                <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
