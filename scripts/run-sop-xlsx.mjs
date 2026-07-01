import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const scripts = path.join(root, 'scripts')

const candidates = [
    process.env.PYTHON,
    'C:\\laragon\\bin\\python\\python-3.10\\python.exe',
    'python',
    'python3',
].filter(Boolean)

const py = candidates.find((bin) => spawnSync(bin, ['--version'], { stdio: 'ignore' }).status === 0)
if (!py) {
    console.error('Python tidak ditemukan. Set env PYTHON atau pasang Python 3.10+.')
    process.exit(1)
}

function run(cmd, args) {
    const result = spawnSync(cmd, args, { stdio: 'inherit', cwd: root })
    if (result.status !== 0) process.exit(result.status ?? 1)
}

run('node', [path.join(scripts, 'generate-sop-md.mjs')])
run('node', [path.join(scripts, 'export-sop-json.mjs')])
run('node', [path.join(scripts, 'prepare-sop-flow-png.mjs')])
run(py, [path.join(scripts, 'generate-sop-xlsx.py')])