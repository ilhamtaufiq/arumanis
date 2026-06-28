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



type NavUserProps = {
    user: {
        name: string
        email: string
        avatar?: string | null
        id?: number | string | null
    }
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
                                <UserAvatar
                                    className='h-8 w-8 rounded-lg'
                                    fallbackClassName='rounded-lg'
                                    name={user.name}
                                    email={user.email}
                                    avatar={user.avatar}
                                    id={user.id}
                                />
                                <div className='grid flex-1 text-start text-sm leading-tight'>
                                    <span className='truncate font-semibold'>{user.name}</span>
                                    <span className='truncate text-xs'>{user.email}</span>
                                </div>
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
                                    <UserAvatar
                                        className='h-8 w-8 rounded-lg'
                                        fallbackClassName='rounded-lg'
                                        name={user.name}
                                        email={user.email}
                                        avatar={user.avatar}
                                        id={user.id}
                                    />
                                    <div className='grid flex-1 text-start text-sm leading-tight'>
                                        <span className='truncate font-semibold'>{user.name}</span>
                                        <span className='truncate text-xs'>{user.email}</span>
                                    </div>
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
