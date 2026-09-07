<script setup lang="ts">
import type { ScheduleItem } from '~/composables/useEvents'
defineProps<{ items: ScheduleItem[] }>()
</script>

<template>
  <section>
    <h2>Timeplan:</h2>
    <div v-for="(item, i) in items" :key="i" class="schedule-item">
      <strong><RichText :text="`${item.time} - ${item.title}`" /></strong>
      <RichText tag="p" :text="item.text" />
    </div>
  </section>
</template>
