const pad = (n: number) => n.toString().padStart(2, '0')

export function usePartyClock(startsAt: string) {
  const config = useRuntimeConfig()

  // ISO string with an explicit offset — no implementation-defined parsing.
  const target = new Date(startsAt).getTime()

  // Seeded with the baked build time so SSR and the first client render agree,
  // then corrected to the real clock on mount.
  const now = ref(new Date(config.public.buildTime as string).getTime())
  let timer: ReturnType<typeof setInterval> | undefined

  const remaining = computed(() => Math.max(0, target - now.value))
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

  onMounted(() => {
    now.value = Date.now()
    timer = setInterval(() => {
      now.value = Date.now()
      if (started.value && timer) { clearInterval(timer); timer = undefined }
    }, 1000)
  })

  onBeforeUnmount(() => { if (timer) clearInterval(timer) })

  return { remaining, started, formatted }
}
