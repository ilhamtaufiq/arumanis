import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicy } from '@/features/public/privacy-policy'

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicy,
})
