import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { buildYearlyRows } from '@/lib/spm-rekap'
import { SpmRekapCapaian } from '../SpmRekapCapaian'

const desaInputs = [
    { desaId: 1, desa: 'Ciloto', kecamatan: 'Cipanas', target: 100, capaian: 120, jiwa: 600, unit: 2 },
    { desaId: 2, desa: 'Sindanglaya', kecamatan: 'Cipanas', target: 200, capaian: 50, jiwa: 250, unit: 1 },
    { desaId: 3, desa: 'Sukamaju', kecamatan: 'Cianjur', target: 100, capaian: 0, jiwa: 0, unit: 0 },
]

describe('SpmRekapCapaian', () => {
    it('renders highlights and yearly table', () => {
        render(
            <SpmRekapCapaian
                title="Rekap"
                capaianLabel="KK Terlayani"
                desaInputs={desaInputs}
                yearlyRows={buildYearlyRows(
                    [
                        { tahun: '2024', capaian: 20, jiwa: 100 },
                        { tahun: '2025', capaian: 30, jiwa: 150 },
                    ],
                    400,
                )}
                exportFilename="rekap"
            />,
        )

        expect(screen.getByText('Peningkatan 2025')).toBeInTheDocument()
        expect(screen.getByText('+30 KK')).toBeInTheDocument()
        expect(screen.getByText('Kecamatan tertinggi')).toBeInTheDocument()
        expect(screen.getAllByText('Cipanas').length).toBeGreaterThan(0)
    })

    it('drills down from kecamatan to desa', () => {
        render(
            <SpmRekapCapaian
                title="Rekap"
                capaianLabel="KK Terlayani"
                desaInputs={desaInputs}
                yearlyRows={[]}
                exportFilename="rekap"
            />,
        )

        fireEvent.mouseDown(screen.getByRole('tab', { name: /Per Kecamatan/ }))
        fireEvent.click(screen.getByRole('tab', { name: /Per Kecamatan/ }))
        const row = screen.getAllByRole('row').find((r) => r.textContent?.includes('Cipanas'))
        expect(row).toBeTruthy()
        fireEvent.click(row!)
        expect(screen.getByText('Kec. Cipanas')).toBeInTheDocument()
        expect(screen.getByText('Sindanglaya')).toBeInTheDocument()
        expect(screen.queryByText('Sukamaju')).not.toBeInTheDocument()
    })

    it('loads matrix on demand and shows per-year increase', () => {
        let opened = false
        render(
            <SpmRekapCapaian
                title="Rekap"
                capaianLabel="KK Terlayani"
                desaInputs={desaInputs}
                yearlyRows={[]}
                exportFilename="rekap"
                matrix={{
                    years: ['2024', '2025'],
                    byYear: [desaInputs, [{ ...desaInputs[0], capaian: 7 }]],
                    onOpen: () => {
                        opened = true
                    },
                }}
            />,
        )

        const tab = screen.getByRole('tab', { name: /Matriks Peningkatan/ })
        fireEvent.mouseDown(tab)
        fireEvent.click(tab)
        expect(opened).toBe(true)
        expect(screen.getByText('+170')).toBeInTheDocument()
        expect(screen.getByText('+7')).toBeInTheDocument()
    })
})
