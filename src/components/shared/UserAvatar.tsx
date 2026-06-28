import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
    getUserAvatarFallbackInitials,
    resolveUserAvatarUrl,
    type UserAvatarSource,
} from '@/lib/user-avatar'

export type UserAvatarProps = UserAvatarSource & {
    className?: string
    fallbackClassName?: string
    imageClassName?: string
    alt?: string
}

export function UserAvatar({
    avatar,
    avatarUrl,
    name,
    email,
    id,
    seed,
    className,
    fallbackClassName,
    imageClassName,
    alt,
}: UserAvatarProps) {
    const src = resolveUserAvatarUrl({ avatar, avatarUrl, name, email, id, seed })
    const initials = getUserAvatarFallbackInitials(name)

    return (
        <Avatar className={className}>
            <AvatarImage
                src={src}
                alt={alt ?? name ?? 'User'}
                className={cn('object-cover', imageClassName)}
            />
            <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
        </Avatar>
    )
}