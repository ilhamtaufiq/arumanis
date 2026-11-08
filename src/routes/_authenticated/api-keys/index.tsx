import { createFileRoute } from '@tanstack/react-router'
import ApiKeyList from '@/features/api-keys/components/ApiKeyList'
import { requireAdmin } from '@/lib/auth-utils'

export const Route = createFileRoute('/_authenticated/api-keys/')({
  beforeLoad: () => {
    requireAdmin()
  },
  component: ApiKeyList,
})
