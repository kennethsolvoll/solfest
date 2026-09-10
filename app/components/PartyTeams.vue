<script setup lang="ts">
import type { Team } from '~/composables/useEvents'

defineProps<{ teams: Team[]; myTeam?: number | null }>()
const stripMarkers = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1')
</script>

<template>
  <div class="teams">
    <div
      v-for="(team, i) in teams"
      :key="team.name"
      class="tcard"
      :class="{ mine: i === myTeam }"
      :style="{ '--tc': `var(--t${i % 5})` }"
    >
      <div class="name">
        {{ team.name }}<span v-if="i === myTeam" class="you">DITT</span>
      </div>
      <div class="members">{{ team.members.map(stripMarkers).join(' · ') }}</div>
    </div>
  </div>
</template>
