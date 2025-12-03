import type { Constraint } from './controller'
import type { ConstraintTimelineEvent } from '../lib/levels/fixtures'

export interface SchedulerEvent {
  sourceId: string
  atSecond: number
  constraint: Constraint
  options?: { replaceId: string }
}

export interface ConstraintScheduler {
  advance(elapsedSeconds: number): SchedulerEvent[]
  getActiveConstraints(): Constraint[]
  peekNextEvent(): ConstraintTimelineEvent | null
  isComplete(): boolean
}

export function createConstraintScheduler(
  timeline: ConstraintTimelineEvent[],
): ConstraintScheduler {
  const ordered = [...timeline].sort((a, b) => a.atSecond - b.atSecond)
  let cursor = 0
  let lastElapsed = 0
  const processed = new Set<string>()
  const active = new Map<string, Constraint>()

  const advance = (elapsedSeconds: number): SchedulerEvent[] => {
    if (elapsedSeconds < lastElapsed) {
      throw new Error(
        `Cannot rewind scheduler time (received ${elapsedSeconds}s after ${lastElapsed}s)`,
      )
    }
    lastElapsed = elapsedSeconds

    const emitted: SchedulerEvent[] = []

    while (cursor < ordered.length && ordered[cursor].atSecond <= elapsedSeconds) {
      const event = ordered[cursor]
      cursor += 1

      if (processed.has(event.id)) {
        continue
      }

      processed.add(event.id)

      if (event.replaceConstraintId) {
        active.delete(event.replaceConstraintId)
      }

      active.set(event.constraint.id, event.constraint)

      emitted.push({
        sourceId: event.id,
        atSecond: event.atSecond,
        constraint: event.constraint,
        options: event.replaceConstraintId
          ? { replaceId: event.replaceConstraintId }
          : undefined,
      })
    }

    return emitted
  }

  return {
    advance,
    getActiveConstraints: () => Array.from(active.values()),
    peekNextEvent: () => ordered[cursor] ?? null,
    isComplete: () => cursor >= ordered.length,
  }
}
