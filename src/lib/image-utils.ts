/**
 * Image utilities for photo processing and watermarking
 */

export interface WatermarkOptions {
    date: string;
    coordinates: string;
}

/**
 * Adds a text watermark to an image
 */
export async function addPhotoWatermark(file: File | Blob, options: WatermarkOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Configure text style
            const fontSize = Math.max(20, Math.floor(img.width / 40));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 0, 0.8)'; // Yellow with slight transparency
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.textAlign = 'right';

            const padding = fontSize;
            const lineHeight = fontSize * 1.2;

            // Draw Date
            ctx.fillText(options.date, canvas.width - padding, canvas.height - padding - lineHeight);

            // Draw Coordinates
            ctx.fillText(options.coordinates, canvas.width - padding, canvas.height - padding);

            // Export to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob from canvas'));
                }
            }, 'image/jpeg', 0.85);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for watermarking'));
        };

        img.src = url;
    });
}
