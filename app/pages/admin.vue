<script setup lang="ts">
import type { PartyEvent } from '~/composables/useEvents'

useHead({ title: 'Solfest – vertspanel' })

const configured = isLiveConfigured()
const baked = useAllEvents()
const route = useRoute()
const slug = computed(() => String(route.query.slug ?? baked[0]?.slug ?? ''))

const signedIn = ref(false)
const email = ref('')
const linkSent = ref(false)
const authError = ref('')

const draft = ref<PartyEvent | null>(null)
const rowExists = ref(false)
const status = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const loadError = ref('')

let saveTimer: ReturnType<typeof setTimeout> | undefined

async function loadRow() {
  const supabase = useSupabase()
  if (!supabase) return
  const { data, error } = await supabase
    .from('events').select('data').eq('slug', slug.value).maybeSingle()
  if (error) { loadError.value = error.message; return }
  if (data?.data) {
    draft.value = data.data as PartyEvent
    rowExists.value = true
  } else {
    // No row yet — start from the JSON in the repo so seeding can happen here.
    draft.value = structuredClone(baked.find(e => e.slug === slug.value) ?? null) as PartyEvent | null
    rowExists.value = false
  }
}

async function commit() {
  const supabase = useSupabase()
  if (!supabase || !draft.value) return
  status.value = 'saving'
  const { data: userData } = await supabase.auth.getUser()
  const { error } = await supabase.from('events').upsert(
    { slug: slug.value, data: draft.value, updated_by: userData.user?.email ?? 'vert' },
    { onConflict: 'slug' }
  )
  if (error) { status.value = 'error'; loadError.value = error.message; return }
  rowExists.value = true
  status.value = 'saved'
  setTimeout(() => { if (status.value === 'saved') status.value = 'idle' }, 1800)
}

/** Structural edits save at once; typing waits for a pause. */
function save(debounced = false) {
  if (saveTimer) clearTimeout(saveTimer)
  if (!debounced) return void commit()
  status.value = 'saving'
  saveTimer = setTimeout(commit, 600)
}

function moveMember(from: number, idx: number, to: number) {
  if (!draft.value) return
  const [m] = draft.value.teams[from]!.members.splice(idx, 1)
  draft.value.teams[to]!.members.push(m!)
  save()
}
function addMember(team: number, name: string) {
  if (!draft.value || !name.trim()) return
  draft.value.teams[team]!.members.push(name.trim())
  save()
}
function removeMember(team: number, idx: number) {
  draft.value?.teams[team]!.members.splice(idx, 1)
  save()
}
function addRule(text: string) {
  if (!draft.value || !text.trim()) return
  draft.value.rules.push(text.trim())
  save()
}
function removeRule(i: number) {
  draft.value?.rules.splice(i, 1)
  save()
}

async function signIn() {
  const supabase = useSupabase()
  if (!supabase) return
  authError.value = ''
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value.trim(),
    options: { emailRedirectTo: window.location.href }
  })
  if (error) authError.value = error.message
  else linkSent.value = true
}

async function signOut() {
  await useSupabase()?.auth.signOut()
  signedIn.value = false
}

const newMember = ref<Record<number, string>>({})
const newRule = ref('')

onMounted(async () => {
  const supabase = useSupabase()
  if (!supabase) return
  const { data } = await supabase.auth.getSession()
  signedIn.value = Boolean(data.session)
  supabase.auth.onAuthStateChange((_e, session) => {
    signedIn.value = Boolean(session)
    if (session) loadRow()
  })
  if (signedIn.value) await loadRow()
})
</script>

