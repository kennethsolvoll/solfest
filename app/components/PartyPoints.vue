<script setup lang="ts">
import type { PointsRow } from '~/composables/useEvents'
defineProps<{ title: string; rows: PointsRow[]; footnote: string }>()
</script>

<template>
  <section class="points">
    <h2>{{ title }}</h2>
    <table class="points-table">
      <thead>
        <tr>
          <th>Aktivitet</th>
          <th>Poeng</th>
          <th>Kommentar</th>
        </tr>
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
  </section>
</template>
