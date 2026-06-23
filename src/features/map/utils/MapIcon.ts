import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { getProgressColor } from './map-utils'

export const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

export function createProgressMarkerIcon(progressLabel?: string | null) {
    const color = getProgressColor(progressLabel)
    return L.divIcon({
        className: 'map-progress-marker',
        html: `<span class="map-progress-marker__dot" style="background:${color};box-shadow:0 0 0 3px #fff,0 4px 12px rgba(15,23,42,.35)"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -12],
    })
}