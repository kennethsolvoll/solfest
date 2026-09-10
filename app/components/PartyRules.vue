<script setup lang="ts">
defineProps<{ rules: string[] }>()
</script>

<template>
  <ul class="rules">
    <RichText v-for="(rule, i) in rules" :key="i" tag="li" :text="rule" />
  </ul>
</template>
