/**
 * Format number to Indonesian Rupiah currency string
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '-';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '-';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numValue);
};

/**
 * Format date string to Indonesian locale
 */
export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        return '-';
    }
};
