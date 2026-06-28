import { Link } from '@tanstack/react-router'
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    LogOut,
    Sparkles,
} from 'lucide-react'

import useDialogState from '@/hooks/use-dialog-state'
import { UserAvatar } from '@/components/shared/UserAvatar'
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

type NavUserData = {
    name: string
    email: string
    avatar?: string | null
    gender?: string | null
    id?: number | string | null
}

type NavUserProps = {
    user: NavUserData
}

function NavUserAvatar({ user }: { user: NavUserData }) {
    return (
        <UserAvatar
            className='h-8 w-8 rounded-lg'
            fallbackClassName='rounded-lg'
            name={user.name}
            email={user.email}
            avatar={user.avatar}
            gender={user.gender}
            id={user.id}
        />
    )
}

function NavUserDetails({ user }: { user: NavUserData }) {
    return (
        <div className='grid flex-1 text-start text-sm leading-tight'>
            <span className='truncate font-semibold'>{user.name}</span>
            <span className='truncate text-xs'>{user.email}</span>
        </div>
    )
}

export function NavUser({ user }: NavUserProps) {
    const { isMobile } = useSidebar()
    const [open, setOpen] = useDialogState()

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size='lg'
                                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                            >
                                <NavUserAvatar user={user} />
                                <NavUserDetails user={user} />
                                <ChevronsUpDown className='ms-auto size-4' />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                            side={isMobile ? 'bottom' : 'right'}
                            align='end'
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className='p-0 font-normal'>
                                <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                                    <NavUserAvatar user={user} />
                                    <NavUserDetails user={user} />
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <Sparkles />
                                    Upgrade ke Pro
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link to='/settings'>
                                        <BadgeCheck />
                                        Akun
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to='/settings'>
                                        <Bell />
                                        Notifikasi
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant='destructive'
                                onClick={() => setOpen(true)}
                            >
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