/**
 * WalrusForms — CLI data clear utility
 * Run: npm run clear-data
 *
 * This prints instructions to clear browser localStorage.
 * (Node.js cannot access the browser's localStorage directly.)
 */
const T = {
  teal:  '\x1b[36m', cyan: '\x1b[96m', yellow: '\x1b[93m',
  green: '\x1b[92m', gray: '\x1b[90m', bold:   '\x1b[1m', reset: '\x1b[0m'
}
const c = (col, s) => `${T[col]}${s}${T.reset}`
const b = s => `${T.bold}${s}${T.reset}`

console.log('')
console.log(c('teal', b('  🦭  WalrusForms — Clear Local Data')))
console.log(c('gray', '  ─────────────────────────────────────────────────────'))
console.log('')
console.log('  To clear all WalrusForms data from your browser:')
console.log('')
console.log(`  ${b('Option 1:')} DevTools Console (F12 → Console tab)`)
console.log(c('cyan', `
  ['walforms_forms_v2','walforms_submissions_v2','walforms_wallet_v2']
    .forEach(k => { localStorage.removeItem(k); console.log('Removed:', k) });
  sessionStorage.removeItem('wf_admin');
  console.log('✓ All WalrusForms data cleared');
  location.reload();
  `))
console.log('')
console.log(`  ${b('Option 2:')} DevTools → Application → Local Storage → Right-click → Clear`)
console.log('')
console.log(`  ${b('Option 3:')} Press ${c('yellow', 'x')} + enter in the WalrusForms dev server terminal`)
console.log('')
console.log(c('gray', '  ─────────────────────────────────────────────────────'))
console.log(`  ${c('yellow', 'Note:')} Walrus blobs on-chain are ${b('NOT')} deleted — only local state.`)
console.log('')
