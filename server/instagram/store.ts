import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { InstagramBusinessProfile, InstagramMediaItem } from './types.ts'

export interface StoredInstagramMessage {
  id: string
  threadId: string
  direction: 'inbound' | 'outbound'
  senderId: string
  recipientId: string
  text: string
  timestamp: number
  mid?: string
  humanAgent?: boolean
  raw?: unknown
}

export interface StoredInstagramThread {
  id: string
  participantId: string
  lastMessageAt: number
  lastText: string
  unread: number
  messages: StoredInstagramMessage[]
}

export interface StoredInstagramComment {
  id: string
  mediaId?: string
  text: string
  username?: string
  fromId?: string
  timestamp: number
  parentId?: string
  raw?: unknown
}

export interface StoredWebhookEvent {
  id: string
  receivedAt: string
  object: string
  summary: string
  payload: unknown
}

export interface InstagramStoreData {
  version: 1
  updatedAt: string | null
  mediaSyncedAt: string | null
  profile: InstagramBusinessProfile | null
  media: InstagramMediaItem[]
  threads: StoredInstagramThread[]
  comments: StoredInstagramComment[]
  events: StoredWebhookEvent[]
}

const MAX_THREADS = 200
const MAX_MESSAGES_PER_THREAD = 200
const MAX_COMMENTS = 500
const MAX_EVENTS = 100
const MAX_MEDIA = 50

function emptyStore(): InstagramStoreData {
  return {
    version: 1,
    updatedAt: null,
    mediaSyncedAt: null,
    profile: null,
    media: [],
    threads: [],
    comments: [],
    events: [],
  }
}

function readEnv(name: string): string {
  try {
    if (typeof Bun !== 'undefined' && Bun.env?.[name] != null) {
      return String(Bun.env[name]).trim()
    }
  } catch {
    // vitest / node without Bun global
  }
  return String(process.env[name] || '').trim()
}

function dataDir(): string {
  const configured = readEnv('INSTAGRAM_DATA_DIR')
  if (configured) return resolve(configured)
  return resolve(process.cwd(), 'data', 'instagram')
}

function storePath(): string {
  return resolve(dataDir(), 'store.json')
}

let memory: InstagramStoreData | null = null
let writeChain: Promise<void> = Promise.resolve()

export async function loadInstagramStore(): Promise<InstagramStoreData> {
  if (memory) return memory
  try {
    const raw = await readFile(storePath(), 'utf8')
    const parsed = JSON.parse(raw) as InstagramStoreData
    memory = {
      ...emptyStore(),
      ...parsed,
      version: 1,
      media: Array.isArray(parsed.media) ? parsed.media : [],
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      comments: Array.isArray(parsed.comments) ? parsed.comments : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    }
  } catch {
    memory = emptyStore()
  }
  return memory
}

async function persist(data: InstagramStoreData): Promise<void> {
  const dir = dataDir()
  await mkdir(dir, { recursive: true })
  const path = storePath()
  const tmp = `${path}.${process.pid}.tmp`
  const json = JSON.stringify(data, null, 2)
  await writeFile(tmp, json, 'utf8')
  await rename(tmp, path)
}

