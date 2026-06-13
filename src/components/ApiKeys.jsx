import { useState } from 'react'
import { KeyRound, Eye, EyeOff } from 'lucide-react'

export default function ApiKeys({ keys, setKeys, onConfirm }) {
  const [show, setShow] = useState(false)
  const ready = keys.higgsfield.trim().length > 10

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-kari mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-display font-bold text-2xl">K</span>
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">KariKreative</h1>
          <p className="text-slate text-sm">AI motion studio for Bangladeshi brands</p>
        </div>

        <div className="card space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound size={16} className="text-kari" />
            <span className="font-display font-semibold text-sm">Connect Higgsfield</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate font-display">Higgsfield API Key</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={keys.higgsfield}
                onChange={e => setKeys(k => ({ ...k, higgsfield: e.target.value }))}
                placeholder="hf-..."
                className="input-field pr-10"
              />
              <button
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-chalk transition-colors"
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-slate">Get yours at higgsfield.ai → Settings → API</p>
          </div>

          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
            <p className="text-xs text-slate/70">
              Claude API runs securely on the server — no key needed here.
            </p>
          </div>

          <button onClick={onConfirm} disabled={!ready} className="btn-primary w-full">
            Enter Studio →
          </button>
        </div>
      </div>
    </div>
  )
}
