import { createFileRoute } from '@tanstack/react-router'
import { AsistenAiPage } from '@/features/ai-chat/components/AsistenAiPage'

export const Route = createFileRoute('/_authenticated/asisten-ai')({
  component: AsistenAiPage,
})
