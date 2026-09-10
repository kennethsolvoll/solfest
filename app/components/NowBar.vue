<script setup lang="ts">
import type { TimedItem } from '~/composables/usePartyClock'

/**
 * The highest-value element on the page: the site already knows the schedule
 * and the time, so it should say what is happening rather than make you count.
 */
defineProps<{ current: TimedItem | null; next: TimedItem | null; firstUp?: TimedItem | null }>()
</script>

<template>
  <div class="nowbar" :class="{ idle: !current }">
    <span class="eyebrow label">{{ current ? 'Nå' : 'Snart' }}</span>

    <span class="now-title">
      <RichText v-if="current" :text="current.title" />
      <template v-else>Festen starter</template>
    </span>

    <span class="next">
      <span class="eyebrow">{{ current ? 'Neste' : 'Først ut' }}</span>
      <template v-if="next ?? firstUp">
        <span class="next-title"><RichText :text="(next ?? firstUp)!.title" /></span>
        <time>{{ (next ?? firstUp)!.time }}</time>
      </template>
      <template v-else>
        <span class="next-title">Ingenting</span>
        <time>—</time>
      </template>
    </span>
  </div>
</template>
