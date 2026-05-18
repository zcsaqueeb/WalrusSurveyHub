/**
 * Walrus Storage — Dual-mode: SDK (wallet-signed) + HTTP Publisher fallback
 *
 * PRIMARY:  @mysten/walrus SDK — direct storage node writes, wallet pays WAL+SUI
 * FALLBACK: HTTP publisher REST API — no wallet required, community endpoints
 *
 * The SDK mode is the proper decentralized way since users already have Sui wallets.
 * The HTTP fallback kicks in when SDK mode isn't available (no wallet / no WAL tokens).
 */

export const NETWORK = 'mainnet'

// ─── Mainnet package config (from @mysten/walrus MAINNET_WALRUS_PACKAGE_CONFIG) ─
export const MAINNET_WALRUS_CONFIG = {
  systemObjectId: '0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2',
  stakingPoolId:  '0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904',
}

// ─── HTTP fallback publishers (community mainnet) ────────────────────────────
const PUBLISHERS = [
  'https://publisher.walrus.space',
  'https://wal-publisher-mainnet.nodeinfra.com',
  'https://walrus-mainnet-publisher-1.staketab.org',
  'https://walrus-publisher.nodes.guru',
]

const AGGREGATORS = [
  'https://aggregator.walrus.space',
  'https://wal-aggregator-mainnet.nodeinfra.com',
  'https://walrus-aggregator.nodes.guru',
  'https://aggregator.walrus.mirai.cloud',
]

export const WALRUS_AGGREGATOR = AGGREGATORS[0]

// ─── Parse blob ID from HTTP response ────────────────────────────────────────
function parseBlobId(result) {
  return (
    result?.newlyCreated?.blobObject?.blobId ||
    result?.alreadyCertified?.blobObject?.blobId ||
    result?.alreadyCertified?.blobId ||
    result?.blobObject?.blobId ||
    result?.blobId ||
    result?.blob_id ||
    null
  )
}

function parseSuiRef(result) {
  return (
    result?.newlyCreated?.blobObject?.id ||
    result?.alreadyCertified?.blobObject?.id ||
    result?.blobObject?.id ||
    result?.id || ''
  )
}

