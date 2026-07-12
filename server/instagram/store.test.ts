import { mkdir, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  appendOutboundMessage,
  getInstagramStoreSnapshot,
  resetInstagramStoreMemory,
  saveMediaAndProfile,
  upsertComment,
  upsertInboundMessage,
} from './store.ts'

const testDir = resolve(process.cwd(), 'data', 'instagram-test')

describe('instagram store', () => {
  beforeEach(async () => {
    process.env.INSTAGRAM_DATA_DIR = testDir
    resetInstagramStoreMemory()
    await rm(testDir, { recursive: true, force: true })
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    resetInstagramStoreMemory()
    await rm(testDir, { recursive: true, force: true })
    delete process.env.INSTAGRAM_DATA_DIR
  })

  it('saves media and profile', async () => {
    await saveMediaAndProfile(
      [{ id: '1', caption: 'hello', media_type: 'IMAGE', permalink: 'https://ig/1' }],
      { id: 'ig', username: 'bidang_ams' },
    )
    resetInstagramStoreMemory()
    const snap = await getInstagramStoreSnapshot()
    expect(snap.media).toHaveLength(1)
    expect(snap.profile?.username).toBe('bidang_ams')
    expect(snap.mediaSyncedAt).toBeTruthy()
  })

  it('upserts inbound thread messages and unread', async () => {
    await upsertInboundMessage({
      participantId: 'user-1',
      senderId: 'user-1',
      recipientId: 'page',
      text: 'Halo',
      timestamp: 1000,
      mid: 'm1',
    })
    await upsertInboundMessage({
      participantId: 'user-1',
      senderId: 'user-1',
      recipientId: 'page',
      text: 'Halo 2',
      timestamp: 2000,
      mid: 'm2',
    })
    const snap = await getInstagramStoreSnapshot()
    expect(snap.threads).toHaveLength(1)
    expect(snap.threads[0].messages).toHaveLength(2)
    expect(snap.threads[0].unread).toBe(2)
    expect(snap.threads[0].lastText).toBe('Halo 2')
  })

  it('dedupes same mid', async () => {
    await upsertInboundMessage({
      participantId: 'user-1',
      senderId: 'user-1',
      recipientId: 'page',
      text: 'A',
      timestamp: 1,
      mid: 'same',
    })
    await upsertInboundMessage({
      participantId: 'user-1',
      senderId: 'user-1',
      recipientId: 'page',
      text: 'A again',
      timestamp: 2,
      mid: 'same',
    })
    const snap = await getInstagramStoreSnapshot()
    expect(snap.threads[0].messages).toHaveLength(1)
  })

  it('appends outbound and comments', async () => {
    await appendOutboundMessage({
      participantId: 'user-1',
      senderId: 'page',
      recipientId: 'user-1',
      text: 'Balasan',
      humanAgent: true,
    })
    await upsertComment({
      id: 'c1',
      text: 'Komentar bagus',
      username: 'warga',
      mediaId: 'media1',
    })
    const snap = await getInstagramStoreSnapshot()
    expect(snap.threads[0].messages.some((m) => m.direction === 'outbound' && m.humanAgent)).toBe(
      true,
    )
    expect(snap.comments[0].text).toBe('Komentar bagus')
  })
})
