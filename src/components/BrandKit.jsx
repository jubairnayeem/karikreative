import { Building2, Palette, Smile, Tag, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  'F&B / Food & Beverage', 'Fashion & Apparel', 'Real Estate',
  'Beauty & Skincare', 'Electronics', 'Healthcare', 'Education',
  'Restaurant & Café', 'Retail / E-commerce', 'Other',
]

const TONES = [
  'Bold & energetic', 'Elegant & premium', 'Fun & playful',
  'Warm & trustworthy', 'Minimal & modern', 'Traditional & cultural',
]

export default function BrandKit({ brandKit, setBrandKit, onNext }) {
  const set = (k, v) => setBrandKit(b => ({ ...b, [k]: v }))
  const ready = brandKit.name && brandKit.category && brandKit.tone && brandKit.colours

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <p className="text-kari font-display text-xs font-semibold uppercase tracking-widest mb-2">Step 1</p>
        <h2 className="font-display font-bold text-3xl tracking-tight mb-2">Your Brand Kit</h2>
        <p className="text-slate text-sm">Set this once. Every video you generate uses it automatically.</p>
      </div>

      {/* Form */}
      <div className="space-y-6">

        {/* Brand name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-display font-medium">
            <Building2 size={14} className="text-kari" />
            Brand name
          </label>
          <input
            type="text"
            value={brandKit.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Polar Ice Cream"
            className="input-field"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-display font-medium">
            <Tag size={14} className="text-kari" />
            Business category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => set('category', cat)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-body border transition-all ${
                  brandKit.category === cat
                    ? 'border-kari/60 bg-kari/10 text-chalk'
                    : 'border-white/10 bg-white/[0.02] text-slate hover:border-white/20 hover:text-chalk'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-display font-medium">
            <Smile size={14} className="text-kari" />
            Brand tone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map(tone => (
              <button
                key={tone}
                onClick={() => set('tone', tone)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-body border transition-all ${
                  brandKit.tone === tone
                    ? 'border-kari/60 bg-kari/10 text-chalk'
                    : 'border-white/10 bg-white/[0.02] text-slate hover:border-white/20 hover:text-chalk'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Colours */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-display font-medium">
            <Palette size={14} className="text-kari" />
            Brand colours
          </label>
          <input
            type="text"
            value={brandKit.colours}
            onChange={e => set('colours', e.target.value)}
            placeholder="e.g. Deep red #E31E24, Golden yellow #FFD700, White"
            className="input-field"
          />
          <p className="text-xs text-slate">Describe in words or hex codes — as many as you like</p>
        </div>

        {/* Tagline (optional) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-display font-medium">
            Tagline <span className="text-slate font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={brandKit.tagline}
            onChange={e => set('tagline', e.target.value)}
            placeholder="e.g. Pure. Cool. Delicious."
            className="input-field"
          />
        </div>
      </div>

      {/* Preview card */}
      {brandKit.name && (
        <div className="card border-kari/20 bg-kari/[0.04]">
          <p className="text-xs text-kari font-display mb-2 uppercase tracking-wider">Brand Kit Preview</p>
          <div className="space-y-1 text-sm">
            <div className="flex gap-2"><span className="text-slate w-20">Brand:</span><span>{brandKit.name}</span></div>
            {brandKit.category && <div className="flex gap-2"><span className="text-slate w-20">Category:</span><span>{brandKit.category}</span></div>}
            {brandKit.tone && <div className="flex gap-2"><span className="text-slate w-20">Tone:</span><span>{brandKit.tone}</span></div>}
            {brandKit.colours && <div className="flex gap-2"><span className="text-slate w-20">Colours:</span><span>{brandKit.colours}</span></div>}
          </div>
        </div>
      )}

      <button onClick={onNext} disabled={!ready} className="btn-primary w-full flex items-center justify-center gap-2">
        Continue to Generate
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
