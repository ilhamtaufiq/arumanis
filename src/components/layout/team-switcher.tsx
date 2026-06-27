import * as React from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { ChevronsUpDown, Plus } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'
import type { Team } from './type'

type TeamSwitcherProps = {
    teams: Team[]
}

function resolveActiveTeam(teams: Team[], pathname: string): Team | null {
    if (teams.length === 0) return null

    const matched = teams.find(
        (team) => team.routePrefix && pathname.startsWith(team.routePrefix)
    )
    return matched ?? teams[0]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
    const { isMobile } = useSidebar()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [activeTeam, setActiveTeam] = React.useState<Team | null>(() =>
        resolveActiveTeam(teams, pathname)
    )

    React.useEffect(() => {
        setActiveTeam(resolveActiveTeam(teams, pathname))
    }, [pathname, teams])

    const selectTeam = React.useCallback(
        (team: Team | null | undefined) => {
            if (!team) return

            setActiveTeam(team)
            if (team.url) {
                navigate({ to: team.url })
            }
        },
        [navigate]
    )

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!(event.metaKey || event.ctrlKey)) return
            if (!/^\d$/.test(event.key)) return

            const index = Number.parseInt(event.key, 10) - 1
            if (!Number.isFinite(index) || index < 0 || index >= teams.length) return

            const team = teams[index]
            if (!team) return

            event.preventDefault()
            selectTeam(team)
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [selectTeam, teams])

    if (teams.length === 0 || !activeTeam) {
        return null
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <div className='text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                                {typeof activeTeam.logo === 'string' ? (
                                    <img
                                        src={activeTeam.logo}
                                        alt={activeTeam.name}
                                        className='size-4'
                                    />
                                ) : (
                                    <activeTeam.logo className='size-4' />
                                )}
                            </div>
                            <div className='grid flex-1 text-start text-sm leading-tight'>
                                <span className='truncate font-semibold'>
                                    {activeTeam.name}
                                </span>
                                <span className='truncate text-xs'>{activeTeam.plan}</span>
                            </div>
                            <ChevronsUpDown className='ms-auto' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                        align='start'
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className='text-muted-foreground text-xs'>
                            Teams
                        </DropdownMenuLabel>
                        {teams.map((team, index) => (
                            <DropdownMenuItem
                                key={team.name}
                                onClick={() => selectTeam(team)}
                                className='gap-2 p-2'
                            >
                                <div className='flex size-6 items-center justify-center rounded-sm border'>
                                    {typeof team.logo === 'string' ? (
                                        <img
                                            src={team.logo}
                                            alt={team.name}
                                            className='size-4 shrink-0'
                                        />
                                    ) : (
                                        <team.logo className='size-4 shrink-0' />
                                    )}
                                </div>
                                {team.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='gap-2 p-2'>
                            <div className='bg-background flex size-6 items-center justify-center rounded-md border'>
                                <Plus className='size-4' />
                            </div>
                            <div className='text-muted-foreground font-medium'>Add team</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}