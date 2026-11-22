// Checks connectors.json: run with `bun scripts/validate.js` (CI runs it on every change).
import { readFileSync } from 'node:fs'

const data = JSON.parse(readFileSync(new URL('../connectors.json', import.meta.url), 'utf-8'))
const errors = []
const ids = new Set()
if (data.schema !== 1) errors.push('schema must be 1')
if (!data.permissions || typeof data.permissions !== 'object') errors.push('permissions is missing')
for (const c of data.connectors || []) {
  const where = `connector "${c.id}"`
  if (!c.id || !/^[a-z0-9][a-z0-9-]*$/.test(c.id)) errors.push(`${where}: id must be lowercase letters, digits and dashes`)
  if (ids.has(c.id)) errors.push(`${where}: duplicate id`)
  ids.add(c.id)
  for (const k of ['name', 'desc', 'cat']) if (!c[k]) errors.push(`${where}: ${k} is missing`)
  if (c.transport === 'http' || c.transport === 'sse') {
    if (!/^https:\/\//.test(c.url || '')) errors.push(`${where}: an http server needs an https url`)
  } else if (!c.command || c.args === undefined) errors.push(`${where}: a program needs command and args`)
  for (const p of c.market?.permissions || [])
    if (!data.permissions[p]) errors.push(`${where}: unknown permission "${p}"`)
  if (c.market?.reviewed && !c.market.source) errors.push(`${where}: a reviewed listing needs market.source`)
}

// routines.json: the ready-made routines (timed ones, and step lists with a category)
const rt = JSON.parse(readFileSync(new URL('../routines.json', import.meta.url), 'utf-8'))
if (rt.schema !== 1) errors.push('routines.json: schema must be 1')
const cats = new Set((rt.categories || []).map((c) => c.id))
const rids = new Set()
for (const t of rt.schedules || []) {
  if (!t.id || !t.title || !t.prompt || !t.mode) errors.push(`schedule "${t.id}": id, title, prompt and mode are required`)
  if (rids.has(`s:${t.id}`)) errors.push(`schedule "${t.id}": duplicate id`)
  rids.add(`s:${t.id}`)
}
for (const f of rt.flows || []) {
  if (!f.id || !f.name || !Array.isArray(f.lines) || !f.lines.length) errors.push(`routine "${f.id}": id, name and lines are required`)
  if (!cats.has(f.category)) errors.push(`routine "${f.id}": unknown category "${f.category}"`)
  if (rids.has(`f:${f.id}`)) errors.push(`routine "${f.id}": duplicate id`)
  rids.add(`f:${f.id}`)
}
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`ok: ${ids.size} connectors, ${rids.size} routines`)
