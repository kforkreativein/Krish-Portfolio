import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function envUpdatePlugin() {
  return {
    name: 'env-update-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/update-env' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const { key, value } = JSON.parse(body)
              const envPath = path.resolve(process.cwd(), '.env')
              let envVars = ''

              if (fs.existsSync(envPath)) {
                envVars = fs.readFileSync(envPath, 'utf-8')
              }

              const regex = new RegExp(`^${key}=.*`, 'm')
              if (regex.test(envVars)) {
                envVars = envVars.replace(regex, `${key}=${value}`)
              } else {
                envVars += `\n${key}=${value}`
              }

              fs.writeFileSync(envPath, envVars.trim() + '\n')

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: err.message }))
            }
          })
          return
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), envUpdatePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5001,
    host: true,
    allowedHosts: 'all',
  },
})
