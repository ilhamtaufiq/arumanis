import { Settings2 } from 'lucide-react'
import { useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { THEME_PRESET_VALUES, THEME_PRESET_LABELS, type ThemePreset } from '@/lib/theme-presets'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/** Dashboard-v2 foundation: preset labels live in `@/lib/theme-presets`. */

/**
 * Dashboard-v2 foundation: user-customizable shell preferences.
 * Simplified port of temp-apps `layout-controls.tsx` using repo-owned
 * Radix primitives (no Base UI dependency).
 */
export function LayoutControls() {
    const {
        contentLayout,
        setContentLayout,
        navbarStyle,
        setNavbarStyle,
        variant,
        setVariant,
        collapsible,
        setCollapsible,
        resetLayout,
    } = useLayout()
    const { themePreset, setThemePreset, resetThemePreset } = useTheme()

    const handleReset = () => {
        resetLayout()
        resetThemePreset()
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='outline' size='icon' className='h-9 w-9' aria-label='Pengaturan tampilan'>
                    <Settings2 className='h-[1.2rem] w-[1.2rem]' />
                </Button>
            </PopoverTrigger>
            <PopoverContent align='end' className='w-64'>
                <div className='flex flex-col gap-4'>
                    <div className='space-y-1'>
                        <h4 className='text-sm leading-none font-medium'>Preferensi Tampilan</h4>
                        <p className='text-muted-foreground text-xs'>Sesuaikan layout dashboard.</p>
                    </div>

                    <div className='space-y-1.5'>
                        <Label className='text-xs font-medium'>Preset Tema</Label>
                        <Select
                            value={themePreset}
                            onValueChange={(value) => setThemePreset(value as ThemePreset)}
                        >
                            <SelectTrigger size='sm' className='w-full text-xs'>
                                <SelectValue placeholder='Preset' />
                            </SelectTrigger>
                            <SelectContent>
                                {THEME_PRESET_VALUES.map((preset) => (
                                    <SelectItem key={preset} value={preset} className='text-xs'>
                                        {THEME_PRESET_LABELS[preset]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-1.5'>
                        <Label className='text-xs font-medium'>Lebar Konten</Label>
                        <div className='grid grid-cols-2 gap-1'>
                            {(
                                [
                                    { value: 'centered', label: 'Centered' },
                                    { value: 'full-width', label: 'Full Width' },
                                ] as const
                            ).map((option) => (
                                <Button
                                    key={option.value}
                                    type='button'
                                    size='sm'
                                    variant={contentLayout === option.value ? 'default' : 'outline'}
                                    className={cn('text-xs')}
                                    onClick={() => setContentLayout(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-1.5'>
                        <Label className='text-xs font-medium'>Navbar</Label>
                        <div className='grid grid-cols-2 gap-1'>
                            {(
                                [
                                    { value: 'sticky', label: 'Sticky' },
                                    { value: 'scroll', label: 'Scroll' },
                                ] as const
                            ).map((option) => (
                                <Button
                                    key={option.value}
                                    type='button'
                                    size='sm'
                                    variant={navbarStyle === option.value ? 'default' : 'outline'}
                                    className={cn('text-xs')}
                                    onClick={() => setNavbarStyle(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-1.5'>
                        <Label className='text-xs font-medium'>Gaya Sidebar</Label>
                        <div className='grid grid-cols-3 gap-1'>
                            {(
                                [
                                    { value: 'inset', label: 'Inset' },
                                    { value: 'sidebar', label: 'Sidebar' },
                                    { value: 'floating', label: 'Floating' },
                                ] as const
                            ).map((option) => (
                                <Button
                                    key={option.value}
                                    type='button'
                                    size='sm'
                                    variant={variant === option.value ? 'default' : 'outline'}
                                    className={cn('text-xs')}
                                    onClick={() => setVariant(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-1.5'>
                        <Label className='text-xs font-medium'>Mode Ciut Sidebar</Label>
                        <div className='grid grid-cols-2 gap-1'>
                            {(
                                [
                                    { value: 'icon', label: 'Icon' },
                                    { value: 'offcanvas', label: 'OffCanvas' },
                                ] as const
                            ).map((option) => (
                                <Button
                                    key={option.value}
                                    type='button'
                                    size='sm'
                                    variant={collapsible === option.value ? 'default' : 'outline'}
                                    className={cn('text-xs')}
                                    onClick={() => setCollapsible(option.value)}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Button type='button' size='sm' variant='outline' className='w-full text-xs' onClick={handleReset}>
                        Kembalikan Default
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
