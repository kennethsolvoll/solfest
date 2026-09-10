/**
 * Push a party JSON file into Supabase.
 *   node scripts/seed.mjs content/events/2026-09-12.json
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (never committed).
 * The service role key bypasses row-level security — keep it off your phone
 * and out of the browser.
 */
import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/seed.mjs <path-to-event.json>')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See .env.example.')
  process.exit(1)
}

const data = JSON.parse(await readFile(file, 'utf8'))
if (!data.slug) {
  console.error(`${file} has no "slug" field.`)
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const { error } = await supabase
  .from('events')
  .upsert({ slug: data.slug, data, updated_by: 'seed' }, { onConflict: 'slug' })

if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}
console.log(`Seeded "${data.slug}" (${data.name}) from ${file}.`)
