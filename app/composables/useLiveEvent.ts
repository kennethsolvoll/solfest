import type { RealtimeChannel } from '@supabase/supabase-js'
import type { PartyEvent } from '~/composables/useEvents'

/**
 * Baseline + overlay.
 *
 * The page paints instantly from the JSON compiled into the build, so it works
 * with no network at all. If Supabase is reachable we swap in the live row and
 * then subscribe: any later edit from /admin lands on every phone in about a
 * second, with no rebuild and no deploy.
 *
 * Every failure path keeps the baseline on screen. A dead connection at the
 * party is no worse than the site was before.
 */
export function useLiveEvent(baseline: PartyEvent) {
  const event = ref<PartyEvent>(baseline)
  const updatedAt = ref<string | null>(null)
  const isLive = ref(false)

  let channel: RealtimeChannel | null = null

  function apply(row: { data: PartyEvent; updated_at: string } | null) {
    if (!row?.data) return
    event.value = row.data
    updatedAt.value = row.updated_at
    isLive.value = true
  }

  onMounted(async () => {
    const supabase = useSupabase()
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('events')
        .select('data, updated_at')
        .eq('slug', baseline.slug)
        .maybeSingle()
      if (!error) apply(data as any)
    } catch {
      // Offline or the project is down — the baseline stays on screen.
    }

    try {
      channel = supabase
        .channel(`event:${baseline.slug}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'events', filter: `slug=eq.${baseline.slug}` },
          payload => apply(payload.new as any)
        )
        .subscribe()
    } catch {
      // No realtime; the fetched snapshot is still better than nothing.
    }
  })

  onBeforeUnmount(() => {
    if (channel) useSupabase()?.removeChannel(channel)
  })

  return { event, updatedAt, isLive }
}
