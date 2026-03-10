import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Storage Helpers ─────────────────────────────────────────────────────────
// Always uploads to the ROOT of the 'portfolio-media' bucket.
// fileName should be a flat string like 'reel-1709999.mp4' — no subfolders.

export const uploadFile = async (fileName, file) => {
    const { error } = await supabase.storage
        .from('portfolio-media')
        .upload(fileName, file, { upsert: true })

    if (error) throw error

    const { data: urlData } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(fileName)

    console.log("Generated URL:", urlData.publicUrl)

    return urlData.publicUrl
}
