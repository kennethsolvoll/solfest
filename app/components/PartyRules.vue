<script setup lang="ts">
defineProps<{ rules: string[] }>()
</script>

<template>
  <section>
    <h2>Festregler:</h2>
    <ul class="rules-list">
      <RichText v-for="(rule, i) in rules" :key="i" tag="li" :text="rule" />
    </ul>
  </section>
</template>
