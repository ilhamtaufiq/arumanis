const path = require('node:path')

const root = path.join(__dirname, '..')

module.exports = {
  apps: [
    {
      name: 'arumanis-whatsapp-bridge',
      script: path.join(root, 'scripts', 'whatsapp-bridge.mjs'),
      interpreter: 'node',
      cwd: root,
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        WHATSAPP_BRIDGE_HOST: '127.0.0.1',
        WHATSAPP_BRIDGE_PORT: 4000,
        WHATSAPP_AUTH_DIR: path.join(root, 'data', 'whatsapp-auth'),
        WHATSAPP_LOG_LEVEL: 'silent',
      },
    },
  ],
}