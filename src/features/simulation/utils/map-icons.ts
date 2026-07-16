import L from 'leaflet'

export function createJunctionIcon(color: string = '#3b82f6') {
    return L.divIcon({
        className: 'custom-junction-icon',
        html: `<div style="width:12px;height:12px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    })
}

export function createReservoirIcon(color: string = '#10b981') {
    return L.divIcon({
        className: 'custom-reservoir-icon',
        html: `<div style="width:16px;height:16px;background:${color};clip-path:polygon(50% 0%, 100% 100%, 0% 100%);border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 16],
    })
}

export function createTankIcon(color: string = '#f59e0b') {
    return L.divIcon({
        className: 'custom-tank-icon',
        html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    })
}

export function createWarningIcon() {
    return L.divIcon({
        className: 'custom-warning-icon',
        html: `<div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;width:20px;height:20px;background:#ef4444;border-radius:50%;opacity:0.3;animation:pulse 1.5s infinite"></div>
        <div style="position:absolute;top:3px;left:3px;width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;color:white;font-weight:bold">!</div>
    </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    })
}
