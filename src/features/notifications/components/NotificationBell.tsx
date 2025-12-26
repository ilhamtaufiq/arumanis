import { useEffect } from 'react';
import {
    Bell,
    CheckCheck,
    Info,
    CheckCircle2,
    AlertCircle,
    AlertTriangle
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from '@/stores/useNotificationStore';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import {
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function NotificationBell({ variant = 'default' }: { variant?: 'default' | 'menu-item' }) {

    const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications(true);
        // Poll every 1 minute
        const interval = setInterval(() => fetchNotifications(true), 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                {variant === 'menu-item' ? (
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifikasi</span>
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                        )}
                    </DropdownMenuItem>
                ) : (
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-in zoom-in"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="text-sm font-semibold">Notifikasi</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px]"
                            onClick={() => markAllRead()}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" /> Tandai semua dibaca
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[350px]">
                    <div className="flex flex-col">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                Belum ada notifikasi
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-3 p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer",
                                        !notification.read_at && "bg-muted/30"
                                    )}
                                    onClick={() => !notification.read_at && markRead(notification.id)}
                                >
                                    <div className="mt-1">
                                        {getIcon(notification.data.type || 'info')}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                "text-xs font-medium leading-none",
                                                !notification.read_at && "font-bold"
                                            )}>
                                                {notification.data.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {notification.created_at}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                                            {notification.data.message}
                                        </p>
                                        {notification.data.url && (
                                            <Link
                                                to={notification.data.url as any}
                                                className="text-[10px] text-primary hover:underline block mt-1"
                                            >
                                                Lihat Detail
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                        <Link to="/notifications">
                            Lihat Semua Notifikasi
                        </Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
