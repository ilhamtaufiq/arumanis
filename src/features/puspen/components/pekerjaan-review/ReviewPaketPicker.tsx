import { Search, X } from 'lucide-react'
import type { Pekerjaan } from '@/features/pekerjaan/types'
import { buildPaketOptionSearchText } from '../../lib/pekerjaan-review-utils'
import { PuspenButton, PuspenChip, PuspenInput } from '../PuspenUi'
import { puspenBorder, puspenLabel, puspenPressable, puspenShadowSm } from '../../lib/tokens'

const MAX_RESULTS = 12

type ReviewPaketPickerProps = {
    items: Pekerjaan[]
    total: number
    loading: boolean
    search: string
    onSearchChange: (value: string) => void
    selectedId: number | null
    onSelect: (id: number | null) => void
}

export function ReviewPaketPicker({
    items,
    total,
    loading,
    search,
    onSearchChange,
    selectedId,
    onSelect,
}: ReviewPaketPickerProps) {
    const normalizedSearch = search.trim().toLowerCase()
    const filteredItems = normalizedSearch
        ? items.filter((item) => buildPaketOptionSearchText(item).toLowerCase().includes(normalizedSearch))
        : []
    const visibleResults = filteredItems.slice(0, MAX_RESULTS)
    const selectedItem = items.find((item) => item.id === selectedId) ?? null

    const handleSelect = (id: number) => {
        onSelect(id)
        onSearchChange('')
    }

    const handleClearSelection = () => {
        onSelect(null)
        onSearchChange('')
    }

    return (
        <section className={`bg-white p-4 sm:p-5 ${puspenBorder} shadow-[6px_6px_0_0_#111111]`}>
            <div className={`mb-3 ${puspenLabel} text-[#111111]/60`}>Cari Paket Pekerjaan</div>

            {selectedItem ? (
                <div className={`flex flex-wrap items-center justify-between gap-3 bg-[#E63946] p-3 text-white ${puspenBorder} ${puspenShadowSm}`}>
                    <div>
                        <div className={`${puspenLabel} text-white/75`}>Paket dipilih</div>
                        <div className="mt-1 text-sm font-black uppercase tracking-[0.04em]">{selectedItem.nama_paket}</div>
                        <div className="mt-1 text-xs font-bold text-white/85">
                            {[selectedItem.desa?.nama_desa, selectedItem.kecamatan?.nama_kecamatan].filter(Boolean).join(', ')}
                            {selectedItem.kode_rekening ? ` · ${selectedItem.kode_rekening}` : ''}
                        </div>
                    </div>
                    <PuspenButton
                        variant="ghost"
                        onClick={handleClearSelection}
                        className="bg-white hover:bg-[#FFF7E8]"
                    >
                        <X className="h-4 w-4" />
                        Ganti
                    </PuspenButton>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111111]/45" />
                        <PuspenInput
                            value={search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Ketik nama paket, desa, kecamatan, kode rekening, pengawas..."
                            className="pl-11"
                            aria-label="Cari paket pekerjaan"
                            aria-autocomplete="list"
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <PuspenChip>{total} paket cocok filter</PuspenChip>
                        {loading ? (
                            <span className="text-xs font-bold text-[#111111]/65">Memuat daftar paket...</span>
                        ) : null}
                    </div>

                    {normalizedSearch ? (
                        <div className="mt-4 space-y-2">
                            {visibleResults.length > 0 ? (
                                <ul className="space-y-2" role="listbox" aria-label="Hasil pencarian paket">
                                    {visibleResults.map((item) => (
                                        <li key={item.id} role="option">
                                            <button
                                                type="button"
                                                onClick={() => handleSelect(item.id)}
                                                className={`w-full text-left p-3 ${puspenBorder} ${puspenShadowSm} ${puspenPressable} bg-[#FFF7E8] hover:bg-[#FFB703]`}
                                            >
                                                <div className="text-sm font-black leading-snug uppercase tracking-[0.04em]">
                                                    {item.nama_paket}
                                                </div>
                                                <div className="mt-1 text-xs font-bold text-[#111111]/65">
                                                    {[item.desa?.nama_desa, item.kecamatan?.nama_kecamatan].filter(Boolean).join(', ')}
                                                    {item.kode_rekening ? ` · ${item.kode_rekening}` : ''}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs font-bold text-[#111111]/60">
                                    Tidak ada paket sesuai kata kunci &quot;{search.trim()}&quot;.
                                </p>
                            )}
                            {filteredItems.length > MAX_RESULTS ? (
                                <p className="text-xs font-bold text-[#111111]/55">
                                    Menampilkan {MAX_RESULTS} dari {filteredItems.length} hasil. Perjelas kata kunci pencarian.
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        <p className="mt-4 text-xs font-bold text-[#111111]/60">
                            Ketik kata kunci untuk menampilkan paket yang bisa dipilih.
                        </p>
                    )}
                </>
            )}
        </section>
    )
}