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
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { BadgeCheck, LogOut } from 'lucide-react'
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
                'z-50 min-h-14 h-auto w-full min-w-0',
                fixed && 'header-fixed peer/header sticky top-0 w-full',
                offset > 10 && fixed ? 'shadow' : 'shadow-none',
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    'relative flex w-full min-w-0 flex-col gap-1 px-3 py-3 sm:p-4',
                    offset > 10 &&
                    fixed &&
                    'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
                )}
            >
                <div className="flex min-w-0 w-full items-center gap-1.5 sm:gap-2">
                    <SidebarTrigger variant='outline' className='size-8 shrink-0 max-md:scale-110' />
                    <Separator orientation='vertical' className='hidden h-6 sm:block' />
                    <div className="hidden min-w-0 md:block">
                        <AutoBreadcrumbs />
                    </div>

                    <div className="ms-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
                        <FiscalYearSelector compact />
                        {isAdmin && (
                            <div className="hidden sm:block">
                                <Search />
                            </div>
                        )}
                        <ThemeToggle />
                        <NotificationBell />
                        <HeaderUserNav />
                    </div>
                </div>

                {children ? (
                    <div className="flex min-w-0 w-full items-start gap-3">
                        {children}
                    </div>
                ) : null}
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
            avatar: auth.user.avatar,
            gender: auth.user.gender,
            id: auth.user.id,
        }
        : {
            name: sidebarData.user.name,
            email: sidebarData.user.email,
            avatar: sidebarData.user.avatar,
        }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='relative h-8 w-8 shrink-0 rounded-full'>
                        <UserAvatar
                            className='h-8 w-8'
                            name={user.name}
                            email={user.email}
                            avatar={user.avatar}
                            gender={'gender' in user ? user.gender : undefined}
                            id={'id' in user ? user.id : undefined}
                        />
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
                            <Link to='/profile'>
                                <BadgeCheck className='mr-2 h-4 w-4' />
                                Profil Saya
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
