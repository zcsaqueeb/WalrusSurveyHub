import React, { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ToastProvider } from './components/Toast.jsx'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import FormsList from './pages/FormsList.jsx'
import FormBuilder from './pages/FormBuilder.jsx'
import FormDetail from './pages/FormDetail.jsx'
import FillForm from './pages/FillForm.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Guide from './pages/Guide.jsx'

/* ── Page transition wrapper ── */
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ── Top progress bar ── */
function TopLoader() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const location = useLocation()

  useEffect(() => {
    setLoading(true)
    setProgress(30)
    const t1 = setTimeout(() => setProgress(70), 100)
    const t2 = setTimeout(() => setProgress(100), 280)
    const t3 = setTimeout(() => { setLoading(false); setProgress(0) }, 480)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [location.pathname])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px]"
          style={{ background: 'linear-gradient(90deg,#2ea8a8,#4dbfbf,#60a5fa)' }}
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          animate={{ scaleX: progress / 100, transformOrigin: 'left' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <>
      <TopLoader />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"               element={<PageWrapper><Landing /></PageWrapper>} />
          <Route path="/forms"          element={<PageWrapper><FormsList /></PageWrapper>} />
          <Route path="/builder"        element={<PageWrapper><FormBuilder /></PageWrapper>} />
          <Route path="/forms/:id"      element={<PageWrapper><FormDetail /></PageWrapper>} />
          <Route path="/forms/:id/fill" element={<PageWrapper><FillForm /></PageWrapper>} />
          <Route path="/dashboard"      element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/guide"          element={<PageWrapper><Guide /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Navbar />
        <AnimatedRoutes />
      </HashRouter>
    </ToastProvider>
  )
}
