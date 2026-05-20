#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// export-from-supabase.js
// One-time migration script. Reads the current live Supabase project (using
// VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from .env) and dumps every table
// into src/content/*.json. Also downloads every file in the portfolio-media
// storage bucket into public/uploads/, and rewrites any *_url column that
// pointed at the Supabase CDN to point at /uploads/<filename> instead.
//
// Usage:
//   npm run export-supabase
//
// Safe to re-run — overwrites existing JSON files.
// ─────────────────────────────────────────────────────────────────────────────

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '../..')
const CONTENT_DIR = path.join(ROOT, 'src/content')
const UPLOADS_DIR = path.join(ROOT, 'public/uploads')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY
const BUCKET = 'portfolio-media'

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Tables to export (matches the JSON file names in src/content/)
const TABLES = [
    'hero',
    'site_content',
    'settings',
    'services',
    'projects',
    'project_reels',
    'testimonials',
    'clients',
    'process_steps',
    'tools',
    'leads',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function writeJson(name, data) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true })
    const file = path.join(CONTENT_DIR, `${name}.json`)
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
    console.log(`  ✓ wrote src/content/${name}.json (${Array.isArray(data) ? data.length : 1} rows)`)
}

function isSupabaseStorageUrl(url) {
    if (typeof url !== 'string') return false
    if (!url) return false
    return url.includes('/storage/v1/object/public/') || url.includes(SUPABASE_URL)
}

function extractFileNameFromUrl(url) {
    try {
        const u = new URL(url)
        const last = u.pathname.split('/').filter(Boolean).pop()
        return decodeURIComponent(last || '')
    } catch {
        return ''
    }
}

// Recursively walk an object/array and rewrite any string field that matches
// a downloaded supabase storage URL into the new /uploads/<name> path.
function rewriteUrls(value, urlMap) {
    if (value == null) return value
    if (typeof value === 'string') {
        if (isSupabaseStorageUrl(value)) {
            const fileName = extractFileNameFromUrl(value)
            if (fileName && urlMap.has(fileName)) return urlMap.get(fileName)
        }
        return value
    }
    if (Array.isArray(value)) return value.map(v => rewriteUrls(v, urlMap))
    if (typeof value === 'object') {
        const out = {}
        for (const [k, v] of Object.entries(value)) out[k] = rewriteUrls(v, urlMap)
        return out
    }
    return value
}

// ─── Storage download ────────────────────────────────────────────────────────

async function listAllFiles(prefix = '') {
    const all = []
    // Supabase paginates listing; pull pages of 1000
    let offset = 0
    while (true) {
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } })
        if (error) {
            console.warn(`  ⚠ list error at "${prefix}": ${error.message}`)
            break
        }
        if (!data || data.length === 0) break
        for (const item of data) {
            // If it's a folder (no id), recurse
            if (!item.id && item.name) {
                const sub = await listAllFiles(prefix ? `${prefix}/${item.name}` : item.name)
                all.push(...sub)
            } else {
                all.push(prefix ? `${prefix}/${item.name}` : item.name)
            }
        }
        if (data.length < 1000) break
        offset += data.length
    }
    return all
}

async function downloadAllStorage() {
    console.log(`\n📦 Listing files in bucket "${BUCKET}"…`)
    const paths = await listAllFiles('')
    console.log(`  found ${paths.length} files`)
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })

    const urlMap = new Map()
    let ok = 0
    let fail = 0
    for (const p of paths) {
        const flatName = p.split('/').pop()
        try {
            const { data, error } = await supabase.storage.from(BUCKET).download(p)
            if (error || !data) throw new Error(error?.message || 'no data')
            const buffer = Buffer.from(await data.arrayBuffer())
            fs.writeFileSync(path.join(UPLOADS_DIR, flatName), buffer)
            urlMap.set(flatName, `/uploads/${flatName}`)
            ok++
            if (ok % 10 === 0) console.log(`  …downloaded ${ok}/${paths.length}`)
        } catch (err) {
            console.warn(`  ⚠ failed: ${p} (${err.message})`)
            fail++
        }
    }
    console.log(`  ✓ downloaded ${ok} files into public/uploads/ (${fail} failed)`)
    return urlMap
}

// ─── Table export ────────────────────────────────────────────────────────────

async function exportTable(name, urlMap) {
    const { data, error } = await supabase.from(name).select('*')
    if (error) {
        console.warn(`  ⚠ skip ${name}: ${error.message}`)
        return
    }
    const rewritten = rewriteUrls(data || [], urlMap)
    writeJson(name, rewritten)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚚 Exporting Supabase → local JSON\n')
    console.log(`   URL: ${SUPABASE_URL}\n`)

    const urlMap = await downloadAllStorage()

    console.log('\n📥 Exporting tables…')
    for (const t of TABLES) {
        await exportTable(t, urlMap)
    }

    console.log('\n✅ Done.\n')
    console.log('Next:')
    console.log('  1. Review src/content/*.json — these are your new sources of truth.')
    console.log('  2. Review public/uploads/ — all downloaded media is here.')
    console.log('  3. git add . && git commit -m "migrate: supabase → local JSON" && git push')
    console.log('  4. (Optional) delete the Supabase project — it is no longer used.\n')
}

main().catch(err => {
    console.error('❌ Export failed:', err)
    process.exit(1)
})
