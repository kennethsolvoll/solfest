<script setup lang="ts">
import type { Team } from '~/composables/useEvents'

// Members as chips, same as "Ditt lag": clear separation, and the **gold**
// markers survive so OPUS Fenriker are recognisable here too.
defineProps<{ teams: Team[]; myTeam?: number | null }>()
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
      <div class="members">
        <RichText v-for="(m, j) in team.members" :key="j" tag="span" class="chip" :text="m" />
      </div>
    </div>
  </div>
</template>
