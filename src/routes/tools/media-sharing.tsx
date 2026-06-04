import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/tools/media-sharing')({
    beforeLoad: () => {
        throw redirect({
            to: '/puspen/media-sharing',
        })
    },
})
