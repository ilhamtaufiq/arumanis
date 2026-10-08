import { usePublicLocale } from '@/features/public/i18n/use-public-locale'
import type { PublicLocale } from '@/features/public/i18n/types'

type Pair = { title: string; description: string }

export type LandingV2Copy = {
  seo: { title: string; description: string }
  features: {
    eyebrow: string
    title: string
    titleMuted: string
    items: Array<Pair & { linkLabel?: string }>
    openApp: string
    waterAlt: string
  }
  howItWorks: {
    eyebrow: string
    title: string
    titleMuted: string
    steps: Array<Pair & { flow: string; result: string }>
    process: string
    active: string
  }
  infrastructure: {
    eyebrow: string
    title: string
    titleLine2: string
    description: string
    stats: [string, string, string]
    network: string
    allConnected: string
    locations: Array<{ city: string; region: string; status: string }>
  }
  integrations: {
    eyebrow: string
    title: string
    titleLine2: string
    description: string
    categories: string[]
  }
  metrics: {
    eyebrow: string
    title: string
    titleLine2: string
    live: string
    labels: [string, string, string, string]
  }
  security: {
    eyebrow: string
    title: string
    titleLine2: string
    description: string
    features: [Pair, Pair, Pair, Pair]
  }
  testimonials: {
    label: string
    items: Array<{ quote: string; author: string; role: string; company: string; metric: string }>
    ariaLabel: string
    result: string
    support: string
    marquee: string[]
    play: string
    pause: string
    showQuote: (index: number, total: number, author: string) => string
  }
  publikasi: {
    eyebrow: string
    title: string
    titleMuted: string
    seeAll: string
    read: string
    alertLabel: string
    alertDismiss: string
    alertView: string
    alertLater: string
  }
  cta: {
    title: string
    titleLine2: string
    description: string
    open: string
    info: string
    note: string
  }
  footer: {
    tagline: string
    columns: Array<{ title: string; links: string[] }>
    social: [string, string]
    copyright: string
    status: string
    logoAlt: string
  }
}

