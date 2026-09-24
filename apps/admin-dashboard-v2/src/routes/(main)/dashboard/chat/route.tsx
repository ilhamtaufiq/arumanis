import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

import { Loader2, MessageSquare, RefreshCw, Send, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  closeLiveChatThread,
  getLiveChatInbox,
  getLiveChatMessages,
  sendLiveChatMessage,
  type LiveChatMessage,
  type LiveChatThread,
} from "@/lib/api/dashboard-api";

export const Route = createFileRoute("/(main)/dashboard/chat")({
  component: ChatPage,
});

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return formatTime(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) + " " + formatTime(iso);
}

function ChatPage() {
  const [threads, setThreads] = useState<LiveChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLiveChatInbox();
      setThreads(data);
      // Auto-select first open thread
      if (!activeThreadId && data.length > 0) {
        const first = data.find((t) => t.status === "open") ?? data[0];
        setActiveThreadId(first.id);
      }
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [activeThreadId]);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  const loadMessages = useCallback(async (threadId: number) => {
    setLoadingMessages(true);
    try {
      const data = await getLiveChatMessages(threadId);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (activeThreadId != null) {
      void loadMessages(activeThreadId);
    }
  }, [activeThreadId, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loadingMessages]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? null,
    [threads, activeThreadId],
  );

  const handleSelect = (threadId: number) => {
    setActiveThreadId(threadId);
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || activeThreadId == null || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const sent = await sendLiveChatMessage(activeThreadId, text);
      if (sent) {
        setMessages((prev) => [...prev, sent]);
      }
      // Refresh inbox to update latest message
      const data = await getLiveChatInbox();
      setThreads(data);
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  }, [input, activeThreadId, sending]);

  const handleClose = useCallback(async () => {
    if (activeThreadId == null) return;
    await closeLiveChatThread(activeThreadId);
    const data = await getLiveChatInbox();
    setThreads(data);
    setActiveThreadId(null);
  }, [activeThreadId]);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unread_count ?? 0), 0);

  return (
    <div className="flex h-[calc(100svh-var(--header-height))] min-h-0 gap-4 p-4">
      {/* ── Conversation List ── */}
      <Card className="flex w-72 shrink-0 flex-col overflow-hidden">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="size-4 text-primary" />
              Pesan Pengguna
            </CardTitle>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px]">
                {totalUnread}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4 text-center text-xs text-muted-foreground">
              Belum ada percakapan masuk dari pengguna.
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => handleSelect(thread.id)}
                className={`flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  activeThreadId === thread.id ? "bg-primary/10" : "hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {thread.user?.name || `User #${thread.user_id}`}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatDate(thread.last_message_at)}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {thread.latest_message?.message || "Belum ada pesan"}
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge variant={thread.status === "open" ? "outline" : "secondary"} className="text-[9px]">
                    {thread.status === "open" ? "Terbuka" : "Ditutup"}
                  </Badge>
                  {(thread.unread_count ?? 0) > 0 && (
                    <Badge variant="destructive" className="h-4 min-w-4 px-1 text-[9px]">
                      {thread.unread_count}
                    </Badge>
                  )}
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── Chat Thread ── */}
      <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="truncate text-base">
                {activeThread?.user?.name || "Pilih Percakapan"}
              </CardTitle>
              {activeThread && (
                <p className="truncate text-xs text-muted-foreground">
                  {activeThread.user?.email || `User ID ${activeThread.user_id}`}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => void loadInbox()}>
                <RefreshCw className="size-3.5" />
                Refresh
              </Button>
              {activeThread?.status === "open" && (
                <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => void handleClose()}>
                  <X className="size-3.5" />
                  Tutup
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
          {activeThreadId == null ? (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              Pilih percakapan pengguna di samping untuk mulai membalas.
            </div>
          ) : loadingMessages ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-2/3 rounded-xl" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
              Belum ada pesan dalam percakapan ini.
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.user_id !== 1; // placeholder: current admin id
              return (
                <div key={msg.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? "rounded-tl-sm bg-muted"
                        : "rounded-tr-sm bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isUser ? "text-muted-foreground" : "text-primary-foreground/70"
                      }`}
                    >
                      {msg.user?.name || "User"} · {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>

        <div className="shrink-0 border-t bg-background/80 p-3">
          {activeThread?.status === "closed" && (
            <p className="mb-2 text-center text-[11px] text-muted-foreground">
              Percakapan ini telah ditutup oleh admin.
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder={
                activeThreadId == null
                  ? "Pilih percakapan dulu..."
                  : activeThread?.status === "closed"
                  ? "Percakapan ditutup..."
                  : "Ketik balasan untuk pengguna..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending || activeThreadId == null || activeThread?.status === "closed"}
              className="h-9 flex-1 bg-card text-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={sending || !input.trim() || activeThreadId == null || activeThread?.status === "closed"}
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
