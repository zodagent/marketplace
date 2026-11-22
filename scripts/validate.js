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
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`ok: ${ids.size} connectors`)
