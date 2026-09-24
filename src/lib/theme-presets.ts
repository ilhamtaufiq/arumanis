/**
 * Dashboard-v2 foundation: theme preset keys.
 *
 * Berawal dari mirror temp-apps THEME_PRESET_VALUES, kini berjalan sendiri di app utama:
 * - `classic` adalah preset base (gaya hidup di `:root` / `styles/theme.css`, tanpa file presets/*.css),
 *   jadi key-nya sengaja BUKAN `default` lagi karena default sekarang `tangerine`.
 * - Preset selain `classic` diterapkan lewat atribut `data-theme-preset` di `<html>`
 *   (lihat `@/context/theme-provider` dan `src/styles/presets/*.css`).
 */
export type ThemePreset = 'classic' | 'brutalist' | 'soft-pop' | 'tangerine'

export const THEME_PRESET_VALUES: ThemePreset[] = ['classic', 'brutalist', 'soft-pop', 'tangerine']

export const THEME_PRESET_LABELS: Record<ThemePreset, string> = {
    classic: 'Classic',
    brutalist: 'Brutalist',
    'soft-pop': 'Soft Pop',
    tangerine: 'Tangerine',
}

export function isThemePreset(value: unknown): value is ThemePreset {
    return typeof value === 'string' && (THEME_PRESET_VALUES as string[]).includes(value)
}
