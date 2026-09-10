<script setup lang="ts">
import type { PointsRow } from '~/composables/useEvents'
defineProps<{ rows: PointsRow[]; footnote: string }>()
</script>

<template>
  <div>
    <table class="ptable">
      <thead>
        <tr><th>Aktivitet</th><th style="text-align:right">Poeng</th><th>Kommentar</th></tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td><RichText :text="row.activity" /></td>
          <td>{{ row.points }}</td>
          <td>{{ row.comment }}</td>
        </tr>
      </tbody>
    </table>
    <p class="points-footnote">{{ footnote }}</p>
  </div>
</template>
