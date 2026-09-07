<script setup lang="ts">
import type { Team } from '~/composables/useEvents'
defineProps<{ teams: Team[] }>()
</script>

<template>
  <section>
    <h2>Lagoppstillingene:</h2>
    <div v-for="team in teams" :key="team.name" class="team">
      <h3>{{ team.name }}</h3>
      <ul>
        <RichText v-for="(member, i) in team.members" :key="i" tag="li" :text="member" />
      </ul>
    </div>
  </section>
</template>
