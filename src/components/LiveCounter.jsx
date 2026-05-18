import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'

/**
 * Real online counter using BroadcastChannel API
 * Tracks actual open tabs/windows of this app.
 * Falls back gracefully if BroadcastChannel is unavailable.
 */

const CHANNEL_NAME = 'walrusforms_presence'
const HEARTBEAT_MS = 4000      // send ping every 4s
const TIMEOUT_MS   = 12000     // consider tab dead after 12s
const TAB_ID       = Math.random().toString(36).slice(2)

export default function LiveCounter() {
  const [count, setCount]     = useState(1)
  const [prevCount, setPrev]  = useState(1)
  const [dir, setDir]         = useState(0)
  const tabsRef               = useRef({ [TAB_ID]: Date.now() })
  const channelRef            = useRef(null)
  const timerRef              = useRef(null)

  useEffect(() => {
    // ── BroadcastChannel path (Chrome, Firefox, Safari 15.4+) ──
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(CHANNEL_NAME)
      channelRef.current = ch

      ch.onmessage = (e) => {
        if (e.data?.type === 'ping' && e.data?.id) {
          tabsRef.current[e.data.id] = Date.now()
          pruneAndUpdate()
        }
        if (e.data?.type === 'pong' && e.data?.id) {
          tabsRef.current[e.data.id] = Date.now()
          pruneAndUpdate()
        }
        if (e.data?.type === 'bye' && e.data?.id) {
          delete tabsRef.current[e.data.id]
          pruneAndUpdate()
        }
      }

      // Announce presence
      ch.postMessage({ type: 'ping', id: TAB_ID })

      // Heartbeat
      timerRef.current = setInterval(() => {
        tabsRef.current[TAB_ID] = Date.now()
        ch.postMessage({ type: 'ping', id: TAB_ID })
        pruneAndUpdate()
      }, HEARTBEAT_MS)

      // Cleanup on close
      const onUnload = () => ch.postMessage({ type: 'bye', id: TAB_ID })
      window.addEventListener('beforeunload', onUnload)

      return () => {
        clearInterval(timerRef.current)
        ch.postMessage({ type: 'bye', id: TAB_ID })
        ch.close()
        window.removeEventListener('beforeunload', onUnload)
      }
    } else {
      // ── Fallback: sessionStorage + storage events ──
      // Each tab writes its heartbeat to sessionStorage
      const key = `wf_tab_${TAB_ID}`
      sessionStorage.setItem(key, Date.now())

      const broadcast = () => {
        sessionStorage.setItem(key, Date.now())
        // Count all wf_tab_* keys that are fresh
        let live = 0
        const now = Date.now()
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i)
          if (k?.startsWith('wf_tab_')) {
            const t = parseInt(sessionStorage.getItem(k) || '0')
            if (now - t < TIMEOUT_MS) live++
          }
        }
        updateCount(live)
      }

      timerRef.current = setInterval(broadcast, HEARTBEAT_MS)
      broadcast()

      return () => {
        clearInterval(timerRef.current)
        sessionStorage.removeItem(key)
      }
    }
  }, [])

  const pruneAndUpdate = () => {
    const now = Date.now()
    for (const [id, ts] of Object.entries(tabsRef.current)) {
      if (now - ts > TIMEOUT_MS) delete tabsRef.current[id]
    }
    // Always count self
    tabsRef.current[TAB_ID] = Date.now()
    updateCount(Object.keys(tabsRef.current).length)
  }

  const updateCount = (n) => {
    setCount(prev => {
      if (n === prev) return prev
      setPrev(prev)
      setDir(n > prev ? 1 : -1)
      return n
    })
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 bg-mint-500/10 border border-mint-500/25 rounded-full"
      title={`${count} browser tab${count !== 1 ? 's' : ''} open`}
    >
      {/* Pulsing dot */}
      <span className="relative flex items-center justify-center">
        <span className="absolute w-2 h-2 bg-mint-400 rounded-full animate-ping opacity-60" />
        <span className="w-2 h-2 bg-mint-400 rounded-full" />
      </span>
      <Users className="w-3.5 h-3.5 text-mint-400" />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={count}
          initial={{ opacity: 0, y: dir > 0 ? -8 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: dir > 0 ? 8 : -8 }}
          transition={{ duration: 0.18 }}
          className="text-xs font-bold text-mint-300 tabular-nums"
        >
          {count}
        </motion.span>
      </AnimatePresence>
      <span className="text-xs text-mint-400/70 font-medium hidden sm:inline">online</span>
    </div>
  )
}
