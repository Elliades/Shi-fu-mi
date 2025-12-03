import { describe, expect, it } from 'vitest'
import type { Constraint } from '../../domain/controller'
import { levelCatalog, tutorialLevel } from './fixtures'

const sumTarget = (constraint: Constraint) =>
  constraint.kind === 'structural' && constraint.effect === 'append_box'
    ? constraint.count
    : 0

describe('level fixtures', () => {
  it('keeps initial row length within the allowed range', () => {
    expect(tutorialLevel.baseRowLength).toBeGreaterThanOrEqual(3)
    expect(tutorialLevel.baseRowLength).toBeLessThanOrEqual(10)
  })

  it('has a target score equal to the eventual row length', () => {
    const appended = tutorialLevel.constraintTimeline
      .map((event) => sumTarget(event.constraint))
      .reduce((total, count) => total + count, 0)

    const totalBoxes = tutorialLevel.baseRowLength + appended
    const targetSum =
      tutorialLevel.targetScore.win +
      tutorialLevel.targetScore.tie +
      tutorialLevel.targetScore.loss

    expect(targetSum).toBe(totalBoxes)
  })

  it('provides constraint events sorted by time within duration window', () => {
    const timeline = tutorialLevel.constraintTimeline

    const isSorted = timeline.every((event, index) => {
      if (index === 0) return true
      return event.atSecond >= timeline[index - 1].atSecond
    })

    expect(isSorted).toBe(true)

    const lastSecond = timeline.at(-1)?.atSecond ?? 0
    expect(lastSecond).toBeLessThanOrEqual(tutorialLevel.durationSeconds)
  })

  it('never references slots beyond computer itinerary length', () => {
    const maxIndex =
      tutorialLevel.baseRowLength +
      tutorialLevel.constraintTimeline
        .map((event) => sumTarget(event.constraint))
        .reduce((total, count) => total + count, 0) -
      1

    const slotEvents = tutorialLevel.constraintTimeline.filter(
      (event) =>
        event.constraint.kind === 'slot_move' ||
        event.constraint.kind === 'slot_outcome',
    )

    expect(slotEvents.length).toBeGreaterThan(0)
    slotEvents.forEach((event) => {
      expect(event.constraint.index).toBeLessThanOrEqual(maxIndex)
    })
  })

  it('exposes a catalog with unique and stable ids', () => {
    const ids = levelCatalog.map((level) => level.id)
    const unique = new Set(ids)

    expect(ids.length).toBeGreaterThan(0)
    expect(unique.size).toBe(ids.length)
  })
})
