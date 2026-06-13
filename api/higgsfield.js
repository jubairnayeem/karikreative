// Vercel serverless proxy for Higgsfield API
// Fixes CORS + handles long-polling server-side

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  const { action, jobId, prompt, aspect_ratio, duration, apiKey } = req.body

  if (!apiKey) {
    res.status(400).json({ error: 'apiKey required' })
    return
  }

  const BASE = 'https://api.higgsfield.ai'
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }

  try {
    // Action: submit — create a new generation job
    if (action === 'submit') {
      const body = {
        model: 'seedance_2_0',
        prompt,
        aspect_ratio: aspect_ratio || '9:16',
        duration: parseInt(duration) || 10,
        resolution: '720p',
        mode: 'std',
      }

      const r = await fetch(`${BASE}/generation/video`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const text = await r.text()
      if (!r.ok) {
        res.status(r.status).json({ error: text })
        return
      }

      const data = JSON.parse(text)
      const id = data.id || data.job_id || data.generation_id

      if (!id) {
        res.status(500).json({ error: 'No job ID in response', raw: data })
        return
      }

      res.status(200).json({ jobId: id })
      return
    }

    // Action: poll — check job status
    if (action === 'poll') {
      if (!jobId) {
        res.status(400).json({ error: 'jobId required for poll' })
        return
      }

      const r = await fetch(`${BASE}/generation/${jobId}`, { headers })
      const text = await r.text()

      if (!r.ok) {
        res.status(r.status).json({ error: text })
        return
      }

      const data = JSON.parse(text)

      // Normalise status
      const status = data.status || 'unknown'
      const isDone = status === 'completed' || status === 'success' || status === 'finished'
      const isFailed = status === 'failed' || status === 'error'

      // Try all known URL fields
      const videoUrl = data.results?.[0]?.url
        || data.result?.url
        || data.video_url
        || data.output_url
        || data.outputs?.[0]?.url
        || null

      res.status(200).json({ status, isDone, isFailed, videoUrl, raw: data })
      return
    }

    res.status(400).json({ error: `Unknown action: ${action}` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
