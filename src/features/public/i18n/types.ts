export type PublicLocale = 'id' | 'en'

export type PublicMessages = {
    landing: {
        nav: {
            achievements: string
            access: string
            about: string
            publications: string
            signIn: string
            menu: string
        }
        hero: {
            tagline: string
            title: string
            description: string
            ctaAchievements: string
            ctaPublications: string
            stats: {
                desaCoverageTitle: string
                airMinum: string
                sanitasi: string
                desaCount: string
                updated: string
                loading: string
            }
        }
        access: {
            title: string
            description: string
            items: Array<{ title: string; desc: string; cta: string; href: string }>
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
            recentLabel: string
            loading: string
            empty: string
            viewAll: string
        }
        spm: {
            label: string
            dataNote: string
            syncDisclaimer: string
            filterAria: string
            viewDetail: string
            yearFilter: {
                label: string
                aria: string
                all: string
                year: string
                updatedAt: string
            }
            sanitasiYearFilter: {
                label: string
                aria: string
                all: string
                year: string
            }
            sectors: {
                air_minum: { filterLabel: string; title: string; description: string }
                sanitasi: { filterLabel: string; title: string; description: string }
            }
        }
        footer: {
            tagline: string
            navigation: string
            information: string
            legal: string
            terms: string
            privacy: string
            objectives: string
            designBuild: string
            dashboard: string
            instagram: string
            instagramBidangAms: string
            instagramDisperkim: string
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