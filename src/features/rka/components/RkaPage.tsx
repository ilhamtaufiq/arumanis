import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileUp, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getRkaDocument, getRkaDocuments, importRkaDocument, deleteRkaDocument } from '../api';
import type { RkaDocument, RkaItem, RkaJenis } from '../types';

const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return '-';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
};

const typeLabel: Record<RkaJenis, string> = {
    murni: 'Murni',
    parsial: 'Parsial',
};

function UploadCard({ jenis }: { jenis: RkaJenis }) {
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);

    const mutation = useMutation({
        mutationFn: () => {
            if (!file) throw new Error('Pilih file PDF RKA terlebih dahulu');
            return importRkaDocument(jenis, file);
        },
        onSuccess: (response) => {
            toast.success(`RKA ${typeLabel[jenis]} berhasil diimport`, {
                description: `${response.data.items_count ?? 0} baris terbaca`,
            });
            setFile(null);
            queryClient.invalidateQueries({ queryKey: ['rka-documents'] });
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Gagal import RKA');
        },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Import RKA {typeLabel[jenis]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor={`rka-${jenis}`}>File PDF</Label>
                    <Input
                        id={`rka-${jenis}`}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    />
                </div>
                <Button onClick={() => mutation.mutate()} disabled={!file || mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                    Import PDF
                </Button>
            </CardContent>
        </Card>
    );
}

function DocumentSummary({ document }: { document: RkaDocument }) {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Sub Kegiatan</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{document.sub_kegiatan || '-'}</CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Sumber Pendanaan</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {(document.sumber_pendanaan || []).length > 0 ? document.sumber_pendanaan.map((source) => (
                        <Badge key={source} variant="secondary">{source}</Badge>
                    )) : <span className="text-sm text-muted-foreground">-</span>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <div>Awal: {formatCurrency(document.total_sebelum)}</div>
                    <div>Akhir: {formatCurrency(document.total_setelah)}</div>
                    <div>Selisih: {formatCurrency(document.total_selisih)}</div>
                </CardContent>
            </Card>
        </div>
    );
}

function ItemsTable({ items, jenis }: { items: RkaItem[]; jenis: RkaJenis }) {
    const visibleItems = useMemo(() => items.filter((item) => item.tipe !== 'rincian' || item.jumlah || item.jumlah_setelah), [items]);

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[130px]">Kode</TableHead>
                        <TableHead className="min-w-[110px]">Tipe</TableHead>
                        <TableHead className="min-w-[420px]">Uraian</TableHead>
                        <TableHead className="min-w-[180px]">Sumber Dana</TableHead>
                        {jenis === 'parsial' ? (
                            <>
                                <TableHead className="min-w-[150px] text-right">Sebelum</TableHead>
                                <TableHead className="min-w-[150px] text-right">Setelah</TableHead>
                                <TableHead className="min-w-[150px] text-right">Selisih</TableHead>
                            </>
                        ) : (
                            <TableHead className="min-w-[150px] text-right">Jumlah</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visibleItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">{item.kode_rekening || '-'}</TableCell>
                            <TableCell><Badge variant="outline">{item.tipe}</Badge></TableCell>
                            <TableCell className={item.tipe === 'kelompok' ? 'font-semibold' : ''}>{item.uraian}</TableCell>
                            <TableCell>{item.sumber_dana || '-'}</TableCell>
                            {jenis === 'parsial' ? (
                                <>
                                    <TableCell className="text-right">{formatCurrency(item.jumlah_sebelum)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.jumlah_setelah)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.selisih)}</TableCell>
                                </>
                            ) : (
                                <TableCell className="text-right">{formatCurrency(item.jumlah)}</TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function RkaPage() {
    const [jenis, setJenis] = useState<RkaJenis>('murni');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const documentsQuery = useQuery({
        queryKey: ['rka-documents', jenis],
        queryFn: () => getRkaDocuments({ jenis, per_page: 50 }),
    });

    const detailQuery = useQuery({
        queryKey: ['rka-document', selectedId],
        queryFn: () => getRkaDocument(selectedId as number),
        enabled: !!selectedId,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteRkaDocument(id),
        onSuccess: () => {
            toast.success('RKA berhasil dihapus');
            setSelectedId(null);
            queryClient.invalidateQueries({ queryKey: ['rka-documents'] });
        },
    });

    const documents = documentsQuery.data?.data ?? [];
    const selectedDocument = detailQuery.data?.data;

    return (
        <>
            <Header />
            <Main>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">RKA</h1>
                        <p className="text-muted-foreground">Import dan cek data RKA Murni atau RKA Parsial dari PDF.</p>
                    </div>
                </div>

                <Tabs value={jenis} onValueChange={(value) => { setJenis(value as RkaJenis); setSelectedId(null); }}>
                    <TabsList>
                        <TabsTrigger value="murni">Murni</TabsTrigger>
                        <TabsTrigger value="parsial">Parsial</TabsTrigger>
                    </TabsList>

                    {(['murni', 'parsial'] as RkaJenis[]).map((tab) => (
                        <TabsContent key={tab} value={tab} className="space-y-4">
                            <UploadCard jenis={tab} />

                            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Dokumen RKA {typeLabel[tab]}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {documentsQuery.isLoading ? (
                                            <div className="text-sm text-muted-foreground">Memuat...</div>
                                        ) : documents.length === 0 ? (
                                            <div className="text-sm text-muted-foreground">Belum ada dokumen.</div>
                                        ) : documents.map((document) => (
                                            <button
                                                key={document.id}
                                                type="button"
                                                onClick={() => setSelectedId(document.id)}
                                                className="w-full rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted"
                                            >
                                                <div className="font-medium">{document.nama_file}</div>
                                                <div className="mt-1 text-muted-foreground">
                                                    {document.tahun_anggaran || '-'} · {document.items_count ?? 0} baris
                                                </div>
                                            </button>
                                        ))}
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    {!selectedDocument ? (
                                        <Card>
                                            <CardContent className="py-10 text-center text-muted-foreground">
                                                Pilih dokumen RKA untuk melihat hasil parsing.
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h2 className="text-lg font-semibold">{selectedDocument.nama_file}</h2>
                                                    <p className="text-sm text-muted-foreground">{selectedDocument.nomor_dokumen || '-'}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    disabled={deleteMutation.isPending}
                                                    onClick={() => deleteMutation.mutate(selectedDocument.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <DocumentSummary document={selectedDocument} />
                                            <ItemsTable items={selectedDocument.items ?? []} jenis={selectedDocument.jenis} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </Main>
        </>
    );
}
