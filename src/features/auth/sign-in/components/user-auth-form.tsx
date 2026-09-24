import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-stores'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/features/auth/api'
import { invalidateSessionCache } from '@/lib/auth-session'
import { GoogleLoginButton } from './GoogleLoginButton'
import { redirectToExternalAppWithHandoff, redirectToPengawasWithHandoff } from '@/lib/auth-handoff'
import { needsDashboardDestinationChoice, shouldRedirectToPengawasApp } from '@/lib/pengawas-app'
import { isExternalRedirectUrl, resolvePostLoginPath } from '@/lib/post-login-redirect'
import { DashboardDestinationModal } from '@/components/common/DashboardDestinationModal'

const formSchema = z.object({
    email: z.string().min(1, 'Please enter your email').email('Invalid email address'),
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
    const [showPassword, setShowPassword] = useState(false)
    const [destinationChoiceOpen, setDestinationChoiceOpen] = useState(false)
    const [pendingPortalPath, setPendingPortalPath] = useState('/dashboard')
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
            auth.setSessionActive(true)
            invalidateSessionCache()

            toast.success(`Welcome back, ${response.user.name}!`)

            // Redirect dari app pengawasan (subpath terpisah, cookie sendiri).
            // Admin/manager tak lolos shouldRedirectToPengawasApp, jadi tangani
            // eksplisit agar tak login ulang di sisi pengawasan.
            if (redirectTo?.startsWith('/pengawasan')) {
                await redirectToPengawasWithHandoff()
                return
            }

            if (needsDashboardDestinationChoice(response.user.roles)) {
                if (redirectTo && isExternalRedirectUrl(redirectTo)) {
                    await redirectToExternalAppWithHandoff(redirectTo)
                    return
                }
                const targetPath = resolvePostLoginPath(response.user.roles, redirectTo)
                setPendingPortalPath(targetPath)
                setDestinationChoiceOpen(true)
                return
            }

            if (shouldRedirectToPengawasApp(response.user.roles)) {
                await redirectToPengawasWithHandoff()
                return
            }

            if (redirectTo && isExternalRedirectUrl(redirectTo)) {
                await redirectToExternalAppWithHandoff(redirectTo)
                return
            }

            const targetPath = resolvePostLoginPath(response.user.roles, redirectTo)
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
        <div className={cn('grid gap-5', className)}>
            <DashboardDestinationModal
                open={destinationChoiceOpen}
                userName={auth.user?.name}
                onChooseArumanis={() => {
                    setDestinationChoiceOpen(false)
                    navigate({ to: pendingPortalPath, replace: true })
                }}
            />
            <GoogleLoginButton className='w-full' redirectTo={redirectTo} />

            <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                <span className='relative z-10 bg-card px-2 text-muted-foreground'>
                    Atau lanjutkan dengan
                </span>
            </div>

            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='grid gap-4'
                {...props}
            >
                <div className='space-y-2'>
                    <label htmlFor='email' className='text-sm font-medium leading-none text-foreground'>
                        Email
                    </label>
                    <Input
                        id='email'
                        type='email'
                        autoFocus
                        placeholder='name@example.com'
                        autoComplete='email'
                        aria-invalid={!!form.formState.errors.email}
                        {...form.register('email')}
                    />
                    {form.formState.errors.email && (
                        <p className='text-xs font-medium text-destructive mt-1'>{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                        <label htmlFor='password' className='text-sm font-medium leading-none text-foreground'>
                            Kata sandi
                        </label>
                        <Link
                            to='/sign-in'
                            className='text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary'
                        >
                            Lupa?
                        </Link>
                    </div>
                    <div className='relative'>
                        <Input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            placeholder='********'
                            autoComplete='current-password'
                            aria-invalid={!!form.formState.errors.password}
                            className='pr-10'
                            {...form.register('password')}
                        />
                        <button
                            type='button'
                            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            className='absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground'
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Eye className='size-4' /> : <EyeOff className='size-4' />}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className='text-xs font-medium text-destructive mt-1'>{form.formState.errors.password.message}</p>
                    )}
                </div>

                <Button
                    type='submit'
                    disabled={isLoading}
                    className='mt-2 w-full'
                >
                    {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
                    Masuk
                </Button>
            </form>
        </div>
    )
}