function enqueueWrite(mutator: (data: InstagramStoreData) => void | Promise<void>): Promise<InstagramStoreData> {
  const run = writeChain.then(async () => {
    const data = await loadInstagramStore()
    await mutator(data)
    data.updatedAt = new Date().toISOString()
    memory = data
    await persist(data)
    return data
  })
  writeChain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export async function getInstagramStoreSnapshot(): Promise<InstagramStoreData> {
  const data = await loadInstagramStore()
  return structuredClone(data)
}

export async function saveMediaAndProfile(
  media: InstagramMediaItem[],
  profile: InstagramBusinessProfile | null,
): Promise<InstagramStoreData> {
  return enqueueWrite((data) => {
    data.media = media.slice(0, MAX_MEDIA)
    data.profile = profile
    data.mediaSyncedAt = new Date().toISOString()
  })
}

export async function appendWebhookEvent(event: Omit<StoredWebhookEvent, 'id' | 'receivedAt'> & {
  id?: string
  receivedAt?: string
}): Promise<void> {
  await enqueueWrite((data) => {
    data.events.unshift({
      id: event.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      receivedAt: event.receivedAt || new Date().toISOString(),
      object: event.object,
      summary: event.summary,
      payload: event.payload,
    })
    if (data.events.length > MAX_EVENTS) {
      data.events = data.events.slice(0, MAX_EVENTS)
    }
  })
}

export async function upsertInboundMessage(input: {
  participantId: string
  senderId: string
  recipientId: string
  text: string
  timestamp: number
  mid?: string
  raw?: unknown
}): Promise<StoredInstagramMessage> {
  let saved!: StoredInstagramMessage
  await enqueueWrite((data) => {
    const threadId = input.participantId
    let thread = data.threads.find((t) => t.id === threadId)
    if (!thread) {
      thread = {
        id: threadId,
        participantId: input.participantId,
        lastMessageAt: input.timestamp,
        lastText: input.text,
        unread: 0,
        messages: [],
      }
      data.threads.unshift(thread)
    }

    const id = input.mid || `in_${input.timestamp}_${input.senderId}`
    const existing = thread.messages.find((m) => m.id === id || (input.mid && m.mid === input.mid))
    if (existing) {
      saved = existing
      return
    }

    const message: StoredInstagramMessage = {
      id,
      threadId,
      direction: 'inbound',
      senderId: input.senderId,
      recipientId: input.recipientId,
      text: input.text,
      timestamp: input.timestamp,
      mid: input.mid,
      raw: input.raw,
    }
    thread.messages.push(message)
    thread.messages.sort((a, b) => a.timestamp - b.timestamp)
    if (thread.messages.length > MAX_MESSAGES_PER_THREAD) {
      thread.messages = thread.messages.slice(-MAX_MESSAGES_PER_THREAD)
    }
    thread.lastMessageAt = input.timestamp
    thread.lastText = input.text
    thread.unread += 1
    data.threads.sort((a, b) => b.lastMessageAt - a.lastMessageAt)
    if (data.threads.length > MAX_THREADS) {
      data.threads = data.threads.slice(0, MAX_THREADS)
    }
    saved = message
  })
  return saved
}

export async function appendOutboundMessage(input: {
  participantId: string
  senderId: string
  recipientId: string
  text: string
  humanAgent?: boolean
  mid?: string
}): Promise<StoredInstagramMessage> {
  let saved!: StoredInstagramMessage
  const timestamp = Date.now()
  await enqueueWrite((data) => {
    const threadId = input.participantId
    let thread = data.threads.find((t) => t.id === threadId)
    if (!thread) {
      thread = {
        id: threadId,
        participantId: input.participantId,
        lastMessageAt: timestamp,
        lastText: input.text,
        unread: 0,
        messages: [],
      }
      data.threads.unshift(thread)
    }
    const message: StoredInstagramMessage = {
      id: input.mid || `out_${timestamp}`,
      threadId,
      direction: 'outbound',
      senderId: input.senderId,
      recipientId: input.recipientId,
      text: input.text,
      timestamp,
      mid: input.mid,
      humanAgent: input.humanAgent,
    }
    thread.messages.push(message)
    if (thread.messages.length > MAX_MESSAGES_PER_THREAD) {
      thread.messages = thread.messages.slice(-MAX_MESSAGES_PER_THREAD)
    }
    thread.lastMessageAt = timestamp
    thread.lastText = input.text
    data.threads.sort((a, b) => b.lastMessageAt - a.lastMessageAt)
    saved = message
  })
  return saved
}

export async function markThreadRead(threadId: string): Promise<void> {
  await enqueueWrite((data) => {
    const thread = data.threads.find((t) => t.id === threadId)
    if (thread) thread.unread = 0
  })
}

export async function upsertComment(input: {
  id: string
  mediaId?: string
  text: string
  username?: string
  fromId?: string
  timestamp?: number
  parentId?: string
  raw?: unknown
}): Promise<void> {
  await enqueueWrite((data) => {
    const existingIdx = data.comments.findIndex((c) => c.id === input.id)
    const row: StoredInstagramComment = {
      id: input.id,
      mediaId: input.mediaId,
      text: input.text,
      username: input.username,
      fromId: input.fromId,
      timestamp: input.timestamp || Date.now(),
      parentId: input.parentId,
      raw: input.raw,
    }
    if (existingIdx >= 0) {
      data.comments[existingIdx] = row
    } else {
      data.comments.unshift(row)
    }
    data.comments.sort((a, b) => b.timestamp - a.timestamp)
    if (data.comments.length > MAX_COMMENTS) {
      data.comments = data.comments.slice(0, MAX_COMMENTS)
    }
  })
}

/** Test helper — reset in-memory cache (does not delete file). */
export function resetInstagramStoreMemory(): void {
  memory = null
}
