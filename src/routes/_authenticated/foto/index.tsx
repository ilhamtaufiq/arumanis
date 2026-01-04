import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/foto/')({
  beforeLoad: () => {
    throw redirect({
      to: '/berkas',
      search: { type: 'images' },
    })
  },
  component: () => null,
})

