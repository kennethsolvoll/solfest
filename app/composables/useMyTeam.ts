const KEY = 'solfest.myTeam'

/** Which team the viewer is on. Per-viewer and per-device, so localStorage. */
export function useMyTeam() {
  const picked = useState<number | null>('solfest-my-team', () => null)

  function load(teamCount: number) {
    try {
      const v = localStorage.getItem(KEY)
      const n = v === null ? null : Number(v)
      if (n !== null && Number.isInteger(n) && n >= 0 && n < teamCount) picked.value = n
    } catch { /* private mode */ }
  }

  function pick(i: number | null) {
    picked.value = i
    try {
      if (i === null) localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, String(i))
    } catch { /* private mode */ }
  }

  return { picked, load, pick }
}
