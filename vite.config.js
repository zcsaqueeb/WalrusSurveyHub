import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import readline from 'readline'
import os from 'os'

// ─── App branding ─────────────────────────────────────────────────────────────
const APP_NAME    = 'WalrusForms'
const APP_VERSION = '7.0.0'
const APP_PORT    = 5173

// ─── ANSI colors ──────────────────────────────────────────────────────────────
const T = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  teal:   '\x1b[36m',
  cyan:   '\x1b[96m',
  green:  '\x1b[92m',
  yellow: '\x1b[93m',
  red:    '\x1b[91m',
  blue:   '\x1b[94m',
  white:  '\x1b[97m',
  gray:   '\x1b[90m',
}
const c = (color, str) => `${T[color]}${str}${T.reset}`
const b = (str) => `${T.bold}${str}${T.reset}`

// ─── Get local IP address ─────────────────────────────────────────────────────
function getLocalIP() {
  try {
    const nets = os.networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) return net.address
      }
    }
  } catch {}
  return null
}

// ─── Print branded banner ─────────────────────────────────────────────────────
function printBanner(host, port, useHost) {
  const localIp = getLocalIP()
  const localUrl   = `http://localhost:${port}/`
  const networkUrl = localIp ? `http://${localIp}:${port}/` : null

  console.clear()
  console.log('')
  // Walrus ASCII logo
  console.log(c('teal', b('  ██╗    ██╗ █████╗ ██╗     ██████╗ ██╗   ██╗███████╗')))
  console.log(c('teal', b('  ██║    ██║██╔══██╗██║     ██╔══██╗██║   ██║██╔════╝')))
  console.log(c('cyan', b('  ██║ █╗ ██║███████║██║     ██████╔╝██║   ██║███████╗')))
  console.log(c('cyan', b('  ██║███╗██║██╔══██║██║     ██╔══██╗██║   ██║╚════██║')))
  console.log(c('blue', b('  ╚███╔███╔╝██║  ██║███████╗██║  ██║╚██████╔╝███████║')))
  console.log(c('blue', b('   ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝')))
  console.log('')
  console.log(c('teal', b(`  🦭  ${APP_NAME} `)) + c('gray', `v${APP_VERSION}`) + c('gray', '  ·  Decentralized Form Platform on Walrus & Sui'))
  console.log(c('gray', '  ─────────────────────────────────────────────────────────'))
  console.log('')
  console.log(`  ${c('green', '➜')}  ${b('Local:')}    ${c('cyan', localUrl)}`)
  if (networkUrl && useHost) {
    console.log(`  ${c('green', '➜')}  ${b('Network:')}  ${c('cyan', networkUrl)}`)
  } else {
    console.log(`  ${c('gray', '➜')}  ${b('Network:')}  ${c('gray', 'use --host to expose')}`)
  }
  console.log(`  ${c('green', '➜')}  ${b('Walrus:')}   ${c('teal', 'aggregator.walrus.space')} ${c('gray', '(mainnet)')}`)
  console.log(`  ${c('green', '➜')}  ${b('Sui RPC:')}  ${c('blue', 'fullnode.mainnet.sui.io')}`)
  console.log('')
  console.log(c('gray', '  ─────────────────────────────────────────────────────────'))
  console.log(`  ${c('yellow', 'press')} ${b('h')} ${c('yellow', '+ enter to show help')}`)
  console.log('')
}

// ─── Print help menu ──────────────────────────────────────────────────────────
function printHelp() {
  console.log('')
  console.log(c('teal', b('  🦭 WalrusForms Dev Server — Shortcuts')))
  console.log(c('gray', '  ───────────────────────────────────────'))
  console.log(`  ${b('r')} + enter   ${c('green', 'Restart the dev server')}`)
  console.log(`  ${b('u')} + enter   ${c('green', 'Show server URL')}`)
  console.log(`  ${b('o')} + enter   ${c('green', 'Open in browser')} (macOS / Linux)`)
  console.log(`  ${b('c')} + enter   ${c('green', 'Clear the console')}`)
  console.log(`  ${b('h')} + enter   ${c('green', 'Show this help menu')}`)
  console.log(`  ${b('x')} + enter   ${c('yellow', 'Clear all local app data')} ${c('gray', '(forms, submissions, wallet)')}`)
  console.log(`  ${b('d')} + enter   ${c('yellow', 'Show stored data summary')}`)
  console.log(`  ${b('q')} + enter   ${c('red', 'Quit the dev server')}`)
  console.log(c('gray', '  ───────────────────────────────────────'))
  console.log('')
}

