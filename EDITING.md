# Content Editing Guide

All site content lives in **`src/content/*.json`**. Uploaded media lives in **`public/uploads/`**.
You edit locally on your machine, then `git push` → Vercel auto-deploys.

---

## Quick-start

```bash
npm install       # first time only
npm run dev       # starts dev server at http://localhost:5001
```

Open **http://localhost:5001/admin** in your browser. Log in with your admin password.

---

## How it works

| Layer | Dev (`npm run dev`) | Production (Vercel) |
|---|---|---|
| **Reads** | Vite middleware → reads `src/content/*.json` | Bundled JSON (zero network calls) |
| **Writes** | Vite middleware → writes `src/content/*.json` on disk | Disabled — shows banner |
| **Uploads** | Saved to `public/uploads/` | Disabled — upload locally first |

---

## Editing workflow

1. `npm run dev`
2. Go to `/admin`, edit anything
3. Files in `src/content/` are updated instantly on disk
4. Stop dev server
5. `git add -A && git commit -m "content: update xyz" && git push`
6. Vercel picks up the commit and redeploys in ~30 seconds

---

## Content files

| File | What it controls |
|---|---|
| `src/content/hero.json` | Hero stats (clients, years, videos, AI systems) |
| `src/content/site_content.json` | All text, section visibility, colors, CTA labels, social links |
| `src/content/settings.json` | Contact email, WhatsApp, meta title/description |
| `src/content/services.json` | Services list |
| `src/content/projects.json` | Portfolio projects |
| `src/content/project_reels.json` | Reel videos attached to projects |
| `src/content/testimonials.json` | Testimonials |
| `src/content/clients.json` | Client logos / names |
| `src/content/process_steps.json` | How-I-Work process steps |
| `src/content/tools.json` | Tools stack |
| `src/content/leads.json` | Contact form submissions (local record) |

---

## Contact form email notifications (Web3Forms)

The contact form saves leads to `leads.json` locally. To also receive an **email notification**:

1. Sign up free at [web3forms.com](https://web3forms.com)
2. Create a form and copy the access key
3. Add to `.env`:
   ```
   VITE_WEB3FORMS_KEY=your-access-key-here
   ```

Without this key the form still works and saves leads locally — you just won't get email pings.

---

## Migrating data from Supabase (one-time)

If you want to pull your existing Supabase data into the JSON files, run:

```bash
npm run export
```

This exports all tables and downloads media from the Supabase CDN into `public/uploads/`,
rewriting all CDN URLs to local `/uploads/` paths in the JSON files.

---

## Adding images / videos

1. Drop the file into `public/uploads/` **or** upload via Admin → Media tab
2. Reference it as `/uploads/filename.ext` in any URL field

---

## Resetting to default content

Delete any JSON file in `src/content/` and restart `npm run dev`.
The admin will recreate it from the first save.
