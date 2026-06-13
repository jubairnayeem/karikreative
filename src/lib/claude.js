// Calls our own Vercel proxy which forwards to Claude API server-side
async function callClaude(system, messages) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, messages }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `Claude proxy error: ${res.status}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text?.trim() || ''
}

const SYSTEM_ENGINEER = `You are a professional motion graphics prompt engineer for Higgsfield AI (Seedance 2.0 video model).
Your job: take a simple SME brief and brand details, then output ONE single highly detailed Higgsfield video generation prompt.

Rules:
- NEVER include any text, words, or typography in the video description. Visual only.
- Focus on: product hero shots, cinematic lighting, slow motion details, camera movement, colour palette, mood
- Match the brand's tone and category
- Output ONLY the prompt text. No preamble, no explanation, no quotes.
- Prompt should be 80-150 words, packed with visual detail
- Always end with: "Cinematic depth of field throughout. Smooth [duration]s, [format] format."

Content type guides:
- Product Ad: hero product shot, macro details, atmospheric lighting, 180 degree orbit
- Brand Intro: logo reveal, brand colours, elegant motion, identity feel
- Offer Announcement: energy, bold colours, dynamic motion, urgency
- Social Reel: trendy, fast-feel even if slow motion, engaging opener`

export async function engineerPrompt(brandKit, userPrompt, contentType, format, duration) {
  const userMessage = `Brand Kit:
- Company: ${brandKit.name}
- Category: ${brandKit.category}
- Tone: ${brandKit.tone}
- Colours: ${brandKit.colours}
- Tagline: ${brandKit.tagline || 'none'}

Content type: ${contentType}
Format: ${format}
Duration: ${duration}s
Brief: ${userPrompt}

Write the Higgsfield video prompt now:`

  return callClaude(SYSTEM_ENGINEER, [{ role: 'user', content: userMessage }])
}

export async function refinePrompt(originalPrompt, feedback, brandKit) {
  return callClaude(null, [{
    role: 'user',
    content: `You are refining a Higgsfield video prompt based on user feedback.

Original prompt:
${originalPrompt}

User feedback: "${feedback}"

Brand tone: ${brandKit.tone}
Brand colours: ${brandKit.colours}

Apply the feedback and output ONLY the revised prompt. No preamble. Keep it 80-150 words. No text or typography in scene.`
  }])
}
