import React, { useState } from 'react'
import { Star } from 'lucide-react'

const LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' }
const LABEL_COLORS = {
  1: 'text-red-500',
  2: 'text-coral-500',
  3: 'text-amber-500',
  4: 'text-mint-500',
  5: 'text-mint-600',
}

export default function StarRating({ value = 0, onChange, max = 5, size = 'md', readOnly = false }) {
  const [hover, setHover] = useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  }
  const iconSize = sizes[size] || sizes.md
  const active = hover || value

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex items-center gap-1.5 ${readOnly ? '' : 'cursor-pointer'}`}>
        {Array.from({ length: max }).map((_, i) => {
          const filled = active > i
          const isHovered = hover > 0 && hover > i
          return (
            <button
              key={i}
              type="button"
              disabled={readOnly}
              className={`transition-all duration-100 ${readOnly ? 'cursor-default' : 'hover:scale-125 active:scale-95 focus:outline-none'}`}
              onMouseEnter={() => !readOnly && setHover(i + 1)}
              onMouseLeave={() => !readOnly && setHover(0)}
              onClick={() => !readOnly && onChange?.(i + 1)}
            >
              <Star
                className={`${iconSize} transition-all duration-100 ${
                  filled
                    ? isHovered
                      ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                      : 'fill-amber-400 text-amber-400'
                    : readOnly
                      ? 'fill-transparent text-ink-200'
                      : 'fill-transparent text-ink-300 hover:text-amber-300'
                }`}
              />
            </button>
          )
        })}
        {active > 0 && (
          <span className={`ml-2 text-sm font-semibold tabular-nums ${LABEL_COLORS[active] || 'text-ink-400'}`}>
            {active}/{max}
            {!readOnly && LABELS[active] && (
              <span className="ml-1 font-normal opacity-80">— {LABELS[active]}</span>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
