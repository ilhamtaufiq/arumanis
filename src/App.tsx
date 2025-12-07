import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { useAuthStore } from '@/stores/auth-stores'

function App() {
  const { auth } = useAuthStore()
  return (
    <RouterProvider router={router} context={{ auth }} />
  )
}

export default App