import { useState } from 'react'
import { Download, RotateCcw, Plus, Type, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

const BENGALI_POSITIONS = [
  { value: 'top', label: 'Top' },
  { value: 'middle', label: 'Middle' },
  { value: 'bottom', label: 'Bottom' },
]

export default function Result({
  videoUrl, engineeredPrompt, brandKit,
  isGenerating, progress, progressStatus,
  revisionCount, error,
  onRevise, onNew
}) {
  const [feedback, setFeedback] = useState('')
  const [bengaliLines, setBengaliLines] = useState([
    { text: '', position: 'top', colour: '#FFFFFF', size: 'large', bold: true },
    { text: '', position: 'bottom', colour: '#FFD700', size: 'medium', bold: true },
  ])
  const [showRevise, setShowRevise] = useState(false)
  const [showBengali, setShowBengali] = useState(false)
  const [copied, setCopied] = useState(false)
  const [overlayLoading, setOverlayLoading] = useState(false)
  const [overlayError, setOverlayError] = useState(null)
  const [finalVideoUrl, setFinalVideoUrl] = useState(null)

  const updateLine = (i, key, val) => {
    setBengaliLines(lines => lines.map((l, idx) => idx === i ? { ...l, [key]: val } : l))
    setFinalVideoUrl(null)
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(engineeredPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleBurnIn() {
    const activeLines = bengaliLines.filter(l => l.text.trim())
    if (!activeLines.length) return
    setOverlayLoading(true)
    setOverlayError(null)
    setFinalVideoUrl(null)
    try {
      const res = await fetch('/api/overlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, lines: activeLines }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `Server error ${res.status}`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setFinalVideoUrl(url)
    } catch (err) {
      setOverlayError(err.message)
    } finally {
      setOverlayLoading(false)
    }
  }

  if (isGenerating) {
    return (
      <div className="card text-center py-16 space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-kari rotate-ring" style={{ borderTopColor: '#FF5C1A' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles size={24} className="text-kari" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-display font-semibold text-lg">{progressStatus || 'Re-generating...'}</p>
          <p className="text-slate text-sm">Revision {revisionCount} of 3</p>
        </div>
        <div className="w-full max-w-xs mx-auto">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-kari rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate mt-2">{progress}%</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-kari font-display text-xs font-semibold uppercase tracking-widest mb-2">Step 3</p>
          <h2 className="font-display font-bold text-3xl tracking-tight mb-1">Your video is ready</h2>
          <p className="text-slate text-sm">{brandKit.name} · {revisionCount > 0 ? `Revision ${revisionCount}` : 'First generation'}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          {3 - revisionCount} revisions left
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Video player — show final (with text) if available, else original */}
      {(finalVideoUrl || videoUrl) && (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10">
            <video
              key={finalVideoUrl || videoUrl}
              src={finalVideoUrl || videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full max-h-[600px] object-contain"
            />
          </div>
          {finalVideoUrl && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <CheckCircle size={13} />
              Bengali text burned in — ready to download
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="grid grid-cols-3 gap-3">
        <a
          href={finalVideoUrl || videoUrl}
          download={finalVideoUrl ? 'karikreative-final.mp4' : 'karikreative-video.mp4'}
          target={finalVideoUrl ? '_self' : '_blank'}
          rel="noopener noreferrer"
          className="btn-primary flex items-center justify-center gap-2 no-underline"
        >
          <Download size={15} />
          {finalVideoUrl ? 'Download Final' : 'Download'}
        </a>
        <button
          onClick={() => { setShowRevise(r => !r); setShowBengali(false) }}
          disabled={revisionCount >= 3}
          className="btn-ghost flex items-center justify-center gap-2"
        >
          <RotateCcw size={15} />
          Revise
        </button>
        <button
          onClick={() => { setShowBengali(b => !b); setShowRevise(false) }}
          className="btn-ghost flex items-center justify-center gap-2"
        >
          <Type size={15} />
          বাংলা Text
        </button>
      </div>

      {/* Revision panel */}
      {showRevise && (
        <div className="card space-y-4 border-kari/20">
          <p className="font-display font-semibold text-sm flex items-center gap-2">
            <RotateCcw size={14} className="text-kari" />
            What would you like to change?
          </p>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder={'e.g. "Make it more energetic, larger product shot, warmer lighting"'}
            rows={3}
            className="input-field resize-none"
          />
          <div className="flex gap-3">
            <button onClick={() => setShowRevise(false)} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={() => { onRevise(feedback); setFeedback(''); setShowRevise(false) }}
              disabled={!feedback.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              Apply & Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Bengali text panel */}
      {showBengali && (
        <div className="card space-y-5 border-kari/20">
          <div>
            <p className="font-display font-semibold text-sm flex items-center gap-2 mb-1">
              <Type size={14} className="text-kari" />
              Bengali text overlay
            </p>
            <p className="text-xs text-slate">
              Type your text, customise, then hit Burn In — FFmpeg adds it directly to your video.
            </p>
          </div>

          {bengaliLines.map((line, i) => (
            <div key={i} className="space-y-3 pb-4 border-b border-white/8 last:border-0">
              <p className="text-xs font-display text-slate uppercase tracking-wider">Line {i + 1}</p>
              <input
                type="text"
                value={line.text}
                onChange={e => updateLine(i, 'text', e.target.value)}
                placeholder={i === 0 ? 'পোলার আইসক্রিম' : 'এখনই কিনুন'}
                className="input-field font-bengali text-lg"
              />
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate">Position</label>
                  <select
                    value={line.position}
                    onChange={e => updateLine(i, 'position', e.target.value)}
                    className="input-field py-2 text-xs"
                  >
                    {BENGALI_POSITIONS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate">Size</label>
                  <select
                    value={line.size}
                    onChange={e => updateLine(i, 'size', e.target.value)}
                    className="input-field py-2 text-xs"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate">Colour</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={line.colour}
                      onChange={e => updateLine(i, 'colour', e.target.value)}
                      className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-slate font-mono">{line.colour}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Live text preview */}
          {bengaliLines.some(l => l.text) && (
            <div className="bg-black rounded-xl p-6 space-y-3 border border-white/10">
              <p className="text-xs text-slate mb-3">Preview</p>
              {bengaliLines.map((line, i) => line.text ? (
                <p
                  key={i}
                  className="font-bengali text-center"
                  style={{
                    color: line.colour,
                    fontSize: line.size === 'large' ? '28px' : line.size === 'medium' ? '22px' : '16px',
                    fontWeight: 700,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {line.text}
                </p>
              ) : null)}
            </div>
          )}

          {overlayError && (
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-400">{overlayError}</p>
            </div>
          )}

          <button
            onClick={handleBurnIn}
            disabled={overlayLoading || !bengaliLines.some(l => l.text.trim())}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {overlayLoading ? (
              <><Loader2 size={15} className="animate-spin" /> Burning in text... (1–2 mins)</>
            ) : (
              <><Type size={15} /> Burn Bengali Text Into Video</>
            )}
          </button>
        </div>
      )}

      {/* Engineered prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate font-display uppercase tracking-wider">Engineered prompt</p>
          <button onClick={copyPrompt} className="text-xs text-slate hover:text-kari transition-colors flex items-center gap-1">
            {copied ? <><CheckCircle size={12} className="text-green-400" /> Copied</> : 'Copy'}
          </button>
        </div>
        <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
          <p className="text-xs text-slate leading-relaxed font-mono">{engineeredPrompt}</p>
        </div>
      </div>

      <button onClick={onNew} className="btn-ghost w-full flex items-center justify-center gap-2">
        <Plus size={15} />
        Create another video
      </button>
    </div>
  )
}
