import { useEffect, useState } from 'react'
import { Cloud, CloudRain, CloudSun, Sun, CloudFog, CloudLightning, CloudSnow } from 'lucide-react'
import type { ReactNode } from 'react'

// Cianjur, West Java
const LAT = -6.8125
const LON = 107.1319

type Weather = { temp: number; label: string; icon: ReactNode }

function weatherLabel(code: number): { label: string; icon: ReactNode } {
  if (code === 0) return { label: 'Cerah', icon: <Sun className="h-4 w-4" /> }
  if (code <= 2) return { label: 'Cerah Berawan', icon: <CloudSun className="h-4 w-4" /> }
  if (code === 3) return { label: 'Berawan', icon: <Cloud className="h-4 w-4" /> }
  if (code <= 48) return { label: 'Berkabut', icon: <CloudFog className="h-4 w-4" /> }
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: 'Hujan', icon: <CloudRain className="h-4 w-4" /> }
  if (code <= 77) return { label: 'Salju', icon: <CloudSnow className="h-4 w-4" /> }
  if (code <= 86) return { label: 'Hujan Deras', icon: <CloudRain className="h-4 w-4" /> }
  return { label: 'Badai', icon: <CloudLightning className="h-4 w-4" /> }
}

export function LandingWeather() {
  const [weather, setWeather] = useState<Weather | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=auto`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return
        const { label, icon } = weatherLabel(data.current.weather_code)
        setWeather({ temp: Math.round(data.current.temperature_2m), label, icon })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!weather) return null

  return (
    <span className="inline-flex items-center gap-2 border-2 border-[#1C1C1C] bg-[#FCE954] brutal-shadow px-4 py-1.5 text-[15px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]">
      {weather.icon}
      {weather.temp}°C · {weather.label}
    </span>
  )
}
