import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AutoBreadcrumbs } from './breadcrumb-nav'
import { Search } from '../search'
import { ThemeToggle } from './theme-toggle'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { FiscalYearSelector } from './fiscal-year-selector'

import { useAuthStore } from '@/stores/auth-stores'
import { sidebarData } from './data/sidebar-data'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { BadgeCheck, CreditCard, LogOut } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { SignOutDialog } from '@/components/sign-out-dialog'


type HeaderProps = React.HTMLAttributes<HTMLElement> & {
    fixed?: boolean
    ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
    const { auth } = useAuthStore()
    const isAdmin = auth.user?.roles?.includes('admin') || false
    const [offset, setOffset] = useState(0)

    useEffect(() => {
        const onScroll = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop)
        }

        // Add scroll listener to the body
        document.addEventListener('scroll', onScroll, { passive: true })

        // Clean up the event listener on unmount
        return () => document.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <header
            className={cn(
                'z-50 min-h-16 h-auto',
                fixed && 'header-fixed peer/header sticky top-0 w-full',
                offset > 10 && fixed ? 'shadow' : 'shadow-none',
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    'relative flex flex-col w-full gap-1 p-4',
                    offset > 10 &&
                    fixed &&
                    'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
                )}
            >
                <div className="flex items-center gap-2 mb-1">
                    <SidebarTrigger variant='outline' className='max-md:scale-125 size-8' />
                    <Separator orientation='vertical' className='h-6' />
                    <AutoBreadcrumbs />

                    <div className="ms-auto flex items-center gap-2">
                        <FiscalYearSelector />
                        {isAdmin && <Search />}
                        <ThemeToggle />
                        <NotificationBell />
                        <HeaderUserNav />
                    </div>
                </div>




                <div className="flex items-center gap-3 w-full">
                    {children}
                </div>
            </div>
        </header>
    )
}

function HeaderUserNav() {
    const { auth } = useAuthStore()
    const [open, setOpen] = useDialogState()
    const user = auth.user
        ? {
            name: auth.user.name,
            email: auth.user.email,
            avatar: auth.user.avatar || sidebarData.user.avatar,
        }
        : sidebarData.user

    const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                        <Avatar className='h-8 w-8'>
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end' forceMount>
                    <DropdownMenuLabel className='font-normal'>
                        <div className='flex flex-col space-y-1'>
                            <p className='text-sm font-medium leading-none'>{user.name}</p>
                            <p className='text-xs leading-none text-muted-foreground'>
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link to='/settings'>
                                <BadgeCheck className='mr-2 h-4 w-4' />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to='/settings'>
                                <CreditCard className='mr-2 h-4 w-4' />
                                Billing
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <LogOut className='mr-2 h-4 w-4' />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <SignOutDialog open={!!open} onOpenChange={setOpen} />
        </>
    )
}

