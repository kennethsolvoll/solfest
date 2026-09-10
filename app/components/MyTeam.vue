<script setup lang="ts">
import type { Team } from '~/composables/useEvents'

defineProps<{ teams: Team[] }>()
const { picked, pick } = useMyTeam()
</script>

<template>
  <div v-if="picked !== null && teams[picked]" class="myteam" :style="{ '--tc': `var(--t${picked % 5})` }">
    <span class="eyebrow">Du spiller for</span>
    <div class="name">{{ teams[picked]!.name }}</div>
    <div class="members">
      <RichText v-for="(m, i) in teams[picked]!.members" :key="i" tag="span" class="chip" :text="m" />
    </div>
    <button class="linkish" @click="pick(null)">Bytt lag</button>
  </div>

  <div v-else class="myteam">
    <span class="eyebrow">Hvilket lag er du på?</span>
    <div class="teampick" style="margin-top:8px">
      <button v-for="(t, i) in teams" :key="t.name" @click="pick(i)">{{ t.name }}</button>
    </div>
  </div>
</template>
