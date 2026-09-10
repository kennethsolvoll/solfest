<script setup lang="ts">
import type { PointsRow } from '~/composables/useEvents'

// A list, not a table: three columns do not fit a phone, and the activity
// names now carry emoji that were wrapping mid-cell.
defineProps<{ rows: PointsRow[]; footnote: string }>()
</script>

<template>
  <div>
    <ul class="points-list">
      <li v-for="(row, i) in rows" :key="i">
        <div class="points-row">
          <RichText class="points-what" :text="row.activity" />
          <span class="points-val">{{ row.points }}</span>
        </div>
        <p class="points-note">{{ row.comment }}</p>
      </li>
    </ul>
    <p class="points-footnote">{{ footnote }}</p>
  </div>
</template>
