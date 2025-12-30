import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Circle, Droplet, Database, ArrowRight, Zap, Settings, HelpCircle } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import type { NetworkJunction, NetworkReservoir, NetworkTank, NetworkPipe, NetworkPump, NetworkValve, NetworkState } from '../hooks/useNetworkEditor'
import type { SimulationResult } from '../services/SimulationService'

interface PropertiesPanelProps {
    selectedNode: string | null
    selectedPipe: string | null
    network: NetworkState
    simResults: SimulationResult | null
    selectedTimeStep: number
    onUpdateJunction: (id: string, updates: Partial<NetworkJunction>) => void
    onUpdateReservoir: (id: string, updates: Partial<NetworkReservoir>) => void
    onUpdateTank: (id: string, updates: Partial<NetworkTank>) => void
    onUpdatePipe: (id: string, updates: Partial<NetworkPipe>) => void
    onUpdatePump: (id: string, updates: Partial<NetworkPump>) => void
    onUpdateValve: (id: string, updates: Partial<NetworkValve>) => void
    onClearSelection: () => void
}

const PropertyLabel = ({ label, tooltip, htmlFor }: { label: string, tooltip: string, htmlFor?: string }) => (
    <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        <Tooltip>
            <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px]">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    </div>
)

export function PropertiesPanel({
    selectedNode,
    selectedPipe,
    network,
    simResults,
    selectedTimeStep,
    onUpdateJunction,
    onUpdateReservoir,
    onUpdateTank,
    onUpdatePipe,
    onUpdatePump,
    onUpdateValve,
    onClearSelection
}: PropertiesPanelProps) {
    // Find the selected element
    const junction = network.junctions.find(j => j.id === selectedNode)
    const reservoir = network.reservoirs.find(r => r.id === selectedNode)
    const tank = network.tanks.find(t => t.id === selectedNode)
    const pipe = network.pipes.find(p => p.id === selectedPipe)
    const pump = network.pumps.find(p => p.id === selectedPipe)
    const valve = network.valves.find(v => v.id === selectedPipe)

    // Get results for selected timestep
    const currentTimeStep = simResults?.timeSteps?.[selectedTimeStep] || simResults?.timeSteps?.[0]
    const nodeResult = currentTimeStep?.junctions.find(j => j.id === selectedNode)
    const pipeResult = currentTimeStep?.links.find(l => l.id === selectedPipe)

    const handleNumberChange = useCallback((
        setter: (id: string, updates: Record<string, number>) => void,
        id: string,
        field: string,
        value: string
    ) => {
        const num = parseFloat(value)
        if (!isNaN(num)) {
            setter(id, { [field]: num })
        }
    }, [])

    if (!selectedNode && !selectedPipe) {
        return (
            <Card className="h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Properties</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Pilih node atau pipe untuk melihat dan mengedit propertinya
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    {junction && <Circle className="h-4 w-4 text-blue-500" />}
                    {reservoir && <Droplet className="h-4 w-4 text-emerald-500" />}
                    {tank && <Database className="h-4 w-4 text-amber-500" />}
                    {pipe && <ArrowRight className="h-4 w-4 text-violet-500" />}
                    {pump && <Zap className="h-4 w-4 text-cyan-500" />}
                    {valve && <Settings className="h-4 w-4 text-orange-500" />}
                    <CardTitle className="text-base">
                        {junction?.name || reservoir?.name || tank?.name || pipe?.name || pump?.name || valve?.name}
                    </CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClearSelection}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Junction Properties */}
                {junction && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="junction-name">Nama</Label>
                            <Input
                                id="junction-name"
                                type="text"
                                value={junction.name}
                                onChange={(e) => onUpdateJunction(junction.id, { name: e.target.value })}
                            />
                        </div>

                        {/* Model attributes */}
                        <Separator className="my-3" />
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-primary">Model attributes</h4>
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="elevation"
                                    label="Elevation (m)"
                                    tooltip="Ketinggian titik relatif terhadap permukaan laut atau datum (meter)."
                                />
                                <Input
                                    id="elevation"
                                    type="number"
                                    value={junction.elevation}
                                    onChange={(e) => handleNumberChange(onUpdateJunction, junction.id, 'elevation', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Demands */}
                        <Separator className="my-3" />
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-primary">Demands</h4>
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="demand"
                                    label="Constant demand (l/s)"
                                    tooltip="Laju pengambilan air rata-rata pada titik ini (Liter per Detik)."
                                />
                                <Input
                                    id="demand"
                                    type="number"
                                    value={junction.demand}
                                    onChange={(e) => handleNumberChange(onUpdateJunction, junction.id, 'demand', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="pattern"
                                    label="Demand Pattern"
                                    tooltip="Pola fluktuasi pemakaian air selama periode waktu tertentu (misal: 24 jam)."
                                />
                                <Select
                                    value={junction.pattern || 'none'}
                                    onValueChange={(v) => onUpdateJunction(junction.id, { pattern: v === 'none' ? '' : v })}
                                >
                                    <SelectTrigger id="pattern">
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {(network.patterns || []).map(p => (
                                            <SelectItem key={p.id} value={p.id}>Pattern {p.id}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Simulation Results for Junction */}
                        {nodeResult && (
                            <>
                                <Separator className="my-4" />
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Simulation Results</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-muted-foreground">Pressure (m)</div>
                                        <div className="font-medium text-right">{nodeResult.pressure.toFixed(3)}</div>
                                        <div className="text-muted-foreground">Head (m)</div>
                                        <div className="font-medium text-right">{nodeResult.head.toFixed(3)}</div>
                                        <div className="text-muted-foreground">Actual demand (l/s)</div>
                                        <div className="font-medium text-right">{junction.demand.toFixed(3)}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Reservoir Properties */}
                {reservoir && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="reservoir-name">Nama</Label>
                            <Input
                                id="reservoir-name"
                                type="text"
                                value={reservoir.name}
                                onChange={(e) => onUpdateReservoir(reservoir.id, { name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <PropertyLabel
                                htmlFor="head"
                                label="Total Head (m)"
                                tooltip="Tinggi tekan total (head) yang disediakan oleh reservoir (meter)."
                            />
                            <Input
                                id="head"
                                type="number"
                                value={reservoir.head}
                                onChange={(e) => handleNumberChange(onUpdateReservoir, reservoir.id, 'head', e.target.value)}
                            />
                        </div>

                        {/* Simulation Results for Reservoir */}
                        {nodeResult && (
                            <>
                                <Separator className="my-4" />
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Simulation Results</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-muted-foreground">Pressure (m)</div>
                                        <div className="font-medium text-right">{nodeResult.pressure.toFixed(2)}</div>
                                        <div className="text-muted-foreground">Head (m)</div>
                                        <div className="font-medium text-right">{nodeResult.head.toFixed(2)}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Tank Properties */}
                {tank && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="tank-name">Nama</Label>
                            <Input
                                id="tank-name"
                                type="text"
                                value={tank.name}
                                onChange={(e) => onUpdateTank(tank.id, { name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <PropertyLabel
                                htmlFor="tank-elevation"
                                label="Elevation (m)"
                                tooltip="Ketinggian dasar tangki (meter)."
                            />
                            <Input
                                id="tank-elevation"
                                type="number"
                                value={tank.elevation}
                                onChange={(e) => handleNumberChange(onUpdateTank, tank.id, 'elevation', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="initLevel"
                                    label="Init Level"
                                    tooltip="Tinggi muka air awal di dalam tangki (meter)."
                                />
                                <Input
                                    id="initLevel"
                                    type="number"
                                    value={tank.initLevel}
                                    onChange={(e) => handleNumberChange(onUpdateTank, tank.id, 'initLevel', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="tank-diameter"
                                    label="Diameter (m)"
                                    tooltip="Diameter silinder tangki (meter)."
                                />
                                <Input
                                    id="tank-diameter"
                                    type="number"
                                    value={tank.diameter}
                                    onChange={(e) => handleNumberChange(onUpdateTank, tank.id, 'diameter', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="minLevel"
                                    label="Min Level"
                                    tooltip="Tinggi muka air minimum yang diizinkan (meter)."
                                />
                                <Input
                                    id="minLevel"
                                    type="number"
                                    value={tank.minLevel}
                                    onChange={(e) => handleNumberChange(onUpdateTank, tank.id, 'minLevel', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="maxLevel"
                                    label="Max Level"
                                    tooltip="Tinggi muka air maksimum yang diizinkan (meter)."
                                />
                                <Input
                                    id="maxLevel"
                                    type="number"
                                    value={tank.maxLevel}
                                    onChange={(e) => handleNumberChange(onUpdateTank, tank.id, 'maxLevel', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Simulation Results for Tank */}
                        {nodeResult && (
                            <>
                                <Separator className="my-4" />
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Simulation Results</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-muted-foreground">Pressure (m)</div>
                                        <div className="font-medium text-right">{nodeResult.pressure.toFixed(2)}</div>
                                        <div className="text-muted-foreground">Head (m)</div>
                                        <div className="font-medium text-right">{nodeResult.head.toFixed(2)}</div>
                                        <div className="text-muted-foreground">Level (m)</div>
                                        <div className="font-medium text-right">{tank.initLevel.toFixed(2)}</div>
                                        <div className="text-muted-foreground">Volume (m³)</div>
                                        <div className="font-medium text-right">
                                            {(Math.PI * Math.pow(tank.diameter / 2, 2) * tank.initLevel).toFixed(3)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Pipe Properties */}
                {pipe && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="pipe-name">Nama</Label>
                            <Input
                                id="pipe-name"
                                type="text"
                                value={pipe.name}
                                onChange={(e) => onUpdatePipe(pipe.id, { name: e.target.value })}
                            />
                        </div>

                        {/* Connections */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-primary">Connections</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">Start node</div>
                                <div className="font-medium text-right text-blue-600">{pipe.fromNode}</div>
                                <div className="text-muted-foreground">End node</div>
                                <div className="font-medium text-right text-blue-600">{pipe.toNode}</div>
                            </div>
                        </div>

                        {/* Model attributes */}
                        <Separator className="my-3" />
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-primary">Model attributes</h4>
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="pipe-diameter"
                                    label="Diameter (mm)"
                                    tooltip="Diameter dalam pipa (milimeter)."
                                />
                                <Input
                                    id="pipe-diameter"
                                    type="number"
                                    value={pipe.diameter}
                                    onChange={(e) => handleNumberChange(onUpdatePipe, pipe.id, 'diameter', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="length"
                                    label="Length (m)"
                                    tooltip="Panjang total pipa (meter)."
                                />
                                <Input
                                    id="length"
                                    type="number"
                                    value={pipe.length}
                                    onChange={(e) => handleNumberChange(onUpdatePipe, pipe.id, 'length', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <PropertyLabel
                                    htmlFor="roughness"
                                    label="Roughness"
                                    tooltip="Koefisien kekasaran pipa (misal: Hazen-Williams C-factor)."
                                />
                                <Input
                                    id="roughness"
                                    type="number"
                                    value={pipe.roughness}
                                    onChange={(e) => handleNumberChange(onUpdatePipe, pipe.id, 'roughness', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Simulation Results for Pipe */}
                        {pipeResult && (
                            <>
                                <Separator className="my-4" />
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Simulation Results</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="text-muted-foreground">Flow (l/s)</div>
                                        <div className="font-medium text-right">{pipeResult.flow.toFixed(3)}</div>
                                        <div className="text-muted-foreground">Velocity (m/s)</div>
                                        <div className="font-medium text-right">{pipeResult.velocity.toFixed(3)}</div>
                                        <div className="text-muted-foreground">Unit headloss (m/km)</div>
                                        <div className="font-medium text-right">
                                            {(Math.abs(pipeResult.flow) * 0.01 / (pipe.length / 1000)).toFixed(3)}
                                        </div>
                                        <div className="text-muted-foreground">Headloss (m)</div>
                                        <div className="font-medium text-right">
                                            {(Math.abs(pipeResult.flow) * 0.01).toFixed(3)}
                                        </div>
                                        <div className="text-muted-foreground">Actual status</div>
                                        <div className="font-medium text-right">
                                            {pipeResult.status === 1 ? 'Open' : 'Closed'}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Pump Properties */}
                {pump && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="pump-name">Nama</Label>
                            <Input
                                id="pump-name"
                                type="text"
                                value={pump.name}
                                onChange={(e) => onUpdatePump(pump.id, { name: e.target.value })}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                            {pump.fromNode} → {pump.toNode}
                        </div>
                        <div className="space-y-2">
                            <PropertyLabel
                                htmlFor="power"
                                label="Power (HP)"
                                tooltip="Daya pompa dalam Horsepower (HP)."
                            />
                            <Input
                                id="power"
                                type="number"
                                value={pump.power}
                                onChange={(e) => handleNumberChange(onUpdatePump, pump.id, 'power', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <PropertyLabel
                                htmlFor="speed"
                                label="Speed Ratio"
                                tooltip="Rasio kecepatan putar pompa relatif terhadap kecepatan nominal (1.0 = normal)."
                            />
                            <Input
                                id="speed"
                                type="number"
                                step="0.1"
                                value={pump.speed}
                                onChange={(e) => handleNumberChange(onUpdatePump, pump.id, 'speed', e.target.value)}
                            />
                        </div>
                    </>
                )}

                {/* Valve Properties */}
                {valve && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="valve-name">Nama</Label>
                            <Input
                                id="valve-name"
                                type="text"
                                value={valve.name}
                                onChange={(e) => onUpdateValve(valve.id, { name: e.target.value })}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                            {valve.fromNode} → {valve.toNode}
                        </div>
                        <div className="space-y-2">
                            <PropertyLabel
                                htmlFor="valve-type"
                                label="Valve Type"
                                tooltip="Jenis katup kontrol (PRV: Tekanan, FCV: Aliran, dll)."
                            />
                            <Select
                                value={valve.type}
                                onValueChange={(v) => onUpdateValve(valve.id, { type: v as 'PRV' | 'PSV' | 'PBV' | 'FCV' | 'TCV' | 'GPV' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRV">PRV (Pressure Reducing)</SelectItem>
                                    <SelectItem value="PSV">PSV (Pressure Sustaining)</SelectItem>
                                    <SelectItem value="PBV">PBV (Pressure Breaker)</SelectItem>
                                    <SelectItem value="FCV">FCV (Flow Control)</SelectItem>
                                    <SelectItem value="TCV">TCV (Throttle Control)</SelectItem>
                                    <SelectItem value="GPV">GPV (General Purpose)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <PropertyLabel
                                htmlFor="valve-diameter"
                                label="Diameter (mm)"
                                tooltip="Diameter katup (milimeter)."
                            />
                            <Input
                                id="valve-diameter"
                                type="number"
                                value={valve.diameter}
                                onChange={(e) => handleNumberChange(onUpdateValve, valve.id, 'diameter', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <PropertyLabel
                                htmlFor="setting"
                                label="Setting"
                                tooltip="Nilai setting katup (misal: target tekanan dalam meter untuk PRV)."
                            />
                            <Input
                                id="setting"
                                type="number"
                                value={valve.setting}
                                onChange={(e) => handleNumberChange(onUpdateValve, valve.id, 'setting', e.target.value)}
                            />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
