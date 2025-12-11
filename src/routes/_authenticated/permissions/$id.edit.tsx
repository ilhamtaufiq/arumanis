import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/permissions/$id/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/permissions/$id/edit"!</div>
}
