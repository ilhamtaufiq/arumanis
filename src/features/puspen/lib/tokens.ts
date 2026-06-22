export const PUSPEN_COLORS = {
    background: '#FFF7E8',
    foreground: '#111111',
    primary: '#FFB703',
    secondary: '#8ECAE6',
    accent: '#FB8500',
    success: '#2ECC71',
    danger: '#EF233C',
    muted: '#E5E5E5',
    paper: '#FFFFFF',
    crt: '#1A1A2E',
} as const

export const puspenBorder = 'border-[3px] border-[#111111]'
export const puspenShadowSm = 'shadow-[2px_2px_0_0_#111111]'
export const puspenShadowMd = 'shadow-[3px_3px_0_0_#111111]'
export const puspenShadowLg = 'shadow-[6px_6px_0_0_#111111]'
export const puspenPressable =
    'transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
export const puspenLabel = 'text-[10px] font-black uppercase tracking-[0.22em]'
export const puspenPixelGridStyle = {
    backgroundImage: `
        linear-gradient(90deg, rgba(17,17,17,0.05) 1px, transparent 1px),
        linear-gradient(rgba(17,17,17,0.05) 1px, transparent 1px),
        linear-gradient(45deg, rgba(255,183,3,0.10) 25%, transparent 25%),
        linear-gradient(-45deg, rgba(142,202,230,0.10) 25%, transparent 25%)
    `,
    backgroundSize: '24px 24px, 24px 24px, 16px 16px, 16px 16px',
    backgroundPosition: '0 0, 0 0, 0 0, 8px 8px',
} as const