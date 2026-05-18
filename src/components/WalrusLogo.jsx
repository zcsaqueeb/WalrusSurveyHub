import React from 'react'
import { motion } from 'framer-motion'

export default function WalrusLogo({ size = 32, animated = false, className = '' }) {
  const s = size
  const Wrapper = animated ? motion.div : 'div'
  const animProps = animated
    ? {
        animate: { rotate: [0, 3, -3, 0], scale: [1, 1.04, 1] },
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
      }
    : {}

  return (
    <Wrapper className={`flex-shrink-0 ${className}`} {...animProps}>
      <svg
        width={s}
        height={s}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer glow ring */}
        <circle cx="20" cy="20" r="19" fill="url(#logoGrad)" opacity="0.15" />

        {/* Main circle bg */}
        <circle cx="20" cy="20" r="17" fill="url(#logoGrad)" />

        {/* Body — walrus silhouette */}
        {/* Head */}
        <ellipse cx="20" cy="16" rx="8" ry="7" fill="white" opacity="0.95" />
        {/* Eyes */}
        <circle cx="17.5" cy="14.5" r="1.2" fill="#0f4545" />
        <circle cx="22.5" cy="14.5" r="1.2" fill="#0f4545" />
        {/* Eye glints */}
        <circle cx="17.9" cy="14.1" r="0.4" fill="white" />
        <circle cx="22.9" cy="14.1" r="0.4" fill="white" />
        {/* Nose */}
        <ellipse cx="20" cy="17.2" rx="2.5" ry="1.5" fill="#2ea8a8" opacity="0.7" />
        {/* Left tusk */}
        <path d="M17 19.5 L15.5 24 Q15 26 16.5 26 Q17.5 26 18 24 L18.5 19.5" fill="white" opacity="0.9" />
        {/* Right tusk */}
        <path d="M23 19.5 L21.5 19.5 L22 24 Q22.5 26 24 26 Q25.5 26 25 24 L23 19.5" fill="white" opacity="0.9" />
        {/* Whiskers left */}
        <line x1="11" y1="17" x2="15.5" y2="17.5" stroke="white" strokeWidth="0.7" opacity="0.7" />
        <line x1="11.5" y1="18.5" x2="15.5" y2="18.5" opacity="0.5" stroke="white" strokeWidth="0.6" />
        {/* Whiskers right */}
        <line x1="29" y1="17" x2="24.5" y2="17.5" stroke="white" strokeWidth="0.7" opacity="0.7" />
        <line x1="28.5" y1="18.5" x2="24.5" y2="18.5" opacity="0.5" stroke="white" strokeWidth="0.6" />

        {/* Small storage/DB dots bottom */}
        <circle cx="16" cy="30" r="1.5" fill="white" opacity="0.5" />
        <circle cx="20" cy="31" r="1.5" fill="white" opacity="0.7" />
        <circle cx="24" cy="30" r="1.5" fill="white" opacity="0.5" />

        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4dbfbf" />
            <stop offset="60%" stopColor="#2ea8a8" />
            <stop offset="100%" stopColor="#1a8a8a" />
          </linearGradient>
        </defs>
      </svg>
    </Wrapper>
  )
}

/* Compact text+icon logo for navbar */
export function NavLogo() {
  return (
    <div className="flex items-center gap-2.5 group">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <div className="absolute inset-0 rounded-xl bg-walrus-500/30 blur-md group-hover:blur-lg transition-all duration-300" />
        <WalrusLogo size={36} className="relative" />
      </motion.div>
      <div className="flex flex-col leading-none">
        <span className="font-extrabold text-white text-[15px] tracking-tight">WalrusForms</span>
        <span className="text-[10px] text-walrus-400 font-medium hidden sm:block tracking-wide">Decentralized Storage</span>
      </div>
    </div>
  )
}
