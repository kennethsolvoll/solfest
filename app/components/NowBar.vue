<script setup lang="ts">
import type { TimedItem, Phase } from '~/composables/usePartyClock'

/**
 * Three states, because "the last activity you passed" is not the same thing
 * as "what is happening now":
 *   pending  — party open, first activity hasn't begun
 *   active   — an activity is running
 *   finished — the programme is over
 */
defineProps<{ phase: Phase; current: TimedItem | null; next: TimedItem | null }>()
</script>

<template>
  <div class="nowbar" :class="{ idle: phase !== 'active' }">
    <span class="eyebrow label">{{ phase === 'pending' ? 'Snart' : 'Nå' }}</span>

    <span class="now-title">
      <RichText v-if="current" :text="current.title" />
      <template v-else-if="phase === 'pending'">Ingenting ennå</template>
      <template v-else>Programmet er ferdig</template>
    </span>

    <span class="next">
      <span class="eyebrow">{{ phase === 'pending' ? 'Først ut' : 'Neste' }}</span>
      <template v-if="next">
        <span class="next-title"><RichText :text="next.title" /></span>
        <time>{{ next.time }}</time>
      </template>
      <template v-else>
        <span class="next-title">Ingenting</span>
        <time>—</time>
      </template>
    </span>
  </div>
</template>
