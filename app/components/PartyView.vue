<script setup lang="ts">
import type { PartyEvent } from '~/composables/useEvents'

const props = defineProps<{ event: PartyEvent }>()
const { started, formatted } = usePartyClock(props.event.startsAt)

const header = computed(() => (started.value ? props.event.afterStart : props.event.beforeStart))

useHead({ title: `Solfest – ${props.event.name}` })
</script>

<template>
  <div>
    <div v-if="!started" class="countdown">{{ formatted }}</div>

    <header>
      <h1>{{ header.title }}</h1>
      <p v-for="(line, i) in header.lines" :key="i">{{ line }}</p>
    </header>

    <ClientOnly>
      <MiniGame v-if="!started && event.minigame" />
    </ClientOnly>

    <template v-if="started">
      <section>
        <h2>Intro</h2>
        <p>{{ event.intro }}</p>
      </section>

      <PartyRules :rules="event.rules" />
      <PartySchedule :items="event.schedule" />
      <PartyTeams :teams="event.teams" />
      <PartySideQuests :quests="event.sideQuests" />
      <PartyPoints
        :title="event.points.title"
        :rows="event.points.rows"
        :footnote="event.points.footnote"
      />
    </template>

    <footer>
      <p>&copy; {{ event.footer }}</p>
    </footer>
  </div>
</template>
