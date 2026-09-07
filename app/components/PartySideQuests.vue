<script setup lang="ts">
import type { SideQuest } from '~/composables/useEvents'
defineProps<{ quests: SideQuest[] }>()
</script>

<template>
  <section>
    <h2>Side Quests:</h2>
    <div v-for="(quest, i) in quests" :key="i" class="side-quest">
      <div class="wrapper">
        <RichText tag="h3" :text="quest.title" />
        <RichText tag="p" :text="quest.text" />
      </div>
    </div>
  </section>
</template>
