import { useState, useEffect, useCallback } from 'react'
import { supabase, uploadFile } from '../lib/supabase'
import { LayoutDashboard, Sparkles, Briefcase, Workflow, MessageSquareQuote, Users, Wrench, Film, Rocket, Settings2, UserRound, FolderKanban, Mail, SlidersVertical, ChevronUp, ChevronDown, Link2, Eye, EyeOff, PanelBottom, Layout, Menu } from 'lucide-react'
import { SOCIAL_ICON_OPTIONS, getSocialIconByName } from '../constants/socialIcons'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 2500)
        return () => clearTimeout(t)
    }, [onDone])
    return (
        <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-[12px] border text-[14px] font-body font-medium shadow-2xl animate-slide-in-right
            ${type === 'success' ? 'dark:bg-zinc-900 bg-white border-[rgba(200,241,59,0.25)] text-accent' : 'dark:bg-zinc-900 bg-white border-red-500/30 text-red-400'}`}>
            {type === 'success'
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            }
            {message}
        </div>
    )
}

// ─── Input helpers ────────────────────────────────────────────────────────────
const cardCls = 'bg-white dark:bg-[#111] border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm'
const inputCls = 'w-full bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent outline-none transition-all'
const labelCls = 'text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block'
const btnPrimaryCls = 'bg-accent text-white dark:text-black font-semibold rounded-lg px-6 py-2 transition-opacity hover:opacity-80 disabled:opacity-60 text-[13px]'
const btnSecondaryCls = 'border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-400 font-semibold rounded-lg px-6 py-2 hover:border-accent hover:text-accent transition-all text-[13px]'

async function loadSiteContentFields(fields = []) {
    const selectCols = fields.length > 0 ? fields.join(',') : '*'
    const { data, error } = await supabase
        .from('site_content')
        .select(selectCols)
        .eq('id', 1)
        .maybeSingle()

    if (error) throw error
    return data || {}
}

async function saveSiteContentPatch(patch) {
    return supabase
        .from('site_content')
        .upsert({ id: 1, ...patch }, { onConflict: 'id' })
}

async function loadSettingsMap() {
    const { data, error } = await supabase.from('settings').select('*')
    if (error) throw error

    const map = {}
    data?.forEach((row) => {
        map[row.key] = row.value
    })
    return map
}

async function saveSettingsPatch(patch) {
    const payload = Object.entries(patch).map(([key, value]) => ({ key, value: value || '' }))
    return supabase.from('settings').upsert(payload, { onConflict: 'key' })
}

function Field({ label, id, children, error }) {
    return (
        <div className="flex flex-col">
            {label && <label htmlFor={id} className={labelCls}>{label}</label>}
            {children}
            {error && <p className="text-red-500 text-[11px] mt-1 font-body">{error}</p>}
        </div>
    )
}

function HexColorPicker({ label, value, onChange }) {
    const [localValue, setLocalValue] = useState(value || '#000000')

    useEffect(() => {
        setLocalValue(value || '#000000')
    }, [value])

    const handleColorChange = (e) => {
        const val = e.target.value
        setLocalValue(val)
        // Sync with parent immediately; parent's saveSiteContentPatch handles the persistence
        onChange(val)
    }

    return (
        <Field label={label}>
            <div className="flex items-center gap-3 dark:bg-zinc-900 bg-gray-50 border border-border p-1.5 rounded-xl w-fit">
                {/* Visual Swatch */}
                <label htmlFor={`${label}-color`} className="sr-only">{label} color picker</label>
                <input
                    id={`${label}-color`}
                    type="color"
                    value={localValue}
                    onChange={handleColorChange}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
                />
                {/* Hex Text Input */}
                <label htmlFor={`${label}-hex`} className="sr-only">{label} hex input</label>
                <input
                    id={`${label}-hex`}
                    type="text"
                    value={localValue}
                    onChange={handleColorChange}
                    maxLength={7}
                    className="bg-transparent border-none outline-none dark:text-white text-gray-900 text-sm w-20 font-mono uppercase focus:ring-0"
                    placeholder="#FFFFFF"
                />
            </div>
        </Field>
    )
}

// ─── Media Upload Component ───────────────────────────────────────────────────
function MediaUpload({ label, sub, bucket, path, currentUrl, onSave, accept, previewShape = 'circle' }) {
    const [mode, setMode] = useState('upload') // 'upload' | 'url'
    const [urlInput, setUrlInput] = useState('')
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setUploading(true)
            setProgress(30)

            // Flat filename — no subfolders, uploads to portfolio-media root
            const ext = file.name.split('.').pop().toLowerCase()
            const baseName = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            const fileName = `${baseName}-${Date.now()}.${ext}`

            const url = await uploadFile(fileName, file)
            setProgress(100)
            onSave(url)
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Upload failed: ' + err.message)
        } finally {
            setTimeout(() => {
                setUploading(false)
                setProgress(0)
            }, 600)
            e.target.value = ''
        }
    }

    const handleUrlSave = () => {
        if (!urlInput) return
        onSave(urlInput)
        setUrlInput('')
    }

    return (
        <div className="dark:bg-zinc-900 bg-white border border-border rounded-[12px] p-5">
            <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex-1">
                    <h3 className="font-heading font-semibold text-[15px] dark:text-white text-gray-900">{label}</h3>
                    {sub && <p className="font-body text-[12px] text-[#888888] mt-1">{sub}</p>}
                </div>
                {/* Previews */}
                {currentUrl && previewShape === 'circle' && (
                    <img src={currentUrl} alt="preview" width={80} height={80} className="w-[80px] h-[80px] rounded-full object-cover border border-[rgba(255,255,255,0.1)] shrink-0 shadow-lg" />
                )}
                {currentUrl && previewShape === 'rect' && (
                    <div className="w-[160px] aspect-video border border-[rgba(255,255,255,0.1)] rounded-[8px] overflow-hidden shrink-0 shadow-lg bg-black">
                        {currentUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video src={currentUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline>
                                <track kind="captions" />
                            </video>
                        ) : (
                            <img src={currentUrl} alt="preview" width={80} height={142} className="w-full h-full object-cover" />
                        )}
                    </div>
                )}
                {currentUrl && previewShape === 'phone' && (
                    <img src={currentUrl} alt="preview" width={80} height={142} className="w-[80px] h-[142px] rounded-[16px] object-cover border border-[rgba(255,255,255,0.1)] shrink-0 shadow-lg" />
                )}
                {currentUrl && previewShape === 'logo' && (
                    <img src={currentUrl} alt="preview" width={120} height={40} className="h-[40px] max-w-[120px] object-contain shrink-0" />
                )}
            </div>

            <div className="flex gap-2 mb-4 border-b border-[rgba(255,255,255,0.055)] pb-3">
                <button onClick={() => setMode('upload')} className={`text-[12px] font-body font-semibold px-3 py-1.5 rounded-[6px] transition-colors ${mode === 'upload' ? 'dark:bg-zinc-800 bg-gray-100 dark:text-white text-gray-900' : 'text-[#555] hover:text-[#888]'}`}>Upload File</button>
                <button onClick={() => setMode('url')} className={`text-[12px] font-body font-semibold px-3 py-1.5 rounded-[6px] transition-colors ${mode === 'url' ? 'dark:bg-zinc-800 bg-gray-100 dark:text-white text-gray-900' : 'text-[#555] hover:text-[#888]'}`}>Paste URL</button>
            </div>

            {mode === 'upload' ? (
                <div className="flex flex-col gap-3">
                    <label className={`flex items-center justify-center w-full h-[100px] border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-[8px] cursor-pointer hover:border-accent/50 transition-colors dark:bg-zinc-900 bg-white ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex flex-col items-center">
                            <span className="text-[20px] mb-1">📁</span>
                            <span className="text-[12px] text-[#888888] font-body">Click to upload ({accept})</span>
                        </div>
                        <input id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`} type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={uploading} />
                    </label>
                    {uploading && (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 dark:bg-zinc-800 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-accent h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[11px] font-body text-[#888] w-8">Uploading...</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex gap-3">
                    <label htmlFor={`url-input-${label.replace(/\s+/g, '-').toLowerCase()}`} className="sr-only">{label} URL input</label>
                    <input id={`url-input-${label.replace(/\s+/g, '-').toLowerCase()}`} type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://..." className={inputCls} />
                    <button onClick={handleUrlSave} className="px-5 h-[46px] dark:bg-zinc-800 bg-gray-100 border border-[rgba(255,255,255,0.1)] dark:text-white text-gray-900 font-body font-semibold text-[13px] rounded-[8px] hover:bg-[#222] transition-colors shrink-0">Save URL</button>
                </div>
            )}
        </div>
    )
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className={cardCls}>
                <p className="dark:text-white text-gray-900 font-body text-[15px] leading-[1.6]">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 h-10 rounded-[8px] border border-border dark:text-[#888888] text-gray-500 font-body text-[14px] hover:border-accent transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 h-10 rounded-[8px] bg-red-500/10 border border-red-500/30 text-red-500 font-body text-[14px] hover:bg-red-500/20 transition-colors">Delete</button>
                </div>
            </div>
        </div>
    )
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate({ onAuth }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [shake, setShake] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_auth', 'true')
            onAuth()
        } else {
            setError(true)
            setShake(true)
            setTimeout(() => setShake(false), 600)
        }
    }

    return (
        <div className="admin-dashboard min-h-screen dark:bg-black bg-gray-50 flex flex-col items-center justify-center px-6">
            <div className="mb-10 text-center">
                <span className="font-heading font-bold text-[28px] dark:text-white text-gray-900">
                    Krish<span className="text-accent">.</span>
                </span>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-[320px]">
                <label htmlFor="admin-password" className="sr-only">Admin Password</label>
                <input
                    id="admin-password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(false) }}
                    autoFocus
                    className={`dark:bg-bg-3 bg-white border rounded-[12px] px-[18px] py-[14px] dark:text-white text-gray-900 font-body text-[15px] focus:outline-none focus:border-accent transition-all
                        ${error ? 'border-red-500' : 'border-border'}
                        ${shake ? 'animate-shake' : ''}`}
                />
                {error && <p className="text-red-400 text-[13px] font-body text-center -mt-1">Wrong password</p>}
                <button type="submit" className="w-full bg-accent text-white dark:text-black font-semibold rounded-full px-6 py-2 transition-opacity hover:opacity-80">
                    Enter Dashboard
                </button>
            </form>
            <style>{`
                @keyframes shake {
                    0%,100%{transform:translateX(0)}
                    20%{transform:translateX(-8px)}
                    40%{transform:translateX(8px)}
                    60%{transform:translateX(-6px)}
                    80%{transform:translateX(6px)}
                }
                .animate-shake { animation: shake 0.5s ease; }
                @keyframes slide-in-right {
                    from { transform: translateX(120%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease; }
            `}</style>
        </div>
    )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Leads', icon: Mail },
    { label: 'Hero', icon: Sparkles },
    { label: 'About', icon: UserRound },
    { label: 'Services', icon: Briefcase },
    { label: 'Projects', icon: FolderKanban },
    { label: 'Clients', icon: Users },
    { label: 'Process', icon: Workflow },
    { label: 'Tools Stack', icon: Wrench },
    { label: 'Showreel', icon: Film },
    { label: 'Testimonials', icon: MessageSquareQuote },
    { label: 'CTA', icon: Rocket },
    { label: 'Footer', icon: PanelBottom },
    { label: 'Navbar', icon: Layout },
    { label: 'Settings', icon: Settings2 },
]

function Sidebar({ active, onNav, onLogout, isOpen, onClose }) {
    const handleNav = (item) => { onNav(item); onClose() }
    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}
            <aside className={`fixed left-0 top-0 h-screen w-[220px] dark:bg-bg-4 bg-white border-r border-border flex flex-col z-40 shadow-sm transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="px-5 py-6 border-b border-border flex items-center justify-between">
                    <span className="font-heading font-bold text-[22px] dark:text-white text-gray-900">
                        Krish<span className="text-accent">.</span>
                    </span>
                    <button
                        onClick={onClose}
                        className="md:hidden w-[32px] h-[32px] flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>
                <nav className="flex flex-col flex-1 py-4">
                    {(NAV_ITEMS || []).map(({ label, icon: Icon }) => {
                        const isActive = active === label
                        return (
                            <button
                                key={label}
                                onClick={() => handleNav(label)}
                                className={`relative flex items-center gap-2.5 h-[44px] mx-2 px-3.5 text-[14px] font-body font-medium rounded-lg text-left transition-all
                                    ${isActive
                                        ? 'text-accent bg-accent/10 shadow-[0_0_20px_rgba(200,241,59,0.08)]'
                                        : 'dark:text-[#888888] text-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900'}`}
                            >
                                <Icon size={15} className={`${isActive ? 'text-accent' : 'opacity-80'}`} />
                                <span>{label}</span>
                            </button>
                        )
                    })}
                </nav>
                <div className="px-5 py-5 border-t border-border">
                    <button
                        onClick={onLogout}
                        className="text-[13px] font-body text-[#555555] hover:text-red-400 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab() {
    const [stats, setStats] = useState({ projects: 0, services: 0, testimonials: 0, leads: 0 })
    const [recentLeads, setRecentLeads] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const [
                { count: projects },
                { count: services },
                { count: testimonials },
                { count: leads },
                { data: recent }
            ] = await Promise.all([
                supabase.from('projects').select('*', { count: 'exact', head: true }),
                supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('testimonials').select('*', { count: 'exact', head: true }),
                supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
                supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5)
            ])
            setStats({ projects: projects || 0, services: services || 0, testimonials: testimonials || 0, leads: leads || 0 })
            setRecentLeads(recent || [])
            setLoading(false)
        }
        load()
    }, [])

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const STAT_CARDS = [
        { label: 'Total Projects', value: stats.projects, icon: '🎬' },
        { label: 'Active Services', value: stats.services, icon: '⚡' },
        { label: 'Total Testimonials', value: stats.testimonials, icon: '⭐' },
        { label: 'New Leads', value: stats.leads, icon: '📩' },
    ]

    return (
        <div>
            <h1 className="font-heading font-bold text-[28px] dark:text-white text-gray-900">Good morning, Krish.</h1>
            <p className="dark:text-[#555555] text-gray-500 font-body text-[13px] mt-1 mb-8">{today}</p>

            {loading ? (
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
                    {[...Array(4)].map((_, i) => <div key={i} className="dark:bg-zinc-900 bg-white rounded-[16px] h-[100px] animate-pulse border border-border" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
                    {(STAT_CARDS || []).map(c => (
                        <div key={c.label} className={cardCls}>
                            <div className="text-[24px] mb-3">{c.icon}</div>
                            <div className="font-heading font-bold text-[32px] dark:text-white text-gray-900">{c.value}</div>
                            <div className="font-body text-[12px] dark:text-[#888888] text-gray-500 mt-1">{c.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="dark:bg-zinc-900 bg-white border border-border rounded-[16px] overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-heading font-bold text-[16px] dark:text-white text-gray-900">Recent Leads</h2>
                </div>
                {recentLeads.length === 0 ? (
                    <p className="dark:text-[#555555] text-gray-400 font-body text-[14px] p-6">No leads yet. Share your portfolio!</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                {['Name', 'Email', 'Type', 'Date', 'Status'].map(h => (
                                    <th key={h} className="text-left px-6 py-3 text-[10px] uppercase tracking-[0.1em] dark:text-[#888888] text-gray-400 font-body font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(recentLeads || []).map(lead => (
                                <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-[14px] text-[14px] dark:text-white text-gray-900 font-body">{lead.name}</td>
                                    <td className="px-6 py-[14px] text-[14px] dark:text-[#888888] text-gray-500 font-body">{lead.email}</td>
                                    <td className="px-6 py-[14px] text-[13px] dark:text-[#888888] text-gray-500 font-body">{lead.project_type}</td>
                                    <td className="px-6 py-[14px] text-[13px] dark:text-[#555555] text-gray-400 font-body whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString('en-IN')}</td>
                                    <td className="px-6 py-[14px]">
                                        <span className={`text-[11px] font-body font-semibold px-2.5 py-1 rounded-full border
                                            ${lead.status === 'new' ? 'text-accent border-accent/25 bg-accent/7' : 'text-[#888888] border-border'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

// ─── Hero Tab ─────────────────────────────────────────────────────────────────
function HeroTab({ showToast }) {
    const [form, setForm] = useState({
        hero_badge: '',
        hero_heading_part1: '',
        hero_heading_part2: '',
        hero_heading_part3: '',
        hero_subheading: '',
        hero_primary_cta: '',
        hero_secondary_cta: '',
        hero_bottom_stats: '',
        hero_card_name: '',
        hero_card_badge: '',
        hero_card_location: '',
    })
    const [heroPhotoUrl, setHeroPhotoUrl] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const [content, settings] = await Promise.all([
                    loadSiteContentFields([
                        'hero_badge',
                        'hero_heading',
                        'hero_heading_part1',
                        'hero_heading_part2',
                        'hero_heading_part3',
                        'hero_subheading',
                        'hero_primary_cta',
                        'hero_secondary_cta',
                        'hero_bottom_stats',
                        'hero_card_name',
                        'hero_card_badge',
                        'hero_card_location',
                    ]),
                    loadSettingsMap(),
                ])

                setForm({
                    hero_badge: content?.hero_badge || '',
                    hero_heading_part1: content?.hero_heading_part1 || 'I Make Your Brand',
                    hero_heading_part2: content?.hero_heading_part2 || 'Impossible to Scroll Past',
                    hero_heading_part3: content?.hero_heading_part3 || 'with AI + Video',
                    hero_subheading: content?.hero_subheading || '',
                    hero_primary_cta: content?.hero_primary_cta || '',
                    hero_secondary_cta: content?.hero_secondary_cta || '',
                    hero_bottom_stats: content?.hero_bottom_stats || '',
                    hero_card_name: content?.hero_card_name || '',
                    hero_card_badge: content?.hero_card_badge || '',
                    hero_card_location: content?.hero_card_location || '',
                })
                setHeroPhotoUrl(settings?.hero_photo_url || '')
            } catch (err) {
                console.error('[HeroTab] load error:', err)
                showToast('Failed to load Hero content', 'error')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const save = async () => {
        setSaving(true)
        const { error } = await saveSiteContentPatch({
            hero_badge: form.hero_badge,
            hero_heading_part1: form.hero_heading_part1,
            hero_heading_part2: form.hero_heading_part2,
            hero_heading_part3: form.hero_heading_part3,
            hero_heading: `${form.hero_heading_part1 || ''} ${form.hero_heading_part2 || ''} ${form.hero_heading_part3 || ''}`.trim(),
            hero_subheading: form.hero_subheading,
            hero_primary_cta: form.hero_primary_cta,
            hero_secondary_cta: form.hero_secondary_cta,
            hero_bottom_stats: form.hero_bottom_stats,
            hero_card_name: form.hero_card_name,
            hero_card_badge: form.hero_card_badge,
            hero_card_location: form.hero_card_location,
        })
        setSaving(false)
        if (error) {
            showToast('Save failed: ' + error.message, 'error')
        } else {
            showToast('Hero content saved!')
        }
    }

    const handleSaveHeroImage = async (url) => {
        setHeroPhotoUrl(url)
        const { error } = await saveSettingsPatch({ hero_photo_url: url })
        if (error) showToast('Hero image save failed: ' + error.message, 'error')
        else showToast('Hero image saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[360px] animate-pulse" />

    return (
        <div className="max-w-[900px] flex flex-col gap-8">
            <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Hero Section</h2>

            <div className={cardCls + ' flex flex-col gap-6'}>
                <Field label="Hero Badge" id="hero-badge">
                    <input id="hero-badge" className={inputCls} value={form?.hero_badge || ''} onChange={e => setForm(prev => ({ ...prev, hero_badge: e.target.value }))} />
                </Field>
                <div className="grid grid-cols-1 gap-4">
                    <Field label="Hero Heading Part 1" id="hero-h1">
                        <input id="hero-h1" className={inputCls} value={form?.hero_heading_part1 || ''} onChange={e => setForm(prev => ({ ...prev, hero_heading_part1: e.target.value }))} />
                    </Field>
                    <Field label="Hero Heading Part 2" id="hero-h2">
                        <input id="hero-h2" className={inputCls} value={form?.hero_heading_part2 || ''} onChange={e => setForm(prev => ({ ...prev, hero_heading_part2: e.target.value }))} />
                    </Field>
                    <Field label="Hero Heading Part 3 (Accent)" id="hero-h3">
                        <input id="hero-h3" className={inputCls} value={form?.hero_heading_part3 || ''} onChange={e => setForm(prev => ({ ...prev, hero_heading_part3: e.target.value }))} />
                    </Field>
                </div>
                <Field label="Hero Subheading" id="hero-sub">
                    <textarea id="hero-sub" rows={3} className={inputCls + ' resize-none'} value={form?.hero_subheading || ''} onChange={e => setForm(prev => ({ ...prev, hero_subheading: e.target.value }))} />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Primary Button Text" id="hero-cta1">
                        <input id="hero-cta1" className={inputCls} value={form?.hero_primary_cta || ''} onChange={e => setForm(prev => ({ ...prev, hero_primary_cta: e.target.value }))} placeholder="Let's Talk" />
                    </Field>
                    <Field label="Secondary Button Text" id="hero-cta2">
                        <input id="hero-cta2" className={inputCls} value={form?.hero_secondary_cta || ''} onChange={e => setForm(prev => ({ ...prev, hero_secondary_cta: e.target.value }))} placeholder="View My Work" />
                    </Field>
                </div>
                <Field label="Bottom Stats Text" id="hero-stats">
                    <input id="hero-stats" className={inputCls} value={form?.hero_bottom_stats || ''} onChange={e => setForm(prev => ({ ...prev, hero_bottom_stats: e.target.value }))} placeholder="25+ clients · 100+ videos delivered · PAN India & international" />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Hero Card Name" id="hero-card-name">
                        <input id="hero-card-name" className={inputCls} value={form?.hero_card_name || ''} onChange={e => setForm(prev => ({ ...prev, hero_card_name: e.target.value }))} placeholder="Krish Chhatrala" />
                    </Field>
                    <Field label="Hero Card Badge" id="hero-card-badge">
                        <input id="hero-card-badge" className={inputCls} value={form?.hero_card_badge || ''} onChange={e => setForm(prev => ({ ...prev, hero_card_badge: e.target.value }))} placeholder="OPEN TO PROJECTS" />
                    </Field>
                </div>
                <Field label="Hero Card Location" id="hero-card-loc">
                    <input id="hero-card-loc" className={inputCls} value={form?.hero_card_location || ''} onChange={e => setForm(prev => ({ ...prev, hero_card_location: e.target.value }))} placeholder="Vadodara, Gujarat 🇮🇳" />
                </Field>
                <button onClick={save} disabled={saving} className={btnPrimaryCls + ' self-start'}>
                    {saving ? 'Saving…' : 'Save Hero Text'}
                </button>
            </div>

            <MediaUpload
                label="Hero Photo / Placeholder"
                sub="Used in the Hero section right-side card."
                bucket="portfolio-media"
                path="hero/photo-[ext].[ext]"
                currentUrl={heroPhotoUrl}
                onSave={handleSaveHeroImage}
                accept="image/*"
                previewShape="rect"
            />
        </div>
    )
}

function AboutDifferentTab({ showToast }) {
    const [form, setForm] = useState({
        diff_heading: '',
        diff_text: '',
        about_cta_text: '',
    })
    const [differentImage, setDifferentImage] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const [content, settings] = await Promise.all([
                    loadSiteContentFields(['diff_heading', 'diff_text', 'about_cta_text']),
                    loadSettingsMap(),
                ])
                setForm({
                    diff_heading: content?.diff_heading || '',
                    diff_text: content?.diff_text || '',
                    about_cta_text: content?.about_cta_text || '',
                })
                setDifferentImage(settings?.different_photo_url || '')
            } catch (err) {
                console.error('[AboutDifferentTab] load error:', err)
                showToast('Failed to load About content', 'error')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const save = async () => {
        setSaving(true)
        const { error } = await saveSiteContentPatch({
            diff_heading: form.diff_heading,
            diff_text: form.diff_text,
            about_cta_text: form.about_cta_text,
        })
        setSaving(false)
        if (error) showToast('Save failed: ' + error.message, 'error')
        else showToast('About content saved!')
    }

    const handleImageSave = async (url) => {
        setDifferentImage(url)
        const { error } = await saveSettingsPatch({ different_photo_url: url })
        if (error) showToast('Image save failed: ' + error.message, 'error')
        else showToast('About image saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[320px] animate-pulse" />

    return (
        <div className="max-w-[900px] flex flex-col gap-8">
            <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">About / Different</h2>
            <div className={cardCls + ' flex flex-col gap-6'}>
                <Field label="Heading" id="diff-h"><textarea id="diff-h" rows={2} className={inputCls + ' resize-none'} value={form?.diff_heading || ''} onChange={e => setForm(prev => ({ ...prev, diff_heading: e.target.value }))} /></Field>
                <Field label="Main Text" id="diff-txt"><textarea id="diff-txt" rows={5} className={inputCls + ' resize-none'} value={form?.diff_text || ''} onChange={e => setForm(prev => ({ ...prev, diff_text: e.target.value }))} /></Field>
                <Field label="About Button Text" id="about-cta">
                    <input id="about-cta" className={inputCls} value={form?.about_cta_text || ''} onChange={e => setForm(prev => ({ ...prev, about_cta_text: e.target.value }))} placeholder="Browse My Work →" />
                </Field>
                <button onClick={save} disabled={saving} className={btnPrimaryCls + ' self-start'}>
                    {saving ? 'Saving…' : 'Save About Text'}
                </button>
            </div>

            <MediaUpload
                label="What Makes Me Different Image"
                bucket="images"
                path="different/photo-[ext].[ext]"
                currentUrl={differentImage}
                onSave={handleImageSave}
                accept="image/*"
                previewShape="rect"
            />
        </div>
    )
}

function DynamicList({ label, items, onChange, placeholder = "Add item..." }) {
    const [newItem, setNewItem] = useState('')

    const add = () => {
        if (!newItem.trim()) return
        onChange([...items, newItem.trim()])
        setNewItem('')
    }

    const remove = (index) => {
        onChange(items.filter((_, i) => i !== index))
    }

    return (
        <Field label={label}>
            <div className="flex flex-col gap-2">
                {(items || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input className={inputCls} value={item} readOnly aria-label={`${label} item ${i + 1}`} />
                        <button onClick={() => remove(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" aria-label={`Remove ${label} item ${i + 1}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
                <div className="flex items-center gap-2 mt-1">
                    <input
                        id={`dynamic-add-${label.replace(/\s+/g, '-').toLowerCase()}`}
                        className={inputCls}
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        placeholder={placeholder}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                        aria-label={`Add new ${label}`}
                    />
                    <button onClick={add} className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors" aria-label={`Add ${label} item`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                </div>
            </div>
        </Field>
    )
}

function SocialLinksManager({ links, onChange }) {
    const addLink = () => {
        onChange([...(links || []), { id: Date.now(), platform: '', url: '', icon: 'Globe' }])
    }

    const removeLink = (index) => {
        onChange((links || []).filter((_, i) => i !== index))
    }

    const updateLink = (index, key, value) => {
        onChange((links || []).map((item, i) => (i === index ? { ...item, [key]: value } : item)))
    }

    return (
        <div className="flex flex-col gap-4">
            <label className={labelCls}>Dynamic Social Links</label>
            {(links || []).length === 0 && (
                <p className="text-[12px] text-gray-500 dark:text-[#888888]">No links added yet.</p>
            )}
            {(links || []).map((item, index) => {
                const IconPreview = getSocialIconByName(item?.icon)
                return (
                    <div key={item?.id || index} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_auto] gap-3 items-end border border-border rounded-lg p-3 bg-gray-50 dark:bg-zinc-900">
                        <Field label="Platform" id={`social-platform-${index}`}>
                            <input id={`social-platform-${index}`} className={inputCls} value={item?.platform || ''} onChange={(e) => updateLink(index, 'platform', e.target.value)} placeholder="Instagram" />
                        </Field>
                        <Field label="URL" id={`social-url-${index}`}>
                            <input id={`social-url-${index}`} className={inputCls} value={item?.url || ''} onChange={(e) => updateLink(index, 'url', e.target.value)} placeholder="https://..." />
                        </Field>
                        <Field label="Icon" id={`social-icon-${index}`}>
                            <select id={`social-icon-${index}`} className={inputCls} value={item?.icon || 'Globe'} onChange={(e) => updateLink(index, 'icon', e.target.value)}>
                                {(SOCIAL_ICON_OPTIONS || []).map((iconName) => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                            </select>
                        </Field>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-11 h-11 rounded-lg border border-border bg-white dark:bg-[#111] flex items-center justify-center">
                                <IconPreview size={18} className="text-accent" />
                            </div>
                            <button onClick={() => removeLink(index)} className="w-11 h-11 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors">
                                <span className="sr-only">Remove link</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                )
            })}
            <button onClick={addLink} className={btnSecondaryCls + ' self-start'}>
                + Add Social Link
            </button>
        </div>
    )
}

function ShowreelTab({ showToast }) {
    const [form, setForm] = useState({
        showreel_heading: '',
        showreel_title: '',
        showreel_subtext: '',
        showreel_video_url: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const data = await loadSiteContentFields(['showreel_heading', 'showreel_title', 'showreel_subtext', 'showreel_video_url'])
                setForm({
                    showreel_heading: data?.showreel_heading || '',
                    showreel_title: data?.showreel_title || '',
                    showreel_subtext: data?.showreel_subtext || '',
                    showreel_video_url: data?.showreel_video_url || '',
                })
            } catch (err) {
                console.error('[ShowreelTab] load error:', err)
                showToast('Failed to load Showreel content', 'error')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const save = async () => {
        setSaving(true)
        const { error } = await saveSiteContentPatch({
            showreel_heading: form.showreel_heading,
            showreel_title: form.showreel_title,
            showreel_subtext: form.showreel_subtext,
            showreel_video_url: form.showreel_video_url,
        })
        setSaving(false)
        if (error) showToast('Save failed: ' + error.message, 'error')
        else showToast('Showreel content saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[320px] animate-pulse" />

    return (
        <div className="max-w-[900px] flex flex-col gap-8">
            <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Showreel</h2>
            <div className={cardCls + ' flex flex-col gap-6'}>
                <Field label="Heading" id="reel-h"><textarea id="reel-h" rows={2} className={inputCls + ' resize-none'} value={form?.showreel_heading || ''} onChange={e => setForm(prev => ({ ...prev, showreel_heading: e.target.value }))} /></Field>
                <Field label="Title" id="reel-t"><input id="reel-t" className={inputCls} value={form?.showreel_title || ''} onChange={e => setForm(prev => ({ ...prev, showreel_title: e.target.value }))} /></Field>
                <Field label="Subtext" id="reel-sub">
                    <textarea id="reel-sub" rows={3} className={inputCls + ' resize-none'} value={form?.showreel_subtext || ''} onChange={e => setForm(prev => ({ ...prev, showreel_subtext: e.target.value }))} />
                </Field>
                <Field label="Video URL" id="reel-url">
                    <input id="reel-url" className={inputCls} value={form?.showreel_video_url || ''} onChange={e => setForm(prev => ({ ...prev, showreel_video_url: e.target.value }))} placeholder="https://..." />
                </Field>
                <button onClick={save} disabled={saving} className={btnPrimaryCls + ' self-start'}>
                    {saving ? 'Saving…' : 'Save Showreel Content'}
                </button>
            </div>

            <MediaUpload
                label="Showreel Video Upload"
                bucket="videos"
                path="showreel/main.[ext]"
                currentUrl={form?.showreel_video_url || ''}
                onSave={url => setForm(prev => ({ ...prev, showreel_video_url: url }))}
                accept="video/*"
                previewShape="rect"
            />
        </div>
    )
}

function CTALevelUpTab({ showToast }) {
    const [form, setForm] = useState({
        cta_heading: '',
        cta_subheading: '',
        cta_pills: [],
        level_up_cta_text: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const data = await loadSiteContentFields(['cta_heading', 'cta_subheading', 'cta_pills', 'level_up_cta_text'])
                setForm({
                    cta_heading: data?.cta_heading || '',
                    cta_subheading: data?.cta_subheading || '',
                    cta_pills: Array.isArray(data?.cta_pills) ? data.cta_pills : [],
                    level_up_cta_text: data?.level_up_cta_text || '',
                })
            } catch (err) {
                console.error('[CTALevelUpTab] load error:', err)
                showToast('Failed to load CTA content', 'error')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const save = async () => {
        setSaving(true)
        const { error } = await saveSiteContentPatch({
            cta_heading: form.cta_heading,
            cta_subheading: form.cta_subheading,
            cta_pills: Array.isArray(form.cta_pills) ? form.cta_pills : [],
            level_up_cta_text: form.level_up_cta_text,
        })
        setSaving(false)
        if (error) showToast('Save failed: ' + error.message, 'error')
        else showToast('CTA content saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[280px] animate-pulse" />

    return (
        <div className="max-w-[900px] flex flex-col gap-8">
            <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">CTA / Level Up</h2>
            <div className={cardCls + ' flex flex-col gap-6'}>
                <Field label="Heading" id="cta-h"><textarea id="cta-h" rows={2} className={inputCls + ' resize-none'} value={form?.cta_heading || ''} onChange={e => setForm(prev => ({ ...prev, cta_heading: e.target.value }))} /></Field>
                <Field label="Subheading" id="cta-sub"><textarea id="cta-sub" rows={3} className={inputCls + ' resize-none'} value={form?.cta_subheading || ''} onChange={e => setForm(prev => ({ ...prev, cta_subheading: e.target.value }))} /></Field>
                <DynamicList
                    label="CTA Pills"
                    items={form?.cta_pills || []}
                    onChange={(value) => setForm(prev => ({ ...prev, cta_pills: value }))}
                    placeholder="Add CTA pill text..."
                />
                <Field label="Button Text" id="cta-btn"><input id="cta-btn" className={inputCls} value={form?.level_up_cta_text || ''} onChange={e => setForm(prev => ({ ...prev, level_up_cta_text: e.target.value }))} placeholder="Let's Talk →" /></Field>
                <button onClick={save} disabled={saving} className={btnPrimaryCls + ' self-start'}>
                    {saving ? 'Saving…' : 'Save CTA Content'}
                </button>
            </div>
        </div>
    )
}

function GlobalUITab({ showToast }) {
    const [form, setForm] = useState({
        nav_logo_text: '',
        nav_status_text: '',
        nav_cta_text: '',
        nav_icon_url: '',
        favicon_url: '',
        floating_cta_text: '',
        floating_cta_link: '',
        theme_accent_light: '#0A68FF',
        theme_accent_dark: '#CCFF00',
        theme_bg_light: '#FAFAFA',
        theme_bg_dark: '#080808',
        theme_text_light: '',
        theme_text_dark: '',
        theme_secondary_text_light: '',
        theme_secondary_text_dark: '',
        theme_btn_filled_text_light: '',
        theme_btn_filled_text_dark: '',
        theme_btn_ghost_text_light: '',
        theme_btn_ghost_text_dark: '',
        dynamic_social_links: [],
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                // Fetch ALL fields defensively to avoid SELECT error if specific columns are missing
                const data = await loadSiteContentFields()
                setForm({
                    nav_logo_text: data?.nav_logo_text || '',
                    nav_status_text: data?.nav_status_text || '',
                    nav_cta_text: data?.nav_cta_text || '',
                    nav_icon_url: data?.nav_icon_url || '',
                    favicon_url: data?.favicon_url || '',
                    floating_cta_text: data?.floating_cta_text || '',
                    floating_cta_link: data?.floating_cta_link || '',
                    theme_accent_light: data?.theme_accent_light || '#0A68FF',
                    theme_accent_dark: data?.theme_accent_dark || '#CCFF00',
                    theme_bg_light: data?.theme_bg_light || '#FAFAFA',
                    theme_bg_dark: data?.theme_bg_dark || '#080808',
                    theme_text_light: data?.theme_text_light || '#0A0A0A',
                    theme_text_dark: data?.theme_text_dark || '#EDE9E3',
                    // New theme fields with explicit fallbacks
                    theme_secondary_text_light: data?.theme_secondary_text_light || '#4B5563',
                    theme_secondary_text_dark: data?.theme_secondary_text_dark || '#A1A1AA',
                    theme_btn_filled_text_light: data?.theme_btn_filled_text_light || '#FFFFFF',
                    theme_btn_filled_text_dark: data?.theme_btn_filled_text_dark || '#000000',
                    theme_btn_ghost_text_light: data?.theme_btn_ghost_text_light || '#000000',
                    theme_btn_ghost_text_dark: data?.theme_btn_ghost_text_dark || '#FFFFFF',
                    dynamic_social_links: Array.isArray(data?.dynamic_social_links)
                        ? data.dynamic_social_links.map(l => ({ ...l, id: l.id || Math.random() }))
                        : [],
                })
            } catch (err) {
                console.error('[GlobalUITab] load error:', err)
                showToast('Failed to load Global UI content', 'error')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [showToast])

    const save = async () => {
        setSaving(true)

        // Core fields known to exist
        const corePayload = {
            nav_logo_text: form.nav_logo_text,
            nav_status_text: form.nav_status_text,
            nav_cta_text: form.nav_cta_text,
            nav_icon_url: form.nav_icon_url,
            favicon_url: form.favicon_url,
            floating_cta_text: form.floating_cta_text,
            floating_cta_link: form.floating_cta_link,
            theme_accent_light: form.theme_accent_light,
            theme_accent_dark: form.theme_accent_dark,
            theme_bg_light: form.theme_bg_light,
            theme_bg_dark: form.theme_bg_dark,
            theme_text_light: form.theme_text_light,
            theme_text_dark: form.theme_text_dark,
            dynamic_social_links: Array.isArray(form.dynamic_social_links) ? form.dynamic_social_links : [],
        }

        // New theme fields that might be missing in schema
        const themeExtension = {
            theme_secondary_text_light: form.theme_secondary_text_light,
            theme_secondary_text_dark: form.theme_secondary_text_dark,
            theme_btn_filled_text_light: form.theme_btn_filled_text_light,
            theme_btn_filled_text_dark: form.theme_btn_filled_text_dark,
            theme_btn_ghost_text_light: form.theme_btn_ghost_text_light,
            theme_btn_ghost_text_dark: form.theme_btn_ghost_text_dark,
        }

        // Try saving everything
        const { error } = await saveSiteContentPatch({ ...corePayload, ...themeExtension })

        if (error) {
            // Check for PostgREST "Column not found" or schema mismatch errors
            const isSchemaError = error.code === 'PGRST204' || error.message?.toLowerCase().includes('column') || error.code === '42703'

            if (isSchemaError) {
                console.warn('[GlobalUITab] Extended theme columns missing. Saving core fields only.')
                const { error: coreError } = await saveSiteContentPatch(corePayload)

                setSaving(false)
                if (coreError) showToast('Save failed: ' + coreError.message, 'error')
                else showToast('Partial save: Please update Supabase schema for new colors', 'error')
            } else {
                setSaving(false)
                showToast('Save failed: ' + error.message, 'error')
            }
        } else {
            setSaving(false)
            showToast('Global UI saved!')
        }
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[320px] animate-pulse" />

    return (
        <div className="max-w-[900px] flex flex-col gap-8">
            <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Global UI</h2>

            <div className={cardCls + ' flex flex-col gap-8'}>
                <div className="flex flex-col gap-4">
                    <p className="font-heading font-semibold text-[16px] dark:text-white text-gray-900">Favicon</p>
                    <MediaUpload
                        label="Favicon"
                        bucket="images"
                        path="site/favicon.[ext]"
                        currentUrl={form?.favicon_url || ''}
                        onSave={url => setForm(prev => ({ ...prev, favicon_url: url }))}
                        accept="image/png,image/x-icon,image/svg+xml,image/*"
                        previewShape="logo"
                    />
                </div>

                <div className="pt-6 border-t border-border flex flex-col gap-4">
                    <p className="font-heading font-semibold text-[16px] dark:text-white text-gray-900">Favicon</p>
                    <MediaUpload
                        label="Favicon"
                        bucket="images"
                        path="site/favicon.[ext]"
                        currentUrl={form?.favicon_url || ''}
                        onSave={url => setForm(prev => ({ ...prev, favicon_url: url }))}
                        accept="image/png,image/x-icon,image/svg+xml,image/*"
                        previewShape="logo"
                    />
                </div>

                <div className="pt-6 border-t border-border flex flex-col gap-4">
                    <p className="font-heading font-semibold text-[16px] dark:text-white text-gray-900">Floating CTA</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="CTA Button Text" id="float-cta-txt"><input id="float-cta-txt" className={inputCls} value={form?.floating_cta_text || ''} onChange={e => setForm(prev => ({ ...prev, floating_cta_text: e.target.value }))} /></Field>
                        <Field label="CTA Button Link" id="float-cta-link"><input id="float-cta-link" className={inputCls} value={form?.floating_cta_link || ''} onChange={e => setForm(prev => ({ ...prev, floating_cta_link: e.target.value }))} placeholder="#contact or https://..." /></Field>
                    </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col gap-4">
                    <p className="font-heading font-semibold text-[16px] dark:text-white text-gray-900">Theme Colors</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <HexColorPicker
                            label="Accent Color (Light)"
                            value={form.theme_accent_light}
                            onChange={(v) => setForm(p => ({ ...p, theme_accent_light: v }))}
                        />
                        <HexColorPicker
                            label="Accent Color (Dark)"
                            value={form.theme_accent_dark}
                            onChange={(v) => setForm(p => ({ ...p, theme_accent_dark: v }))}
                        />
                        <HexColorPicker
                            label="Background Color (Light)"
                            value={form.theme_bg_light}
                            onChange={(v) => setForm(p => ({ ...p, theme_bg_light: v }))}
                        />
                        <HexColorPicker
                            label="Background Color (Dark)"
                            value={form.theme_bg_dark}
                            onChange={(v) => setForm(p => ({ ...p, theme_bg_dark: v }))}
                        />
                        <HexColorPicker
                            label="Text Color (Light)"
                            value={form.theme_text_light}
                            onChange={(v) => setForm(p => ({ ...p, theme_text_light: v }))}
                        />
                        <HexColorPicker
                            label="Text Color (Dark)"
                            value={form.theme_text_dark}
                            onChange={(v) => setForm(p => ({ ...p, theme_text_dark: v }))}
                        />
                        <HexColorPicker
                            label="Secondary Text (Light)"
                            value={form.theme_secondary_text_light}
                            onChange={(v) => setForm(p => ({ ...p, theme_secondary_text_light: v }))}
                        />
                        <HexColorPicker
                            label="Secondary Text (Dark)"
                            value={form.theme_secondary_text_dark}
                            onChange={(v) => setForm(p => ({ ...p, theme_secondary_text_dark: v }))}
                        />
                        <HexColorPicker
                            label="Colored Button Text (Light)"
                            value={form.theme_btn_filled_text_light}
                            onChange={(v) => setForm(p => ({ ...p, theme_btn_filled_text_light: v }))}
                        />
                        <HexColorPicker
                            label="Colored Button Text (Dark)"
                            value={form.theme_btn_filled_text_dark}
                            onChange={(v) => setForm(p => ({ ...p, theme_btn_filled_text_dark: v }))}
                        />
                        <HexColorPicker
                            label="Normal Button Text (Light)"
                            value={form.theme_btn_ghost_text_light}
                            onChange={(v) => setForm(p => ({ ...p, theme_btn_ghost_text_light: v }))}
                        />
                        <HexColorPicker
                            label="Normal Button Text (Dark)"
                            value={form.theme_btn_ghost_text_dark}
                            onChange={(v) => setForm(p => ({ ...p, theme_btn_ghost_text_dark: v }))}
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col gap-4">
                    <SocialLinksManager
                        links={form?.dynamic_social_links || []}
                        onChange={(links) => setForm(prev => ({ ...prev, dynamic_social_links: links }))}
                    />
                </div>

                <button onClick={save} disabled={saving} className={btnPrimaryCls + ' self-start'}>
                    {saving ? 'Saving…' : 'Save Global UI'}
                </button>
            </div>
        </div>
    )
}

function FooterTab({ showToast }) {
    const [form, setForm] = useState({
        footer_big_text: '',
        footer_text: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const data = await loadSiteContentFields(['footer_big_text', 'footer_text'])
                setForm({
                    footer_big_text: data?.footer_big_text || '',
                    footer_text: data?.footer_text || '',
                })
            } catch (err) {
                console.error('[FooterTab] load error:', err)
                showToast('Failed to load footer content', 'error')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const save = async () => {
        setSaving(true)
        const { error } = await saveSiteContentPatch({
            footer_big_text: form.footer_big_text,
            footer_text: form.footer_text,
        })
        setSaving(false)
        if (error) showToast('Save failed: ' + error.message, 'error')
        else showToast('Footer content saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[260px] animate-pulse" />

    return (
        <div className="max-w-[900px] flex flex-col gap-8">
            <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Footer</h2>
            <div className={cardCls + ' flex flex-col gap-6'}>
                <Field label="Footer Big Text" id="foot-big"><input id="foot-big" className={inputCls} value={form?.footer_big_text || ''} onChange={e => setForm(prev => ({ ...prev, footer_big_text: e.target.value }))} placeholder="Krish Chhatrala" /></Field>
                <Field label="Footer Subtext" id="foot-sub"><input id="foot-sub" className={inputCls} value={form?.footer_text || ''} onChange={e => setForm(prev => ({ ...prev, footer_text: e.target.value }))} /></Field>
                <button onClick={save} disabled={saving} className={btnPrimaryCls + ' self-start'}>
                    {saving ? 'Saving…' : 'Save Footer'}
                </button>
            </div>
        </div>
    )
}

function LayoutTab({ showToast }) {
    const DEFAULT_ORDER = ['hero', 'about', 'services', 'process', 'portfolio', 'clients', 'tools', 'showreel', 'testimonials', 'cta']
    const [sectionOrder, setSectionOrder] = useState(DEFAULT_ORDER)
    const [hiddenSections, setHiddenSections] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const data = await loadSiteContentFields(['section_order', 'hidden_sections'])
                if (Array.isArray(data?.section_order) && data.section_order.length > 0) {
                    setSectionOrder(data.section_order)
                } else {
                    setSectionOrder(DEFAULT_ORDER)
                }
                if (Array.isArray(data?.hidden_sections)) {
                    setHiddenSections(data.hidden_sections)
                }
            } catch (err) {
                console.error('[LayoutTab] load error:', err)
                showToast('Failed to load section order', 'error')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const moveSection = (index, direction) => {
        const target = index + direction
        if (target < 0 || target >= sectionOrder.length) return
        const next = [...sectionOrder]
            ;[next[index], next[target]] = [next[target], next[index]]
        setSectionOrder(next)
    }

    const toggleVisibility = (section) => {
        setHiddenSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        )
    }

    const save = async () => {
        setSaving(true)
        const { error } = await supabase
            .from('site_content')
            .update({ section_order: sectionOrder, hidden_sections: hiddenSections })
            .eq('id', 1)
        setSaving(false)
        if (error) showToast('Save failed: ' + error.message, 'error')
        else showToast('Layout saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[320px] animate-pulse" />

    return (
        <div className="max-w-[900px] flex flex-col gap-8">
            <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Layout</h2>
            <div className={cardCls + ' flex flex-col gap-4'}>
                <p className="font-body text-[13px] text-gray-500 dark:text-[#888888]">Reorder homepage sections and toggle visibility. Changes persist after saving.</p>
                {(sectionOrder || []).map((section, index) => {
                    const isHidden = hiddenSections.includes(section)
                    return (
                        <div
                            key={`${section}-${index}`}
                            className={`flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-gray-50 dark:bg-zinc-900 transition-opacity ${isHidden ? 'opacity-40' : 'opacity-100'}`}
                        >
                            <span className="font-body text-[14px] text-gray-900 dark:text-white uppercase tracking-wide">{section}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleVisibility(section)}
                                    className={`w-8 h-8 inline-flex items-center justify-center rounded-md border transition-colors ${isHidden ? 'border-red-500/40 text-red-500 hover:bg-red-500/10' : 'border-border text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/10'}`}
                                    title={isHidden ? 'Show section' : 'Hide section'}
                                >
                                    {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                    onClick={() => moveSection(index, -1)}
                                    className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border text-gray-500 dark:text-[#888888] hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40"
                                    disabled={index === 0}
                                    title="Move up"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    onClick={() => moveSection(index, 1)}
                                    className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border text-gray-500 dark:text-[#888888] hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40"
                                    disabled={index === sectionOrder.length - 1}
                                    title="Move down"
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
                    )
                })}
                <button onClick={save} disabled={saving} className={btnPrimaryCls + ' self-start mt-2'}>
                    {saving ? 'Saving…' : 'Save Layout'}
                </button>
            </div>
        </div>
    )
}

function SpacingTab({ showToast }) {
    const [paddings, setPaddings] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const sections = [
        { id: 'hero', label: 'Hero Section' },
        { id: 'different', label: 'About Section' },
        { id: 'services', label: 'Services Section' },
        { id: 'work', label: 'Selected Work' },
        { id: 'process', label: 'Process Section' },
        { id: 'clients', label: 'Logo Strip' },
        { id: 'stack', label: 'Tools Stack' },
        { id: 'showreel', label: 'Showreel Section' },
        { id: 'testimonials', label: 'Testimonials' },
        { id: 'cta', label: 'CTA Section' },
    ]

    const internals = [
        { id: 'project', label: 'Project Detail' },
        { id: 'admin', label: 'Admin Panel' },
    ]

    useEffect(() => {
        async function load() {
            try {
                const map = await loadSettingsMap()
                setPaddings(map)
            } catch (err) {
                console.error('[SpacingTab] load error:', err)
                showToast('Failed to load spacing settings', 'error')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [showToast])

    const handleUpdate = (key, val) => {
        setPaddings(prev => ({ ...prev, [key]: val }))
    }

    const save = async () => {
        setSaving(true)
        const patch = {}
        Object.keys(paddings).forEach(k => {
            if (k.startsWith('pad_')) patch[k] = paddings[k]
        })
        const { error } = await saveSettingsPatch(patch)
        setSaving(false)
        if (error) showToast('Save failed: ' + error.message, 'error')
        else showToast('Layout spacing saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[320px] animate-pulse" />

    const TableHeader = () => (
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800 items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Section</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Mobile (t/b)</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Tablet (t/b)</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Desktop (t/b)</span>
        </div>
    )

    const SectionRow = ({ id, label }) => {
        const t_mob = `pad_${id}_t_mob`; const b_mob = `pad_${id}_b_mob`
        const t_tab = `pad_${id}_t_tab`; const b_tab = `pad_${id}_b_tab`
        const t_desk = `pad_${id}_t_desk`; const b_desk = `pad_${id}_b_desk`

        return (
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-4 py-4 border-b border-gray-100 dark:border-zinc-800 last:border-0 items-center">
                <span className="font-body text-[13px] font-semibold text-gray-900 dark:text-white">{label}</span>
                <div className="flex gap-1 justify-center">
                    <label htmlFor={t_mob} className="sr-only">{label} Mobile Top padding</label>
                    <input id={t_mob} className="w-12 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded p-1.5 text-[11px] text-center dark:text-white" value={paddings[t_mob] || ''} onChange={e => handleUpdate(t_mob, e.target.value)} placeholder="T" />
                    <label htmlFor={b_mob} className="sr-only">{label} Mobile Bottom padding</label>
                    <input id={b_mob} className="w-12 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded p-1.5 text-[11px] text-center dark:text-white" value={paddings[b_mob] || ''} onChange={e => handleUpdate(b_mob, e.target.value)} placeholder="B" />
                </div>
                <div className="flex gap-1 justify-center">
                    <label htmlFor={t_tab} className="sr-only">{label} Tablet Top padding</label>
                    <input id={t_tab} className="w-12 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded p-1.5 text-[11px] text-center dark:text-white" value={paddings[t_tab] || ''} onChange={e => handleUpdate(t_tab, e.target.value)} placeholder="T" />
                    <label htmlFor={b_tab} className="sr-only">{label} Tablet Bottom padding</label>
                    <input id={b_tab} className="w-12 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded p-1.5 text-[11px] text-center dark:text-white" value={paddings[b_tab] || ''} onChange={e => handleUpdate(b_tab, e.target.value)} placeholder="B" />
                </div>
                <div className="flex gap-1 justify-center">
                    <label htmlFor={t_desk} className="sr-only">{label} Desktop Top padding</label>
                    <input id={t_desk} className="w-12 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded p-1.5 text-[11px] text-center dark:text-white" value={paddings[t_desk] || ''} onChange={e => handleUpdate(t_desk, e.target.value)} placeholder="T" />
                    <label htmlFor={b_desk} className="sr-only">{label} Desktop Bottom padding</label>
                    <input id={b_desk} className="w-12 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded p-1.5 text-[11px] text-center dark:text-white" value={paddings[b_desk] || ''} onChange={e => handleUpdate(b_desk, e.target.value)} placeholder="B" />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[1000px] flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Layout & Spacing</h2>
                    <p className="font-body text-[13px] text-gray-500 dark:text-[#888888] mt-1">Manage vertical margins/paddings for every section across devices.</p>
                </div>
                <button onClick={save} disabled={saving} className={btnPrimaryCls}>
                    {saving ? 'Saving...' : 'Save Spacing'}
                </button>
            </div>

            <div className={cardCls}>
                <TableHeader />
                {sections.map(s => <SectionRow key={s.id} {...s} />)}
            </div>

            <div>
                <h3 className="font-heading font-bold text-[18px] dark:text-white text-gray-900 mb-4">Internal Pages</h3>
                <div className={cardCls}>
                    <TableHeader />
                    {internals.map(s => <SectionRow key={s.id} {...s} />)}
                </div>
            </div>

            <div>
                <h3 className="font-heading font-bold text-[18px] dark:text-white text-gray-900 mb-4">Global Side Padding</h3>
                <div className={cardCls + ' grid grid-cols-1 md:grid-cols-3 gap-8'}>
                    <Field label="Mobile Side" id="side-mob">
                        <input id="side-mob" className={inputCls} value={paddings.pad_side_mob || ''} onChange={e => handleUpdate('pad_side_mob', e.target.value)} placeholder="20px" />
                    </Field>
                    <Field label="Tablet Side" id="side-tab">
                        <input id="side-tab" className={inputCls} value={paddings.pad_side_tab || ''} onChange={e => handleUpdate('pad_side_tab', e.target.value)} placeholder="32px" />
                    </Field>
                    <Field label="Desktop Side" id="side-desk">
                        <input id="side-desk" className={inputCls} value={paddings.pad_side_desk || ''} onChange={e => handleUpdate('pad_side_desk', e.target.value)} placeholder="52px" />
                    </Field>
                </div>
            </div>
        </div>
    )
}

function ServiceForm({ initial, onSave, onCancel, saving }) {
    const [f, setF] = useState(initial || { number: '', title: '', description: '', tags: '', bullet_points: [], image_url: '', sort_order: 0, is_active: true })
    const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
    return (
        <div className={cardCls + ' flex flex-col gap-6 mt-3'}>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Number" id="diff-step-num"><input id="diff-step-num" className={inputCls} value={f.number} onChange={e => set('number', e.target.value)} placeholder="01" /></Field>
                <Field label="Sort Order" id="diff-step-sort"><input id="diff-step-sort" type="number" className={inputCls} value={f.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
            </div>
            <Field label="Title" id="diff-step-title"><input id="diff-step-title" className={inputCls} value={f.title} onChange={e => set('title', e.target.value)} /></Field>
            <Field label="Description" id="diff-step-desc"><textarea id="diff-step-desc" rows={3} className={inputCls + ' resize-none'} value={f.description} onChange={e => set('description', e.target.value)} /></Field>
            <Field label="Tags (comma separated)" id="diff-step-tags"><input id="diff-step-tags" className={inputCls} value={f.tags} onChange={e => set('tags', e.target.value)} placeholder="React, Tailwind, Framer" /></Field>
            <DynamicList label="Bullet Points" items={f.bullet_points || []} onChange={val => set('bullet_points', val)} />

            <div className="pt-4 border-t border-border mt-2">
                <MediaUpload
                    label="Service Image"
                    bucket="portfolio-media"
                    path={`services/${f.id || 'new-service'}-image.[ext]`}
                    currentUrl={f.image_url}
                    onSave={url => set('image_url', url)}
                    accept="image/*"
                    previewShape="rect"
                />
            </div>

            <label htmlFor="service-active" className="flex items-center gap-3 cursor-pointer mt-2">
                <input id="service-active" type="checkbox" checked={f.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-accent w-4 h-4" />
                <span className="font-body text-[14px] dark:text-white text-gray-900">Active</span>
            </label>
            <div className="flex gap-3 mt-2">
                <button onClick={() => onSave(f)} disabled={saving} className={btnPrimaryCls}>{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={onCancel} className={btnSecondaryCls}>Cancel</button>
            </div>
        </div>
    )
}

function ServicesTab({ showToast }) {
    const [items, setItems] = useState([])
    const [servicesHeading, setServicesHeading] = useState('')
    const [loading, setLoading] = useState(true)
    const [editId, setEditId] = useState(null)
    const [adding, setAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savingHeading, setSavingHeading] = useState(false)
    const [confirm, setConfirm] = useState(null)

    const load = useCallback(async () => {
        const [{ data }, content] = await Promise.all([
            supabase.from('services').select('*').order('sort_order', { ascending: true }),
            loadSiteContentFields(['services_heading']),
        ])
        setItems(data || [])
        setServicesHeading(content?.services_heading || '')
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const toDbForm = (f) => ({
        number: f.number, title: f.title, description: f.description, image_url: f.image_url,
        tags: f.tags ? f.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        bullet_points: Array.isArray(f.bullet_points) ? f.bullet_points : [],
        sort_order: Number(f.sort_order), is_active: f.is_active
    })

    const fromItem = (item) => ({
        ...item,
        tags: (item.tags || []).join(', '),
        bullet_points: item.bullet_points || item.bullets || []
    })

    const handleAdd = async (f) => {
        setSaving(true)
        await supabase.from('services').insert([toDbForm(f)])
        setSaving(false); setAdding(false); showToast('Service added!'); load()
    }

    const handleEdit = async (f) => {
        setSaving(true)
        await supabase.from('services').update(toDbForm(f)).eq('id', editId)
        setSaving(false); setEditId(null); showToast('Saved!'); load()
    }

    const handleDelete = async (id) => {
        await supabase.from('services').delete().eq('id', id)
        setConfirm(null); showToast('Deleted!', 'error'); load()
    }

    const toggleActive = async (item) => {
        await supabase.from('services').update({ is_active: !item.is_active }).eq('id', item.id)
        load()
    }

    const saveHeading = async () => {
        setSavingHeading(true)
        const { error } = await saveSiteContentPatch({ services_heading: servicesHeading })
        setSavingHeading(false)
        if (error) showToast('Heading save failed: ' + error.message, 'error')
        else showToast('Services heading saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[300px] animate-pulse" />

    return (
        <div>
            {confirm && <ConfirmModal message="Delete this service?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
            <div className={cardCls + ' mb-6 flex flex-col gap-4'}>
                <Field label="Services Section Heading" id="serv-h">
                    <textarea id="serv-h" rows={2} className={inputCls + ' resize-none'} value={servicesHeading || ''} onChange={e => setServicesHeading(e.target.value)} />
                </Field>
                <button onClick={saveHeading} disabled={savingHeading} className={btnPrimaryCls + ' self-start'}>
                    {savingHeading ? 'Saving…' : 'Save Heading'}
                </button>
            </div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Services</h2>
                <button onClick={() => { setAdding(true); setEditId(null) }} className={btnPrimaryCls}>
                    + Add New Service
                </button>
            </div>
            {adding && <ServiceForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />}
            <div className="flex flex-col gap-3 mt-4">
                {(items || []).map(item => (
                    <div key={item.id} className="dark:bg-zinc-900 bg-white border border-border rounded-[12px] shadow-sm">
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-4">
                                <span className="dark:text-[#555555] text-gray-400 font-body text-[13px] w-6">{item.number}</span>
                                <span className="font-heading font-semibold text-[16px] dark:text-white text-gray-900">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => toggleActive(item)} className={`text-[11px] font-body font-semibold px-2.5 py-1 rounded-full border transition-colors
                                    ${item.is_active ? 'text-accent border-accent/25 bg-accent/7' : 'dark:text-[#555555] text-gray-400 border-border'}`}>
                                    {item.is_active ? 'Active' : 'Inactive'}
                                </button>
                                <button onClick={() => { setEditId(editId === item.id ? null : item.id); setAdding(false) }} className="text-[13px] font-body dark:text-[#888888] text-gray-500 dark:hover:text-text hover:text-gray-900 transition-colors">Edit</button>
                                <button onClick={() => setConfirm(item.id)} className="text-[13px] font-body dark:text-[#555555] text-gray-400 hover:text-red-400 transition-colors">Delete</button>
                            </div>
                        </div>
                        {editId === item.id && <div className="px-5 pb-5"><ServiceForm initial={fromItem(item)} onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} /></div>}
                    </div>
                ))}
                {items.length === 0 && <p className="dark:text-[#555555] text-gray-400 font-body text-[14px]">No services yet.</p>}
            </div>
        </div>
    )
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────
function ReelForm({ initial, projectId, onSave, onCancel, saving }) {
    const [f, setF] = useState(initial || {
        title: '', caption: '', video_url: '', drive_url: '',
        youtube_url: '', instagram_url: '', thumbnail_url: '',
        sort_order: 0, is_active: true
    })
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [uploadingThumb, setUploadingThumb] = useState(false)

    const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0]
        if (!file) return

        const isVideo = type === 'video'
        const setUploading = isVideo ? setUploadingVideo : setUploadingThumb
        const fieldKey = isVideo ? 'video_url' : 'thumbnail_url'

        try {
            setUploading(true)
            // Flat filename — uploaded directly to portfolio-media bucket root
            const ext = file.name.split('.').pop().toLowerCase()
            const prefix = isVideo ? 'reel-video' : 'reel-thumb'
            const fileName = `${prefix}-${Date.now()}.${ext}`

            const url = await uploadFile(fileName, file)
            set(fieldKey, url)
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Upload failed: ' + err.message)
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const toDb = () => ({
        project_id: projectId,
        title: f.title, caption: f.caption, video_url: f.video_url,
        drive_url: f.drive_url, youtube_url: f.youtube_url,
        instagram_url: f.instagram_url, thumbnail_url: f.thumbnail_url,
        sort_order: Number(f.sort_order), is_active: f.is_active
    })
    return (
        <div className="dark:bg-zinc-900 bg-gray-100 border border-border rounded-[10px] p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
                <Field label="Title" id={`reel-title-${f.title || 'new'}`}><input id={`reel-title-${f.title || 'new'}`} className={inputCls} value={f.title} onChange={e => set('title', e.target.value)} placeholder="Reel title..." /></Field>
                <Field label="Sort Order" id={`reel-sort-${f.title || 'new'}`}><input id={`reel-sort-${f.title || 'new'}`} type="number" className={inputCls} value={f.sort_order} onChange={e => set('sort_order', e.target.value)} /></Field>
            </div>
            <Field label="Caption" id={`reel-caption-${f.title || 'new'}`}><textarea id={`reel-caption-${f.title || 'new'}`} rows={2} className={inputCls + ' resize-none'} value={f.caption} onChange={e => set('caption', e.target.value)} placeholder="Short caption..." /></Field>
            <Field label="Video URL (MP4)" id={`reel-video-url-${f.title || 'new'}`}>
                <div className="flex gap-2">
                    <input id={`reel-video-url-${f.title || 'new'}`} className={inputCls} value={f.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://..." />
                    <label htmlFor={`upload-video-${f.title}`} className={`shrink-0 flex items-center justify-center px-4 rounded-[8px] border font-body text-[13px] font-semibold cursor-pointer transition-all ${uploadingVideo ? 'border-border dark:bg-zinc-800 bg-gray-100 dark:text-[#555] text-gray-400 cursor-not-allowed' : 'border-accent/20 bg-accent/5 text-accent hover:bg-accent hover:text-white dark:hover:text-black'}`}>
                        {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                        <input id={`upload-video-${f.title}`} type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => handleFileUpload(e, 'video')} disabled={uploadingVideo} />
                    </label>
                </div>
                {/* Reel Preview — appears immediately after upload auto-fills the URL */}
                {f.video_url && (
                    <div className="mt-2 rounded-[8px] overflow-hidden border border-border bg-black aspect-[9/16] max-w-[120px]">
                        <video
                            key={f.video_url}
                            src={f.video_url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <track kind="captions" />
                        </video>
                    </div>
                )}
            </Field>
            <Field label="Google Drive URL" id={`reel-drive-${f.title || 'new'}`}><input id={`reel-drive-${f.title || 'new'}`} className={inputCls} value={f.drive_url} onChange={e => set('drive_url', e.target.value)} placeholder="https://drive.google.com/..." /></Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="YouTube URL" id={`reel-yt-${f.title || 'new'}`}><input id={`reel-yt-${f.title || 'new'}`} className={inputCls} value={f.youtube_url || ''} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/..." /></Field>
                <Field label="Instagram URL" id={`reel-ig-${f.title || 'new'}`}><input id={`reel-ig-${f.title || 'new'}`} className={inputCls} value={f.instagram_url || ''} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/..." /></Field>
            </div>
            <Field label="Thumbnail URL" id={`reel-thumb-url-${f.title || 'new'}`}>
                <div className="flex gap-2">
                    <input id={`reel-thumb-url-${f.title || 'new'}`} className={inputCls} value={f.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} placeholder="https://..." />
                    <label htmlFor={`upload-thumb-${f.title}`} className={`shrink-0 flex items-center justify-center px-4 rounded-[8px] border font-body text-[13px] font-semibold cursor-pointer transition-all ${uploadingThumb ? 'border-border dark:bg-zinc-800 bg-gray-100 dark:text-[#555] text-gray-400 cursor-not-allowed' : 'border-accent/20 bg-accent/5 text-accent hover:bg-accent hover:text-white dark:hover:text-black'}`}>
                        {uploadingThumb ? 'Uploading...' : 'Upload Image'}
                        <input id={`upload-thumb-${f.title}`} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'thumb')} disabled={uploadingThumb} />
                    </label>
                </div>
                {/* Thumbnail preview */}
                {f.thumbnail_url && (
                    <img src={f.thumbnail_url} alt="thumb preview" width={120} height={80} className="mt-2 rounded-[8px] max-h-[80px] object-cover border border-border" />
                )}
            </Field>
            <label htmlFor={`reel-active-${f.title || 'new'}`} className="flex items-center gap-2 cursor-pointer">
                <input id={`reel-active-${f.title || 'new'}`} type="checkbox" checked={f.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-accent w-4 h-4" />
                <span className="font-body text-[13px] dark:text-white text-gray-900">Active</span>
            </label>
            <div className="flex gap-2">
                <button onClick={() => onSave(toDb())} disabled={saving} className={btnPrimaryCls}>{saving ? 'Saving…' : 'Save Reel'}</button>
                <button onClick={onCancel} className={btnSecondaryCls}>Cancel</button>
            </div>
        </div>
    )
}

function ReelsManager({ projectId }) {
    const [reels, setReels] = useState([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [editId, setEditId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [confirm, setConfirm] = useState(null)

    const load = useCallback(async () => {
        const { data } = await supabase.from('project_reels').select('*').eq('project_id', projectId).order('sort_order')
        setReels(data || [])
        setLoading(false)
    }, [projectId])
    useEffect(() => { load() }, [load])

    const handleAdd = async (data) => {
        setSaving(true)
        const { error } = await supabase.from('project_reels').insert([data])
        setSaving(false)
        if (error) { alert('Failed to add reel: ' + error.message); return }
        setAdding(false)
        load()
    }

    const handleEdit = async (data) => {
        setSaving(true)
        const { error } = await supabase
            .from('project_reels')
            .update({
                title: data.title,
                caption: data.caption,
                video_url: data.video_url,
                thumbnail_url: data.thumbnail_url,
                drive_url: data.drive_url,
                youtube_url: data.youtube_url,
                instagram_url: data.instagram_url,
                sort_order: data.sort_order,
                is_active: data.is_active,
            })
            .eq('id', editId)
        setSaving(false)
        if (error) { alert('Failed to save reel: ' + error.message); return }
        setEditId(null)
        load()
    }

    const handleDelete = async (id) => {
        const { error } = await supabase.from('project_reels').delete().eq('id', id)
        if (error) { alert('Delete failed: ' + error.message); return }
        setConfirm(null)
        load()
    }

    if (loading) return <div className="h-10 bg-bg-3 rounded animate-pulse" />
    return (
        <div className="flex flex-col gap-3">
            {confirm && <ConfirmModal message="Delete this reel?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-body font-semibold text-accent uppercase tracking-widest">Project Reels ({reels.length})</p>
                <button onClick={() => { setAdding(true); setEditId(null) }} className={btnPrimaryCls}>+ Add Reel</button>
            </div>
            {adding && <ReelForm projectId={projectId} onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />}
            <div className="flex flex-col gap-2">
                {(reels || []).map(reel => (
                    <div key={reel.id} className="dark:bg-zinc-900 bg-white border border-border rounded-[8px] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Inline video preview */}
                                {reel.video_url ? (
                                    <div className="shrink-0 w-[40px] h-[70px] rounded-[6px] overflow-hidden border border-border bg-black">
                                        <video
                                            src={reel.video_url}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        >
                                            <track kind="captions" />
                                        </video>
                                    </div>
                                ) : (
                                    <div className="shrink-0 w-[40px] h-[70px] rounded-[6px] border border-dashed border-border dark:bg-zinc-800 bg-gray-100 flex items-center justify-center">
                                        <span className="text-[16px]">🎬</span>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-heading font-semibold text-[13px] dark:text-white text-gray-900 truncate">{reel.title || 'Untitled Reel'}</p>
                                    <p className="text-[11px] dark:text-[#555555] text-gray-400 font-body mt-0.5 truncate">{reel.caption || '—'}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <span className={`text-[11px] font-body px-2 py-0.5 rounded-full border ${reel.is_active ? 'text-accent border-accent/25' : 'dark:text-[#555555] text-gray-400 border-border'}`}>{reel.is_active ? 'Active' : 'Off'}</span>
                                <button onClick={() => { setEditId(editId === reel.id ? null : reel.id); setAdding(false) }} className="text-[12px] font-body dark:text-[#888888] text-gray-500 dark:hover:text-white hover:text-gray-900">Edit</button>
                                <button onClick={() => setConfirm(reel.id)} className="text-[12px] font-body dark:text-[#555555] text-gray-400 hover:text-red-400">Del</button>
                            </div>
                        </div>
                        {editId === reel.id && (
                            <div className="mt-3">
                                <ReelForm initial={reel} projectId={projectId} onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} />
                            </div>
                        )}
                    </div>
                ))}
                {reels.length === 0 && !adding && <p className="text-[12px] dark:text-[#555555] text-gray-400 font-body">No reels yet. Add your first reel.</p>}
            </div>
        </div>
    )
}

function ProjectForm({ initial, onSave, onCancel, saving }) {
    const [showReels, setShowReels] = useState(false)
    const [f, setF] = useState(() => {
        const base = initial || {
            category: '', title: '', slug: '', client_name: '', role: '', description: '', full_content: '',
            full_description: '', results: '', services_provided: '',
            gradient: '', emoji: '', sort_order: 0, is_active: true, is_cta: false,
            thumbnail_url: '', video_url: '', profile_url: '', featured_reel_id: '', gallery_urls: []
        }
        return {
            ...base,
            full_description: base.full_description || '',
            results: base.results || '',
            services_provided: Array.isArray(base.services_provided)
                ? base.services_provided.join(', ')
                : (base.services_provided || ''),
            thumbnail_url: base.thumbnail_url || '',
            video_url: base.video_url || '',
            profile_url: base.profile_url || '',
            featured_reel_id: base.featured_reel_id || ''
        }
    })

    const [formReels, setFormReels] = useState([])
    useEffect(() => {
        if (f.id) {
            supabase.from('project_reels').select('*').eq('project_id', f.id).order('sort_order', { ascending: true })
                .then(({ data }) => setFormReels(data || []))
        }
    }, [f.id])

    // Auto-generate slug from title if slug is empty or user is typing title for a new project
    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setF(prev => ({
            ...prev,
            title: newTitle,
            slug: (!initial || !initial.id) ? autoSlug : prev.slug
        }));
    }

    const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
    return (
        <div className={cardCls + ' flex flex-col gap-6 mt-3'}>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Category" id="proj-cat"><input id="proj-cat" className={inputCls} value={f.category} onChange={e => set('category', e.target.value)} /></Field>
                <Field label="Emoji" id="proj-emoji"><input id="proj-emoji" className={inputCls} value={f.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🎬" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Title" id="proj-title"><input id="proj-title" className={inputCls} value={f.title} onChange={handleTitleChange} /></Field>
                <Field label="Slug" id="proj-slug" sub="For /work/slug URL"><input id="proj-slug" className={inputCls} value={f.slug} onChange={e => set('slug', e.target.value)} placeholder="my-project" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Client Name" id="proj-client"><input id="proj-client" className={inputCls} value={f.client_name || ''} onChange={e => set('client_name', e.target.value)} /></Field>
                <Field label="Role" id="proj-role"><input id="proj-role" className={inputCls} value={f.role || ''} onChange={e => set('role', e.target.value)} placeholder="Lead Editor" /></Field>
            </div>
            <Field label="Short Description" id="proj-desc" sub="For the carousel card"><textarea id="proj-desc" rows={2} className={inputCls + ' resize-none'} value={f.description} onChange={e => set('description', e.target.value)} /></Field>
            <Field label="Full Content" id="proj-full" sub="For the dedicated project page"><textarea id="proj-full" rows={6} className={inputCls + ' resize-none'} value={f.full_content || ''} onChange={e => set('full_content', e.target.value)} placeholder="Detailed project breakdown..." /></Field>
            <Field label="Full Page Description" id="proj-full-desc" sub="Shown on the /work/slug page (overrides Full Content if set)"><textarea id="proj-full-desc" rows={4} className={inputCls + ' resize-none'} value={f.full_description} onChange={e => set('full_description', e.target.value)} placeholder="Detailed description for the project page..." /></Field>
            <Field label="Results / Outcome" id="proj-results" sub="Shown below description on project page"><textarea id="proj-results" rows={2} className={inputCls + ' resize-none'} value={f.results} onChange={e => set('results', e.target.value)} placeholder="2M+ views, 300% ROAS, 50K new followers..." /></Field>
            <Field label="Services Provided" id="proj-services" sub="Comma-separated list"><input id="proj-services" className={inputCls} value={f.services_provided} onChange={e => set('services_provided', e.target.value)} placeholder="Video Editing, Color Grading, Motion Graphics" /></Field>
            <Field label="Gradient CSS" id="proj-grad"><input id="proj-grad" className={inputCls} value={f.gradient} onChange={e => set('gradient', e.target.value)} placeholder="linear-gradient(135deg, #111, #222)" /></Field>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Sort Order" id="proj-sort"><input id="proj-sort" type="number" className={inputCls} value={f.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
            </div>
            <div className="flex gap-6">
                <label htmlFor="proj-active" className="flex items-center gap-2 cursor-pointer">
                    <input id="proj-active" type="checkbox" checked={f.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-accent w-4 h-4" />
                    <span className="font-body text-[14px] dark:text-white text-gray-900">Active</span>
                </label>
                <label htmlFor="proj-cta" className="flex items-center gap-2 cursor-pointer">
                    <input id="proj-cta" type="checkbox" checked={f.is_cta} onChange={e => set('is_cta', e.target.checked)} className="accent-accent w-4 h-4" />
                    <span className="font-body text-[14px] dark:text-white text-gray-900">Is CTA card</span>
                </label>
            </div>

            {f.id ? (
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border mt-2">
                    <MediaUpload
                        label="Project Thumbnail"
                        bucket="portfolio-media"
                        path={`projects/${f.id}-thumb.[ext]`}
                        currentUrl={f.thumbnail_url}
                        onSave={url => set('thumbnail_url', url)}
                        accept="image/*"
                        previewShape="phone"
                    />
                    <MediaUpload
                        label="Project Video (Reel)"
                        bucket="portfolio-media"
                        path={`projects/${f.id}-video.[ext]`}
                        currentUrl={f.video_url}
                        onSave={url => set('video_url', url)}
                        accept="video/*"
                        previewShape="rect"
                    />
                </div>
            ) : (
                <div className="pt-4 border-t border-border mt-2">
                    <p className="text-[12px] dark:text-[#888] text-gray-400 font-body">Save this project first to upload media (thumbnails & videos).</p>
                </div>
            )}

            <div className="pt-4 border-t border-border mt-2 flex flex-col gap-3">
                <p className="text-[11px] font-body font-semibold text-accent uppercase tracking-widest">Media Links</p>
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-body font-bold dark:text-[#888] text-gray-500 uppercase tracking-wider">Instagram Profile URL</label>
                    <input
                        type="text"
                        className={inputCls}
                        value={f.profile_url || ''}
                        onChange={e => set('profile_url', e.target.value)}
                        placeholder="https://instagram.com/client_brand"
                    />
                </div>
                {f.id && (
                    <div className="flex flex-col gap-2 mt-2">
                        <label className="text-[11px] font-body font-bold dark:text-[#888] text-gray-500 uppercase tracking-wider">Featured Reel (Homepage Preview)</label>
                        <select
                            className={inputCls}
                            value={f.featured_reel_id || ''}
                            onChange={e => set('featured_reel_id', e.target.value)}
                        >
                            <option value="">-- Generic Project Video --</option>
                            {formReels.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.title || 'Untitled Reel'} ({r.video_url?.split('/').pop()})
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] dark:text-[#555] text-gray-400 mt-1 italic">
                            * Recommended: Selected reel's video and thumbnail will be used on the homepage cards.
                        </p>
                    </div>
                )}
            </div>

            {f.id && (
                <div className="pt-4 border-t border-border mt-2">
                    <button
                        type="button"
                        onClick={() => setShowReels(prev => !prev)}
                        className="text-[12px] font-body font-semibold text-accent uppercase tracking-widest hover:opacity-70 mb-3"
                    >
                        {showReels ? '▲ Hide Reels Manager' : '▼ Manage Reels'}
                    </button>
                    {showReels && <ReelsManager projectId={f.id} />}
                </div>
            )}

            <div className="flex gap-3 mt-2">
                <button onClick={() => onSave(f)} disabled={saving} className={btnPrimaryCls}>{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={onCancel} className={btnSecondaryCls}>Cancel</button>
            </div>
        </div>
    )
}

function ProjectsTab({ showToast }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [editId, setEditId] = useState(null)
    const [adding, setAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [confirm, setConfirm] = useState(null)
    const [hasMoved, setHasMoved] = useState(false)

    const load = useCallback(async () => {
        const { data } = await supabase.from('projects').select('*').order('sort_order', { ascending: true })
        console.log("Fetched Projects (Admin):", data)
        setItems(data || []); setLoading(false)
    }, [])
    useEffect(() => { load() }, [load])

    const toDb = (f) => ({
        category: f.category, title: f.title, slug: f.slug, client_name: f.client_name,
        role: f.role, description: f.description, full_content: f.full_content,
        full_description: f.full_description || null, results: f.results || null,
        services_provided: f.services_provided ? f.services_provided.split(',').map(s => s.trim()).filter(Boolean) : [],
        gradient: f.gradient, emoji: f.emoji, sort_order: Number(f.sort_order),
        is_active: f.is_active, is_cta: f.is_cta,
        thumbnail_url: f.thumbnail_url || null,
        video_url: f.video_url || null,
        profile_url: f.profile_url || null,
        featured_reel_id: f.featured_reel_id || null,
        gallery_urls: f.gallery_urls || []
    })
    const handleAdd = async (f) => {
        setSaving(true)
        const payload = toDb(f)
        console.log('[ProjectsTab] INSERT payload:', payload)
        const { error } = await supabase.from('projects').insert([payload])
        setSaving(false)
        if (error) { console.error('[ProjectsTab] INSERT error:', error); showToast('Save failed: ' + error.message, 'error'); return }
        setAdding(false); showToast('Project added!'); load()
    }
    const handleEdit = async (f) => {
        setSaving(true)
        const payload = toDb(f)
        console.log('[ProjectsTab] UPDATE payload:', payload)
        const { error } = await supabase.from('projects').update(payload).eq('id', editId)
        setSaving(false)
        if (error) { console.error('[ProjectsTab] UPDATE error:', error); showToast('Save failed: ' + error.message, 'error'); return }
        setEditId(null); showToast('Saved!'); load()
    }
    const handleDelete = async (id) => { await supabase.from('projects').delete().eq('id', id); setConfirm(null); showToast('Deleted!', 'error'); load() }

    const handleMove = (index, direction) => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === items.length - 1) return
        const newItems = [...items]
        const swapIndex = direction === 'up' ? index - 1 : index + 1
            ;[newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]]
        setItems(newItems)
        setHasMoved(true)
    }

    const saveSequence = async () => {
        setSaving(true)
        await Promise.all(
            items.map((item, index) =>
                supabase.from('projects').update({ sort_order: index }).eq('id', item.id)
            )
        )
        setSaving(false)
        setHasMoved(false)
        showToast('Sequence saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[300px] animate-pulse" />

    return (
        <div>
            {confirm && <ConfirmModal message="Delete this project?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Projects</h2>
                <div className="flex items-center gap-3">
                    {hasMoved && (
                        <button
                            onClick={saveSequence}
                            disabled={saving}
                            className="bg-accent text-bg px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider animate-pulse disabled:animate-none disabled:opacity-60"
                        >
                            💾 Save Sequence
                        </button>
                    )}
                    <button onClick={() => { setAdding(true); setEditId(null) }} className={btnPrimaryCls}>+ Add New Project</button>
                </div>
            </div>
            {adding && <ProjectForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />}
            <div className="flex flex-col gap-3 mt-4">
                {(items || []).map((item, index) => (
                    <div key={item.id} className="dark:bg-zinc-900 bg-white border border-border rounded-[12px] shadow-sm">
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[28px]">{item.emoji}</span>
                                <div>
                                    <div className="font-heading font-semibold text-[15px] dark:text-white text-gray-900">{item.title}</div>
                                    <div className="text-[12px] dark:text-[#555555] text-gray-400 font-body">{item.category}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col mr-1">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="text-[10px] dark:text-[#555555] text-gray-400 dark:hover:text-white hover:text-gray-900 disabled:opacity-20 disabled:cursor-not-allowed leading-none px-1 py-0.5"
                                        aria-label="Move project up"
                                    >▲</button>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === items.length - 1}
                                        className="text-[10px] dark:text-[#555555] text-gray-400 dark:hover:text-white hover:text-gray-900 disabled:opacity-20 disabled:cursor-not-allowed leading-none px-1 py-0.5"
                                        aria-label="Move project down"
                                    >▼</button>
                                </div>
                                {item.is_cta && <span className="text-[11px] font-body font-semibold px-2 py-0.5 rounded border border-border dark:text-[#555555] text-gray-400">CTA</span>}
                                <span className={`text-[11px] font-body font-semibold px-2.5 py-1 rounded-full border ${item.is_active ? 'text-accent border-accent/25 bg-accent/7' : 'dark:text-[#555555] text-gray-400 border-border'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                                <button onClick={() => { setEditId(editId === item.id ? null : item.id); setAdding(false) }} className="text-[13px] font-body dark:text-[#888888] text-gray-500 dark:hover:text-text hover:text-gray-900">Edit</button>
                                <button onClick={() => setConfirm(item.id)} className="text-[13px] font-body dark:text-[#555555] text-gray-400 hover:text-red-400">Delete</button>
                            </div>
                        </div>
                        {editId === item.id && <div className="px-5 pb-5"><ProjectForm initial={item} onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} /></div>}
                    </div>
                ))}
                {items.length === 0 && <p className="dark:text-[#555555] text-gray-400 font-body text-[14px]">No projects yet.</p>}
            </div>
        </div>
    )
}

// ─── Testimonials Tab ─────────────────────────────────────────────────────────
function TestimonialForm({ initial, onSave, onCancel, saving }) {
    const [f, setF] = useState(initial || { quote: '', author_name: '', author_role: '', author_initial: '', photo_url: '', stars: 5, sort_order: 0, is_active: true })
    const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
    return (
        <div className={cardCls + ' flex flex-col gap-6 mt-3'}>
            <Field label="Quote" id="test-quote"><textarea id="test-quote" rows={4} className={inputCls + ' resize-none'} value={f.quote} onChange={e => set('quote', e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Author Name" id="test-name"><input id="test-name" className={inputCls} value={f.author_name} onChange={e => set('author_name', e.target.value)} /></Field>
                <Field label="Author Initial" id="test-init"><input id="test-init" className={inputCls} value={f.author_initial} onChange={e => set('author_initial', e.target.value)} maxLength={2} /></Field>
            </div>
            <Field label="Author Role" id="test-role"><input id="test-role" className={inputCls} value={f.author_role} onChange={e => set('author_role', e.target.value)} /></Field>

            {f.id ? (
                <div className="pt-4 border-t border-[rgba(255,255,255,0.055)] mt-2">
                    <MediaUpload
                        label="Author Photo"
                        bucket="portfolio-media"
                        path={`testimonials/${f.id}-photo.[ext]`}
                        currentUrl={f.photo_url}
                        onSave={url => set('photo_url', url)}
                        accept="image/*"
                        previewShape="circle"
                    />
                </div>
            ) : (
                <div className="pt-4 border-t border-[rgba(255,255,255,0.055)] mt-2">
                    <p className="text-[12px] text-[#888] font-body">Save this testimonial first to upload a photo.</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <Field label="Stars (1–5)" id="test-stars">
                    <select id="test-stars" className={inputCls} value={f.stars} onChange={e => set('stars', Number(e.target.value))}>
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </Field>
                <Field label="Sort Order" id="test-sort"><input id="test-sort" type="number" className={inputCls} value={f.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
            </div>
            <label htmlFor="test-active" className="flex items-center gap-2 cursor-pointer mt-2">
                <input id="test-active" type="checkbox" checked={f.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-accent w-4 h-4" />
                <span className="font-body text-[14px] dark:text-white text-gray-900">Active</span>
            </label>
            <div className="flex gap-3 mt-2">
                <button onClick={() => onSave(f)} disabled={saving} className={btnPrimaryCls}>{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={onCancel} className={btnSecondaryCls}>Cancel</button>
            </div>
        </div>
    )
}

function TestimonialsTab({ showToast }) {
    const [items, setItems] = useState([])
    const [testimonialsHeading, setTestimonialsHeading] = useState('')
    const [loading, setLoading] = useState(true)
    const [editId, setEditId] = useState(null)
    const [adding, setAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savingHeading, setSavingHeading] = useState(false)
    const [confirm, setConfirm] = useState(null)

    const load = useCallback(async () => {
        const [{ data }, content] = await Promise.all([
            supabase.from('testimonials').select('*').order('sort_order', { ascending: true }),
            loadSiteContentFields(['testimonials_heading']),
        ])
        setItems(data || [])
        setTestimonialsHeading(content?.testimonials_heading || '')
        setLoading(false)
    }, [])
    useEffect(() => { load() }, [load])

    const toDb = (f) => ({ quote: f.quote, author_name: f.author_name, author_role: f.author_role, author_initial: f.author_initial, photo_url: f.photo_url, stars: Number(f.stars), sort_order: Number(f.sort_order), is_active: f.is_active })
    const handleAdd = async (f) => { setSaving(true); await supabase.from('testimonials').insert([toDb(f)]); setSaving(false); setAdding(false); showToast('Testimonial added!'); load() }
    const handleEdit = async (f) => { setSaving(true); await supabase.from('testimonials').update(toDb(f)).eq('id', editId); setSaving(false); setEditId(null); showToast('Saved!'); load() }
    const handleDelete = async (id) => { await supabase.from('testimonials').delete().eq('id', id); setConfirm(null); showToast('Deleted!', 'error'); load() }
    const saveHeading = async () => {
        setSavingHeading(true)
        const { error } = await saveSiteContentPatch({ testimonials_heading: testimonialsHeading })
        setSavingHeading(false)
        if (error) showToast('Heading save failed: ' + error.message, 'error')
        else showToast('Testimonials heading saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[300px] animate-pulse" />

    return (
        <div>
            {confirm && <ConfirmModal message="Delete this testimonial?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
            <div className={cardCls + ' mb-6 flex flex-col gap-4'}>
                <Field label="Testimonials Section Heading" id="test-h">
                    <textarea id="test-h" rows={2} className={inputCls + ' resize-none'} value={testimonialsHeading || ''} onChange={e => setTestimonialsHeading(e.target.value)} />
                </Field>
                <button onClick={saveHeading} disabled={savingHeading} className={btnPrimaryCls + ' self-start'}>
                    {savingHeading ? 'Saving…' : 'Save Heading'}
                </button>
            </div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Testimonials</h2>
                <button onClick={() => { setAdding(true); setEditId(null) }} className={btnPrimaryCls}>+ Add Testimonial</button>
            </div>
            {adding && <TestimonialForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />}
            <div className="flex flex-col gap-3 mt-4">
                {(items || []).map(item => (
                    <div key={item.id} className="dark:bg-zinc-900 bg-white border border-border rounded-[12px] shadow-sm">
                        <div className="flex items-start justify-between px-5 py-4">
                            <div className="flex-1 pr-4">
                                <p className="font-body text-[13px] dark:text-[#888888] text-gray-500 italic leading-[1.7] line-clamp-2">"{item.quote}"</p>
                                <p className="font-heading font-semibold text-[13px] dark:text-white text-gray-900 mt-2">{item.author_name} <span className="dark:text-[#555555] text-gray-400 font-body font-normal">· {item.author_role}</span></p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[11px] font-body font-semibold px-2.5 py-1 rounded-full border ${item.is_active ? 'text-accent border-accent/25 bg-accent/7' : 'dark:text-[#555555] text-gray-400 border-border'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                                <button onClick={() => { setEditId(editId === item.id ? null : item.id); setAdding(false) }} className="text-[13px] font-body dark:text-[#888888] text-gray-500 dark:hover:text-text hover:text-gray-900">Edit</button>
                                <button onClick={() => setConfirm(item.id)} className="text-[13px] font-body dark:text-[#555555] text-gray-400 hover:text-red-400">Delete</button>
                            </div>
                        </div>
                        {editId === item.id && <div className="px-5 pb-5"><TestimonialForm initial={item} onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} /></div>}
                    </div>
                ))}
                {items.length === 0 && <p className="dark:text-[#555555] text-gray-400 font-body text-[14px]">No testimonials yet.</p>}
            </div>
        </div>
    )
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────
function ClientForm({ initial, onSave, onCancel, saving }) {
    const [f, setF] = useState(initial || {
        name: '', type: '', logo_url: '', logo_light_url: '', logo_dark_url: '',
        use_same_logo: false, sort_order: 0,
        is_active: true, is_cta: false
    })
    const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))
    return (
        <div className={cardCls + ' flex flex-col gap-6 mt-3'}>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Name" id="client-name"><input id="client-name" className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} /></Field>
                <Field label="Type" id="client-type"><input id="client-type" className={inputCls} value={f.type} onChange={e => set('type', e.target.value)} placeholder="Brand, Agency, etc." /></Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border mt-2">
                <MediaUpload
                    label="Light Theme Logo"
                    bucket="portfolio-media"
                    path={`clients/${f.id || 'new'}-logo-light.[ext]`}
                    currentUrl={f.logo_light_url || f.logo_url}
                    onSave={url => set('logo_light_url', url)}
                    accept="image/*"
                    previewShape="logo"
                />
                {!f.use_same_logo && (
                    <MediaUpload
                        label="Dark Theme Logo"
                        bucket="portfolio-media"
                        path={`clients/${f.id || 'new'}-logo-dark.[ext]`}
                        currentUrl={f.logo_dark_url}
                        onSave={url => set('logo_dark_url', url)}
                        accept="image/*"
                        previewShape="logo"
                    />
                )}
            </div>
            <label htmlFor="client-use-same" className="flex items-center gap-3 cursor-pointer mt-4 mb-4">
                <input id="client-use-same" type="checkbox" checked={f.use_same_logo} onChange={e => set('use_same_logo', e.target.checked)} className="accent-accent w-4 h-4" />
                <span className="font-body text-[14px] dark:text-white text-gray-900">Use same logo on both themes</span>
            </label>


            <div className="grid grid-cols-2 gap-4">
                <Field label="Sort Order" id="client-sort"><input id="client-sort" type="number" className={inputCls} value={f.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
            </div>
            <div className="flex gap-6">
                <label htmlFor="client-active" className="flex items-center gap-2 cursor-pointer">
                    <input id="client-active" type="checkbox" checked={f.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-accent w-4 h-4" />
                    <span className="font-body text-[14px] dark:text-white text-gray-900">Active</span>
                </label>
                <label htmlFor="client-is-cta" className="flex items-center gap-2 cursor-pointer">
                    <input id="client-is-cta" type="checkbox" checked={f.is_cta} onChange={e => set('is_cta', e.target.checked)} className="accent-accent w-4 h-4" />
                    <span className="font-body text-[14px] dark:text-white text-gray-900">Is CTA</span>
                </label>
            </div>
            <div className="flex gap-3 mt-2">
                <button onClick={() => onSave(f)} disabled={saving} className={btnPrimaryCls}>{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={onCancel} className={btnSecondaryCls}>Cancel</button>
            </div>
        </div>
    )
}

function ClientsTab({ showToast }) {
    const [items, setItems] = useState([])
    const [marqueeHeading, setMarqueeHeading] = useState('')
    const [loading, setLoading] = useState(true)
    const [editId, setEditId] = useState(null)
    const [adding, setAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savingHeading, setSavingHeading] = useState(false)
    const [confirm, setConfirm] = useState(null)

    const load = useCallback(async () => {
        const [{ data }, content] = await Promise.all([
            supabase.from('clients').select('*').order('sort_order', { ascending: true }),
            loadSiteContentFields(['marquee_heading']),
        ])
        setItems(data || [])
        setMarqueeHeading(content?.marquee_heading || '')
        setLoading(false)
    }, [])
    useEffect(() => { load() }, [load])

    const toDb = (f) => ({
        name: f.name, type: f.type,
        logo_url: f.logo_light_url || f.logo_url,
        logo_light_url: f.logo_light_url,
        logo_dark_url: f.use_same_logo ? f.logo_light_url : f.logo_dark_url,
        use_same_logo: f.use_same_logo,
        sort_order: Number(f.sort_order), is_active: f.is_active, is_cta: f.is_cta
    })
    const handleAdd = async (f) => {
        setSaving(true)
        try {
            const { data, error } = await supabase.from('clients').insert([toDb(f)]).select()
            if (error) throw error

            const newClient = data?.[0]
            if (newClient) {
                setItems(currentItems => {
                    const updated = [...currentItems, newClient]
                    return updated.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
                })
                setAdding(false)
                showToast('Client added!')
            } else {
                // Fallback if no data returned
                await load()
                setAdding(false)
                showToast('Client added!')
            }
        } catch (err) {
            console.error('[Clients] Add error:', err)
            showToast('Error: ' + err.message, 'error')
        } finally {
            setSaving(false)
        }
    }
    const handleEdit = async (f) => { setSaving(true); await supabase.from('clients').update(toDb(f)).eq('id', editId); setSaving(false); setEditId(null); showToast('Saved!'); load() }
    const handleDelete = async (id) => { await supabase.from('clients').delete().eq('id', id); setConfirm(null); showToast('Deleted!', 'error'); load() }
    const saveHeading = async () => {
        setSavingHeading(true)
        const { error } = await saveSiteContentPatch({ marquee_heading: marqueeHeading })
        setSavingHeading(false)
        if (error) showToast('Heading save failed: ' + error.message, 'error')
        else showToast('Marquee heading saved!')
    }

    if (loading) return <div className="dark:bg-zinc-900 bg-white rounded-[16px] h-[300px] animate-pulse" />

    return (
        <div>
            {confirm && <ConfirmModal message="Delete this client?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
            <div className={cardCls + ' mb-6 flex flex-col gap-4'}>
                <Field label="Marquee Heading" id="marq-h">
                    <textarea id="marq-h" rows={2} className={inputCls + ' resize-none'} value={marqueeHeading || ''} onChange={e => setMarqueeHeading(e.target.value)} />
                </Field>
                <button onClick={saveHeading} disabled={savingHeading} className={btnPrimaryCls + ' self-start'}>
                    {savingHeading ? 'Saving…' : 'Save Heading'}
                </button>
            </div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Clients</h2>
                <button onClick={() => { setAdding(true); setEditId(null) }} className={btnPrimaryCls}>+ Add Client</button>
            </div>
            {adding && <ClientForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />}
            <div className="flex flex-col gap-3 mt-4">
                {(items || []).map(item => (
                    <div key={item.id} className="glass border border-[rgba(255,255,255,0.08)] rounded-[12px]">
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-4">
                                {item.logo_url
                                    ? <img src={item.logo_url} alt={item.name} width={80} height={32} style={{ height: 32 }} className="object-contain" />
                                    : <div className="w-8 h-8 rounded-full dark:bg-zinc-800 bg-gray-100 flex items-center justify-center font-heading font-bold text-[14px] text-[#888888]">{item.name?.[0]}</div>
                                }
                                <div>
                                    <div className="font-heading font-semibold text-[15px] dark:text-white text-gray-900">{item.name}</div>
                                    <div className="text-[12px] text-[#555555] font-body">{item.type}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {item.is_cta && <span className="text-[11px] font-body font-semibold px-2 py-0.5 rounded border border-border text-[#555555]">CTA</span>}
                                <span className={`text-[11px] font-body font-semibold px-2.5 py-1 rounded-full border ${item.is_active ? 'text-accent border-accent/25 bg-accent/7' : 'text-[#555555] border-[rgba(255,255,255,0.055)]'}`}>{item.is_active ? 'Active' : 'Inactive'}</span>
                                <button onClick={() => { setEditId(editId === item.id ? null : item.id); setAdding(false) }} className="text-[13px] font-body text-[#888888] hover:dark:text-white text-gray-900">Edit</button>
                                <button onClick={() => setConfirm(item.id)} className="text-[13px] font-body text-[#555555] hover:text-red-400">Delete</button>
                            </div>
                        </div>
                        {editId === item.id && <div className="px-5 pb-5"><ClientForm initial={item} onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} /></div>}
                    </div>
                ))}
                {items.length === 0 && <p className="text-[#555555] font-body text-[14px]">No clients yet.</p>}
            </div>
        </div>
    )
}

// ─── Leads Tab ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['new', 'contacted', 'converted', 'archived']

function LeadsTab({ showToast }) {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
        setLeads(data || []); setLoading(false)
    }, [])
    useEffect(() => { load() }, [load])

    const updateStatus = async (id, status) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
        await supabase.from('leads').update({ status }).eq('id', id)
    }

    const exportCSV = () => {
        const headers = ['Date', 'Name', 'Email', 'Phone', 'Project Type', 'Status']
        const rows = (leads || []).map(l => [
            new Date(l.created_at).toLocaleDateString('en-IN'),
            l.name, l.email, l.phone, l.project_type, l.status
        ])
        const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return <div className="dark:bg-zinc-900 bg-white rounded-[16px] h-[400px] animate-pulse" />

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Leads</h2>
                <button onClick={exportCSV} className="px-4 h-9 border border-border text-[#888888] font-body text-[13px] rounded-[8px] hover:border-[rgba(255,255,255,0.2)] hover:dark:text-white text-gray-900 transition-colors flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    Export CSV
                </button>
            </div>

            {leads.length === 0 ? (
                <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] p-12 text-center shadow-sm">
                    <p className="dark:text-[#555555] text-gray-500 font-body text-[15px]">No leads yet. Share your portfolio!</p>
                </div>
            ) : (
                <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] overflow-auto shadow-sm">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="border-b border-border">
                                {['Date', 'Name', 'Email', 'Phone', 'Project Type', 'Status'].map(h => (
                                    <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.1em] dark:text-[#888888] text-gray-400 font-body font-semibold whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(leads || []).map(lead => (
                                <tr key={lead.id} className={`border-b border-border last:border-0 ${lead.status === 'new' ? 'bg-accent/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'} transition-colors`}>
                                    <td className="px-5 py-[14px] text-[13px] dark:text-[#555555] text-gray-400 font-body whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString('en-IN')}</td>
                                    <td className="px-5 py-[14px] text-[14px] dark:text-white text-gray-900 font-body font-medium whitespace-nowrap">{lead.name}</td>
                                    <td className="px-5 py-[14px] text-[13px] dark:text-[#888888] text-gray-500 font-body">{lead.email}</td>
                                    <td className="px-5 py-[14px] text-[13px] dark:text-[#888888] text-gray-500 font-body whitespace-nowrap">{lead.phone || '—'}</td>
                                    <td className="px-5 py-[14px] text-[13px] dark:text-[#888888] text-gray-500 font-body whitespace-nowrap">{lead.project_type}</td>
                                    <td className="px-5 py-[14px]">
                                        <label htmlFor={`lead-status-${lead.id}`} className="sr-only">Lead status</label>
                                        <select
                                            id={`lead-status-${lead.id}`}
                                            value={lead.status}
                                            onChange={e => updateStatus(lead.id, e.target.value)}
                                            className="dark:bg-bg-4 bg-gray-50 border border-border rounded-[6px] px-2 py-1 text-[12px] font-body dark:text-white text-gray-900 focus:outline-none focus:border-accent transition-colors"
                                        >
                                            {(STATUS_OPTIONS || []).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// ─── Media & Settings Tab ───────────────────────────────────────────────────
function MediaSettingsTab({ showToast }) {
    const [settings, setSettings] = useState({})
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        const { data } = await supabase.from('settings').select('*')
        const map = {}
        data?.forEach(r => map[r.key] = r.value)
        setSettings(map)
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const saveSetting = async (key, value) => {
        const { error } = await supabase
            .from('settings')
            .upsert({ key, value }, { onConflict: 'key' })
        if (error) {
            console.error('[saveSetting] error:', error)
            showToast('Save failed: ' + error.message, 'error')
            return
        }
        setSettings(prev => ({ ...prev, [key]: value }))
        showToast('Saved successfully!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[400px] animate-pulse" />

    return (
        <div className="max-w-[700px] flex flex-col gap-8">
            <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Media & Settings</h2>

            <div className="flex flex-col gap-4 pb-6 border-b border-border">
                <p className="font-heading font-semibold text-[16px] dark:text-white text-gray-900">Showreel</p>
                <Field label="YouTube URL" sub="Paste a YouTube video link — will be embedded as an iframe (priority)">
                    <div className="flex gap-2">
                        <input
                            id="showreel-yt"
                            className={inputCls + ' flex-1'}
                            value={settings.showreel_youtube_url || ''}
                            onChange={e => setSettings(prev => ({ ...prev, showreel_youtube_url: e.target.value }))}
                            placeholder="https://youtube.com/watch?v=..."
                            aria-label="YouTube URL for showreel"
                        />
                        <button
                            onClick={() => saveSetting('showreel_youtube_url', settings.showreel_youtube_url || '')}
                            className={btnPrimaryCls + ' h-10 px-4 shrink-0'}
                        >Save</button>
                    </div>
                </Field>
                <Field label="Google Drive URL" sub="Paste a Drive share link — used as fallback if no YouTube URL is set">
                    <div className="flex gap-2">
                        <input
                            id="showreel-drive"
                            className={inputCls + ' flex-1'}
                            value={settings.showreel_drive_url || ''}
                            onChange={e => setSettings(prev => ({ ...prev, showreel_drive_url: e.target.value }))}
                            placeholder="https://drive.google.com/file/d/..."
                            aria-label="Google Drive URL for showreel"
                        />
                        <button
                            onClick={() => saveSetting('showreel_drive_url', settings.showreel_drive_url || '')}
                            className={btnPrimaryCls + ' h-10 px-4 shrink-0'}
                        >Save</button>
                    </div>
                </Field>
            </div>

            <MediaUpload
                label="Navbar & Hero Avatar"
                sub="Small circular image shown in the floating navbar pill. Recommended: Square image, min 200×200px"
                bucket="images"
                path="avatars/navbar.[ext]"
                currentUrl={settings.avatar_image_url}
                onSave={url => saveSetting('avatar_image_url', url)}
                accept="image/*"
                previewShape="circle"
            />
            <p className="text-[11px] text-[#888888] -mt-4">This same image appears in the navbar pill and as your avatar throughout the site</p>

            <MediaUpload
                label="Hero Background Image"
                sub="Optional background image behind hero section"
                bucket="images"
                path="hero/bg-[ext].[ext]"
                currentUrl={settings.hero_bg_url}
                onSave={url => saveSetting('hero_bg_url', url)}
                accept="image/*"
                previewShape="rect"
            />
            <MediaUpload
                label="Hero Photo Placeholder"
                sub="The main photo on the right side of the Hero section"
                bucket="images"
                path="hero/photo-[ext].[ext]"
                currentUrl={settings.hero_photo_url}
                onSave={url => saveSetting('hero_photo_url', url)}
                accept="image/*"
                previewShape="rect"
            />
            <p className="text-[11px] text-[#888888] -mt-4">Recommended size: 1080 × 1920px (9:16 portrait ratio) · Max file size: 5MB · Format: JPG or PNG</p>

            <MediaUpload
                label="What Makes Me Different Photo"
                sub="The photo shown in the 'What makes me different' section"
                bucket="images"
                path="different/photo-[ext].[ext]"
                currentUrl={settings.different_photo_url}
                onSave={url => saveSetting('different_photo_url', url)}
                accept="image/*"
                previewShape="rect"
            />

            <MediaUpload
                label="Favicon"
                sub="Browser tab icon. Recommended: 512×512px PNG with transparent background"
                bucket="images"
                path="site/favicon.[ext]"
                currentUrl={settings.favicon_url}
                onSave={url => saveSetting('favicon_url', url)}
                accept="image/png,image/x-icon,image/svg+xml"
                previewShape="rect"
            />
        </div>
    )
}

// ─── Tools Tab ────────────────────────────────────────────────────────────────

function ToolForm({ initial, onSave, onCancel, saving }) {
    const [f, setF] = useState(initial || { name: '', category: '', emoji: '', icon_url: '', sort_order: 0, is_active: true })
    const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))

    return (
        <div className={cardCls + ' flex flex-col gap-6 mt-3'}>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Name" id="tool-name"><input id="tool-name" className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Premiere Pro" /></Field>
                <Field label="Category" id="tool-cat"><input id="tool-cat" className={inputCls} value={f.category} onChange={e => set('category', e.target.value)} placeholder="Video" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Emoji (Fallback)" id="tool-emoji"><input id="tool-emoji" className={inputCls} value={f.emoji} onChange={e => set('emoji', e.target.value)} placeholder="🎬" /></Field>
                <Field label="Sort Order" id="tool-sort"><input id="tool-sort" type="number" className={inputCls} value={f.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.055)] mt-2 flex flex-col gap-2">
                <MediaUpload
                    label="Tool Icon"
                    sub="Upload image or SVG icon. Overrides emoji if set."
                    bucket="images"
                    path={`tools/${f.id || 'new-tool'}-icon.[ext]`}
                    currentUrl={f.icon_url}
                    onSave={url => set('icon_url', url)}
                    accept="image/*,.svg"
                    previewShape="logo"
                />
            </div>

            <label htmlFor={`tool-active-${f.id || 'new'}`} className="flex items-center gap-3 cursor-pointer mt-2">
                <input id={`tool-active-${f.id || 'new'}`} type="checkbox" checked={f.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-accent w-4 h-4" />
                <span className="font-body text-[14px] dark:text-white text-gray-900">Active</span>
            </label>
            <div className="flex gap-3 mt-2">
                <button onClick={() => onSave(f)} disabled={saving} className={btnPrimaryCls}>
                    {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={onCancel} className={btnSecondaryCls}>Cancel</button>
            </div>
        </div>
    )
}

function ToolsTab({ showToast }) {
    const [items, setItems] = useState([])
    const [toolsHeading, setToolsHeading] = useState('')
    const [loading, setLoading] = useState(true)
    const [editId, setEditId] = useState(null)
    const [adding, setAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savingHeading, setSavingHeading] = useState(false)
    const [confirm, setConfirm] = useState(null)

    const load = useCallback(async () => {
        const [{ data }, content] = await Promise.all([
            supabase.from('tools').select('*').order('sort_order', { ascending: true }),
            loadSiteContentFields(['tools_heading']),
        ])
        setItems(data || [])
        setToolsHeading(content?.tools_heading || '')
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const toDbForm = (f) => ({
        name: f.name, category: f.category, emoji: f.emoji, icon_url: f.icon_url,
        sort_order: Number(f.sort_order), is_active: f.is_active
    })

    const handleAdd = async (f) => {
        setSaving(true)
        const nextOrder = (items || []).length > 0 ? Math.max(...(items || []).map(i => i.sort_order || 0)) + 1 : 1
        const payload = toDbForm(f)
        if (f.sort_order === 0) payload.sort_order = nextOrder

        await supabase.from('tools').insert([payload])
        setSaving(false); setAdding(false); showToast('Tool added!'); load()
    }

    const handleEdit = async (f) => {
        setSaving(true)
        await supabase.from('tools').update(toDbForm(f)).eq('id', editId)
        setSaving(false); setEditId(null); showToast('Saved!'); load()
    }

    const handleDelete = async (id) => {
        await supabase.from('tools').delete().eq('id', id)
        setConfirm(null); showToast('Deleted!', 'error'); load()
    }

    const toggleActive = async (item) => {
        await supabase.from('tools').update({ is_active: !item.is_active }).eq('id', item.id)
        load()
    }

    const saveHeading = async () => {
        setSavingHeading(true)
        const { error } = await saveSiteContentPatch({ tools_heading: toolsHeading })
        setSavingHeading(false)
        if (error) showToast('Heading save failed: ' + error.message, 'error')
        else showToast('Tools heading saved!')
    }

    if (loading) return <div className="dark:bg-zinc-900 bg-white rounded-[16px] h-[300px] animate-pulse" />

    return (
        <div>
            {confirm && <ConfirmModal message="Delete this tool?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
            <div className={cardCls + ' mb-6 flex flex-col gap-4'}>
                <Field label="Tools Section Heading" id="tools-h">
                    <textarea id="tools-h" rows={2} className={inputCls + ' resize-none'} value={toolsHeading || ''} onChange={e => setToolsHeading(e.target.value)} />
                </Field>
                <button onClick={saveHeading} disabled={savingHeading} className={btnPrimaryCls + ' self-start'}>
                    {savingHeading ? 'Saving…' : 'Save Heading'}
                </button>
            </div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Tools & Stack</h2>
                <button onClick={() => { setAdding(true); setEditId(null) }} className={btnPrimaryCls}>
                    + Add New Tool
                </button>
            </div>
            {adding && <ToolForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />}
            <div className="flex flex-col gap-0 mt-4 dark:bg-bg-3 bg-white border border-border rounded-[12px] overflow-hidden shadow-sm">
                {(items || []).map(item => (
                    <div key={item.id} className="border-b border-border last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between px-5 py-[14px]">
                            <div className="flex items-center gap-4">
                                <span className="dark:text-[#555555] text-gray-400 cursor-grab select-none" role="img" aria-label="Reorder handle">⋮⋮</span>
                                <div className="w-[32px] h-[32px] flex items-center justify-center">
                                    {item.icon_url ? (
                                        <img src={item.icon_url} alt={item.name} width={28} height={28} className="w-[28px] h-[28px] object-contain" />
                                    ) : (
                                        <span className="text-[20px]">{item.emoji}</span>
                                    )}
                                </div>
                                <span className="font-body font-medium text-[15px] dark:text-white text-gray-900 w-[140px] truncate">{item.name}</span>
                                <span className="font-body text-[10px] uppercase tracking-wider dark:text-[#888] text-gray-500 dark:bg-bg-4 bg-gray-100 border border-border px-2 py-0.5 rounded-full">{item.category}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <label htmlFor={`tool-toggle-${item.id}`} className="relative inline-flex items-center cursor-pointer group">
                                    <input id={`tool-toggle-${item.id}`} type="checkbox" checked={item.is_active} onChange={() => toggleActive(item)} className="sr-only peer" />
                                    <span className="sr-only">Toggle tool active status</span>
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                                <button onClick={() => { setEditId(editId === item.id ? null : item.id); setAdding(false) }} className="text-[13px] font-body dark:text-[#888888] text-gray-500 dark:hover:text-text hover:text-gray-900 transition-colors">Edit</button>
                                <button onClick={() => setConfirm(item.id)} className="text-[13px] font-body dark:text-[#555555] text-gray-400 hover:text-red-400 transition-colors">Delete</button>
                            </div>
                        </div>
                        {editId === item.id && <div className="px-5 pb-5"><ToolForm initial={item} onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} /></div>}
                    </div>
                ))}
                {items.length === 0 && <p className="dark:text-[#555555] text-gray-400 font-body text-[14px] p-5">No tools yet.</p>}
            </div>
        </div>
    )
}

// ─── Links & SEO Tab ──────────────────────────────────────────────────────────
function LinksSEOTab({ showToast }) {
    const [settings, setSettings] = useState({})
    const [passwords, setPasswords] = useState({ newPass: '', confirmPass: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savingSeo, setSavingSeo] = useState(false)
    const [savingPass, setSavingPass] = useState(false)

    const load = useCallback(async () => {
        const { data } = await supabase.from('settings').select('*')
        const map = {}
        data?.forEach(r => map[r.key] = r.value)
        setSettings(map)
        setLoading(false)
    }, [])
    useEffect(() => { load() }, [load])

    const saveGroup = async (keys, setSavingState) => {
        setSavingState(true)
        const payload = keys.map(k => ({ key: k, value: settings[k] || '' }))
        await supabase.from('settings').upsert(payload, { onConflict: 'key' })
        setSavingState(false)
        showToast('Saved successfully!')
    }

    const setVal = (k, v) => setSettings(p => ({ ...p, [k]: v }))

    const handlePasswordUpdate = async () => {
        if (!passwords.newPass || !passwords.confirmPass) {
            showToast('Enter a password', 'error')
            return
        }
        if (passwords.newPass !== passwords.confirmPass) {
            showToast('Passwords do not match', 'error')
            return
        }
        setSavingPass(true)
        try {
            const res = await fetch('/api/update-env', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'VITE_ADMIN_PASSWORD', value: passwords.newPass })
            })
            if (!res.ok) throw new Error('Failed to update')
            showToast('Password updated! Restart dev server.')
            setPasswords({ newPass: '', confirmPass: '' })
        } catch (err) {
            showToast('Failed to update password', 'error')
        } finally {
            setSavingPass(false)
        }
    }

    if (loading) return <div className="dark:bg-zinc-900 bg-white rounded-[16px] h-[400px] animate-pulse" />

    const linkKeys = ['instagram_url', 'behance_url', 'dribbble_url', 'agency_url', 'whatsapp_number', 'whatsapp_message', 'contact_email']
    const seoKeys = ['meta_title', 'meta_description']

    return (
        <div className="max-w-[700px] flex flex-col gap-10">
            <div>
                <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900 mb-6">Links & SEO</h2>

                <h3 className="font-body font-semibold dark:text-[#888] text-gray-400 uppercase tracking-widest text-[11px] mb-4">Social & Contact Links</h3>
                <div className={cardCls + ' flex flex-col gap-6'}>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Instagram URL" id="seo-insta"><input id="seo-insta" className={inputCls} value={settings.instagram_url || ''} onChange={e => setVal('instagram_url', e.target.value)} /></Field>
                        <Field label="Contact Email" id="seo-email"><input id="seo-email" className={inputCls} value={settings.contact_email || ''} onChange={e => setVal('contact_email', e.target.value)} /></Field>
                        <Field label="Behance URL" id="seo-behance"><input id="seo-behance" className={inputCls} value={settings.behance_url || ''} onChange={e => setVal('behance_url', e.target.value)} /></Field>
                        <Field label="Dribbble URL" id="seo-dribble"><input id="seo-dribble" className={inputCls} value={settings.dribbble_url || ''} onChange={e => setVal('dribbble_url', e.target.value)} /></Field>
                        <Field label="Agency Website URL" id="seo-agency"><input id="seo-agency" className={inputCls} value={settings.agency_url || ''} onChange={e => setVal('agency_url', e.target.value)} /></Field>
                        <Field label="WhatsApp Number" id="seo-wa-num"><input id="seo-wa-num" className={inputCls} value={settings.whatsapp_number || ''} onChange={e => setVal('whatsapp_number', e.target.value)} placeholder="e.g. 919724690118" /></Field>
                        <Field label="WhatsApp Default Message" id="seo-wa-msg">
                            <input id="seo-wa-msg" className={inputCls} value={settings.whatsapp_message || ''} onChange={e => setVal('whatsapp_message', e.target.value)} placeholder="Hi Krish, I want to discuss a project." />
                        </Field>
                    </div>
                    <button onClick={() => saveGroup(linkKeys, setSaving)} disabled={saving} className={btnPrimaryCls + ' self-start mt-2'}>
                        {saving ? 'Saving...' : 'Save All Links'}
                    </button>
                </div>
            </div>

            <div>
                <h3 className="font-body font-semibold dark:text-[#888] text-gray-400 uppercase tracking-widest text-[11px] mb-4">SEO</h3>
                <div className={cardCls + ' flex flex-col gap-6'}>
                    <Field label={`Meta Title (${(settings.meta_title || '').length}/60)`} id="seo-meta-title">
                        <input id="seo-meta-title" className={inputCls} maxLength={60} value={settings.meta_title || ''} onChange={e => setVal('meta_title', e.target.value)} />
                    </Field>
                    <Field label={`Meta Description (${(settings.meta_description || '').length}/160)`} id="seo-meta-desc">
                        <textarea id="seo-meta-desc" rows={3} className={inputCls + ' resize-none'} maxLength={160} value={settings.meta_description || ''} onChange={e => setVal('meta_description', e.target.value)} />
                    </Field>
                    <button onClick={() => saveGroup(seoKeys, setSavingSeo)} disabled={savingSeo} className={btnPrimaryCls + ' self-start mt-2'}>
                        {savingSeo ? 'Saving...' : 'Save SEO'}
                    </button>
                </div>
            </div>

            <div>
                <h3 className="font-body font-semibold text-red-500/80 uppercase tracking-widest text-[11px] mb-4">Admin Password</h3>
                <div className={cardCls + ' flex flex-col gap-6'}>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="New Password" id="pass-new"><input id="pass-new" type="password" className={inputCls} value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} /></Field>
                        <Field label="Confirm Password" id="pass-conf"><input id="pass-conf" type="password" className={inputCls} value={passwords.confirmPass} onChange={e => setPasswords(p => ({ ...p, confirmPass: e.target.value }))} /></Field>
                    </div>
                    <button onClick={handlePasswordUpdate} disabled={savingPass} className="self-start mt-2 px-6 h-10 border border-red-500/40 text-red-400 font-heading font-bold text-[13px] rounded-[8px] hover:bg-red-500/10 transition-colors disabled:opacity-60">
                        {savingPass ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Admin ───────────────────────────────────────────────────────────────

function ProcessForm({ initial, onSave, onCancel, saving }) {
    const [f, setF] = useState(() => {
        const seed = initial || { step_number: '', title: '', description: '', icon_light_url: '', icon_dark_url: '', sort_order: 0 }
        return {
            ...seed,
            icon_light_url: seed?.icon_light_url || '',
            icon_dark_url: seed?.icon_dark_url || '',
        }
    })
    const set = (k, v) => setF(prev => ({ ...prev, [k]: v }))

    return (
        <div className={cardCls + ' flex flex-col gap-6 mt-3'}>
            <div className="grid grid-cols-2 gap-4">
                <Field label="Step Number" id="proc-step"><input id="proc-step" className={inputCls} value={f.step_number} onChange={e => set('step_number', e.target.value)} placeholder="01" /></Field>
                <Field label="Sort Order" id="proc-sort"><input id="proc-sort" type="number" className={inputCls} value={f.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></Field>
            </div>
            <Field label="Title" id="proc-title"><input id="proc-title" className={inputCls} value={f.title} onChange={e => set('title', e.target.value)} /></Field>
            <Field label="Description" id="proc-desc"><textarea id="proc-desc" rows={3} className={inputCls} value={f.description} onChange={e => set('description', e.target.value)} /></Field>
            <MediaUpload
                label="Icon (Dark Theme)"
                sub="Used when the site is in dark mode."
                bucket="images"
                path={`process/${f.id || 'new-step'}-dark.[ext]`}
                currentUrl={f.icon_light_url}
                onSave={url => set('icon_light_url', url)}
                accept="image/*,.svg"
                previewShape="logo"
            />
            <MediaUpload
                label="Icon (Light Theme)"
                sub="Used when the site is in light mode."
                bucket="images"
                path={`process/${f.id || 'new-step'}-light.[ext]`}
                currentUrl={f.icon_dark_url}
                onSave={url => set('icon_dark_url', url)}
                accept="image/*,.svg"
                previewShape="logo"
            />

            <div className="flex gap-3 mt-2">
                <button onClick={() => onSave(f)} disabled={saving} className={btnPrimaryCls}>{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={onCancel} className={btnSecondaryCls}>Cancel</button>
            </div>
        </div>
    )
}
function NavbarTab({ showToast }) {
    const [form, setForm] = useState({
        nav_logo_text: '',
        nav_status_text: '',
        nav_cta_text: '',
        nav_cta_text_mobile: '',
        nav_icon_url: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const data = await loadSiteContentFields(['nav_logo_text', 'nav_status_text', 'nav_cta_text', 'nav_cta_text_mobile', 'nav_icon_url'])
                setForm({
                    nav_logo_text: data?.nav_logo_text || '',
                    nav_status_text: data?.nav_status_text || '',
                    nav_cta_text: data?.nav_cta_text || '',
                    nav_cta_text_mobile: data?.nav_cta_text_mobile || '',
                    nav_icon_url: data?.nav_icon_url || ''
                })
            } catch (err) {
                console.error('[NavbarTab] load error:', err)
                showToast('Failed to load navbar settings', 'error')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [showToast])

    const save = async () => {
        setSaving(true)
        const { error } = await saveSiteContentPatch({
            nav_logo_text: form.nav_logo_text,
            nav_status_text: form.nav_status_text,
            nav_cta_text: form.nav_cta_text,
            nav_cta_text_mobile: form.nav_cta_text_mobile,
            nav_icon_url: form.nav_icon_url
        })
        setSaving(false)
        if (error) showToast('Save failed: ' + error.message, 'error')
        else showToast('Navbar settings saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[320px] animate-pulse" />

    return (
        <div className="max-w-[900px] flex flex-col gap-8">
            <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Navbar Settings</h2>
            <div className={cardCls + ' flex flex-col gap-8'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <Field label="Brand/Logo Text" id="nav-logo">
                        <input id="nav-logo" className={inputCls} value={form.nav_logo_text} onChange={e => setForm(p => ({ ...p, nav_logo_text: e.target.value }))} placeholder="Krish." />
                    </Field>
                    <Field label="Availability Status Text" id="nav-status">
                        <input id="nav-status" className={inputCls} value={form.nav_status_text} onChange={e => setForm(p => ({ ...p, nav_status_text: e.target.value }))} placeholder="Available for work" />
                    </Field>
                    <Field label="Desktop Button Text" id="nav-cta-d">
                        <input id="nav-cta-d" className={inputCls} value={form.nav_cta_text} onChange={e => setForm(p => ({ ...p, nav_cta_text: e.target.value }))} placeholder="Contact" />
                    </Field>
                    <Field label="Mobile Button Text" id="nav-cta-m">
                        <input id="nav-cta-m" className={inputCls} value={form.nav_cta_text_mobile} onChange={e => setForm(p => ({ ...p, nav_cta_text_mobile: e.target.value }))} placeholder="Let's Talk" />
                    </Field>
                    <MediaUpload
                        label="Navbar Icon"
                        bucket="images"
                        path="nav/icon-[ext].[ext]"
                        currentUrl={form.nav_icon_url}
                        onSave={url => setForm(p => ({ ...p, nav_icon_url: url }))}
                        accept="image/*"
                        previewShape="circle"
                    />
                </div>
                <button onClick={save} disabled={saving} className={btnPrimaryCls + ' self-start'}>
                    {saving ? 'Saving...' : 'Save Navbar Settings'}
                </button>
            </div>
        </div>
    )
}


function SettingsTab({ showToast }) {
    const [activeSubTab, setActiveSubTab] = useState('Global UI')
    const subTabs = ['Global UI', 'Links & SEO', 'Layout', 'Spacing']

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Settings</h2>
            </div>
            <div className="flex gap-6 mb-8 border-b border-border overflow-x-auto whitespace-nowrap scrollbar-hide">
                {subTabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`text-[14px] font-body font-semibold pb-4 pt-1 transition-all relative ${activeSubTab === tab
                            ? 'dark:text-white text-gray-900'
                            : 'dark:text-[#555555] text-gray-400 hover:text-gray-900 dark:hover:text-[#888888]'
                            }`}
                    >
                        {tab}
                        {activeSubTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" />
                        )}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeSubTab === 'Global UI' && <GlobalUITab showToast={showToast} />}
                {activeSubTab === 'Links & SEO' && <LinksSEOTab showToast={showToast} />}
                {activeSubTab === 'Layout' && <LayoutTab showToast={showToast} />}
                {activeSubTab === 'Spacing' && <SpacingTab showToast={showToast} />}
            </div>
        </div>
    )
}

function ProcessTab({ showToast }) {
    const [items, setItems] = useState([])
    const [processHeading, setProcessHeading] = useState('')
    const [loading, setLoading] = useState(true)
    const [editId, setEditId] = useState(null)
    const [adding, setAdding] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savingHeading, setSavingHeading] = useState(false)
    const [confirm, setConfirm] = useState(null)

    const load = useCallback(async () => {
        const [{ data }, content] = await Promise.all([
            supabase.from('process_steps').select('*').order('sort_order', { ascending: true }),
            loadSiteContentFields(['process_heading']),
        ])
        setItems(data || [])
        setProcessHeading(content?.process_heading || '')
        setLoading(false)
    }, [])
    useEffect(() => { load() }, [load])

    const toDbForm = (f) => ({
        step_number: f?.step_number || '',
        title: f?.title || '',
        description: f?.description || '',
        icon_light_url: f?.icon_light_url || '',
        icon_dark_url: f?.icon_dark_url || '',
        sort_order: Number(f?.sort_order || 0),
    })

    const handleAdd = async (f) => {
        setSaving(true)
        await supabase.from('process_steps').insert([toDbForm(f)])
        setSaving(false); setAdding(false); showToast('Step added!'); load()
    }

    const handleEdit = async (f) => {
        setSaving(true)
        await supabase.from('process_steps').update(toDbForm(f)).eq('id', editId)
        setSaving(false); setEditId(null); showToast('Saved!'); load()
    }

    const handleDelete = async (id) => {
        await supabase.from('process_steps').delete().eq('id', id)
        setConfirm(null); showToast('Deleted!', 'error'); load()
    }

    const moveStep = async (index, direction) => {
        const swapIndex = index + direction
        if (swapIndex < 0 || swapIndex >= items.length) return

        const current = items[index]
        const target = items[swapIndex]
        const currentOrder = current.sort_order ?? index
        const targetOrder = target.sort_order ?? swapIndex

        await Promise.all([
            supabase.from('process_steps').update({ sort_order: targetOrder }).eq('id', current.id),
            supabase.from('process_steps').update({ sort_order: currentOrder }).eq('id', target.id),
        ])

        load()
        showToast('Order updated!')
    }

    const saveHeading = async () => {
        setSavingHeading(true)
        const { error } = await saveSiteContentPatch({ process_heading: processHeading })
        setSavingHeading(false)
        if (error) showToast('Heading save failed: ' + error.message, 'error')
        else showToast('Process heading saved!')
    }

    if (loading) return <div className="dark:bg-bg-3 bg-white border border-border rounded-[16px] h-[300px] animate-pulse" />

    return (
        <div>
            {confirm && <ConfirmModal message="Delete this step?" onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
            <div className={cardCls + ' mb-6 flex flex-col gap-4'}>
                <Field label="Process Section Heading" id="proc-h">
                    <textarea id="proc-h" rows={2} className={inputCls + ' resize-none'} value={processHeading || ''} onChange={e => setProcessHeading(e.target.value)} />
                </Field>
                <button onClick={saveHeading} disabled={savingHeading} className={btnPrimaryCls + ' self-start'}>
                    {savingHeading ? 'Saving…' : 'Save Heading'}
                </button>
            </div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading font-bold text-[22px] dark:text-white text-gray-900">Process Steps</h2>
                <button onClick={() => { setAdding(true); setEditId(null) }} className={btnPrimaryCls}>+ Add Step</button>
            </div>
            {adding && <ProcessForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} />}
            <div className="flex flex-col gap-3 mt-4">
                {(items || []).map(item => (
                    <div key={item.id} className="dark:bg-zinc-900 bg-white border border-border rounded-[12px] shadow-sm">
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-4">
                                <span className="dark:text-accent font-heading font-bold">{item.step_number}</span>
                                <span className="font-heading font-semibold text-[16px] dark:text-white text-gray-900">{item.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => moveStep(items.findIndex(x => x.id === item.id), -1)}
                                    className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border text-gray-500 dark:text-[#888888] hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40"
                                    disabled={items[0]?.id === item.id}
                                    title="Move up"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    onClick={() => moveStep(items.findIndex(x => x.id === item.id), 1)}
                                    className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border text-gray-500 dark:text-[#888888] hover:text-accent hover:border-accent/40 transition-colors disabled:opacity-40"
                                    disabled={items[items.length - 1]?.id === item.id}
                                    title="Move down"
                                >
                                    <ChevronDown size={14} />
                                </button>
                                <button onClick={() => { setEditId(editId === item.id ? null : item.id); setAdding(false) }} className="text-[13px] font-body dark:text-[#888888] text-gray-500 dark:hover:text-text hover:text-gray-900">Edit</button>
                                <button onClick={() => setConfirm(item.id)} className="text-[13px] font-body dark:text-[#555555] text-gray-400 hover:text-red-400">Delete</button>
                            </div>
                        </div>
                        {editId === item.id && <div className="px-5 pb-5"><ProcessForm initial={item} onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} /></div>}
                    </div>
                ))}
            </div>
        </div>
    )
}

function Admin() {
    const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === 'true')
    const [activeTab, setActiveTab] = useState('Dashboard')
    const [toast, setToast] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type, key: Date.now() })
    }, [])

    const logout = () => {
        sessionStorage.removeItem('admin_auth')
        setAuthed(false)
    }

    if (!authed) return <AuthGate onAuth={() => setAuthed(true)} />

    return (
        <div className="admin-dashboard min-h-screen dark:bg-black bg-gray-50 flex font-body transition-colors">
            {/* Hamburger — mobile only */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden w-[44px] h-[44px] flex items-center justify-center dark:bg-zinc-900 bg-white border dark:border-border border-gray-200 rounded-[10px] shadow-sm"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>
            <Sidebar active={activeTab} onNav={setActiveTab} onLogout={logout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="ml-0 md:ml-[220px] flex-1 min-h-screen overflow-y-auto px-[var(--pad-side)]" style={{ paddingTop: 'var(--pad-admin-t)', paddingBottom: 'var(--pad-admin-b)' }}>
                {activeTab === 'Dashboard' && <DashboardTab />}
                {activeTab === 'Leads' && <LeadsTab />}
                {activeTab === 'Hero' && <HeroTab showToast={showToast} />}
                {activeTab === 'About' && <AboutDifferentTab showToast={showToast} />}
                {activeTab === 'Services' && <ServicesTab showToast={showToast} />}
                {activeTab === 'Projects' && <ProjectsTab showToast={showToast} />}
                {activeTab === 'Clients' && <ClientsTab showToast={showToast} />}
                {activeTab === 'Process' && <ProcessTab showToast={showToast} />}
                {activeTab === 'Tools Stack' && <ToolsTab showToast={showToast} />}
                {activeTab === 'Showreel' && <ShowreelTab showToast={showToast} />}
                {activeTab === 'Testimonials' && <TestimonialsTab showToast={showToast} />}
                {activeTab === 'CTA' && <CTALevelUpTab showToast={showToast} />}
                {activeTab === 'Footer' && <FooterTab showToast={showToast} />}
                {activeTab === 'Navbar' && <NavbarTab showToast={showToast} />}
                {activeTab === 'Settings' && <SettingsTab showToast={showToast} />}
            </main>
            {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
        </div>
    )
}

export default Admin
