import { Link } from '@tanstack/react-router'
import { useSimulationNetworksByPekerjaan } from '@/features/simulation/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Loader2, Plus, ExternalLink } from 'lucide-react'

interface SimulationTabContentProps {
    pekerjaanId: number
}

export default function SimulationTabContent({ pekerjaanId }: SimulationTabContentProps) {
    const { data: networks = [], isLoading } = useSimulationNetworksByPekerjaan(pekerjaanId)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold">Simulasi Jaringan</h3>
                    <p className="text-sm text-muted-foreground">
                        Jaringan pipa EPANET yang terhubung ke pekerjaan ini.
                    </p>
                </div>
                <Button asChild size="sm">
                    <Link
                        to="/simulation"
                        search={{ pekerjaanId }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Buat / Buka Editor
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : networks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    <p>Belum ada jaringan simulasi untuk pekerjaan ini.</p>
                    <p className="text-sm mt-1">
                        Buat jaringan baru di editor, lalu simpan dengan pekerjaan terkait.
                    </p>
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Nodes</TableHead>
                                <TableHead>Links</TableHead>
                                <TableHead>Versi</TableHead>
                                <TableHead>Terakhir Simulasi</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {networks.map((net) => (
                                <TableRow key={net.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {net.name}
                                            {net.is_public && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Public
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{net.stats?.total_nodes ?? 0}</TableCell>
                                    <TableCell>{net.stats?.total_links ?? 0}</TableCell>
                                    <TableCell>v{net.version}</TableCell>
                                    <TableCell>
                                        {net.last_simulated_at
                                            ? new Date(net.last_simulated_at).toLocaleString('id-ID')
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link
                                                to="/simulation"
                                                search={{ pekerjaanId, networkId: net.id }}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Buka
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}