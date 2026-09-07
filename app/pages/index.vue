<script setup lang="ts">
// "/" always shows the most recent party. Adding a new JSON file with a later
// date is all it takes to make that party the front page.
const event = useCurrentEvent()
</script>

<template>
  <PartyView v-if="event" :event="event" />
  <p v-else>Ingen fester lagt inn ennå.</p>
</template>
