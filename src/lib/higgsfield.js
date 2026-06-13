// All Higgsfield calls go through /api/higgsfield to avoid CORS
// and to get correct API shape

async function higgsfieldRequest(body) {
  const res = await fetch('/api/higgsfield', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Higgsfield proxy error ${res.status}`)
  return data
}

export async function generateVideo(prompt, format, duration, apiKey, onProgress) {
  onProgress?.(2, 'Submitting to Higgsfield...')

  // Step 1 — submit job
  const { jobId } = await higgsfieldRequest({
    action: 'submit',
    prompt,
    aspect_ratio: format,
    duration,
    apiKey,
  })

  onProgress?.(5, 'Queued — Higgsfield is rendering...')

  // Step 2 — poll until done
  const maxAttempts = 120 // 10 mins at 5s intervals
  let attempts = 0

  while (attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 5000))
    attempts++

    const result = await higgsfieldRequest({ action: 'poll', jobId, apiKey })

    // Progress based on time elapsed (we don't get % from API)
    const pct = Math.min(5 + Math.round((attempts / maxAttempts) * 90), 95)
    onProgress?.(pct, 'Higgsfield is rendering...')

    if (result.isFailed) {
      throw new Error(result.raw?.error || result.raw?.message || 'Generation failed on Higgsfield')
    }

    if (result.isDone) {
      onProgress?.(100, 'completed')
      if (!result.videoUrl) {
        // Log the raw response so we can debug the URL field name
        console.error('Higgsfield done but no URL found. Raw:', JSON.stringify(result.raw))
        throw new Error('Video generated but URL not found. Check console for raw response.')
      }
      return result.videoUrl
    }
  }

  throw new Error('Generation timed out after 10 minutes')
}
