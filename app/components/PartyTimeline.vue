<script setup lang="ts">
import type { TimedItem, ItemState } from '~/composables/usePartyClock'

defineProps<{ items: TimedItem[]; stateOf: (i: number) => ItemState }>()
</script>

<template>
  <ol class="timeline">
    <li v-for="(item, i) in items" :key="item.time + item.title" class="ti" :class="stateOf(i)">
      <time>{{ item.time }}</time>
      <div class="body">
        <RichText tag="h3" :text="item.title" />
        <RichText tag="p" :text="item.text" />
      </div>
    </li>
  </ol>
</template>
