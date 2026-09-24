import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface PinDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function PinDialog({ open, onOpenChange, onSuccess }: PinDialogProps) {
    const [pin, setPin] = useState('');

    useEffect(() => {
        if (open) {
            // Setup default PIN in localStorage if not exists
            if (!localStorage.getItem('penerima_pin')) {
                localStorage.setItem('penerima_pin', '123456');
            }
            setPin('');
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const savedPin = localStorage.getItem('penerima_pin') || '123456';
        if (pin === savedPin) {
            sessionStorage.setItem('penerima_session_pin', pin);
            toast.success('Akses dibuka');
            onSuccess();
            onOpenChange(false);
        } else {
            toast.error('PIN salah');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Masukkan PIN Keamanan
                        </DialogTitle>
                        <DialogDescription>
                            Data NIK dan Alamat penerima disensor untuk privasi. Masukkan PIN Anda untuk melihat data asli. PIN default adalah 123456.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            type="password"
                            placeholder="PIN 6-digit"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={8}
                            autoFocus
                            className="text-center text-2xl tracking-widest font-mono"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit">Verifikasi</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
