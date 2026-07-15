import { cn } from '@/lib/utils'

type MainProps = React.HTMLAttributes<HTMLElement> & {
    fixed?: boolean
    fluid?: boolean
    ref?: React.Ref<HTMLElement>
}

export function Main({ fixed, className, fluid, ...props }: MainProps) {
    return (
        <main
            data-layout={fixed ? 'fixed' : 'auto'}
            className={cn(
                'min-w-0 max-w-full px-3 py-4 sm:px-4 sm:py-6',

                // If layout is fixed, make the main container flex and grow
                fixed && 'flex grow flex-col overflow-hidden',

                !fluid && 'w-full',
                className
            )}
            {...props}
        />
    )
}
