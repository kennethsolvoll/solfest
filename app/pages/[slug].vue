<script setup lang="ts">
// Every past party stays reachable at /<dato>, e.g. /2025-06-14.
const route = useRoute()
const event = useEventBySlug(String(route.params.slug))

if (!event) {
  throw createError({ statusCode: 404, statusMessage: 'Ingen fest med den datoen', fatal: true })
}
</script>

<template>
  <PartyView :event="event!" />
</template>
