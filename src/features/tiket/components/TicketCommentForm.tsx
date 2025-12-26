import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { createTiketComment } from '../api/tiket';
import { toast } from 'sonner';

interface TicketCommentFormProps {
    tiketId: number;
    onSuccess: () => void;
}

export default function TicketCommentForm({ tiketId, onSuccess }: TicketCommentFormProps) {
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            setSubmitting(true);
            await createTiketComment(tiketId, message);
            setMessage('');
            onSuccess();
            toast.success('Komentar terkirim');
        } catch (error) {
            console.error('Failed to post comment:', error);
            toast.error('Gagal mengirim komentar');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t">
            <Textarea
                placeholder="Tulis balasan atau komentar..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={submitting}
            />
            <div className="flex justify-end">
                <Button type="submit" disabled={submitting || !message.trim()} size="sm">
                    {submitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    Kirim Balasan
                </Button>
            </div>
        </form>
    );
}
