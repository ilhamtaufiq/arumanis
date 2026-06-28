import type { ComponentType } from 'react'
import { Link } from '@tanstack/react-router'
import {
    AlertTriangle,
    BookOpen,
    ChevronsUpDown,
    LogOut,
    Settings,
    UserRound,
} from 'lucide-react'

import useDialogState from '@/hooks/use-dialog-state'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { useAuthStore } from '@/stores/auth-stores'
import { cn } from '@/lib/utils'

export type NavUserData = {
    name: string
    email: string
    avatar?: string | null
    gender?: string | null
    id?: number | string | null
    roles?: string[]
}

type NavUserProps = {
    user: NavUserData
}

function formatRoleLabel(roles: string[]): string {
    if (roles.length === 0) return 'Pengguna'

    const primary = roles[0]
    const label = primary.charAt(0).toUpperCase() + primary.slice(1).replace(/_/g, ' ')

    return roles.length > 1 ? `${label} +${roles.length - 1}` : label
}

function NavUserAvatar({ user, className }: { user: NavUserData; className?: string }) {
    return (
        <UserAvatar
            className={cn('h-8 w-8 rounded-lg', className)}
            fallbackClassName='rounded-lg'
            name={user.name}
            email={user.email}
            avatar={user.avatar}
            gender={user.gender}
            id={user.id}
        />
    )
}

function NavUserDetails({
    user,
    roleLabel,
    compact = false,
}: {
    user: NavUserData
    roleLabel: string
    compact?: boolean
}) {
    return (
        <div className='grid min-w-0 flex-1 text-start text-sm leading-tight'>
            <span className='truncate font-semibold'>{user.name}</span>
            <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
            {!compact ? (
                <span className='mt-1 truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80'>
                    {roleLabel}
                </span>
            ) : null}
        </div>
    )
}

function NavUserMenuLink({
    to,
    icon: Icon,
    children,
}: {
    to: string
    icon: ComponentType<{ className?: string }>
    children: React.ReactNode
}) {
    return (
        <DropdownMenuItem asChild>
            <Link to={to}>
                <Icon />
                {children}
            </Link>
        </DropdownMenuItem>
    )
}

export function NavUser({ user }: NavUserProps) {
    const { isMobile } = useSidebar()
    const [open, setOpen] = useDialogState()
    const { auth } = useAuthStore()

    const roles = auth.user?.roles ?? user.roles ?? []
    const isAdmin = roles.includes('admin')
    const isImpersonating = auth.isImpersonating
    const roleLabel = formatRoleLabel(roles)

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size='lg'
                                className='group/nav-user data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                            >
                                <NavUserAvatar
                                    user={user}
                                    className='ring-2 ring-transparent transition-all group-data-[state=open]/nav-user:ring-sidebar-ring/40'
                                />
                                <NavUserDetails user={user} roleLabel={roleLabel} />
                                <ChevronsUpDown className='ms-auto size-4 shrink-0 opacity-60' />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className='w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg'
                            side={isMobile ? 'bottom' : 'right'}
                            align='end'
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className='p-0 font-normal'>
                                <div className='flex items-start gap-2 px-2 py-2 text-start text-sm'>
                                    <NavUserAvatar user={user} />
                                    <div className='min-w-0 flex-1'>
                                        <NavUserDetails user={user} roleLabel={roleLabel} compact />
                                        <Badge variant='secondary' className='mt-2 h-5 px-2 text-[10px] font-medium'>
                                            {roleLabel}
                                        </Badge>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            {isImpersonating ? (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className='mx-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-2 text-xs text-amber-900 dark:text-amber-100'>
                                        <div className='flex items-start gap-2'>
                                            <AlertTriangle className='mt-0.5 size-3.5 shrink-0' />
                                            <p>
                                                Mode impersonasi aktif sebagai{' '}
                                                <span className='font-semibold'>{user.name}</span>.
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenuItem onClick={() => auth.stopImpersonating()}>
                                        <LogOut />
                                        Berhenti impersonasi
                                    </DropdownMenuItem>
                                </>
                            ) : null}

                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <NavUserMenuLink to='/profile' icon={UserRound}>
                                    Profil saya
                                </NavUserMenuLink>
                                <NotificationBell variant='menu-item' />
                                <NavUserMenuLink to='/panduan' icon={BookOpen}>
                                    Panduan pengguna
                                </NavUserMenuLink>
                                {isAdmin ? (
                                    <NavUserMenuLink to='/settings' icon={Settings}>
                                        Pengaturan sistem
                                    </NavUserMenuLink>
                                ) : null}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant='destructive' onClick={() => setOpen(true)}>
                                <LogOut />
                                Keluar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
            <SignOutDialog open={!!open} onOpenChange={setOpen} />
        </>
    )
}