import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const candidates = [
    process.env.PYTHON,
    'C:\\laragon\\bin\\python\\python-3.10\\python.exe',
    'python',
    'python3',
].filter(Boolean)

let py = candidates.find((bin) => {
    const r = spawnSync(bin, ['--version'], { stdio: 'ignore' })
    return r.status === 0
})

if (!py) {
    console.error('Python tidak ditemukan. Set env PYTHON atau pasang Python 3.10+.')
    process.exit(1)
}

const script = path.join(root, 'scripts', 'generate-sop-xlsx.py')
const result = spawnSync(py, [script], { stdio: 'inherit', cwd: root })
process.exit(result.status ?? 1)