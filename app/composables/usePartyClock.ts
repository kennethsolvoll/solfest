import type { PartyEvent, ScheduleItem } from '~/composables/useEvents'

const pad = (n: number) => n.toString().padStart(2, '0')

export interface TimedItem extends ScheduleItem { at: number }
export type ItemState = 'done' | 'current' | 'next' | 'future'

/**
 * Resolves an "HH:MM" schedule entry against the event's own date and offset,
 * so the timeline never depends on the viewer's timezone.
 */
function itemTimestamp(time: string, startsAt: string): number {
  const m = startsAt.match(/^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}(?::\d{2})?(.*)$/)
  if (!m) return Number.NaN
  const [, date, offset] = m
  let ts = new Date(`${date}T${time}:00${offset || 'Z'}`).getTime()
  // An entry timed before the party begins belongs to the small hours after it.
  if (ts < new Date(startsAt).getTime() - 6 * 3_600_000) ts += 86_400_000
  return ts
}

export function usePartyClock(source: MaybeRefOrGetter<PartyEvent>) {
  const config = useRuntimeConfig()
  const event = computed(() => toValue(source))
  const target = computed(() => new Date(event.value.startsAt).getTime())

  // Seeded from the baked build time so SSR and the first client render agree,
  // then corrected to the real clock on mount. No hydration mismatch.
  const now = ref(new Date(config.public.buildTime as string).getTime())
  let timer: ReturnType<typeof setInterval> | undefined

  const remaining = computed(() => Math.max(0, target.value - now.value))
  const started = computed(() => remaining.value <= 0)

  const formatted = computed(() => {
    const t = remaining.value
    const days = Math.floor(t / 86_400_000)
    const hours = Math.floor((t % 86_400_000) / 3_600_000)
    const minutes = Math.floor((t % 3_600_000) / 60_000)
    const seconds = Math.floor((t % 60_000) / 1000)
    return days > 0
      ? `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  })

  const items = computed<TimedItem[]>(() =>
    event.value.schedule.map(s => ({ ...s, at: itemTimestamp(s.time, event.value.startsAt) }))
  )

  const currentIndex = computed(() => {
    let idx = -1
    items.value.forEach((it, i) => { if (now.value >= it.at) idx = i })
    return idx
  })

  const current = computed<TimedItem | null>(() => items.value[currentIndex.value] ?? null)
  const next = computed<TimedItem | null>(() => items.value[currentIndex.value + 1] ?? null)

  function stateOf(i: number): ItemState {
    if (i < currentIndex.value) return 'done'
    if (i === currentIndex.value) return 'current'
    if (i === currentIndex.value + 1) return 'next'
    return 'future'
  }

  onMounted(() => {
    now.value = Date.now()
    timer = setInterval(() => { now.value = Date.now() }, 1000)
  })
  onBeforeUnmount(() => { if (timer) clearInterval(timer) })

  return { now, remaining, started, formatted, items, current, next, stateOf }
}
