import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const MAX_MESSAGES_PER_CHAT = 150
const MAX_CHATS = 300

function isBrowsableChatId(id) {
  if (!id || typeof id !== 'string') return false
  if (id === 'status@broadcast') return false
  if (id.endsWith('@broadcast')) return false
  return true
}

function extractMessageText(waMessage) {
  const payload = waMessage?.message
  if (!payload) return ''
  if (payload.conversation) return payload.conversation
  if (payload.extendedTextMessage?.text) return payload.extendedTextMessage.text
  if (payload.imageMessage) {
    const cap = payload.imageMessage.caption
    return cap ? `[Gambar] ${cap}` : '[Gambar]'
  }
  if (payload.videoMessage) {
    const cap = payload.videoMessage.caption
    return cap ? `[Video] ${cap}` : '[Video]'
  }
  if (payload.documentMessage) {
    const name = payload.documentMessage.fileName || 'dokumen'
    return `[Dokumen] ${name}`
  }
  if (payload.audioMessage) return '[Audio]'
  if (payload.stickerMessage) return '[Stiker]'
  if (payload.contactMessage) return '[Kontak]'
  if (payload.locationMessage) return '[Lokasi]'
  if (payload.buttonsMessage) return payload.buttonsMessage.contentText || '[Tombol]'
  if (payload.listMessage) return payload.listMessage.description || '[Daftar]'
  return '[Pesan media]'
}

function toTimestamp(value) {
  if (value == null) return Date.now()
  if (typeof value === 'number') return value < 1e12 ? value * 1000 : value
  if (typeof value === 'object' && typeof value.toNumber === 'function') {
    const n = value.toNumber()
    return n < 1e12 ? n * 1000 : n
  }
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return Date.now()
  return parsed < 1e12 ? parsed * 1000 : parsed
}

function displayNameForChat(chatId, contactsById, chatsById) {
  const contact = contactsById.get(chatId)
  if (contact?.name) return contact.name
  if (contact?.notify) return contact.notify
  const chat = chatsById.get(chatId)
  if (chat?.name) return chat.name
  if (chatId.endsWith('@g.us')) return 'Grup WhatsApp'
  const phone = chatId.split('@')[0]
  return phone.startsWith('62') ? `+${phone}` : phone
}

