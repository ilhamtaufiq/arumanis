import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-stores'
import { cn } from '@/lib/utils'
import { login } from '@/features/auth/api'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
    email: z.email({
        error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
    }),
    password: z
        .string()
        .min(1, 'Please enter your password')
        .min(7, 'Password must be at least 7 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
    redirectTo?: string
}

export function UserAuthForm({
    className,
    redirectTo,
    ...props
}: UserAuthFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { auth } = useAuthStore()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsLoading(true)

        try {
            const response = await login(data)

            // Set user and access token
            auth.setUser(response.user)
            auth.setAccessToken(response.token)

            toast.success(`Welcome back, ${response.user.name}!`)

            // Redirect to the stored location or default to dashboard
            const targetPath = redirectTo || '/'
            navigate({ to: targetPath, replace: true })
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Invalid email or password'
            toast.error(errorMessage)

            // If validation errors exist
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors
                if (errors.email) {
                    form.setError('email', { message: errors.email[0] })
                }
                if (errors.password) {
                    form.setError('password', { message: errors.password[0] })
                }
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn('grid gap-3', className)}
                {...props}
            >
                <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder='name@example.com' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                        <FormItem className='relative'>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <PasswordInput placeholder='********' {...field} />
                            </FormControl>
                            <FormMessage />
                            <Link
                                to='/sign-in'
                                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
                            >
                                Forgot password?
                            </Link>
                        </FormItem>
                    )}
                />
                <Button className='mt-2' disabled={isLoading}>
                    {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
                    Sign in
                </Button>
            </form>
        </Form>
    )
}