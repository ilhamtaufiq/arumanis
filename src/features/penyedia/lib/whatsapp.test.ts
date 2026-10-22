import { describe, expect, it } from 'vitest';
import { formatNomorWhatsapp } from './whatsapp';

describe('formatNomorWhatsapp', () => {
    it('mengelompokkan nomor internasional dengan spasi', () => {
        expect(formatNomorWhatsapp('6281234567890')).toBe('+62 8123 4567 890');
    });
    it('membuang karakter non-digit', () => {
        expect(formatNomorWhatsapp('62-812-3456')).toBe('+62 8123 456');
    });
});
