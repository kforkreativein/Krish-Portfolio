import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// ─── Local Content API plugin ───────────────────────────────────────────────
// Provides dev-only HTTP endpoints that read/write src/content/*.json and
// public/uploads/*. Disabled automatically in production builds.
function localContentApiPlugin() {
  const CONTENT_DIR = path.resolve(process.cwd(), 'src/content')
  const UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads')

  const readBody = req =>
    new Promise((resolve, reject) => {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', () => resolve(body))
      req.on('error', reject)
    })

  const readTable = name => {
    const file = path.join(CONTENT_DIR, `${name}.json`)
    if (!fs.existsSync(file)) return []
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'))
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const writeTable = (name, rows) => {
    fs.mkdirSync(CONTENT_DIR, { recursive: true })
    const file = path.join(CONTENT_DIR, `${name}.json`)
    fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n')
  }

  const nextId = rows => {
    const max = rows.reduce((m, r) => Math.max(m, Number(r?.id) || 0), 0)
    return max + 1
  }

  const matchesFilters = (row, filters) =>
    (filters || []).every(f => {
      if (f.op === 'eq') return String(row?.[f.col]) === String(f.val)
      if (f.op === 'neq') return String(row?.[f.col]) !== String(f.val)
      return true
    })

  const applyQuery = (rows, q) => {
    let out = Array.isArray(rows) ? rows.slice() : []
    if (q.filters?.length) out = out.filter(r => matchesFilters(r, q.filters))
    if (q.order) {
      const { col, ascending } = q.order
      out.sort((a, b) => {
        const av = a?.[col]
        const bv = b?.[col]
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        if (av < bv) return ascending ? -1 : 1
        if (av > bv) return ascending ? 1 : -1
        return 0
      })
    }
    if (q.limit) out = out.slice(0, q.limit)

    if (q.countOpts?.head) return { data: null, error: null, count: out.length }
    if (q.countOpts?.count === 'exact') return { data: out, error: null, count: out.length }
    if (q.single) {
      return out.length
        ? { data: out[0], error: null }
        : { data: null, error: { message: 'No rows found' } }
    }
    if (q.maybeSingle) return { data: out[0] || null, error: null }
    return { data: out, error: null }
  }

  const sanitizeFileName = name => {
    const cleaned = String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '-')
    return cleaned.replace(/-+/g, '-').replace(/^-+|-+$/g, '') || `file-${Date.now()}`
  }

  return {
    name: 'local-content-api',
    configureServer(server) {
      // /api/auth — server-side password check (ADMIN_PASSWORD never reaches the client bundle)
      server.middlewares.use('/api/auth', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        try {
          const body = await readBody(req)
          const { password } = JSON.parse(body || '{}')
          const adminPassword = process.env.ADMIN_PASSWORD
          if (!adminPassword) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ ok: false, error: 'ADMIN_PASSWORD not set in .env' }))
          }
          if (password === adminPassword) {
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ ok: true }))
          }
          res.statusCode = 401
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ ok: false, error: 'Wrong password' }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, error: err.message }))
        }
      })

      // /api/db — all CRUD operations on src/content/*.json
      server.middlewares.use('/api/db', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        try {
          const body = await readBody(req)
          const payload = JSON.parse(body || '{}')
          const { table, op, payload: opPayload, onConflict } = payload

          if (!table) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ data: null, error: { message: 'Missing table' } }))
          }

          let rows = readTable(table)
          let result = { data: null, error: null }

          if (op === 'select') {
            result = applyQuery(rows, payload)
          } else if (op === 'insert') {
            const inputs = Array.isArray(opPayload) ? opPayload : [opPayload]
            const inserted = []
            for (const row of inputs) {
              const id = row?.id ?? nextId(rows)
              const newRow = {
                id,
                ...row,
                created_at: row?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
              rows.push(newRow)
              inserted.push(newRow)
            }
            writeTable(table, rows)
            result = { data: inserted, error: null }
          } else if (op === 'update') {
            const updated = []
            rows = rows.map(r => {
              if (matchesFilters(r, payload.filters)) {
                const merged = { ...r, ...opPayload, updated_at: new Date().toISOString() }
                updated.push(merged)
                return merged
              }
              return r
            })
            writeTable(table, rows)
            result = { data: updated, error: null }
          } else if (op === 'delete') {
            const remaining = rows.filter(r => !matchesFilters(r, payload.filters))
            writeTable(table, remaining)
            result = { data: null, error: null }
          } else if (op === 'upsert') {
            const inputs = Array.isArray(opPayload) ? opPayload : [opPayload]
            const conflictCol = onConflict || 'id'
            const upserted = []
            for (const row of inputs) {
              const idx = rows.findIndex(r => String(r?.[conflictCol]) === String(row?.[conflictCol]))
              if (idx >= 0) {
                const merged = { ...rows[idx], ...row, updated_at: new Date().toISOString() }
                rows[idx] = merged
                upserted.push(merged)
              } else {
                const id = row?.id ?? nextId(rows)
                const newRow = {
                  id,
                  ...row,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
                rows.push(newRow)
                upserted.push(newRow)
              }
            }
            writeTable(table, rows)
            result = { data: upserted, error: null }
          } else {
            result = { data: null, error: { message: `Unknown op: ${op}` } }
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ data: null, error: { message: err.message } }))
        }
      })

      // /api/upload — base64-encoded file upload, saved to public/uploads/
      server.middlewares.use('/api/upload', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        try {
          const body = await readBody(req)
          const { fileName, base64 } = JSON.parse(body || '{}')
          if (!fileName || !base64) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            return res.end(JSON.stringify({ error: 'Missing fileName or base64' }))
          }
          fs.mkdirSync(UPLOADS_DIR, { recursive: true })
          const safe = sanitizeFileName(fileName)
          fs.writeFileSync(path.join(UPLOADS_DIR, safe), Buffer.from(base64, 'base64'))
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ url: `/uploads/${safe}`, savedFileName: safe }))
        } catch (err) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

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
              const ALLOWED_ENV_KEYS = ['ADMIN_PASSWORD']
              if (!ALLOWED_ENV_KEYS.includes(key)) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: false, error: 'Key not allowed' }))
                return
              }
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
  plugins: [react(), envUpdatePlugin(), localContentApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5001,
    host: 'localhost',
  },
})
