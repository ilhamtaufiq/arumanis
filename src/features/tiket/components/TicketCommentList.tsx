import type { TiketComment } from '../types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TicketCommentListProps {
    comments: TiketComment[];
}

export default function TicketCommentList({ comments }: TicketCommentListProps) {
    if (comments.length === 0) {
        return (
            <div className="py-4 text-center text-sm text-muted-foreground italic">
                Belum ada balasan.
            </div>
        );
    }

    return (
        <div className="space-y-4 py-4">
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className={cn(
                        "flex gap-3 max-w-[80%]",
                        comment.user?.roles?.some(role => role.name === 'admin') ? "ml-auto flex-row-reverse text-right" : "mr-auto"
                    )}
                >
                    <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={comment.user?.avatar || ''} />
                        <AvatarFallback>{comment.user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <div className={cn(
                            "flex items-center gap-2",
                            comment.user?.roles?.some(role => role.name === 'admin') && "flex-row-reverse"
                        )}>
                            <span className="text-xs font-semibold">{comment.user?.name}</span>
                            <span className="text-[10px] text-muted-foreground italic">
                                {new Date(comment.created_at).toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                        <div className={cn(
                            "px-3 py-2 rounded-lg text-sm transition-colors",
                            comment.user?.roles?.some(role => role.name === 'admin')
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted rounded-tl-none hover:bg-muted/80"
                        )}>
                            {comment.message}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
