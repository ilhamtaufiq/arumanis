import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/output/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/output/"!</div>
}
