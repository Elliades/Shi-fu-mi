import { describe, expect, it } from 'vitest'
import { tutorialLevel } from '../lib/levels/fixtures'
import { createConstraintScheduler } from './constraintScheduler'
import type { ConstraintTimelineEvent } from '../lib/levels/fixtures'

describe('constraint scheduler', () => {
  it('emits constraints once elapsed time reaches their threshold', () => {
    const scheduler = createConstraintScheduler(tutorialLevel.constraintTimeline)

    expect(scheduler.advance(5)).toHaveLength(0)

    const firstBatch = scheduler.advance(12)
    expect(firstBatch).toHaveLength(1)
    expect(firstBatch[0].constraint.id).toBe('slot-2-win')

    const secondBatch = scheduler.advance(40)
    expect(secondBatch).toHaveLength(2)
    expect(secondBatch.map((event) => event.constraint.id)).toEqual([
      'append-fourth-box',
      'final-rock',
    ])
  })

  it('never replays previously emitted constraints', () => {
    const scheduler = createConstraintScheduler(tutorialLevel.constraintTimeline)

    scheduler.advance(60)
    const after = scheduler.advance(60)

    expect(after).toHaveLength(0)
    expect(scheduler.isComplete()).toBe(true)
  })

  it('supports replacing constraints when timeline specifies replaceId', () => {
    const timeline: ConstraintTimelineEvent[] = [
      {
        id: 'baseline',
        atSecond: 2,
        constraint: {
          id: 'slot-1-win',
          kind: 'slot_outcome',
          index: 0,
          outcome: 'win',
        },
      },
      {
        id: 'replacement',
        atSecond: 5,
        replaceConstraintId: 'slot-1-win',
        constraint: {
          id: 'slot-1-loss',
          kind: 'slot_outcome',
          index: 0,
          outcome: 'loss',
        },
      },
    ]

    const scheduler = createConstraintScheduler(timeline)
    const [first] = scheduler.advance(2)

    expect(first.options).toBeUndefined()

    const [replacement] = scheduler.advance(6)
    expect(replacement.options).toEqual({ replaceId: 'slot-1-win' })
  })

  it('exposes packaged events for the next constraint in the queue', () => {
    const scheduler = createConstraintScheduler(tutorialLevel.constraintTimeline)

    const peek1 = scheduler.peekNextEvent()
    expect(peek1?.atSecond).toBe(10)

    scheduler.advance(10)
    const peek2 = scheduler.peekNextEvent()
    expect(peek2?.atSecond).toBe(25)
  })

  it('returns active constraints accumulated over time', () => {
    const scheduler = createConstraintScheduler(tutorialLevel.constraintTimeline)

    expect(scheduler.getActiveConstraints()).toHaveLength(0)

    scheduler.advance(12)
    expect(scheduler.getActiveConstraints().map((c) => c.id)).toEqual([
      'slot-2-win',
    ])

    scheduler.advance(60)
    expect(
      scheduler.getActiveConstraints().map((c) => c.id).sort(),
    ).toEqual(['append-fourth-box', 'final-rock', 'slot-2-win'].sort())
  })
})
