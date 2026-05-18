import React, { useState } from 'react'
import { Database, Shield, ExternalLink, Copy, CheckCircle, Globe } from 'lucide-react'
import { formatBlobId, getWalrusBlobUrl } from '../lib/walrus.js'

export default function WalrusBadge({ blobId, encrypted, small }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    if (!blobId) return
    await navigator.clipboard.writeText(blobId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const blobUrl = getWalrusBlobUrl(blobId)

  if (small) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-1 rounded-lg border bg-walrus-500/10 border-walrus-500/25 text-walrus-400">
          <Database className="w-2.5 h-2.5" />
          {formatBlobId(blobId, 8)}
        </span>
        {encrypted && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400">
            <Shield className="w-2.5 h-2.5" /> Sealed
          </span>
        )}
        {blobId && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-mint-500/10 border border-mint-500/25 text-mint-400">
            <Globe className="w-2.5 h-2.5" /> On-chain
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-walrus-500/15 flex items-center justify-center flex-shrink-0">
        <Database className="w-4 h-4 text-walrus-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-semibold text-ink-500 uppercase tracking-wider">Walrus Blob ID</span>
          {blobId && (
            <span className="text-[9px] px-1.5 py-px bg-mint-500/15 text-mint-400 rounded-full font-semibold border border-mint-500/20">
              LIVE
            </span>
          )}
          {encrypted && (
            <span className="text-[9px] px-1.5 py-px bg-amber-500/15 text-amber-400 rounded-full font-semibold border border-amber-500/20 flex items-center gap-0.5">
              <Shield className="w-2 h-2" /> SEALED
            </span>
          )}
        </div>
        <p className="text-xs font-mono text-ink-300 truncate">{blobId || '—'}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleCopy}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-ink-400 hover:text-white transition-all"
          title="Copy blob ID"
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5 text-mint-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        {blobUrl && (
          <a
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-ink-400 hover:text-white transition-all"
            title="View on Walrus"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
