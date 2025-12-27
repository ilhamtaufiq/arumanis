import { createFileRoute } from '@tanstack/react-router'
import { AuditLogList } from '@/features/audit-logs/components/AuditLogList'

export const Route = createFileRoute('/_authenticated/audit-logs')({
    component: AuditLogList,
})
