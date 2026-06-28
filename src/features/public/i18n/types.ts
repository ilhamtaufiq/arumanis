export type PublicLocale = 'id' | 'en'

export type PublicMessages = {
    landing: {
        nav: {
            achievements: string
            features: string
            about: string
            publications: string
            signIn: string
        }
        hero: {
            tagline: string
            title: string
            description: string
        }
        features: {
            title: string
            description: string
            highlights: [string, string, string]
            items: Array<{ title: string; desc: string }>
        }
        about: {
            title: string
            description: string
            cards: Array<{ label: string; text: string }>
        }
        publications: {
            label: string
            title: string
            description: string
            cta: string
        }
        spm: {
            label: string
            dataNote: string
            syncDisclaimer: string
            filterAria: string
            viewDetail: string
            sectors: {
                air_minum: { filterLabel: string; title: string; description: string }
                sanitasi: { filterLabel: string; title: string; description: string }
            }
        }
        footer: {
            tagline: string
            navigation: string
            legal: string
            terms: string
            privacy: string
            dashboard: string
            copyright: string
        }
    }
    legal: {
        back: string
        subtitle: string
        footerNote: string
        terms: string
        privacy: string
        designBuild: string
        objectives: string
        guide: string
        enNotice: string
    }
    spmDetail: {
        header: {
            back: string
            signIn: string
        }
        hero: {
            eyebrow: string
            description: string
        }
        syncDisclaimer: string
        aggregate: {
            airMinum: {
                title: string
                coverage: string
                jiwa: string
                unitSpam: string
                bjp: string
                desa: string
                desaHint: string
                achievement: string
                kecamatan: string
                scopeFallback: string
            }
            sanitasi: {
                title: string
                scopeLabel: string
                coverageJiwa: string
                coverageKk: string
                coverageKkHint: string
                jiwaPemanfaat: string
                penduduk: string
                infrastruktur: string
                berfungsi: string
                desa: string
                belumAda: string
                wilayah: string
                kecamatan: string
            }
        }
        infrastructure: {
            title: string
            subtitle: string
            spaldt: string
            spalds: string
            iplt: string
            mckIndividu: string
            mckKomunal: string
        }
        table: {
            title: string
            subtitle: string
            searchPlaceholder: string
            loading: string
            empty: string
            pageInfo: string
            prev: string
            next: string
            columns: {
                desa: string
                kecamatan: string
                sr: string
                targetKk: string
                kk: string
                kkPemanfaat: string
                jiwa: string
                unitSpam: string
                infrastruktur: string
                penduduk: string
                coverage: string
            }
        }
    }
}