const id: LandingV2Copy = {
  seo: {
    title: 'Arumanis Cianjur | Air Minum dan Sanitasi',
    description:
      'Arumanis adalah gerakan kolaborasi untuk akses air minum dan sanitasi yang layak, aman, dan berkelanjutan di Kabupaten Cianjur.',
  },
  features: {
    eyebrow: 'Layanan utama',
    title: 'Melayani kebutuhan dasar.',
    titleMuted: 'Tanpa yang berlebihan.',
    items: [
      {
        title: 'Air Minum & Sanitasi',
        description:
          'Menghubungkan sumber air, layanan sanitasi, dan kebutuhan masyarakat dalam satu ekosistem layanan dasar Kabupaten Cianjur.',
      },
      {
        title: 'Perencanaan Berbasis Data',
        description:
          'Gunakan data wilayah dan kebutuhan masyarakat untuk menentukan prioritas pembangunan yang tepat sasaran.',
      },
      {
        title: 'Kolaborasi Lintas Sektor',
        description:
          'Memperkuat koordinasi pemerintah, mitra pembangunan, dan masyarakat untuk hasil yang berkelanjutan.',
      },
      {
        title: 'Akuntabilitas Layanan',
        description:
          'Mendorong layanan publik yang transparan, aman, dan dapat dipantau bersama oleh seluruh pemangku kepentingan.',
      },
      {
        title: 'Survey Lapangan e-Survey',
        description:
          'Aplikasi survey kebutuhan data perencanaan SPAM Perpipaan, SPAM Pengeboran, dan MCK — dengan foto lampiran, titik GPS, penugasan tim, dan mode offline untuk daerah tanpa sinyal.',
        linkLabel: 'Buka e-Survey',
      },
    ],
    openApp: 'Buka aplikasi',
    waterAlt: 'Ilustrasi air minum dan sanitasi',
  },
  howItWorks: {
    eyebrow: 'Alur layanan',
    title: 'Tiga langkah.',
    titleMuted: 'Dampak yang nyata.',
    steps: [
      {
        title: 'Rencanakan program',
        description:
          'Susun kegiatan, pekerjaan, target, dan anggaran air minum serta sanitasi berdasarkan kebutuhan wilayah.',
        flow: 'Kebutuhan wilayah',
        result: 'Rencana program',
      },
      {
        title: 'Kelola pelaksanaan',
        description:
          'Pantau kontrak, output, penerima manfaat, berkas, foto lapangan, dan checklist dalam satu portal.',
        flow: 'Pelaksanaan kegiatan',
        result: 'Output terverifikasi',
      },
      {
        title: 'Awasi dan evaluasi',
        description:
          'Gunakan dashboard, panel pengawasan, dan metrik capaian untuk menjaga program tetap akuntabel.',
        flow: 'Data & pengawasan',
        result: 'Capaian terukur',
      },
    ],
    process: 'proses Arumanis',
    active: 'Alur aktif dan terpantau',
  },
  infrastructure: {
    eyebrow: 'Infrastruktur data Cianjur',
    title: 'Terhubung',
    titleLine2: 'untuk layanan publik.',
    description:
      'Satu portal untuk menghubungkan data program air minum dan sanitasi Kabupaten Cianjur dari perencanaan hingga pengawasan lapangan.',
    stats: ['Kecamatan', 'Satu data terpadu', 'Pemantauan program'],
    network: 'Jaringan data Arumanis',
    allConnected: 'Semua modul terhubung',
    locations: [
      { city: 'Kabupaten Cianjur', region: 'Jawa Barat', status: 'Aktif' },
      { city: 'Kecamatan', region: 'Wilayah layanan', status: 'Terpantau' },
      { city: 'Desa', region: 'Penerima manfaat', status: 'Terdata' },
      { city: 'Unit SPAM', region: 'Sarana air minum', status: 'Tersedia' },
      { city: 'Pekerjaan', region: 'Pelaksanaan program', status: 'Diperbarui' },
      { city: 'Panel Pengawasan', region: 'Kontrol lapangan', status: 'Terhubung' },
    ],
  },
  integrations: {
    eyebrow: 'Modul dan koneksi',
    title: 'Satu ekosistem',
    titleLine2: 'untuk kerja lintas bidang.',
    description:
      'Hubungkan data perencanaan, pelaksanaan, dokumen, lapangan, pengawasan, dan capaian layanan air minum serta sanitasi.',
    categories: [
      'Backend layanan',
      'Perencanaan',
      'Pengadaan',
      'Dokumen',
      'Komunikasi',
      'Pengendalian',
      'Air minum',
      'Capaian layanan',
      'Pengawasan',
      'Data spasial',
      'Dokumentasi',
      'Bantuan kerja',
    ],
  },
  metrics: {
    eyebrow: 'Dasbor capaian',
    title: 'Layanan yang',
    titleLine2: 'dapat diukur.',
    live: 'Live',
    labels: [
      'Kecamatan terpantau',
      'Desa & kelurahan terdata',
      'Modul layanan terintegrasi',
      'Portal data terpadu',
    ],
  },
  security: {
    eyebrow: 'Keamanan dan transparansi',
    title: 'Kepercayaan',
    titleLine2: 'tidak bisa ditawar.',
    description:
      'Akuntabilitas bukan pilihan. Arumanis dibangun untuk mendukung perencanaan layanan air minum dan sanitasi yang aman, transparan, dan berkelanjutan.',
    features: [
      {
        title: 'Akses berbasis peran',
        description: 'Setiap peran — admin, PPTK, pengawas, mitra — hanya mengakses data sesuai kewenangannya.',
      },
      {
        title: 'Sesi & data terjaga',
        description: 'Autentikasi sesi aman via BFF, tanpa token tersimpan di browser pengguna.',
      },
      {
        title: 'Pengawasan transparan',
        description: 'Setiap perubahan tercatat dan dapat ditelusuri melalui audit log dan panel pengawasan.',
      },
      {
        title: 'Dokumentasi akuntabel',
        description: 'Berkas, foto lapangan, berita acara, dan capaian SPM terdokumentasi dalam satu portal.',
      },
    ],
  },
  testimonials: {
    label: 'Kata mereka',
    items: [
      {
        quote: 'Arumanis mempertemukan pemerintah dan masyarakat untuk mempercepat layanan air minum dan sanitasi.',
        author: 'Bidang Air Minum',
        role: 'Pengelola program',
        company: 'Kab. Cianjur',
        metric: '1 portal terpadu',
      },
      {
        quote: 'Kolaborasi lintas sektor membuat perencanaan layanan dasar menjadi lebih terarah dan berdampak.',
        author: 'Tim Perencana',
        role: 'Perangkat daerah',
        company: 'Kab. Cianjur',
        metric: '32 kecamatan terpantau',
      },
      {
        quote: 'Progres lapangan, foto, dan berkas kini terdokumentasi rapi dalam satu alur kerja.',
        author: 'Pengawas Lapangan',
        role: 'Pelaksana kegiatan',
        company: 'Arumanis',
        metric: 'Dokumentasi terkendali',
      },
      {
        quote: 'Capaian layanan per wilayah akhirnya bisa dipantau bersama secara terbuka dan terukur.',
        author: 'Mitra Desa',
        role: 'Penerima manfaat',
        company: 'Wilayah layanan',
        metric: '360 desa & kelurahan',
      },
    ],
    ariaLabel: 'Kata mereka',
    result: 'Hasil utama',
    support: 'Didukung kolaborasi lintas bidang',
    marquee: ['Air Minum', 'Sanitasi', 'SPAM', 'SPM', 'Pengawasan', 'Perencanaan', 'Dokumentasi'],
    play: 'Putar otomatis',
    pause: 'Jeda putar otomatis',
    showQuote: (index, total, author) => `Tampilkan kutipan ${index} dari ${total}: ${author}`,
  },
  publikasi: {
    eyebrow: 'Publikasi terbaru',
    title: 'Kabar terkini',
    titleMuted: 'dari lapangan.',
    seeAll: 'Lihat semua publikasi',
    read: 'Baca artikel',
    alertLabel: 'Publikasi terbaru',
    alertDismiss: 'Tutup info publikasi terbaru',
    alertView: 'Lihat',
    alertLater: 'Nanti',
  },
  cta: {
    title: 'Siap memperkuat',
    titleLine2: 'layanan Cianjur?',
    description:
      'Mari berkolaborasi mempercepat layanan air minum dan sanitasi. Sampaikan aspirasi dan kebutuhan wilayah Anda.',
    open: 'Buka Arumanis',
    info: 'Lihat informasi program',
    note: 'Platform informasi dan pengendalian layanan air minum serta sanitasi Kabupaten Cianjur',
  },
  footer: {
    tagline: 'Platform kolaborasi untuk layanan air minum dan sanitasi yang layak bagi masyarakat Cianjur.',
    columns: [
      { title: 'Arumanis', links: ['Layanan', 'Cara kerja', 'Publikasi', 'Capaian SPM'] },
      { title: 'Kolaborasi', links: ['Informasi layanan', 'Masuk portal', 'Program'] },
      {
        title: 'Pemerintah Kabupaten Cianjur',
        links: ['Portal Cianjur', 'Instagram Bidang AMS', 'Instagram Disperkim'],
      },
      { title: 'Kebijakan', links: ['Privasi data', 'Ketentuan layanan', 'Transparansi'] },
    ],
    social: ['Portal Cianjur', 'Instagram'],
    copyright: '2026 Arumanis Cianjur. Hak cipta dilindungi.',
    status: 'Portal layanan air minum & sanitasi',
    logoAlt: 'Logo Arumanis',
  },
}

