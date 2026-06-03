import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/tools/organize-pdf')({
    beforeLoad: () => {
        throw redirect({
            to: '/puspen/organize-pdf',
        })
    },
})
