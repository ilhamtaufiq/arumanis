import { createFileRoute } from '@tanstack/react-router'
import ErrorLogList from '@/features/error-logs/components/ErrorLogList'

export const Route = createFileRoute('/_authenticated/error-logs')({
    component: ErrorLogList,
})
