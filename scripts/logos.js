// Makes logos/<id>.svg for every connector: a rounded tile in the brand colour with the brand glyph (from simple-icons), or a
// Lucide glyph for the ones with no brand mark. Run `bun scripts/logos.js` after adding a connector, then commit logos/ and the
// `logo` fields it writes into connectors.json. Needs network (jsDelivr).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const SI = 'https://cdn.jsdelivr.net/npm/simple-icons@13.21.0'
const LU = 'https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/icons'
// connector id -> simple-icons slug (a brand glyph)
const BRAND = {
  git: 'git', github: 'github', brave: 'brave', 'brave-search': 'brave', notion: 'notion', airtable: 'airtable', slack: 'slack',
  stripe: 'stripe', supabase: 'supabase', postgres: 'postgresql', sqlite: 'sqlite', figma: 'figma', huggingface: 'huggingface',
  sentry: 'sentry',
}
// connector id -> [lucide icon, tile colour]
const GLYPH = {
  filesystem: ['folder-open', '#3b82f6'], memory: ['brain', '#8b5cf6'], 'sequential-thinking': ['list-ordered', '#6366f1'],
  fetch: ['globe', '#0ea5e9'], time: ['clock', '#f59e0b'], playwright: ['monitor-play', '#2ead33'],
  'playwright-chrome': ['compass', '#4285f4'], browsermcp: ['mouse-pointer-click', '#14b8a6'], 'browser-use': ['bot', '#ec4899'],
  context7: ['book-open', '#0ea5e9'], deepwiki: ['library', '#6366f1'], tavily: ['search', '#3b82f6'], exa: ['telescope', '#2563eb'],
  firecrawl: ['flame', '#f97316'], sheets: ['table-2', '#16a34a'], books: ['book-open-check', '#d97706'],
}

const text = async (u) => {
  const r = await fetch(u)
  if (!r.ok) throw new Error(`${u}: ${r.status}`)
  return r.text()
}
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.299 * r + 0.587 * g + 0.114 * b
}
const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

const si = JSON.parse(await text(`${SI}/_data/simple-icons.json`))
const hexOf = (slug) => {
  const t = (i) => i.title.toLowerCase().replace(/[^a-z0-9]/g, '')
  const hit = (si.icons || si).find((i) => t(i) === slug)
  return hit ? `#${hit.hex}` : '#444444'
}

const file = new URL('../connectors.json', import.meta.url)
const data = JSON.parse(readFileSync(file, 'utf-8'))
mkdirSync(new URL('../logos/', import.meta.url), { recursive: true })
for (const c of data.connectors) {
  let svg
  if (BRAND[c.id]) {
    const slug = BRAND[c.id]
    let bg = hexOf(slug)
    if (lum(bg) < 0.12) bg = '#2b2b2f' // near-black brands stay visible on a dark page
    const fg = lum(bg) > 0.62 ? '#161616' : '#ffffff'
    const glyph = inner(await text(`${SI}/icons/${slug}.svg`))
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="${bg}"/><g transform="translate(24 24) scale(3.33)" fill="${fg}">${glyph}</g></svg>`
  } else {
    const [icon, bg] = GLYPH[c.id] || ['plug', '#52525b']
    const g = inner(await text(`${LU}/${icon}.svg`))
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="${bg}"/><g transform="translate(32 32) scale(2.667)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${g}</g></svg>`
  }
  writeFileSync(new URL(`../logos/${c.id}.svg`, import.meta.url), `${svg}\n`)
  c.logo = `logos/${c.id}.svg`
}
writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
console.log(`${data.connectors.length} logos`)
