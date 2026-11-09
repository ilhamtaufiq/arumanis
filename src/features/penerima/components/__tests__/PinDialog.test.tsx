import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PinDialog } from '../PinDialog';

const verifyPenerimaPin = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('../../api', () => ({
    verifyPenerimaPin: (pin: string) => verifyPenerimaPin(pin),
}));
vi.mock('sonner', () => ({
    toast: {
        success: (m: string) => toastSuccess(m),
        error: (m: string) => toastError(m),
    },
}));

function setup() {
    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();
    render(<PinDialog open onOpenChange={onOpenChange} onSuccess={onSuccess} />);
    return { onSuccess, onOpenChange };
}

function submit(pin: string) {
    fireEvent.change(screen.getByPlaceholderText('PIN 6-digit'), { target: { value: pin } });
    fireEvent.click(screen.getByRole('button', { name: 'Verifikasi' }));
}

describe('PinDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        localStorage.clear();
    });

    it('menyimpan PIN dan membuka akses bila server menyatakan valid', async () => {
        verifyPenerimaPin.mockResolvedValue({ data: { valid: true } });
        const { onSuccess, onOpenChange } = setup();
        submit('654321');
        await waitFor(() => expect(onSuccess).toHaveBeenCalled());
        expect(verifyPenerimaPin).toHaveBeenCalledWith('654321');
        expect(sessionStorage.getItem('penerima_session_pin')).toBe('654321');
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(toastSuccess).toHaveBeenCalledWith('Akses dibuka');
    });

    it('tidak memakai localStorage: PIN default lokal tidak lagi diterima', async () => {
        localStorage.setItem('penerima_pin', '123456');
        verifyPenerimaPin.mockResolvedValue({ data: { valid: false } });
        const { onSuccess } = setup();
        submit('123456');
        await waitFor(() => expect(toastError).toHaveBeenCalledWith('PIN salah'));
        expect(onSuccess).not.toHaveBeenCalled();
        expect(sessionStorage.getItem('penerima_session_pin')).toBeNull();
    });

    it('menampilkan pesan jelas saat error jaringan', async () => {
        verifyPenerimaPin.mockRejectedValue(new Error('network'));
        const { onSuccess } = setup();
        submit('123456');
        await waitFor(() =>
            expect(toastError).toHaveBeenCalledWith(expect.stringContaining('Tidak dapat memverifikasi PIN')),
        );
        expect(onSuccess).not.toHaveBeenCalled();
        expect(sessionStorage.getItem('penerima_session_pin')).toBeNull();
    });
});
