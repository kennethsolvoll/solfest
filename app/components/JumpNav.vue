<script setup lang="ts">
// A ~12 000px page needs a way out of the scroll.
const links = [
  { href: '#lag', label: 'Ditt lag' },
  { href: '#timeplan', label: 'Timeplan' },
  { href: '#regler', label: 'Regler' },
  { href: '#alle-lag', label: 'Alle lag' },
  { href: '#quests', label: 'Quests' },
  { href: '#poeng', label: 'Poeng' }
]
</script>

<template>
  <nav class="jumpnav" aria-label="Snarveier">
    <a v-for="l in links" :key="l.href" :href="l.href">{{ l.label }}</a>
  </nav>
</template>
