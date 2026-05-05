import EXIF from 'exif-js';
import { createWorker } from 'tesseract.js';

/**
 * Extracts GPS coordinates from image metadata (EXIF)
 */
export async function getGPSFromExif(file: File): Promise<string | null> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target?.result) {
                resolve(null);
                return;
            }

            try {
                // @ts-ignore - EXIF is not typed in this environment
                EXIF.getData(file, function() {
                    // @ts-ignore
                    const lat = EXIF.getTag(this, "GPSLatitude");
                    // @ts-ignore
                    const lon = EXIF.getTag(this, "GPSLongitude");
                    // @ts-ignore
                    const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
                    // @ts-ignore
                    const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

                    if (!lat || !lon) {
                        resolve(null);
                        return;
                    }

                    // Convert to decimal
                    const latDec = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef === "N" ? 1 : -1);
                    const lonDec = (lon[0] + lon[1] / 60 + lon[2] / 3600) * (lonRef === "E" ? 1 : -1);

                    resolve(`${latDec.toFixed(6)}, ${lonDec.toFixed(6)}`);
                });
            } catch (err) {
                console.error('EXIF Error:', err);
                resolve(null);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Extracts coordinates from image content using OCR
 * Specifically looks for "Lat -x.xxxx Long y.yyyy" or similar patterns
 */
export async function getGPSFromOCR(file: File): Promise<string | null> {
    try {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();

        console.log('OCR Text:', text);

        // Regex patterns for coordinates
        // Pattern 1: Lat -6.836233° Long 107.181751°
        // Pattern 2: -6.12345, 106.12345
        const latMatch = text.match(/Lat\s*(-?\d+\.\d+)/i);
        const lonMatch = text.match(/Long\s*(\d+\.\d+)/i);

        if (latMatch && lonMatch) {
            return `${latMatch[1]}, ${lonMatch[1]}`;
        }

        // Try a more generic decimal pair
        const pairMatch = text.match(/(-?\d+\.\d+)\s*[,|]\s*(\d+\.\d+)/);
        if (pairMatch) {
            return `${pairMatch[1]}, ${pairMatch[2]}`;
        }

        return null;
    } catch (err) {
        console.error('OCR Error:', err);
        return null;
    }
}

/**
 * Combined utility to get coordinates from an image file
 */
export async function extractCoordinates(file: File): Promise<string | null> {
    // 1. Try EXIF first (fastest)
    const exifCoord = await getGPSFromExif(file);
    if (exifCoord) return exifCoord;

    // 2. Try OCR if EXIF fails (slower)
    return await getGPSFromOCR(file);
}
