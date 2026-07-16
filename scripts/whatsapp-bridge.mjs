/**
 * Arumanis WhatsApp bridge using Baileys (@whiskeysockets/baileys).
 * HTTP API (localhost): status | start | stop | send | send-bulk
 *
 * Docs: https://github.com/whiskeysockets/Baileys
 */
import cors from 'cors'
import express from 'express'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import pino from 'pino'
import QRCode from 'qrcode'
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys'

const port = Number(process.env.WHATSAPP_BRIDGE_PORT || 4000)
const apiKey = process.env.WHATSAPP_BRIDGE_KEY || ''
const authDir = resolve(process.env.WHATSAPP_AUTH_DIR || './data/whatsapp-auth')

mkdirSync(authDir, { recursive: true })

const logger = pino({ level: process.env.WHATSAPP_LOG_LEVEL || 'silent' })

let sock = null
let startingPromise = null
/** @type {'disconnected' | 'connecting' | 'connected'} */
let status = 'disconnected'
let lastQrCode = null
let connectedNumber = null
let lastError = null

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

function requireApiKey(req, res, next) {
  if (!apiKey) return next()
  const header = req.get('x-api-key') || ''
  if (header !== apiKey) {
    return res.status(401).json({ message: 'Invalid WhatsApp bridge API key' })
  }
  return next()
}

app.use(requireApiKey)

function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '')
  if (!digits) return ''
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return normalized.includes('@') ? normalized : `${normalized}@s.whatsapp.net`
}

function publicStatus() {
  return {
    status,
    qrCode: lastQrCode,
    connectedNumber,
    lastError,
  }
}

function extractPhoneFromJid(jid) {
  if (!jid) return null
  return String(jid).split('@')[0] || null
}

async function startClient() {
  if (sock && status === 'connected') return sock
  if (startingPromise) return startingPromise

  status = 'connecting'
  lastError = null

  startingPromise = (async () => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(authDir)
      const { version } = await fetchLatestBaileysVersion()

      const socket = makeWASocket({
        version,
        auth: state,
        logger,
        printQRInTerminal: false,
        syncFullHistory: false,
        markOnlineOnConnect: false,
      })

      sock = socket

      socket.ev.on('creds.update', saveCreds)

      socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
          status = 'connecting'
          try {
            lastQrCode = await QRCode.toDataURL(qr)
          } catch (error) {
            lastError = error?.message || String(error)
            lastQrCode = null
          }
        }

        if (connection === 'open') {
          status = 'connected'
          lastQrCode = null
          lastError = null
          connectedNumber =
            extractPhoneFromJid(socket.user?.id) ||
            extractPhoneFromJid(socket.user?.lid) ||
            null
        }

        if (connection === 'close') {
          const code = lastDisconnect?.error?.output?.statusCode
          const shouldReconnect = code !== DisconnectReason.loggedOut

          status = 'disconnected'
          lastQrCode = null
          connectedNumber = null
          sock = null
          startingPromise = null

          if (code === DisconnectReason.loggedOut) {
            lastError = 'Sesi logout. Scan QR ulang.'
          } else if (lastDisconnect?.error) {
            lastError = lastDisconnect.error.message || String(lastDisconnect.error)
          }

          // Auto-reconnect unless explicit logout / stop
          if (shouldReconnect && code !== DisconnectReason.loggedOut) {
            setTimeout(() => {
              startClient().catch(() => undefined)
            }, 2000)
          }
        }
      })

      return socket
    } catch (error) {
      status = 'disconnected'
      sock = null
      startingPromise = null
      lastError = error?.message || String(error)
      throw error
    }
  })()

  return startingPromise
}

async function stopClient({ logout = true } = {}) {
  const active = sock
  sock = null
  startingPromise = null
  status = 'disconnected'
  lastQrCode = null
  connectedNumber = null

  if (!active) return

  try {
    if (logout && typeof active.logout === 'function') {
      await active.logout()
    } else if (typeof active.end === 'function') {
      active.end(undefined)
    }
  } catch (error) {
    lastError = error?.message || String(error)
  }
}

app.get('/status', (_req, res) => {
  res.json(publicStatus())
})

app.post('/start', async (_req, res) => {
  startClient().catch(() => undefined)
  res.status(202).json({
    message: 'WhatsApp session is starting (Baileys)',
    ...publicStatus(),
  })
})

app.post('/stop', async (_req, res) => {
  await stopClient({ logout: true })
  res.json({ message: 'WhatsApp session stopped', ...publicStatus() })
})

app.post('/send', async (req, res) => {
  const to = normalizePhone(req.body?.to)
  const text = String(req.body?.text || req.body?.message || '').trim()

  if (!to || !text) {
    return res.status(422).json({ message: 'Nomor tujuan dan pesan wajib diisi' })
  }

  try {
    const client = await startClient()
    // Wait briefly if still connecting
    if (status !== 'connected') {
      await new Promise((r) => setTimeout(r, 1500))
    }
    if (status !== 'connected') {
      return res.status(503).json({
        message: 'WhatsApp belum terhubung. Scan QR di halaman admin.',
        ...publicStatus(),
      })
    }

    await client.sendMessage(to, { text })
    res.json({ message: 'Pesan WhatsApp berhasil dikirim' })
  } catch (error) {
    lastError = error?.message || String(error)
    res.status(500).json({ message: 'Gagal mengirim pesan WhatsApp', error: lastError })
  }
})

app.post('/send-bulk', async (req, res) => {
  const recipients = Array.isArray(req.body?.recipients) ? req.body.recipients : []
  const results = []

  for (const recipient of recipients) {
    try {
      const client = await startClient()
      if (status !== 'connected') {
        results.push({
          phone: recipient.phone,
          success: false,
          error: 'WhatsApp belum terhubung',
        })
        continue
      }
      await client.sendMessage(normalizePhone(recipient.phone), {
        text: String(recipient.message || ''),
      })
      results.push({ phone: recipient.phone, success: true })
    } catch (error) {
      results.push({
        phone: recipient.phone,
        success: false,
        error: error?.message || String(error),
      })
    }
  }

  res.json({ results })
})

app.listen(port, '127.0.0.1', () => {
  console.log(`Arumanis WhatsApp bridge (Baileys) listening on http://127.0.0.1:${port}`)
  console.log(`Auth state: ${authDir}`)
})
