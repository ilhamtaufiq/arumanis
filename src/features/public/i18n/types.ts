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
            map: {
                loading: string
                hint: string
                legendTitle: string
                legendNone: string
                legendLow: string
                legendMid: string
                legendHigh: string
                zoomIn: string
                zoomOut: string
                resetView: string
                summaryAirTitle: string
                summarySanitasiTitle: string
                summaryHide: string
                summaryShow: string
                desaCapaian: string
                desaCapaianHint: string
                coverageSpm: string
                coverageJiwa: string
                jiwaTerlayani: string
                jiwaPemanfaat: string
                unitSpam: string
                infrastruktur: string
                popupGapKk: string
                popupSr: string
                popupKkTerlayani: string
                popupKkPemanfaat: string
                popupJiwa: string
                popupTargetKk: string
                popupPenduduk: string
                popupCoverageAir: string
                popupCoverageSanitasi: string
                tiers: {
                    none: string
                    low: string
                    mid: string
                    high: string
                }
            }
        }
        contact: {
            label: string
            title: string
            description: string
            name: string
            email: string
            phone: string
            phoneOptional: string
            subject: string
            message: string
            subjectPlaceholder: string
            messagePlaceholder: string
            submit: string
            submitting: string
            success: string
            error: string
            rateLimit: string
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
            changelog: string
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
        changelog: string
        guide: string
        enNotice: string
    }
    changelog: {
        seoTitle: string
        seoDescription: string
        title: string
        subtitle: string
        badge: string
        footerNote: string
        versionNotice: string
        lineageTitle: string
        lineageIntro: string
        statusActive: string
        statusArchived: string
        eraPeriod: string
        eraArchitecture: string
        releasesTitle: string
        releasesIntro: string
        reposTitle: string
        reposIntro: string
        enNote: string
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
        yearlyChart: {
            eyebrow: string
            title: string
            subtitleAirMinum: string
            subtitleSanitasi: string
            kkAirMinum: string
            kkSanitasi: string
            coverageLegend: string
            jiwa: string
            target: string
            unitSpam: string
            infrastruktur: string
            loading: string
            empty: string
            tooltipYear: string
        }
        nav: {
            map: string
            summary: string
            table: string
        }
        filters: {
            kecamatan: string
            allKecamatan: string
            coverageTier: string
            tierAll: string
            tierNone: string
            tierLow: string
            tierMid: string
            tierHigh: string
            reset: string
            activeFilters: string
        }
        detailCard: {
            selected: string
            close: string
            gapKk: string
            clickHint: string
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