<template>
  <div class="phone">
    <div class="masthead">
      <h1 class="wordmark">Vertspanel</h1>
      <div class="stamp">{{ slug }}<br><NuxtLink to="/">til festsiden</NuxtLink></div>
    </div>

    <ClientOnly>
      <section v-if="!configured">
        <div class="hostnote warn">
          Supabase er ikke satt opp. Legg inn <b>NUXT_PUBLIC_SUPABASE_URL</b> og
          <b>NUXT_PUBLIC_SUPABASE_ANON_KEY</b>, så bygg på nytt. Festsiden fungerer
          som før i mellomtiden.
        </div>
      </section>

      <section v-else-if="!signedIn">
        <div class="sec-head"><h2>Logg inn</h2><div class="rule" /></div>
        <div v-if="linkSent" class="hostnote">
          Sjekk e-posten din — lenken logger deg inn her.
          <b>Gjør dette dagen før festen</b>, ikke 22:30 på festwifi.
        </div>
        <template v-else>
          <div class="editrow">
            <div class="grow">
              <input v-model="email" type="email" inputmode="email" placeholder="din@epost.no" @keyup.enter="signIn">
            </div>
            <button class="btn gold" @click="signIn">Send lenke</button>
          </div>
          <p v-if="authError" class="hostnote warn" style="margin-top:12px">{{ authError }}</p>
        </template>
      </section>

      <template v-else-if="draft">
        <section>
          <div class="hostnote">
            Endringer lagres i databasen og dukker opp hos <b>alle gjestene med én gang</b> —
            ingen bygging, ingen deploy.
            <template v-if="!rowExists"><br><br>Denne festen ligger ikke i databasen ennå. Første endring oppretter den.</template>
          </div>
        </section>

        <section>
          <div class="sec-head"><h2>Lag</h2><div class="rule" /></div>
          <div v-for="(team, k) in draft.teams" :key="k" class="tgroup" :style="{ '--tc': `var(--t${k % 5})` }">
            <div class="name">{{ team.name }}</div>
            <div v-for="(m, j) in team.members" :key="j" class="editrow">
              <div class="grow">{{ m.replace(/\*\*(.+?)\*\*/g, '$1') }}</div>
              <select :value="''" @change="e => moveMember(k, j, Number((e.target as HTMLSelectElement).value))">
                <option value="" disabled>flytt til …</option>
                <option v-for="(o, oi) in draft.teams" v-show="oi !== k" :key="oi" :value="oi">{{ o.name }}</option>
              </select>
              <button class="btn icon" aria-label="Fjern" @click="removeMember(k, j)">✕</button>
            </div>
            <div class="editrow">
              <div class="grow">
                <input v-model="newMember[k]" placeholder="Legg til navn …"
                       @keyup.enter="addMember(k, newMember[k] ?? ''); newMember[k] = ''">
              </div>
              <button class="btn" @click="addMember(k, newMember[k] ?? ''); newMember[k] = ''">Legg til</button>
            </div>
          </div>
        </section>

        <section>
          <div class="sec-head"><h2>Timeplan</h2><div class="rule" /></div>
          <div v-for="(s, k) in draft.schedule" :key="k" class="editrow">
            <input v-model="s.time" style="max-width:78px" inputmode="numeric" @input="save(true)">
            <div class="grow"><input v-model="s.title" @input="save(true)"></div>
          </div>
        </section>

        <section>
          <div class="sec-head"><h2>Regler</h2><div class="rule" /></div>
          <div v-for="(r, k) in draft.rules" :key="k" class="editrow">
            <div class="grow"><input :value="r" @input="e => { draft!.rules[k] = (e.target as HTMLInputElement).value; save(true) }"></div>
            <button class="btn icon" aria-label="Slett regel" @click="removeRule(k)">✕</button>
          </div>
          <div class="editrow">
            <div class="grow"><input v-model="newRule" placeholder="Ny regel …" @keyup.enter="addRule(newRule); newRule = ''"></div>
            <button class="btn gold" @click="addRule(newRule); newRule = ''">Legg til</button>
          </div>
        </section>

        <div class="savebar">
          <span class="savestate" :class="status">
            <template v-if="status === 'saving'">lagrer …</template>
            <template v-else-if="status === 'saved'">lagret</template>
            <template v-else-if="status === 'error'">kunne ikke lagre — {{ loadError }}</template>
          </span>
          <button class="btn" @click="signOut">Logg ut</button>
        </div>
      </template>

      <section v-else>
        <div class="hostnote">Laster …</div>
      </section>
    </ClientOnly>
  </div>
</template>