const en: LandingV2Copy = {
  seo: {
    title: 'Arumanis Cianjur | Drinking Water and Sanitation',
    description:
      'Arumanis is a collaborative movement for decent, safe, and sustainable access to drinking water and sanitation in Cianjur Regency.',
  },
  features: {
    eyebrow: 'Core services',
    title: 'Serving basic needs.',
    titleMuted: 'Nothing excessive.',
    items: [
      {
        title: 'Drinking Water & Sanitation',
        description:
          'Connecting water sources, sanitation services, and community needs in a single basic-service ecosystem for Cianjur Regency.',
      },
      {
        title: 'Data-Driven Planning',
        description:
          'Use regional data and community needs to set development priorities that hit the mark.',
      },
      {
        title: 'Cross-Sector Collaboration',
        description:
          'Strengthening coordination between government, development partners, and communities for lasting results.',
      },
      {
        title: 'Service Accountability',
        description:
          'Promoting transparent, safe public services that all stakeholders can monitor together.',
      },
      {
        title: 'e-Survey Field Survey',
        description:
          'A survey app for planning data on piped water systems, borehole water systems, and public toilets — with photo attachments, GPS points, team assignments, and offline mode for areas without signal.',
        linkLabel: 'Open e-Survey',
      },
    ],
    openApp: 'Open app',
    waterAlt: 'Illustration of drinking water and sanitation',
  },
  howItWorks: {
    eyebrow: 'Service flow',
    title: 'Three steps.',
    titleMuted: 'Real impact.',
    steps: [
      {
        title: 'Plan the program',
        description:
          'Draft activities, works, targets, and budgets for drinking water and sanitation based on regional needs.',
        flow: 'Regional needs',
        result: 'Program plan',
      },
      {
        title: 'Manage implementation',
        description:
          'Track contracts, outputs, beneficiaries, documents, field photos, and checklists in one portal.',
        flow: 'Activity implementation',
        result: 'Verified output',
      },
      {
        title: 'Oversee and evaluate',
        description:
          'Use dashboards, the supervision panel, and achievement metrics to keep the program accountable.',
        flow: 'Data & oversight',
        result: 'Measured achievements',
      },
    ],
    process: 'Arumanis process',
    active: 'Flow active and monitored',
  },
  infrastructure: {
    eyebrow: 'Cianjur data infrastructure',
    title: 'Connected',
    titleLine2: 'for public service.',
    description:
      'One portal connecting Cianjur Regency drinking water and sanitation program data, from planning to field supervision.',
    stats: ['Districts', 'One unified dataset', 'Program monitoring'],
    network: 'Arumanis data network',
    allConnected: 'All modules connected',
    locations: [
      { city: 'Cianjur Regency', region: 'West Java', status: 'Active' },
      { city: 'Districts', region: 'Service area', status: 'Monitored' },
      { city: 'Villages', region: 'Beneficiaries', status: 'Recorded' },
      { city: 'Water System Units', region: 'Drinking water facilities', status: 'Available' },
      { city: 'Works', region: 'Program implementation', status: 'Updated' },
      { city: 'Supervision Panel', region: 'Field control', status: 'Connected' },
    ],
  },
  integrations: {
    eyebrow: 'Modules and connections',
    title: 'One ecosystem',
    titleLine2: 'for cross-field work.',
    description:
      'Connect planning, implementation, documents, field work, supervision, and service achievement data for drinking water and sanitation.',
    categories: [
      'Service backend',
      'Planning',
      'Procurement',
      'Documents',
      'Communication',
      'Control',
      'Drinking water',
      'Service achievements',
      'Supervision',
      'Spatial data',
      'Documentation',
      'Work assistance',
    ],
  },
  metrics: {
    eyebrow: 'Achievement dashboard',
    title: 'Services that',
    titleLine2: 'can be measured.',
    live: 'Live',
    labels: [
      'Districts monitored',
      'Villages & sub-districts recorded',
      'Integrated service modules',
      'Unified data portal',
    ],
  },
  security: {
    eyebrow: 'Security and transparency',
    title: 'Trust',
    titleLine2: 'is non-negotiable.',
    description:
      'Accountability is not optional. Arumanis is built to support safe, transparent, and sustainable planning of drinking water and sanitation services.',
    features: [
      {
        title: 'Role-based access',
        description: 'Each role — admin, PPTK, supervisor, partner — only accesses data within their authority.',
      },
      {
        title: 'Protected sessions & data',
        description: 'Secure session authentication via BFF, with no tokens stored in the user’s browser.',
      },
      {
        title: 'Transparent oversight',
        description: 'Every change is recorded and traceable through the audit log and supervision panel.',
      },
      {
        title: 'Accountable documentation',
        description: 'Documents, field photos, handover reports, and SPM achievements are documented in one portal.',
      },
    ],
  },
  testimonials: {
    label: 'What they say',
    items: [
      {
        quote: 'Arumanis brings government and communities together to speed up drinking water and sanitation services.',
        author: 'Drinking Water Division',
        role: 'Program manager',
        company: 'Cianjur Regency',
        metric: '1 unified portal',
      },
      {
        quote: 'Cross-sector collaboration makes basic-service planning more focused and impactful.',
        author: 'Planning Team',
        role: 'Regional agency',
        company: 'Cianjur Regency',
        metric: '32 districts monitored',
      },
      {
        quote: 'Field progress, photos, and documents are now neatly documented in a single workflow.',
        author: 'Field Supervisor',
        role: 'Activity implementer',
        company: 'Arumanis',
        metric: 'Controlled documentation',
      },
      {
        quote: 'Service achievements per area can finally be monitored together, openly and measurably.',
        author: 'Village Partner',
        role: 'Beneficiary',
        company: 'Service area',
        metric: '360 villages & sub-districts',
      },
    ],
    ariaLabel: 'What they say',
    result: 'Key result',
    support: 'Supported by cross-field collaboration',
    marquee: ['Drinking Water', 'Sanitation', 'SPAM', 'SPM', 'Supervision', 'Planning', 'Documentation'],
    play: 'Resume autoplay',
    pause: 'Pause autoplay',
    showQuote: (index, total, author) => `Show quote ${index} of ${total}: ${author}`,
  },
  publikasi: {
    eyebrow: 'Latest publications',
    title: 'Latest news',
    titleMuted: 'from the field.',
    seeAll: 'See all publications',
    read: 'Read article',
    alertLabel: 'Latest publication',
    alertDismiss: 'Close latest publication notice',
    alertView: 'View',
    alertLater: 'Later',
  },
  cta: {
    title: 'Ready to strengthen',
    titleLine2: 'Cianjur’s services?',
    description:
      'Let’s collaborate to accelerate drinking water and sanitation services. Share your voice and your area’s needs.',
    open: 'Open Arumanis',
    info: 'View program information',
    note: 'Information and control platform for drinking water and sanitation services in Cianjur Regency',
  },
  footer: {
    tagline: 'A collaboration platform for decent drinking water and sanitation services for the people of Cianjur.',
    columns: [
      { title: 'Arumanis', links: ['Services', 'How it works', 'Publications', 'SPM achievements'] },
      { title: 'Collaboration', links: ['Service information', 'Sign in to portal', 'Programs'] },
      {
        title: 'Cianjur Regency Government',
        links: ['Cianjur Portal', 'Instagram Bidang AMS', 'Instagram Disperkim'],
      },
      { title: 'Policy', links: ['Data privacy', 'Terms of service', 'Transparency'] },
    ],
    social: ['Cianjur Portal', 'Instagram'],
    copyright: '2026 Arumanis Cianjur. All rights reserved.',
    status: 'Drinking water & sanitation service portal',
    logoAlt: 'Arumanis logo',
  },
}

const COPY: Record<PublicLocale, LandingV2Copy> = { id, en }

export function useLandingCopy() {
  const { locale, setLocale } = usePublicLocale()
  return { locale, setLocale, copy: COPY[locale] }
}
