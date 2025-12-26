import { useEffect } from 'react';
import { useAppSettings, getSettingValue } from '@/features/settings/api';
import { useAppSettingsStore } from '@/stores/app-settings-store';

/**
 * Hook to dynamically update document title and favicon based on app settings
 * Call this hook once in a root-level component (e.g., App or main layout)
 */
export function useAppSettingsEffect() {
    const { data } = useAppSettings();
    const activeYear = useAppSettingsStore((state) => state.tahunAnggaran);

    useEffect(() => {
        if (!data?.data) return;

        const settings = data.data;
        const appName = getSettingValue(settings, 'app_name');
        const appDescription = getSettingValue(settings, 'app_description');
        const faviconUrl = getSettingValue(settings, 'favicon');
        const tahunAnggaran = activeYear || getSettingValue(settings, 'tahun_anggaran');

        // Update document title with app name and tahun anggaran
        if (appName) {
            const titleWithYear = tahunAnggaran ? `${appName} - ${tahunAnggaran}` : appName;
            document.title = titleWithYear;

            // Update meta title tags
            const metaTitle = document.querySelector('meta[name="title"]');
            if (metaTitle) metaTitle.setAttribute('content', titleWithYear);

            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', titleWithYear);

            const twitterTitle = document.querySelector('meta[property="twitter:title"]');
            if (twitterTitle) twitterTitle.setAttribute('content', titleWithYear);
        }

        // Update meta description tags
        if (appDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', appDescription);

            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', appDescription);

            const twitterDesc = document.querySelector('meta[property="twitter:description"]');
            if (twitterDesc) twitterDesc.setAttribute('content', appDescription);
        }

        // Update favicon
        if (faviconUrl) {
            // Remove existing favicon links
            const existingFavicons = document.querySelectorAll('link[rel="icon"]');
            existingFavicons.forEach(el => el.remove());

            // Add new favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.href = faviconUrl;

            // Determine type from URL
            if (faviconUrl.includes('.svg')) {
                link.type = 'image/svg+xml';
            } else if (faviconUrl.includes('.png')) {
                link.type = 'image/png';
            } else if (faviconUrl.includes('.ico')) {
                link.type = 'image/x-icon';
            } else {
                link.type = 'image/png'; // default
            }

            document.head.appendChild(link);
        }
    }, [data, activeYear]);
}

/**
 * Helper to get app settings values for use in components
 */
export function useAppSettingsValues() {
    const { data, isLoading } = useAppSettings();
    const activeYear = useAppSettingsStore((state) => state.tahunAnggaran);

    if (!data?.data) {
        return {
            isLoading,
            appName: '',
            appDescription: '',
            tahunAnggaran: activeYear || new Date().getFullYear().toString(),
            logoUrl: '',
            faviconUrl: '',
        };
    }

    return {
        isLoading,
        appName: getSettingValue(data.data, 'app_name'),
        appDescription: getSettingValue(data.data, 'app_description'),
        tahunAnggaran: activeYear || getSettingValue(data.data, 'tahun_anggaran') || new Date().getFullYear().toString(),
        logoUrl: getSettingValue(data.data, 'logo'),
        faviconUrl: getSettingValue(data.data, 'favicon'),
    };
}
