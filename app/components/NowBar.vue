<script setup lang="ts">
import type { TimedItem, Phase } from '~/composables/usePartyClock'

/**
 * Always reads NÅ / NESTE. Three states behind it:
 *   pending  — party open, first activity hasn't begun (NÅ = idleLabel)
 *   active   — an activity is running
 *   finished — the programme is over
 */
withDefaults(defineProps<{
  phase: Phase
  current: TimedItem | null
  next: TimedItem | null
  idleLabel?: string
}>(), { idleLabel: 'Mingling' })
</script>

<template>
  <div class="nowbar" :class="{ idle: phase === 'finished' }">
    <span class="eyebrow label">Nå</span>

    <span class="now-title">
      <RichText v-if="current" :text="current.title" />
      <template v-else-if="phase === 'pending'">{{ idleLabel }}</template>
      <template v-else>Programmet er ferdig</template>
    </span>

    <span class="next">
      <span class="eyebrow">Neste</span>
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
