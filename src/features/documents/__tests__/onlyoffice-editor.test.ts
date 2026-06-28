import { describe, expect, it } from 'vitest';
import {
    buildOnlyOfficeViewerUrl,
    mapOnlyOfficeLoadError,
    mapOnlyOfficeRuntimeError,
    normalizeDocumentServerUrl,
    resolveDocumentServerUrl,
} from '../lib/onlyoffice-editor';
import { isImageFile } from '@/lib/file-preview';
import { resolveBerkasFileName } from '../lib/resolve-berkas-file-name';

describe('normalizeDocumentServerUrl', () => {
    it('adds trailing slash when missing', () => {
        expect(normalizeDocumentServerUrl('https://office.example.com')).toBe('https://office.example.com/');
    });

    it('keeps existing trailing slash', () => {
        expect(normalizeDocumentServerUrl('https://office.example.com/')).toBe('https://office.example.com/');
    });
});

describe('mapOnlyOfficeLoadError', () => {
    it('maps document server connection errors', () => {
        expect(mapOnlyOfficeLoadError(-2, 'load failed')).toContain('Document Server');
    });
});

describe('mapOnlyOfficeRuntimeError', () => {
    it('maps download failures to Indonesian guidance', () => {
        expect(mapOnlyOfficeRuntimeError({ data: 'Download failed' })).toContain('Unduhan dokumen gagal');
    });
});

describe('resolveDocumentServerUrl', () => {
    it('uses same-origin office proxy in browser', () => {
        expect(resolveDocumentServerUrl('https://office.cianjur.space')).toBe('http://localhost:3000/office/');
    });

    it('falls back to normalized api url on server', () => {
        const originalWindow = globalThis.window;
        // @ts-expect-error test shim
        delete globalThis.window;
        expect(resolveDocumentServerUrl('https://office.cianjur.space')).toBe('https://office.cianjur.space/');
        globalThis.window = originalWindow;
    });
});

describe('buildOnlyOfficeViewerUrl', () => {
    it('builds viewer route with optional title', () => {
        expect(buildOnlyOfficeViewerUrl(42)).toBe('/documents/onlyoffice/42');
        expect(buildOnlyOfficeViewerUrl(42, 'Laporan')).toBe('/documents/onlyoffice/42?title=Laporan');
    });
});

describe('isImageFile', () => {
    it('detects common image extensions', () => {
        expect(isImageFile('foto.jpg')).toBe(true);
        expect(isImageFile('https://cdn.example.com/a/b/scan.png')).toBe(true);
        expect(isImageFile('laporan.xlsx')).toBe(false);
    });
});

describe('resolveBerkasFileName', () => {
    it('prefers filename with extension from URL', () => {
        expect(resolveBerkasFileName({
            berkas_url: 'https://cdn.example.com/files/laporan.xlsx?token=1',
            jenis_dokumen: 'Laporan',
        })).toBe('laporan.xlsx');
    });

    it('falls back to jenis dokumen when URL has no extension', () => {
        expect(resolveBerkasFileName({
            berkas_url: 'https://cdn.example.com/media/123',
            jenis_dokumen: 'Berita Acara',
        })).toBe('Berita Acara');
    });
});