// ─── Print URL ────────────────────────────────────────────────────────────────
function printUrl(port) {
  const ip = getLocalIP()
  console.log('')
  console.log(`  ${c('green', '➜')}  ${b('Local:')}    ${c('cyan', `http://localhost:${port}/`)}`)
  if (ip) console.log(`  ${c('green', '➜')}  ${b('Network:')}  ${c('cyan', `http://${ip}:${port}/`)}`)
  console.log('')
}

// ─── Custom Vite plugin: branded banner + keyboard shortcuts ──────────────────
function walrusFormsPlugin(useHost) {
  let serverPort = APP_PORT
  let serverRef  = null
  let rlInterface = null

  function setupKeyboard(server) {
    if (!process.stdin.isTTY) return
    process.stdin.setRawMode?.(false)

    rlInterface = readline.createInterface({
      input: process.stdin,
      terminal: false,
    })

    rlInterface.on('line', async (line) => {
      const key = line.trim().toLowerCase()

      if (key === 'h') {
        printHelp()

      } else if (key === 'u') {
        printUrl(serverPort)

      } else if (key === 'o') {
        const url = `http://localhost:${serverPort}/`
        const cmd = process.platform === 'darwin' ? `open "${url}"`
                  : process.platform === 'win32'  ? `start "${url}"`
                  : `xdg-open "${url}"`
        const { exec } = await import('child_process')
        exec(cmd, err => { if (err) console.log(`  ${c('yellow', '⚠')}  Open ${c('cyan', url)} in your browser`) })
        console.log(`  ${c('green', '✓')}  Opening ${c('cyan', url)}…`)

      } else if (key === 'c') {
        console.clear()
        printBanner(null, serverPort, useHost)

      } else if (key === 'r') {
        console.log(`\n  ${c('yellow', '↺')}  Restarting server…\n`)
        server.restart?.()

      } else if (key === 'x') {
        // Clear all WalrusForms localStorage data
        console.log('')
        console.log(`  ${c('yellow', '⚠')}  ${b('Clearing all local WalrusForms data…')}`)
        console.log(`  ${c('gray', 'This removes: forms, submissions, wallet state')}`)
        console.log(`  ${c('gray', 'Note: Walrus blobs on-chain are NOT affected')}`)
        // We inject a script via the dev server to clear localStorage in the browser
        // by sending a custom message the app will handle
        console.log(`  ${c('green', '✓')}  To clear in browser: open DevTools Console and run:`)
        console.log(`       ${c('cyan', "['walforms_forms_v2','walforms_submissions_v2','walforms_wallet_v2'].forEach(k=>localStorage.removeItem(k)); location.reload()")}`)
        console.log(`  ${c('gray', '─────────────────────────────────────────────────────')}`)
        console.log(`  ${c('yellow', '⚡')}  Or use the in-app Clear Data button in the Guide page`)
        console.log('')

      } else if (key === 'd') {
        console.log('')
        console.log(`  ${c('teal', '📦')}  ${b('localStorage keys:')}`)
        console.log(`  ${c('gray', '  walforms_forms_v2')}       ${c('cyan', '→ Form schemas')}`)
        console.log(`  ${c('gray', '  walforms_submissions_v2')}  ${c('cyan', '→ Form submissions')}`)
        console.log(`  ${c('gray', '  walforms_wallet_v2')}       ${c('cyan', '→ Wallet connection state')}`)
        console.log(`  ${c('gray', '  wf_admin')}                 ${c('cyan', '→ Admin session (sessionStorage)')}`)
        console.log('')
        console.log(`  ${c('yellow', 'Tip:')} Open DevTools → Application → Local Storage to inspect data`)
        console.log('')

      } else if (key === 'q') {
        console.log(`\n  ${c('teal', '🦭')}  ${b('WalrusForms dev server stopped.')} ${c('gray', 'Goodbye!')}\n`)
        rlInterface?.close()
        process.exit(0)
      }
    })
  }

  return {
    name: 'walrusforms-dev',
    configureServer(server) {
      serverRef = server
      server.httpServer?.once('listening', () => {
        const addr = server.httpServer?.address()
        serverPort = (addr && typeof addr !== 'string') ? addr.port : APP_PORT
        setTimeout(() => {
          printBanner(null, serverPort, useHost)
          setupKeyboard(server)
        }, 150)
      })
    },
    buildStart() {
      if (process.env.NODE_ENV === 'production') return
    }
  }
}

// ─── Vite config ─────────────────────────────────────────────────────────────
export default defineConfig(({ mode }) => {
  const env      = loadEnv(mode, process.cwd(), '')
  const useHost  = process.argv.includes('--host')

  return {
    plugins: [
      react(),
      walrusFormsPlugin(useHost),
    ],

    server: {
      port: APP_PORT,
      host: useHost ? true : 'localhost',
      strictPort: false,
      // Suppress Vite's own banner — we print our own
      customLogger: {
        info:  (msg, opts) => { /* suppress default "ready" messages */ if (msg.includes('➜') || msg.includes('ready') || msg.includes('Local') || msg.includes('VITE')) return; console.log(msg) },
        warn:  (msg, opts) => console.warn(c('yellow', msg)),
        error: (msg, opts) => console.error(c('red', msg)),
        warnOnce: (msg) => console.warn(c('yellow', msg)),
        clearScreen: () => {},
        hasErrorLogged: () => false,
        hasWarned: false,
      },
      hmr: {
        overlay: true,
      },
    },

    define: {
      'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(env.VITE_ADMIN_PASSWORD || 'walrus2025'),
      'import.meta.env.VITE_WALRUS_NETWORK': JSON.stringify(env.VITE_WALRUS_NETWORK || 'mainnet'),
      'import.meta.env.VITE_APP_NAME':       JSON.stringify(APP_NAME),
      'import.meta.env.VITE_APP_VERSION':    JSON.stringify(APP_VERSION),
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor:  ['react', 'react-dom', 'react-router-dom'],
            motion:  ['framer-motion'],
            walletstandard: ['@mysten/wallet-standard'],
          },
        },
        external: [],
      },
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
    },
  }
})
