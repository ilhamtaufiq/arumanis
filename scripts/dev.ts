const server = Bun.spawn({
  cmd: ['bun', 'run', 'server/index.ts'],
  cwd: process.cwd(),
  env: {
    PORT: '8787',
    BUN_ENV: Bun.env.BUN_ENV ?? 'development',
    APIAMIS_BASE_URL:
      Bun.env.APIAMIS_BASE_URL ??
      Bun.env.VITE_API_BASE_URL ??
      'http://apiamis.test/api',
  },
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
})

const client = Bun.spawn({
  cmd: ['bunx', 'vite'],
  cwd: process.cwd(),
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
})

const [serverExit, clientExit] = await Promise.all([server.exited, client.exited])

if (serverExit !== 0) {
  client.kill()
  process.exit(serverExit)
}

client.kill()
process.exit(clientExit)

export {}