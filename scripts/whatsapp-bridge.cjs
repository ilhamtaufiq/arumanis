const cors = require('cors')
const express = require('express')
const { create, ev } = require('@open-wa/wa-automate')

const app = express()
const port = Number(process.env.WHATSAPP_BRIDGE_PORT || 4000)
const apiKey = process.env.WHATSAPP_BRIDGE_KEY || ''
const sessionId = process.env.WHATSAPP_SESSION_ID || 'arumanis'
const defaultChromePath = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find(path => require('fs').existsSync(path))

let client = null
let startingPromise = null
let status = 'disconnected'
let lastQrCode = null
let connectedNumber = null
let lastError = null

app.use(cors())
app.use(express.json({ limit: '1mb' }))

function requireApiKey(req, res, next) {
  if (!apiKey) return next()

  const header = req.get('x-api-key') || ''
  if (header !== apiKey) {
    return res.status(401).json({ message: 'Invalid WhatsApp bridge API key' })
  }

  next()
}

app.use(requireApiKey)

function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '')
  if (!digits) return ''

  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return normalized.endsWith('@c.us') ? normalized : `${normalized}@c.us`
}

function publicStatus() {
  return {
    status,
    qrCode: lastQrCode,
    connectedNumber,
    lastError,
  }
}

ev.on('qr.**', qrcode => {
  lastQrCode = qrcode
  status = 'connecting'
  lastError = null
})

async function startClient() {
  if (client) return client
  if (startingPromise) return startingPromise

  status = 'connecting'
  lastError = null

  startingPromise = create({
    sessionId,
    multiDevice: true,
    headless: process.env.WHATSAPP_HEADLESS !== 'false',
    qrTimeout: 0,
    authTimeout: 0,
    qrLogSkip: true,
    useChrome: process.env.WHATSAPP_USE_CHROME !== 'false',
    executablePath: process.env.WHATSAPP_CHROME_PATH || defaultChromePath || undefined,
    chromiumArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
    killProcessOnBrowserClose: true,
  })
    .then(async createdClient => {
      client = createdClient
      status = 'connected'
      lastQrCode = null

      try {
        connectedNumber = await client.getHostNumber()
      } catch {
        connectedNumber = null
      }

      client.onStateChanged(state => {
        if (['CONFLICT', 'UNLAUNCHED', 'UNPAIRED', 'UNPAIRED_IDLE'].includes(state)) {
          status = 'disconnected'
        }
        if (['CONNECTED', 'OPENING', 'PAIRING'].includes(state)) {
          status = state === 'CONNECTED' ? 'connected' : 'connecting'
        }
      })

      return client
    })
    .catch(error => {
      status = 'disconnected'
      lastError = error.message || String(error)
      client = null
      throw error
    })
    .finally(() => {
      startingPromise = null
    })

  return startingPromise
}

app.get('/status', (_req, res) => {
  res.json(publicStatus())
})

app.post('/start', async (_req, res) => {
  startClient().catch(() => undefined)
  res.status(202).json({
    message: 'WhatsApp session is starting',
    ...publicStatus(),
  })
})

app.post('/stop', async (_req, res) => {
  const activeClient = client
  client = null
  startingPromise = null
  status = 'disconnected'
  lastQrCode = null
  connectedNumber = null

  if (activeClient) {
    try {
      if (typeof activeClient.logout === 'function') {
        await activeClient.logout()
      }
      if (typeof activeClient.kill === 'function') {
        await activeClient.kill()
      }
    } catch (error) {
      lastError = error.message || String(error)
    }
  }

  res.json({ message: 'WhatsApp session stopped', ...publicStatus() })
})

app.post('/send', async (req, res) => {
  const to = normalizePhone(req.body.to)
  const text = String(req.body.text || req.body.message || '').trim()

  if (!to || !text) {
    return res.status(422).json({ message: 'Nomor tujuan dan pesan wajib diisi' })
  }

  try {
    const activeClient = await startClient()
    await activeClient.sendText(to, text)
    res.json({ message: 'Pesan WhatsApp berhasil dikirim' })
  } catch (error) {
    lastError = error.message || String(error)
    res.status(500).json({ message: 'Gagal mengirim pesan WhatsApp', error: lastError })
  }
})

app.post('/send-bulk', async (req, res) => {
  const recipients = Array.isArray(req.body.recipients) ? req.body.recipients : []
  const results = []

  for (const recipient of recipients) {
    try {
      const activeClient = await startClient()
      await activeClient.sendText(normalizePhone(recipient.phone), String(recipient.message || ''))
      results.push({ phone: recipient.phone, success: true })
    } catch (error) {
      results.push({ phone: recipient.phone, success: false, error: error.message || String(error) })
    }
  }

  res.json({ results })
})

app.listen(port, () => {
  console.log(`Arumanis WhatsApp bridge listening on http://127.0.0.1:${port}`)
})
