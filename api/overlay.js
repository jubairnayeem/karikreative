import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import { createWriteStream, createReadStream, mkdirSync, unlinkSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pipeline } from 'stream/promises'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import https from 'https'
import http from 'http'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONT_BOLD = join(__dirname, 'fonts', 'NotoSansBengali-Bold.ttf')
const FONT_REG  = join(__dirname, 'fonts', 'NotoSansBengali-Regular.ttf')

// Download video from URL to a temp file
function downloadToTemp(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http
    const file = createWriteStream(destPath)
    proto.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode}`))
        return
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
      file.on('error', reject)
    }).on('error', reject)
  })
}

// Escape text for FFmpeg drawtext filter
function escapeDrawtext(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/,/g, '\\,')
}

// Build FFmpeg drawtext filter for one text line
function buildDrawtext(line, fontBold, fontReg) {
  const sizeMap = { small: 32, medium: 42, large: 54 }
  const fontSize = sizeMap[line.size] || 42
  const font = line.bold !== false ? fontBold : fontReg
  const escaped = escapeDrawtext(line.text)

  // y position
  let y
  if (line.position === 'top')    y = '80'
  else if (line.position === 'middle') y = '(h-text_h)/2'
  else                             y = 'h-120'

  // colour — strip # for FFmpeg format, add alpha
  const colour = (line.colour || '#FFFFFF').replace('#', '') + 'FF'

  return [
    `fontfile='${font}'`,
    `text='${escaped}'`,
    `fontcolor=0x${colour}`,
    `fontsize=${fontSize}`,
    `x=(w-text_w)/2`,
    `y=${y}`,
    `shadowcolor=0x000000AA`,
    `shadowx=2`,
    `shadowy=2`,
  ].join(':')
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { videoUrl, lines } = req.body

  if (!videoUrl || !lines || !Array.isArray(lines)) {
    res.status(400).json({ error: 'videoUrl and lines[] required' })
    return
  }

  // Filter out empty lines
  const activeLines = lines.filter(l => l.text && l.text.trim())

  if (activeLines.length === 0) {
    res.status(400).json({ error: 'At least one text line required' })
    return
  }

  const tmpDir = tmpdir()
  const id = randomUUID()
  const inputPath  = join(tmpDir, `kk-input-${id}.mp4`)
  const outputPath = join(tmpDir, `kk-output-${id}.mp4`)

  try {
    // 1. Download video
    await downloadToTemp(videoUrl, inputPath)

    // 2. Build filter chain
    const filters = activeLines
      .map(line => `drawtext=${buildDrawtext(line, FONT_BOLD, FONT_REG)}`)
      .join(',')

    // 3. Run FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilter(filters)
        .outputOptions(['-c:v libx264', '-pix_fmt yuv420p', '-c:a copy'])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run()
    })

    // 4. Stream output back
    res.setHeader('Content-Type', 'video/mp4')
    res.setHeader('Content-Disposition', 'attachment; filename="karikreative-final.mp4"')

    const readStream = createReadStream(outputPath)
    await pipeline(readStream, res)

  } catch (err) {
    console.error('FFmpeg overlay error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Overlay failed' })
    }
  } finally {
    // Cleanup temp files
    try { if (existsSync(inputPath))  unlinkSync(inputPath)  } catch {}
    try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
  }
}
