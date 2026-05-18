/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        walrus: { 50:'#edfafa',100:'#d5f5f5',200:'#aeeaea',300:'#7dd8d8',400:'#4dbfbf',500:'#2ea8a8',600:'#1a8a8a',700:'#156f6f',800:'#125858',900:'#0f4545',950:'#072d2d' },
        ink:    { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a',950:'#020617' },
        coral:  { 400:'#fb7185',500:'#f43f5e',600:'#e11d48' },
        mint:   { 400:'#34d399',500:'#10b981',600:'#059669' },
        amber:  { 400:'#fbbf24',500:'#f59e0b',600:'#d97706' },
        ocean:  { 400:'#60a5fa',500:'#3b82f6',600:'#2563eb' },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: { '2xl':'1rem','3xl':'1.5rem','4xl':'2rem' },
      boxShadow: {
        'glow-walrus':'0 0 30px rgba(46,168,168,0.25)',
        'glow-coral':'0 0 30px rgba(244,63,94,0.25)',
        'glow-ocean':'0 0 30px rgba(59,130,246,0.25)',
        'card':'0 2px 8px rgba(15,23,42,0.06),0 0 1px rgba(15,23,42,0.06)',
        'card-hover':'0 8px 24px rgba(15,23,42,0.10),0 0 1px rgba(15,23,42,0.06)',
      },
      animation: {
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':'float 6s ease-in-out infinite',
        'shimmer':'shimmer 2s linear infinite',
        'spin-slow':'spin 8s linear infinite',
        'pulse-ring':'pulseRing 2.5s cubic-bezier(0.455,0.03,0.515,0.955) infinite',
        'fadeIn':'fadeIn 0.35s ease-out both',
        'slideUp':'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        float:    { '0%,100%':{ transform:'translateY(0px)' },'50%':{ transform:'translateY(-10px)' } },
        shimmer:  { '0%':{ backgroundPosition:'-200% 0' },'100%':{ backgroundPosition:'200% 0' } },
        pulseRing:{ '0%':{ boxShadow:'0 0 0 0 rgba(46,168,168,0.4)' },'70%':{ boxShadow:'0 0 0 15px rgba(46,168,168,0)' },'100%':{ boxShadow:'0 0 0 0 rgba(46,168,168,0)' } },
        fadeIn:   { from:{ opacity:'0',transform:'translateY(8px)' },to:{ opacity:'1',transform:'translateY(0)' } },
        slideUp:  { from:{ opacity:'0',transform:'translateY(20px)' },to:{ opacity:'1',transform:'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