export function createChatStore(authDir) {
  /** @type {Map<string, object>} */
  const chatsById = new Map()
  /** @type {Map<string, object[]>} */
  const messagesByChat = new Map()
  /** @type {Map<string, object>} */
  const rawMessageIndex = new Map()
  /** @type {Map<string, object>} */
  const contactsById = new Map()

  const cachePath = join(authDir, 'chat-store-cache.json')

  function messageIndexKey(key) {
    return `${key.remoteJid}|${key.id}`
  }

  function trimChatMessages(jid) {
    const list = messagesByChat.get(jid)
    if (!list || list.length <= MAX_MESSAGES_PER_CHAT) return
    const trimmed = list.slice(-MAX_MESSAGES_PER_CHAT)
    messagesByChat.set(jid, trimmed)
    for (const key of [...rawMessageIndex.keys()]) {
      if (key.startsWith(`${jid}|`)) {
        const stillUsed = trimmed.some((m) => m.id === key.split('|')[1])
        if (!stillUsed) rawMessageIndex.delete(key)
      }
    }
  }

  function upsertChatSummary(jid, patch) {
    if (!isBrowsableChatId(jid)) return
    const prev = chatsById.get(jid) || {
      id: jid,
      name: null,
      lastMessageText: '',
      lastMessageTime: 0,
      unreadCount: 0,
      isGroup: jid.endsWith('@g.us'),
    }
    const next = { ...prev, ...patch, id: jid, isGroup: jid.endsWith('@g.us') }
    next.name = next.name || displayNameForChat(jid, contactsById, chatsById)
    chatsById.set(jid, next)
    if (chatsById.size > MAX_CHATS) {
      const sorted = [...chatsById.values()].sort(
        (a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0),
      )
      chatsById.clear()
      for (const chat of sorted.slice(0, MAX_CHATS)) chatsById.set(chat.id, chat)
    }
  }

  function ingestWaMessage(waMessage) {
    const jid = waMessage?.key?.remoteJid
    if (!isBrowsableChatId(jid) || !waMessage?.key?.id) return

    rawMessageIndex.set(messageIndexKey(waMessage.key), waMessage)

    const timestamp = toTimestamp(waMessage.messageTimestamp)
    const text = extractMessageText(waMessage)
    const fromMe = Boolean(waMessage.key.fromMe)
    const normalized = {
      id: waMessage.key.id,
      jid,
      fromMe,
      timestamp,
      text,
      pushName: waMessage.pushName || null,
    }

    const list = messagesByChat.get(jid) || []
    const existingIdx = list.findIndex((m) => m.id === normalized.id)
    if (existingIdx >= 0) list[existingIdx] = normalized
    else list.push(normalized)
    list.sort((a, b) => a.timestamp - b.timestamp)
    messagesByChat.set(jid, list)
    trimChatMessages(jid)

    upsertChatSummary(jid, {
      lastMessageText: text,
      lastMessageTime: timestamp,
      name: waMessage.pushName || undefined,
    })
  }

  function upsertChatFromWa(chat) {
    const jid = chat?.id
    if (!isBrowsableChatId(jid)) return
    upsertChatSummary(jid, {
      name: chat.name || null,
      lastMessageTime: toTimestamp(chat.conversationTimestamp),
      unreadCount: Number(chat.unreadCount || 0),
    })
  }

  function bind(socket) {
    socket.ev.on('messaging-history.set', ({ chats = [], contacts = [], messages = [] }) => {
      for (const contact of contacts) {
        if (contact?.id) contactsById.set(contact.id, contact)
      }
      for (const chat of chats) upsertChatFromWa(chat)
      for (const message of messages) ingestWaMessage(message)
      persist()
    })

    socket.ev.on('chats.upsert', (chats) => {
      for (const chat of chats) upsertChatFromWa(chat)
    })

    socket.ev.on('chats.update', (updates) => {
      for (const update of updates) {
        if (!update?.id) continue
        const prev = chatsById.get(update.id) || { id: update.id }
        upsertChatSummary(update.id, {
          ...prev,
          unreadCount: update.unreadCount ?? prev.unreadCount,
          lastMessageTime: update.conversationTimestamp
            ? toTimestamp(update.conversationTimestamp)
            : prev.lastMessageTime,
        })
      }
    })

    socket.ev.on('contacts.upsert', (contacts) => {
      for (const contact of contacts) {
        if (contact?.id) contactsById.set(contact.id, contact)
      }
      for (const chat of chatsById.values()) {
        chat.name = displayNameForChat(chat.id, contactsById, chatsById)
        chatsById.set(chat.id, chat)
      }
    })

    socket.ev.on('messages.upsert', ({ messages = [] }) => {
      for (const message of messages) ingestWaMessage(message)
      persist()
    })
  }

  function getMessage(key) {
    if (!key?.remoteJid || !key?.id) return undefined
    return rawMessageIndex.get(messageIndexKey(key))
  }

  function listChats(limit = 50) {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100)
    return [...chatsById.values()]
      .filter((c) => isBrowsableChatId(c.id))
      .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0))
      .slice(0, safeLimit)
      .map((chat) => ({
        id: chat.id,
        name: chat.name || displayNameForChat(chat.id, contactsById, chatsById),
        lastMessageText: chat.lastMessageText || '',
        lastMessageTime: chat.lastMessageTime || 0,
        unreadCount: chat.unreadCount || 0,
        isGroup: Boolean(chat.isGroup),
      }))
  }

  function listMessages(jid, limit = 50) {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100)
    const list = messagesByChat.get(jid) || []
    return list.slice(-safeLimit)
  }

  function clear() {
    chatsById.clear()
    messagesByChat.clear()
    rawMessageIndex.clear()
    contactsById.clear()
    try {
      if (existsSync(cachePath)) writeFileSync(cachePath, '{}')
    } catch {
      // ignore
    }
  }

  function persist() {
    try {
      const payload = {
        chats: [...chatsById.values()],
        messages: Object.fromEntries(messagesByChat.entries()),
        contacts: Object.fromEntries(contactsById.entries()),
        savedAt: new Date().toISOString(),
      }
      writeFileSync(cachePath, JSON.stringify(payload))
    } catch {
      // ignore persistence errors
    }
  }

  function hydrate() {
    try {
      if (!existsSync(cachePath)) return
      const raw = readFileSync(cachePath, 'utf8')
      const data = JSON.parse(raw)
      for (const chat of data.chats || []) {
        if (chat?.id) chatsById.set(chat.id, chat)
      }
      for (const [jid, messages] of Object.entries(data.messages || {})) {
        if (Array.isArray(messages)) messagesByChat.set(jid, messages)
      }
      for (const [id, contact] of Object.entries(data.contacts || {})) {
        contactsById.set(id, contact)
      }
    } catch {
      // ignore corrupt cache
    }
  }

  hydrate()

  return { bind, getMessage, listChats, listMessages, clear, persist }
}