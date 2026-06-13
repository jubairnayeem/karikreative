import { useState, useRef } from 'react'
import { engineerPrompt, refinePrompt } from './lib/claude.js'
import { generateVideo } from './lib/higgsfield.js'
import BrandKit from './components/BrandKit.jsx'
import Generate from './components/Generate.jsx'
import Result from './components/Result.jsx'
import ApiKeys from './components/ApiKeys.jsx'

const STEPS = ['brand', 'generate', 'result']

export default function App() {
  const [step, setStep] = useState('brand')
  const [brandKit, setBrandKit] = useState({
    name: '', category: '', tone: '', colours: '', tagline: '',
  })
  const [keys, setKeys] = useState({ higgsfield: '' })
  const [keysSet, setKeysSet] = useState(false)

  const [engineeredPrompt, setEngineeredPrompt] = useState('')
  const [videoUrl, setVideoUrl] = useState(null)
  const [progress, setProgress] = useState(0)
  const [progressStatus, setProgressStatus] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [revisionCount, setRevisionCount] = useState(0)

  async function handleGenerate(userPrompt, contentType, format, duration) {
    setError(null)
    setIsGenerating(true)
    setProgress(0)
    setVideoUrl(null)
    setStep('generate')

    try {
      // Step 1: Claude engineers the prompt
      setProgressStatus('Crafting your prompt...')
      const engineered = await engineerPrompt(brandKit, userPrompt, contentType, format, duration)
      setEngineeredPrompt(engineered)

      // Step 2: Higgsfield generates the video
      setProgressStatus('Generating your video...')
      const url = await generateVideo(
        engineered, format, duration, keys.higgsfield,
        (pct, status) => {
          setProgress(pct)
          setProgressStatus(status === 'completed' ? 'Finalising...' : 'Higgsfield is rendering...')
        }
      )

      setVideoUrl(url)
      setStep('result')
    } catch (err) {
      setError(err.message)
      setStep('generate')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleRevise(feedback) {
    if (revisionCount >= 3) return
    setError(null)
    setIsGenerating(true)
    setProgress(0)
    setRevisionCount(r => r + 1)

    try {
      setProgressStatus('Applying your feedback...')
      const revised = await refinePrompt(engineeredPrompt, feedback, brandKit)
      setEngineeredPrompt(revised)

      setProgressStatus('Re-generating...')
      const url = await generateVideo(
        revised, '9:16', '15', keys.higgsfield,
        (pct, status) => {
          setProgress(pct)
          setProgressStatus(status === 'completed' ? 'Finalising...' : 'Higgsfield is rendering...')
        }
      )
      setVideoUrl(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!keysSet) {
    return (
      <ApiKeys
        keys={keys}
        setKeys={setKeys}
        onConfirm={() => setKeysSet(true)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-ink text-chalk">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-kari flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">K</span>
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">KariKreative</span>
          <span className="text-xs text-slate bg-white/5 px-2 py-0.5 rounded-full border border-white/10">Beta</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 text-xs font-display">
          {[
            { id: 'brand', label: 'Brand Kit' },
            { id: 'generate', label: 'Generate' },
            { id: 'result', label: 'Result' },
          ].map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => !isGenerating && setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                  step === s.id
                    ? 'bg-kari/15 text-kari border border-kari/30'
                    : 'text-slate hover:text-chalk'
                }`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-semibold
                  ${step === s.id ? 'bg-kari text-white' : 'bg-white/10 text-slate'}`}>
                  {i + 1}
                </span>
                {s.label}
              </button>
              {i < 2 && <span className="text-white/20">›</span>}
            </div>
          ))}
        </div>

        <button onClick={() => setKeysSet(false)} className="text-xs text-slate hover:text-chalk transition-colors">
          API Keys
        </button>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        {step === 'brand' && (
          <BrandKit
            brandKit={brandKit}
            setBrandKit={setBrandKit}
            onNext={() => setStep('generate')}
          />
        )}
        {step === 'generate' && (
          <Generate
            brandKit={brandKit}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            progress={progress}
            progressStatus={progressStatus}
            error={error}
            engineeredPrompt={engineeredPrompt}
            onBack={() => setStep('brand')}
          />
        )}
        {step === 'result' && (
          <Result
            videoUrl={videoUrl}
            engineeredPrompt={engineeredPrompt}
            brandKit={brandKit}
            isGenerating={isGenerating}
            progress={progress}
            progressStatus={progressStatus}
            revisionCount={revisionCount}
            error={error}
            onRevise={handleRevise}
            onNew={() => {
              setStep('generate')
              setVideoUrl(null)
              setRevisionCount(0)
              setEngineeredPrompt('')
            }}
          />
        )}
      </main>
    </div>
  )
}
