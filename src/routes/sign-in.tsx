import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './root'
import { SignIn } from '@/features/auth/sign-in'
import { z } from 'zod'

const signInSearchSchema = z.object({
    redirect: z.string().optional(),
})

export const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    validateSearch: signInSearchSchema,
    component: SignIn,
})
