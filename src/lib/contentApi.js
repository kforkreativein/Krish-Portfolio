// ─────────────────────────────────────────────────────────────────────────────
// contentApi.js
// Drop-in replacement for the Supabase JS client, backed entirely by local
// JSON files in src/content/ and uploaded media in public/uploads/.
//
// Dev mode (npm run dev):
//   • Reads/writes hit /api/db and /api/upload — served by the Vite plugin
//     in vite.config.js. Mutations persist to src/content/*.json on disk.
//
// Production build (Vercel):
//   • Reads return bundled JSON imported below (zero network calls).
//   • Mutations return {data:null, error:{message:'...'}} so the admin
//     panel can show a "edit locally" banner without crashing.
// ─────────────────────────────────────────────────────────────────────────────

import hero from '../content/hero.json'
import site_content from '../content/site_content.json'
import settings from '../content/settings.json'
import services from '../content/services.json'
import projects from '../content/projects.json'
import project_reels from '../content/project_reels.json'
import testimonials from '../content/testimonials.json'
import clients from '../content/clients.json'
import process_steps from '../content/process_steps.json'
import tools from '../content/tools.json'
const BUNDLED = {
    hero,
    site_content,
    settings,
    services,
    projects,
    project_reels,
    testimonials,
    clients,
    process_steps,
    tools,
    // leads intentionally excluded — contact submissions must not be bundled into public JS
}

const PRODUCTION = import.meta.env.PROD

// ─── In-memory query application (used in production) ───────────────────────
function applyQuery(rows, q) {
    let out = Array.isArray(rows) ? rows.slice() : []

    if (q.filters?.length) {
        out = out.filter(r =>
            q.filters.every(f => {
                if (f.op === 'eq') return String(r?.[f.col]) === String(f.val)
                if (f.op === 'neq') return String(r?.[f.col]) !== String(f.val)
                return true
            })
        )
    }

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

    if (q.countOpts?.head) {
        return { data: null, error: null, count: out.length }
    }
    if (q.countOpts?.count === 'exact') {
        return { data: out, error: null, count: out.length }
    }
    if (q.single) {
        return out.length
            ? { data: out[0], error: null }
            : { data: null, error: { message: 'No rows found' } }
    }
    if (q.maybeSingle) {
        return { data: out[0] || null, error: null }
    }
    return { data: out, error: null }
}

// ─── Request transport ──────────────────────────────────────────────────────
async function dbRequest(payload) {
    if (PRODUCTION) {
        if (payload.op !== 'select') {
            return {
                data: null,
                error: {
                    message:
                        'Editing disabled in production. Run `npm run dev` locally, edit at /admin, then `git push`.',
                },
            }
        }
        const rows = BUNDLED[payload.table] || []
        return applyQuery(rows, payload)
    }

    try {
        const res = await fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        const json = await res.json()
        return json
    } catch (err) {
        // Dev API not reachable — fall back to bundled JSON read so the UI still works
        if (payload.op === 'select') {
            const rows = BUNDLED[payload.table] || []
            return applyQuery(rows, payload)
        }
        return { data: null, error: { message: err.message } }
    }
}

// ─── Thenable QueryBuilder ──────────────────────────────────────────────────
class QueryBuilder {
    constructor(table, op) {
        this._table = table
        this._op = op
        this._cols = '*'
        this._filters = []
        this._order = null
        this._limit = null
        this._single = false
        this._maybeSingle = false
        this._countOpts = null
        this._payload = null
        this._onConflict = null
    }

    setPayload(p) {
        this._payload = p
        return this
    }

    setOnConflict(c) {
        this._onConflict = c
        return this
    }

    select(cols, opts) {
        // .select() chained after insert/update/upsert is a no-op flag in
        // Supabase. Our server returns the affected rows regardless.
        if (this._op === 'select') {
            this._cols = cols
            if (opts) this._countOpts = opts
        }
        return this
    }

    eq(col, val) {
        this._filters.push({ op: 'eq', col, val })
        return this
    }

    neq(col, val) {
        this._filters.push({ op: 'neq', col, val })
        return this
    }

    order(col, opts) {
        this._order = { col, ascending: opts?.ascending !== false }
        return this
    }

    limit(n) {
        this._limit = n
        return this
    }

    single() {
        this._single = true
        return this._exec()
    }

    maybeSingle() {
        this._maybeSingle = true
        return this._exec()
    }

    then(resolve, reject) {
        return this._exec().then(resolve, reject)
    }

    catch(reject) {
        return this._exec().catch(reject)
    }

    finally(cb) {
        return this._exec().finally(cb)
    }

    _exec() {
        return dbRequest({
            table: this._table,
            op: this._op,
            cols: this._cols,
            filters: this._filters,
            order: this._order,
            limit: this._limit,
            single: this._single,
            maybeSingle: this._maybeSingle,
            countOpts: this._countOpts,
            payload: this._payload,
            onConflict: this._onConflict,
        })
    }
}

// ─── Storage (uploads) ──────────────────────────────────────────────────────
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result || ''
            const idx = String(result).indexOf(',')
            resolve(idx >= 0 ? String(result).slice(idx + 1) : String(result))
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

const storage = {
    from() {
        return {
            async upload(fileName, file) {
                if (PRODUCTION) {
                    return {
                        data: null,
                        error: {
                            message:
                                'Uploads disabled in production. Run `npm run dev` locally.',
                        },
                    }
                }
                try {
                    const base64 = await fileToBase64(file)
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fileName,
                            contentType: file.type || 'application/octet-stream',
                            base64,
                        }),
                    })
                    const json = await res.json()
                    if (!res.ok || json.error) {
                        return { data: null, error: { message: json.error || 'Upload failed' } }
                    }
                    return { data: { path: json.savedFileName }, error: null }
                } catch (err) {
                    return { data: null, error: { message: err.message } }
                }
            },
            getPublicUrl(fileName) {
                return { data: { publicUrl: `/uploads/${fileName}` } }
            },
        }
    },
}

// ─── Exported Supabase-compatible client ────────────────────────────────────
export const supabase = {
    from(table) {
        return {
            select: (cols, opts) => new QueryBuilder(table, 'select').select(cols, opts),
            insert: rows => new QueryBuilder(table, 'insert').setPayload(rows),
            update: patch => new QueryBuilder(table, 'update').setPayload(patch),
            delete: () => new QueryBuilder(table, 'delete'),
            upsert: (rows, opts) =>
                new QueryBuilder(table, 'upsert')
                    .setPayload(rows)
                    .setOnConflict(opts?.onConflict),
        }
    },
    storage,
}

// Convenience helper used in Admin uploads (same signature as the old
// src/lib/supabase.js uploadFile).
export async function uploadFile(fileName, file) {
    const { error } = await supabase.storage.from('portfolio-media').upload(fileName, file)
    if (error) throw new Error(error.message)
    const { data: urlData } = supabase.storage.from('portfolio-media').getPublicUrl(fileName)
    return urlData.publicUrl
}
