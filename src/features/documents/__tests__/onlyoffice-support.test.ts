import { describe, expect, it } from 'vitest';
import { isOnlyOfficeSupported } from '../lib/onlyoffice-support';

describe('isOnlyOfficeSupported', () => {
    it('returns true for common office formats', () => {
        expect(isOnlyOfficeSupported('laporan.docx')).toBe(true);
        expect(isOnlyOfficeSupported('data.xlsx')).toBe(true);
        expect(isOnlyOfficeSupported('presentasi.pptx')).toBe(true);
        expect(isOnlyOfficeSupported('dokumen.pdf')).toBe(true);
    });

    it('returns false for unsupported formats', () => {
        expect(isOnlyOfficeSupported('foto.jpg')).toBe(false);
        expect(isOnlyOfficeSupported('video.mp4')).toBe(false);
    });
});