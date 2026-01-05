import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, MessageSquare } from 'lucide-react';
import { sendMessage } from '../api';
import { toast } from 'sonner';

export default function MessageSender() {
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || !message) {
            toast.error('Isi nomor HP dan pesan');
            return;
        }

        setSending(true);
        try {
            await sendMessage({ to: phone, message });
            toast.success('Pesan berhasil dikirim!');
            setMessage('');
        } catch (error) {
            toast.error((error as Error).message || 'Gagal mengirim pesan');
        } finally {
            setSending(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Kirim Pesan
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSend} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Nomor HP</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="08123456789 atau 628123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Format: 08xxx atau 62xxx (tanpa +)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Pesan</Label>
                        <Textarea
                            id="message"
                            placeholder="Ketik pesan Anda..."
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={sending} className="w-full">
                        {sending ? (
                            <>Mengirim...</>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Kirim Pesan
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
