<script setup lang="ts">
import type { PartyEvent } from '~/composables/useEvents'

const props = defineProps<{ event: PartyEvent }>()

// Baked JSON paints first; the live row overlays it if Supabase is reachable.
const { event: live, updatedAt, isLive } = useLiveEvent(props.event)
const { started, formatted, items, current, next, stateOf } = usePartyClock(live)
const { picked, load } = useMyTeam()

onMounted(() => load(live.value.teams.length))

useHead({ title: () => `Solfest – ${live.value.name}` })

// Read once at the start of the night, then dismissable. Per viewer and per
// party, so localStorage keyed by slug.
const introHidden = ref(false)
const introKey = computed(() => `solfest.introHidden.${live.value.slug}`)

onMounted(() => {
  try { introHidden.value = localStorage.getItem(introKey.value) === '1' } catch { /* private mode */ }
})

function hideIntro() {
  introHidden.value = true
  try { localStorage.setItem(introKey.value, '1') } catch { /* private mode */ }
}

const stamp = computed(() => {
  if (!updatedAt.value) return null
  const d = new Date(updatedAt.value)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})
</script>

<template>
  <div class="phone">
    <div class="masthead">
      <h1 class="wordmark">Solfest</h1>
      <div class="stamp">
        <template v-if="isLive && stamp">oppdatert <b>{{ stamp }}</b></template>
        <template v-else>{{ live.name }}</template>
        <br>{{ live.slug }}
      </div>
    </div>

    <!-- Before it starts: countdown and the minigame. Nothing is given away. -->
    <template v-if="!started">
      <div class="countdown">{{ formatted }}</div>
      <p class="countdown-note">{{ live.beforeStart.lines[0] }}</p>
      <ClientOnly>
        <MiniGame v-if="live.minigame" />
      </ClientOnly>
      <section>
        <div class="sec-head"><h2>{{ live.beforeStart.title }}</h2><div class="rule" /></div>
        <p v-for="(line, i) in live.beforeStart.lines.slice(1)" :key="i" class="intro">{{ line }}</p>
      </section>
    </template>

    <!-- Once it starts, the page leads with what is happening right now. -->
    <template v-else>
      <section v-if="!introHidden" class="welcome">
        <div class="sec-head">
          <h2>Velkommen</h2>
          <div class="rule" />
          <button class="sec-close" type="button" aria-label="Skjul velkomstteksten" @click="hideIntro">✕</button>
        </div>
        <p class="intro">{{ live.intro }}</p>
      </section>

      <div class="sticky">
        <NowBar :current="current" :next="next" :first-up="items[0]" />
        <JumpNav />
      </div>

      <section id="lag">
        <div class="sec-head"><h2>Ditt lag</h2><div class="rule" /></div>
        <MyTeam :teams="live.teams" />
      </section>

      <section id="timeplan">
        <div class="sec-head"><h2>Timeplan</h2><div class="rule" /></div>
        <PartyTimeline :items="items" :state-of="stateOf" />
      </section>

      <section id="regler">
        <div class="sec-head"><h2>Festregler</h2><div class="rule" /></div>
        <PartyRules :rules="live.rules" />
      </section>

      <section id="alle-lag">
        <div class="sec-head"><h2>Alle lag</h2><div class="rule" /></div>
        <PartyTeams :teams="live.teams" :my-team="picked" />
      </section>

      <section id="quests">
        <div class="sec-head"><h2>Side quests</h2><div class="rule" /></div>
        <PartySideQuests :quests="live.sideQuests" />
      </section>

      <section id="poeng">
        <div class="sec-head"><h2>Poengsystem</h2><div class="rule" /></div>
        <PartyPoints :rows="live.points.rows" :footnote="live.points.footnote" />
      </section>
    </template>

    <footer>{{ live.footer }}</footer>
  </div>
</template>
