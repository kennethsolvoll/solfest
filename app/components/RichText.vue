<script setup lang="ts">
/**
 * Renders the small marker syntax used in content/events/*.json:
 *   **text**  ->  gold sparkle span
 *   :flame:   ->  animated flame
 * Deliberately not v-html: the data stays free of markup.
 */
const props = defineProps<{ text: string; tag?: string }>()

type Token = { type: 'text' | 'sparkle' | 'flame'; value: string }

const tokens = computed<Token[]>(() => {
  const out: Token[] = []
  const re = /\*\*(.+?)\*\*|:flame:/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(props.text)) !== null) {
    if (m.index > last) out.push({ type: 'text', value: props.text.slice(last, m.index) })
    if (m[1] !== undefined) out.push({ type: 'sparkle', value: m[1] })
    else out.push({ type: 'flame', value: '' })
    last = m.index + m[0].length
  }
  if (last < props.text.length) out.push({ type: 'text', value: props.text.slice(last) })
  return out
})
</script>

<template>
  <component :is="tag ?? 'span'">
    <template v-for="(t, i) in tokens" :key="i">
      <span v-if="t.type === 'sparkle'" class="sparkle">{{ t.value }}</span>
      <span v-else-if="t.type === 'flame'" class="flame" />
      <template v-else>{{ t.value }}</template>
    </template>
  </component>
</template>
