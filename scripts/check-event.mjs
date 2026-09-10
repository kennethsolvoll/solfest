/**
 * Sanity-check a party file before the night.
 *   node scripts/check-event.mjs content/events/2026-09-12.json
 *
 * Catches the classes of mistake that are easy to make by hand and annoying
 * to discover at 19:00: unknown :shortcodes:, unbalanced **, a schedule out of
 * order, and prose that quotes a start time the schedule disagrees with.
 */
import { readFile } from 'node:fs/promises'

const KNOWN = new Set(['flame', 'flex', 'beer', 'shot', 'chili', 'fire', 'crown',
  'trophy', 'sparkles', 'party', 'cake', 'gift', 'music', 'mic', 'art', 'hotdog',
  'skull', 'star', 'clock'])

const file = process.argv[2]
if (!file) { console.error('Usage: node scripts/check-event.mjs <event.json>'); process.exit(1) }

const raw = await readFile(file, 'utf8')
let ev
try { ev = JSON.parse(raw) } catch (e) { console.error('✗ invalid JSON:', e.message); process.exit(1) }

const errors = [], warnings = []
const strings = []
;(function walk(v, path) {
  if (typeof v === 'string') strings.push([path, v])
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k)
})(ev, '')

// required fields
for (const f of ['slug', 'name', 'startsAt', 'intro', 'rules', 'schedule', 'teams', 'sideQuests', 'points'])
  if (ev[f] === undefined) errors.push(`missing field: ${f}`)

// startsAt must carry an explicit offset, or the timeline drifts per viewer
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(ev.startsAt ?? ''))
  errors.push(`startsAt "${ev.startsAt}" needs an explicit timezone offset, e.g. 2026-09-12T18:30:00+02:00`)
if (ev.slug && !/^\d{4}-\d{2}-\d{2}$/.test(ev.slug)) warnings.push(`slug "${ev.slug}" is not a date`)
if (ev.startsAt && ev.slug && !ev.startsAt.startsWith(ev.slug))
  warnings.push(`slug ${ev.slug} does not match startsAt date ${ev.startsAt.slice(0, 10)}`)

// markers
for (const [path, s] of strings) {
  for (const m of s.matchAll(/:([a-zA-Z][a-zA-Z0-9_+-]*):/g))
    if (!KNOWN.has(m[1].toLowerCase())) errors.push(`unknown shortcode ":${m[1]}:" in ${path}`)
  const stars = (s.match(/\*\*/g) ?? []).length
  if (stars % 2) errors.push(`unbalanced ** in ${path}: "${s.slice(0, 60)}…"`)
}

// schedule ordering and the arrival buffer
const mins = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m }
const sched = ev.schedule ?? []
sched.forEach((s, i) => {
  if (!/^\d{2}:\d{2}$/.test(s.time ?? '')) errors.push(`schedule[${i}].time "${s.time}" is not HH:MM`)
  if (i && mins(s.time) <= mins(sched[i - 1].time))
    errors.push(`schedule out of order: ${sched[i - 1].time} then ${s.time}`)
})
if (sched.length && ev.startsAt) {
  const start = mins(ev.startsAt.slice(11, 16))
  const first = mins(sched[0].time)
  if (first < start) errors.push(`first activity ${sched[0].time} is before the countdown ends (${ev.startsAt.slice(11, 16)})`)
  else if (first === start) warnings.push(`no arrival buffer: countdown ends and "${sched[0].title}" begins at the same minute (${sched[0].time})`)
}

// prose quoting a time the schedule does not have
const times = new Set(sched.map(s => s.time))
const hours = new Set([...times].map(t => String(Number(t.slice(0, 2)))))
for (const [path, s] of strings) {
  if (path.startsWith('schedule')) continue
  for (const m of s.matchAll(/\bkl\.?\s*(\d{1,2})(?:[.:](\d{2}))?/gi)) {
    const h = String(Number(m[1])), full = m[2] ? `${m[1].padStart(2, '0')}:${m[2]}` : null
    if (full ? !times.has(full) : !hours.has(h))
      warnings.push(`${path} says "${m[0]}" but no activity starts then (schedule: ${[...times].join(', ')})`)
  }
}

// prose that states when the first activity is, disagreeing with the schedule
for (const [path, s] of strings) {
  if (path.startsWith('schedule')) continue
  const m = s.match(/f[øo]rste\s+aktivitet[^.!?]*?\bkl\.?\s*(\d{1,2})(?:[.:](\d{2}))?/i)
  if (m && sched.length) {
    const actual = sched[0].time
    const same = m[2] ? `${m[1].padStart(2, '0')}:${m[2]}` === actual : Number(m[1]) === Number(actual.slice(0, 2))
    if (!same) errors.push(`${path} says the first activity is at kl. ${m[1]}${m[2] ? ':' + m[2] : ''}, but the schedule opens with "${sched[0].title}" at ${actual}`)
  }
}

// teams
;(ev.teams ?? []).forEach((t, i) => {
  if (!t.name) errors.push(`teams[${i}] has no name`)
  if (!Array.isArray(t.members)) errors.push(`teams[${i}].members is not a list`)
  else if (!t.members.length) warnings.push(`team "${t.name}" has no members yet`)
})
const seen = new Map()
;(ev.teams ?? []).forEach(t => (t.members ?? []).forEach(m => {
  const k = m.replace(/\*\*/g, '').trim().toLowerCase()
  if (seen.has(k)) errors.push(`"${m.replace(/\*\*/g, '')}" is on both ${seen.get(k)} and ${t.name}`)
  else seen.set(k, t.name)
}))
if ((ev.teams ?? []).length > 5)
  warnings.push(`${ev.teams.length} teams but only 5 identity colours — colours will repeat`)

const starred = [...seen.keys()].length
const sparkled = (ev.teams ?? []).flatMap(t => t.members ?? []).filter(m => m.includes('**')).length
console.log(`${file}`)
console.log(`  ${ev.teams?.length ?? 0} teams, ${starred} people (${sparkled} highlighted), ` +
            `${sched.length} activities, ${ev.rules?.length ?? 0} rules, ` +
            `${ev.sideQuests?.length ?? 0} side quests, ${ev.points?.rows?.length ?? 0} points rows`)
console.log()
for (const e of errors) console.log(`  ✗ ${e}`)
for (const w of warnings) console.log(`  ! ${w}`)
if (!errors.length && !warnings.length) console.log('  ✓ nothing to flag')
process.exit(errors.length ? 1 : 0)
