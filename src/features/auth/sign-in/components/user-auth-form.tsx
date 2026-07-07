import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-stores'
import { cn } from '@/lib/utils'
import { login } from '@/features/auth/api'
import { invalidateSessionCache } from '@/lib/auth-session'
import { GoogleLoginButton } from './GoogleLoginButton'
import { redirectToExternalAppWithHandoff, redirectToPengawasWithHandoff } from '@/lib/auth-handoff'
import { shouldRedirectToPengawasApp } from '@/lib/pengawas-app'
import { isExternalRedirectUrl, resolvePostLoginPath } from '@/lib/post-login-redirect'

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
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='grid gap-4'
                {...props}
            >
                <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-[0.18em] text-[#111111]">Email</label>
                    <input 
                        type="email"
                        placeholder="name@example.com" 
                        {...form.register('email')}
                        className="w-full bg-[#FFFFFF] border-[3px] border-[#111111] px-4 py-3 font-bold text-[#111111] outline-none focus:bg-[#8ECAE6] transition-colors rounded-none placeholder:text-[#111111]/40"
                    />
                    {form.formState.errors.email && (
                        <p className="text-[#EF233C] text-xs font-bold mt-1">{form.formState.errors.email.message}</p>
                    )}
                </div>
                
                <div className="space-y-1 relative">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-[0.18em] text-[#111111]">Password</label>
                        <Link
                            to='/sign-in'
                            className='text-[10px] font-black uppercase tracking-wider text-[#111111] hover:text-[#FB8500] underline decoration-[2px] underline-offset-4 transition-colors'
                        >
                            Lupa?
                        </Link>
                    </div>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="********" 
                            {...form.register('password')}
                            className="w-full bg-[#FFFFFF] border-[3px] border-[#111111] px-4 py-3 pr-12 font-bold text-[#111111] outline-none focus:bg-[#8ECAE6] transition-colors rounded-none placeholder:text-[#111111]/40"
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[#111111]/10 rounded-none transition-colors text-[#111111]"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Eye size={20} strokeWidth={2.5} /> : <EyeOff size={20} strokeWidth={2.5} />}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-[#EF233C] text-xs font-bold mt-1">{form.formState.errors.password.message}</p>
                    )}
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className='mt-2 w-full bg-[#FFB703] border-[3px] border-[#111111] shadow-[6px_6px_0_0_#111111] px-5 py-3 font-black text-[#111111] uppercase tracking-[0.15em] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-[#FFB703]/90 disabled:opacity-60 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[6px_6px_0_0_#111111] flex items-center justify-center rounded-none cursor-pointer'
                >
                    {isLoading ? <Loader2 className='animate-spin mr-2 h-5 w-5' /> : <LogIn className='mr-2 h-5 w-5' strokeWidth={2.5} />}
                    Sign In
                </button>
            </form>

            <div className='relative flex items-center justify-center my-1'>
                <div className='absolute inset-x-0 h-[3px] bg-[#111111] z-0'></div>
                <div className='relative bg-[#FFFFFF] px-4 text-xs font-black uppercase tracking-wider text-[#111111] z-10'>
                    Atau
                </div>
            </div>

            <GoogleLoginButton className='w-full' redirectTo={redirectTo} />
        </div>
    )
}
