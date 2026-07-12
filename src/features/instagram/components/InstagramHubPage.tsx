import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  CheckCircle2,
  ExternalLink,
  Inbox,
  Instagram,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldAlert,
  Webhook,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  INSTAGRAM_PERMISSION_CATALOG,
} from '../types'
import {
  useInstagramComments,
  useInstagramEvents,
  useInstagramInbox,
  useInstagramMedia,
  useInstagramProbe,
  useInstagramStatus,
  useInstagramThread,
  useReplyInstagramThread,
  useSyncInstagramMedia,
} from '../hooks/useInstagram'

function fmtTime(value: string | number | null | undefined) {
  if (value == null || value === '') return '—'
  const date = typeof value === 'number' ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, 'dd MMM yyyy HH:mm', { locale: idLocale })
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={ok ? 'default' : 'secondary'} className={ok ? 'bg-emerald-600' : ''}>
        {ok ? 'OK' : 'Belum'}
      </Badge>
    </div>
  )
}

export default function InstagramHubPage() {
  const [tab, setTab] = useState('overview')
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [useHumanAgent, setUseHumanAgent] = useState(true)

  const statusQuery = useInstagramStatus()
  const probeQuery = useInstagramProbe(true)
  const mediaQuery = useInstagramMedia(tab === 'media' || tab === 'overview')
  const inboxQuery = useInstagramInbox(tab === 'inbox')
  const threadQuery = useInstagramThread(selectedThreadId)
  const commentsQuery = useInstagramComments(tab === 'comments')
  const eventsQuery = useInstagramEvents(tab === 'events' || tab === 'overview')
  const syncMutation = useSyncInstagramMedia()
  const replyMutation = useReplyInstagramThread()

  const status = statusQuery.data
  const missing = status?.missing ?? []

  const unreadTotal = useMemo(
    () => (inboxQuery.data?.data ?? []).reduce((n, t) => n + (t.unread || 0), 0),
    [inboxQuery.data],
  )

  async function handleSync() {
    try {
      const result = await syncMutation.mutateAsync()
      if (result.ok) {
        toast.success(`Sinkron media: ${result.mediaCount ?? 0} item`)
      } else {
        toast.error(result.error || 'Gagal sinkron')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal sinkron')
    }
  }

  async function handleReply() {
    if (!selectedThreadId || !replyText.trim()) return
    try {
      const result = await replyMutation.mutateAsync({
        threadId: selectedThreadId,
        text: replyText.trim(),
        humanAgent: useHumanAgent,
      })
      if (result.ok) {
        toast.success(useHumanAgent ? 'Terkirim (Human Agent)' : 'Terkirim')
        setReplyText('')
      } else {
        toast.error(result.error || 'Gagal mengirim')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengirim')
    }
  }

  return (
    <>
      <Header>
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" aria-hidden />
            <div>
              <h1 className="text-lg font-semibold leading-none">Instagram</h1>
              <p className="text-xs text-muted-foreground">
                Gallery, inbox, komentar, webhook &amp; Human Agent
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleSync}
            disabled={syncMutation.isPending || !status?.capabilities.media}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync media
          </Button>
        </div>
      </Header>

      <Main>
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="flex h-auto flex-wrap gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="inbox">
              Inbox
              {unreadTotal > 0 ? (
                <Badge className="ml-1.5 h-5 min-w-5 px-1" variant="destructive">
                  {unreadTotal}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="comments">Komentar</TabsTrigger>
            <TabsTrigger value="events">Webhook</TabsTrigger>
            <TabsTrigger value="permissions">Permission</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {statusQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Konfigurasi Meta</CardTitle>
                    <CardDescription>
                      Callback webhook:{' '}
                      <code className="text-xs">{status?.webhookPath || '/bff/webhooks/meta'}</code>
                      {' · '}Graph {status?.graphVersion}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-2 sm:grid-cols-2">
                    <Flag ok={Boolean(status?.appIdSet)} label="META_APP_ID" />
                    <Flag ok={Boolean(status?.appSecretSet)} label="META_APP_SECRET" />
                    <Flag ok={Boolean(status?.verifyTokenSet)} label="Verify token" />
                    <Flag ok={Boolean(status?.accessTokenSet)} label="Access token" />
                    <Flag ok={Boolean(status?.igUserIdSet)} label="IG user id" />
                    <Flag ok={Boolean(status?.capabilities.webhooks)} label="Webhook ready" />
                    <Flag ok={Boolean(status?.capabilities.media)} label="Media / gallery" />
                    <Flag
                      ok={Boolean(status?.capabilities.messagingHumanAgent)}
                      label="Messaging + Human Agent"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Cache lokal</CardTitle>
                    <CardDescription>Disimpan di data/instagram (BFF)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Media</span>
                      <span className="font-medium">{status?.mediaCached ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sync terakhir</span>
                      <span className="font-medium">{fmtTime(status?.mediaSyncedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thread inbox</span>
                      <span className="font-medium">{status?.inboxThreads ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Komentar</span>
                      <span className="font-medium">{status?.commentsCached ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event webhook</span>
                      <span className="font-medium">{status?.eventsCached ?? 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {missing.length > 0 ? (
              <Card className="border-amber-500/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    Env belum lengkap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {missing.map((item) => (
                      <li key={item}>
                        <code>{item}</code>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Lihat <code>docs/instagram-meta-setup.md</code> untuk langkah Meta Developer.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Probe token</CardTitle>
                  <CardDescription>Uji koneksi Graph (admin)</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => probeQuery.refetch()}
                  disabled={probeQuery.isFetching}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${probeQuery.isFetching ? 'animate-spin' : ''}`} />
                  Refresh probe
                </Button>
              </CardHeader>
              <CardContent className="text-sm">
                {probeQuery.isLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : probeQuery.data?.ok ? (
                  <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p>
                        Terhubung
                        {probeQuery.data.probe.name ? (
                          <>
                            {' '}
                            sebagai <strong>@{probeQuery.data.probe.name}</strong>
                          </>
                        ) : null}
                        {probeQuery.data.probe.id ? (
                          <span className="text-muted-foreground"> ({probeQuery.data.probe.id})</span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Sample media live: {probeQuery.data.mediaSampleCount ?? '—'} · cache:{' '}
                        {probeQuery.data.store?.mediaCached ?? '—'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-destructive">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{probeQuery.data?.error || probeQuery.data?.probe?.error || 'Probe gagal'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            {mediaQuery.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-xl" />
                ))}
              </div>
            ) : (mediaQuery.data?.data.length ?? 0) === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada media di cache. Klik <strong>Sync media</strong> setelah token dikonfigurasi.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="mb-3 text-xs text-muted-foreground">
                  Sync terakhir: {fmtTime(mediaQuery.data?.syncedAt)}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {mediaQuery.data?.data.map((item) => {
                    const src = item.thumbnail_url || item.media_url
                    return (
                      <a
                        key={item.id}
                        href={item.permalink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group overflow-hidden rounded-xl border bg-card transition hover:border-pink-400/50"
                      >
                        <div className="aspect-square bg-muted">
                          {src ? (
                            <img
                              src={src}
                              alt=""
                              className="h-full w-full object-cover transition group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {item.caption || item.media_type || item.id}
                          </p>
                          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            {fmtTime(item.timestamp)}
                          </p>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="inbox">
            <div className="grid gap-4 lg:grid-cols-5">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Inbox className="h-4 w-4" />
                    Percakapan
                  </CardTitle>
                  <CardDescription>Dari webhook messages</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[480px]">
                    {(inboxQuery.data?.data.length ?? 0) === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">
                        Belum ada DM. Pastikan webhook field <code>messages</code> ter-subscribe.
                      </p>
                    ) : (
                      <ul className="divide-y">
                        {inboxQuery.data?.data.map((thread) => (
                          <li key={thread.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedThreadId(thread.id)}
                              className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-muted/60 ${
                                selectedThreadId === thread.id ? 'bg-muted' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-medium">
                                  {thread.participantId}
                                </span>
                                {thread.unread > 0 ? (
                                  <Badge variant="destructive" className="h-5 px-1.5">
                                    {thread.unread}
                                  </Badge>
                                ) : null}
                              </div>
                              <span className="line-clamp-1 text-xs text-muted-foreground">
                                {thread.lastText}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {fmtTime(thread.lastMessageAt)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4" />
                    {selectedThreadId ? `Thread ${selectedThreadId}` : 'Pilih percakapan'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!selectedThreadId ? (
                    <p className="text-sm text-muted-foreground">Pilih thread di kiri.</p>
                  ) : threadQuery.isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <>
                      <ScrollArea className="h-[320px] rounded-lg border p-3">
                        <div className="space-y-3">
                          {threadQuery.data?.data.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                                  msg.direction === 'outbound'
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                <p
                                  className={`mt-1 text-[10px] ${
                                    msg.direction === 'outbound' ? 'text-white/70' : 'text-muted-foreground'
                                  }`}
                                >
                                  {fmtTime(msg.timestamp)}
                                  {msg.humanAgent ? ' · Human Agent' : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Tulis balasan..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="human-agent"
                              checked={useHumanAgent}
                              onCheckedChange={(v) => setUseHumanAgent(v === true)}
                            />
                            <Label htmlFor="human-agent" className="text-sm font-normal">
                              Human Agent (di luar window standar)
                            </Label>
                          </div>
                          <Button
                            onClick={handleReply}
                            disabled={replyMutation.isPending || !replyText.trim()}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Kirim
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comments">
            {commentsQuery.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (commentsQuery.data?.data.length ?? 0) === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Belum ada komentar. Subscribe field <code>comments</code> di Meta Webhooks.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {commentsQuery.data?.data.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {c.username || c.fromId || 'Pengguna'}
                          {c.mediaId ? (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              media {c.mediaId}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{c.text || '—'}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {fmtTime(c.timestamp)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Webhook className="h-4 w-4" />
                  Event webhook terbaru
                </CardTitle>
                <CardDescription>
                  POST ke <code>/bff/webhooks/meta</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsQuery.isLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (eventsQuery.data?.data.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada event.</p>
                ) : (
                  <ul className="divide-y rounded-lg border">
                    {eventsQuery.data?.data.map((ev) => (
                      <li key={ev.id} className="px-3 py-2 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Badge variant="outline">{ev.object}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {fmtTime(ev.receivedAt)}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">{ev.summary}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Permission Meta yang dipakai Arumanis</CardTitle>
                <CardDescription>
                  Termasuk Business Asset User Profile Access &amp; Human Agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {INSTAGRAM_PERMISSION_CATALOG.map((p) => (
                    <li key={p.key} className="rounded-lg border px-3 py-2">
                      <p className="text-sm font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">
                        <code>{p.key}</code> — {p.purpose}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
