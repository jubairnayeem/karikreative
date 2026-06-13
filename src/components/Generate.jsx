import { useState } from 'react'
import { Sparkles, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react'

const CONTENT_TYPES = ['Product Ad', 'Brand Intro', 'Offer Announcement', 'Social Reel']
const FORMATS = [
  { value: '9:16', label: '9:16', sub: 'Reels / TikTok' },
  { value: '16:9', label: '16:9', sub: 'YouTube / FB' },
  { value: '1:1', label: '1:1', sub: 'Feed' },
]
const DURATIONS = ['5', '10', '15']

export default function Generate({
  brandKit, onGenerate, isGenerating,
  progress, progressStatus, error, engineeredPrompt, onBack
}) {
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('Product Ad')
  const [format, setFormat] = useState('9:16')
  const [duration, setDuration] = useState('15')
  const [showPrompt, setShowPrompt] = useState(false)

  const ready = prompt.trim().length > 3 && !isGenerating

  return (
    <div className="space-y-8">
      <div>
        <p className="text-kari font-display text-xs font-semibold uppercase tracking-widest mb-2">Step 2</p>
        <h2 className="font-display font-bold text-3xl tracking-tight mb-1">Create your video</h2>
        <p className="text-slate text-sm">
          Generating for <span className="text-chalk font-medium">{brandKit.name}</span>
          {' '}·{' '}<span className="text-slate">{brandKit.category}</span>
        </p>
      </div>

      {!isGenerating ? (
        <div className="space-y-6">
          {/* Content type */}
          <div className="space-y-2">
            <label className="text-sm font-display font-medium">Content type</label>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setContentType(t)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-body border text-left transition-all ${
                    contentType === t
                      ? 'border-kari/60 bg-kari/10 text-chalk'
                      : 'border-white/10 bg-white/[0.02] text-slate hover:border-white/20 hover:text-chalk'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Format + Duration row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-display font-medium">Format</label>
              <div className="space-y-2">
                {FORMATS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm border transition-all ${
                      format === f.value
                        ? 'border-kari/60 bg-kari/10 text-chalk'
                        : 'border-white/10 bg-white/[0.02] text-slate hover:border-white/20'
                    }`}
                  >
                    <span className="font-display font-semibold">{f.label}</span>
                    <span className="text-xs text-slate">{f.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-display font-medium">Duration</label>
              <div className="space-y-2">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm border transition-all ${
                      duration === d
                        ? 'border-kari/60 bg-kari/10 text-chalk'
                        : 'border-white/10 bg-white/[0.02] text-slate hover:border-white/20'
                    }`}
                  >
                    <span className="font-display font-semibold">{d}s</span>
                    <span className="text-xs text-slate">
                      {d === '5' ? 'Teaser' : d === '10' ? 'Standard' : 'Full promo'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Brief */}
          <div className="space-y-2">
            <label className="text-sm font-display font-medium">Your brief</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={`Describe what you want. Keep it simple.\n\ne.g. "Polar Essora banana ice cream, summer feel, golden light, kids will love it"`}
              rows={4}
              className="input-field resize-none"
            />
            <p className="text-xs text-slate">Write in English or Bangla — Claude will handle the rest.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-400 font-medium">Generation failed</p>
                <p className="text-xs text-red-400/70 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Show engineered prompt (debug) */}
          {engineeredPrompt && (
            <div className="space-y-2">
              <button
                onClick={() => setShowPrompt(s => !s)}
                className="text-xs text-slate hover:text-kari transition-colors font-display"
              >
                {showPrompt ? '▾ Hide' : '▸ Show'} engineered prompt
              </button>
              {showPrompt && (
                <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
                  <p className="text-xs text-slate leading-relaxed font-mono">{engineeredPrompt}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onBack} className="btn-ghost flex items-center gap-2">
              <ChevronLeft size={15} /> Back
            </button>
            <button
              onClick={() => onGenerate(prompt, contentType, format, duration)}
              disabled={!ready}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Generate Video
            </button>
          </div>
        </div>
      ) : (
        /* Generating state */
        <div className="card text-center py-12 space-y-6">
          {/* Animated ring */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-kari rotate-ring"
              style={{ borderTopColor: '#FF5C1A' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={24} className="text-kari" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-display font-semibold text-lg">{progressStatus || 'Working...'}</p>
            <p className="text-slate text-sm">This takes 3–10 minutes. Go grab a chai ☕</p>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs mx-auto">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-kari rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate mt-2">{progress}%</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
