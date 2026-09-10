export interface ScheduleItem { time: string; title: string; text: string }
export interface Team { name: string; members: string[] }
export interface SideQuest { title: string; text: string }
export interface PointsRow { activity: string; points: string; comment: string }

export interface PartyEvent {
  slug: string
  name: string
  startsAt: string
  minigame?: boolean
  /** Shown as NÅ before the first activity begins. Defaults to "Mingling". */
  idleLabel?: string
  beforeStart: { title: string; lines: string[] }
  afterStart: { title: string; lines: string[] }
  intro: string
  rules: string[]
  schedule: ScheduleItem[]
  teams: Team[]
  sideQuests: SideQuest[]
  points: { title: string; rows: PointsRow[]; footnote: string }
  footer: string
}

const modules = import.meta.glob('../../content/events/*.json', { eager: true })

/** All parties, newest first. */
export function useAllEvents(): PartyEvent[] {
  return Object.values(modules)
    .map((m: any) => (m.default ?? m) as PartyEvent)
    .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
}

/** The party the site shows at "/" — simply the most recent one. */
export function useCurrentEvent(): PartyEvent | undefined {
  return useAllEvents()[0]
}

export function useEventBySlug(slug: string): PartyEvent | undefined {
  return useAllEvents().find(e => e.slug === slug)
}
