/** "6281234567890" tampil sebagai "+62 812 3456 7890" agar mudah dibaca. */
export function formatNomorWhatsapp(nomor: string): string {
    const digit = nomor.replace(/\D/g, '');
    const sisa = digit.startsWith('62') ? digit.slice(2) : digit;
    const bagian = sisa.match(/.{1,4}/g) ?? [];
    return `+62 ${bagian.join(' ')}`;
}
