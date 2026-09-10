<script setup lang="ts">
/**
 * The small marker syntax used in content/events/*.json:
 *   **text**   ->  gold sparkle span
 *   :flame:    ->  animated flame
 *   :flex: etc ->  plain emoji, see EMOJI below
 *
 * Deliberately not v-html: the data stays free of markup.
 * An unknown :shortcode: is left as literal text on purpose, so a typo is
 * visible on the page rather than silently disappearing.
 */
const props = defineProps<{ text: string; tag?: string }>()

const EMOJI: Record<string, string> = {
  flex: '💪',
  beer: '🍺',
  shot: '🥃',
  chili: '🌶️',
  fire: '🔥',
  crown: '👑',
  trophy: '🏆',
  sparkles: '✨',
  party: '🎉',
  cake: '🎂',
  gift: '🎁',
  music: '🎵',
  mic: '🎤',
  art: '🎨',
  hotdog: '🌭',
  skull: '💀',
  star: '⭐',
  clock: '⏰'
}

type Token = { type: 'text' | 'sparkle' | 'flame'; value: string }

// Shortcodes must start with a letter so clock times ("19:00") never match.
const RE = /\*\*(.+?)\*\*|:([a-zA-Z][a-zA-Z0-9_+-]*):/g

const tokens = computed<Token[]>(() => {
  const out: Token[] = []
  let last = 0
  let m: RegExpExecArray | null

  const push = (type: Token['type'], value: string) => {
    if (type === 'text' && out.length && out[out.length - 1]!.type === 'text') {
      out[out.length - 1]!.value += value      // keep adjacent text in one node
    } else {
      out.push({ type, value })
    }
  }

  RE.lastIndex = 0
  while ((m = RE.exec(props.text)) !== null) {
    if (m.index > last) push('text', props.text.slice(last, m.index))

    if (m[1] !== undefined) {
      push('sparkle', m[1])
    } else {
      const name = m[2]!.toLowerCase()
      if (name === 'flame') push('flame', '')
      else if (EMOJI[name]) push('text', EMOJI[name]!)
      else push('text', m[0])                  // unknown code: show it as written
    }
    last = m.index + m[0].length
  }
  if (last < props.text.length) push('text', props.text.slice(last))
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
