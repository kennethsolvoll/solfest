<script setup lang="ts">
import type { SideQuest } from '~/composables/useEvents'
defineProps<{ quests: SideQuest[] }>()
</script>

<template>
  <div class="quests">
    <div v-for="(quest, i) in quests" :key="i" class="quest">
      <RichText tag="h3" :text="quest.title" />
      <RichText tag="p" :text="quest.text" />
    </div>
  </div>
</template>