// ─── HTTP Publisher — single endpoint attempt ────────────────────────────────
async function tryPublish(publisherUrl, body, contentType, epochs, timeoutMs = 30000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${publisherUrl}/v1/blobs?epochs=${epochs}`, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body,
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      throw new Error(`HTTP ${res.status}: ${txt.slice(0, 120) || res.statusText}`)
    }
    return await res.json()
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') throw new Error('Request timed out after 30s')
    throw err
  }
}

// ─── HTTP fallback: upload raw bytes ─────────────────────────────────────────
async function uploadViaHTTP(body, contentType, epochs, onProgress) {
  const errors = []
  for (let i = 0; i < PUBLISHERS.length; i++) {
    onProgress?.(0.1 + i * 0.15)
    try {
      const result = await tryPublish(PUBLISHERS[i], body, contentType, epochs)
      const blobId = parseBlobId(result)
      if (!blobId) throw new Error('No blobId in response')
      onProgress?.(1.0)
      return { blobId, suiRef: parseSuiRef(result), mode: 'http', publisher: PUBLISHERS[i] }
    } catch (err) {
      errors.push(`${PUBLISHERS[i]}: ${err.message}`)
      console.warn(`[Walrus HTTP] Publisher ${i + 1}/${PUBLISHERS.length} failed:`, err.message)
    }
  }
  throw new Error(`All Walrus publishers failed:\n${errors.map(e => `  • ${e}`).join('\n')}`)
}

// ─── SDK mode: upload using @mysten/walrus WalrusClient ──────────────────────
// walletContext = { signAndExecuteTransaction, currentAccount } from dApp Kit
// or a signer keypair in node environments
async function uploadViaSDK(bytes, walletContext, epochs, onProgress, mimeType) {
  const { WalrusClient, WalrusFile, MAINNET_WALRUS_PACKAGE_CONFIG } = await import('@mysten/walrus')
  const { SuiGrpcClient } = await import('@mysten/sui/grpc')

  onProgress?.(0.05)

  const suiClient = new SuiGrpcClient({
    network: 'mainnet',
    baseUrl: 'https://fullnode.mainnet.sui.io:443',
  })

  const walrusClient = new WalrusClient({
    network: 'mainnet',
    suiClient,
    packageConfig: MAINNET_WALRUS_PACKAGE_CONFIG,
  })

  onProgress?.(0.1)

  // Build a WalrusFile from the bytes
  const file = WalrusFile.from({
    contents: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
    identifier: 'upload',
    tags: mimeType ? { 'content-type': mimeType } : {},
  })

  onProgress?.(0.2)

  // Use writeFilesFlow for browser wallet compatibility (separate sign steps)
  const flow = walrusClient.writeFilesFlow({ files: [file] })
  await flow.encode()
  onProgress?.(0.35)

  const { signAndExecuteTransaction, currentAccount } = walletContext

  // Step 1: Register blob (first wallet signature)
  const registerTx = flow.register({
    epochs,
    owner: currentAccount.address,
    deletable: false,
  })

  onProgress?.(0.4)
  const registerResult = await signAndExecuteTransaction({ transaction: registerTx })
  if (registerResult?.$kind === 'FailedTransaction') {
    throw new Error(`Blob registration failed: ${registerResult.FailedTransaction?.status?.error?.message || 'unknown'}`)
  }

  onProgress?.(0.6)

  // Step 2: Upload slivers to storage nodes
  await flow.upload({ digest: registerResult?.Transaction?.digest || registerResult?.digest })

  onProgress?.(0.8)

  // Step 3: Certify blob (second wallet signature)
  const certifyTx = flow.certify()
  const certifyResult = await signAndExecuteTransaction({ transaction: certifyTx })
  if (certifyResult?.$kind === 'FailedTransaction') {
    throw new Error(`Blob certification failed: ${certifyResult.FailedTransaction?.status?.error?.message || 'unknown'}`)
  }

  onProgress?.(0.95)

  const uploadedFiles = await flow.listFiles()
  const blobId = uploadedFiles?.[0]?.id || null

  onProgress?.(1.0)
  return { blobId, mode: 'sdk', suiRef: null }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

/**
 * Upload JSON data to Walrus.
 * Uses SDK if walletContext provided, else HTTP fallback.
 */
export async function uploadToWalrus(data, opts = {}) {
  const { epochs = 5, onProgress, walletContext } = opts
  const bytes = new TextEncoder().encode(JSON.stringify(data, null, 2))
  onProgress?.(0.05)

  if (walletContext?.signAndExecuteTransaction && walletContext?.currentAccount) {
    try {
      return await uploadViaSDK(bytes, walletContext, epochs, onProgress, 'application/json')
    } catch (err) {
      console.warn('[Walrus SDK] Falling back to HTTP:', err.message)
    }
  }

  return await uploadViaHTTP(bytes, 'application/octet-stream', epochs, onProgress)
}

/**
 * Upload a File (image, video, etc.) to Walrus.
 * Uses SDK if walletContext provided, else HTTP fallback.
 */
export async function uploadFileToWalrus(file, opts = {}) {
  const { epochs = 5, onProgress, walletContext } = opts
  onProgress?.(0.05)

  const bytes = new Uint8Array(await file.arrayBuffer())
  onProgress?.(0.12)

  if (walletContext?.signAndExecuteTransaction && walletContext?.currentAccount) {
    try {
      return await uploadViaSDK(bytes, walletContext, epochs, onProgress, file.type)
    } catch (err) {
      console.warn('[Walrus SDK] File upload SDK failed, trying HTTP:', err.message)
    }
  }

  return await uploadViaHTTP(bytes, file.type || 'application/octet-stream', epochs, onProgress)
}

/**
 * Read a blob from Walrus (via aggregator REST API)
 */
export async function getFromWalrus(blobId) {
  if (!blobId) throw new Error('No blobId provided')
  for (const agg of AGGREGATORS) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 15000)
      const res = await fetch(`${agg}/v1/blobs/${blobId}`, { signal: ctrl.signal })
      clearTimeout(timer)
      if (!res.ok) continue
      const text = await res.text()
      try { return JSON.parse(text) } catch { return text }
    } catch { /* try next */ }
  }
  throw new Error(`Could not read blob ${blobId.slice(0, 12)}… from Walrus`)
}

/** Get a CDN URL for a blob */
export function getWalrusBlobUrl(blobId) {
  if (!blobId) return null
  return `${AGGREGATORS[0]}/v1/blobs/${blobId}`
}

/** Check if a blob exists */
export async function blobExists(blobId) {
  if (!blobId) return false
  for (const agg of AGGREGATORS) {
    try {
      const ctrl = new AbortController()
      setTimeout(() => ctrl.abort(), 8000)
      const res = await fetch(`${agg}/v1/blobs/${blobId}`, { method: 'HEAD', signal: ctrl.signal })
      if (res.ok) return true
    } catch { /* try next */ }
  }
  return false
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export function formatBlobId(blobId, length = 12) {
  if (!blobId) return '—'
  return `${blobId.slice(0, length)}…${blobId.slice(-6)}`
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3)  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}
