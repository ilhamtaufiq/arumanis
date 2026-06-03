import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/tools/sign-pdf')({
    beforeLoad: () => {
        throw redirect({
            to: '/puspen/sign-pdf',
        })
    },
})
