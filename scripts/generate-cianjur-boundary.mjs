import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import union from '@turf/union'
import { featureCollection } from '@turf/helpers'

const sourcePath = resolve('src/assets/geojson/kecamatan/id3203_cianjur_simplified.geojson')
const outputPath = resolve('src/assets/geojson/kecamatan/id3203_cianjur_boundary.geojson')

const geojson = JSON.parse(readFileSync(sourcePath, 'utf8'))
const features = geojson.features.filter((feature) => {
  const props = feature.properties ?? {}
  return props.regency === 'Cianjur' || props.regency_code === 'id3203'
})

if (features.length === 0) {
  throw new Error('No Cianjur features found in source GeoJSON')
}

console.log(`Unioning ${features.length} village polygons...`)
const merged = union(featureCollection(features))
if (!merged) {
  throw new Error('Union returned empty geometry')
}

const output = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        regency: 'Cianjur',
        regency_code: 'id3203',
        source: 'id3203_cianjur_simplified.geojson',
        generated_at: new Date().toISOString(),
      },
      geometry: merged.geometry,
    },
  ],
}

writeFileSync(outputPath, `${JSON.stringify(output)}\n`)
console.log(`Wrote ${outputPath}`)