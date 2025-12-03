import { describe, expect, it, beforeEach } from 'vitest'
import {
  createGameController,
  type GameController,
  type LevelConfig,
  type Move,
} from './controller'

const computerItinerary: Move[] = ['rock', 'paper', 'scissor', 'rock']
const level: LevelConfig = {
  targetScore: { win: 1, tie: 1, loss: 1 },
  computerMoves: computerItinerary,
  rowLength: 3,
}

describe('GameController', () => {
  let controller: GameController

  beforeEach(() => {
    controller = createGameController(level)
  })

  it('evaluates attempts and reports a win when the target score is met', () => {
    const attempt: Move[] = ['paper', 'paper', 'paper']

    const result = controller.submitAttempt(attempt)

    expect(result.score).toEqual({ win: 1, tie: 1, loss: 1 })
    expect(result.isTargetScoreMet).toBe(true)
    expect(result.constraintsSatisfied).toBe(true)
    expect(result.isWin).toBe(true)
    expect(result.slotResults.map((slot) => slot.highlight)).toEqual([
      'green',
      'yellow',
      'red',
    ])
  })

  it('flags constraint violations for required outcomes and moves', () => {
    controller.addConstraint({
      id: 'c1',
      kind: 'slot_outcome',
      index: 1,
      outcome: 'win',
    })
    controller.addConstraint({
      id: 'c2',
      kind: 'slot_move',
      index: 2,
      move: 'scissor',
    })

    const result = controller.submitAttempt(['paper', 'paper', 'rock'])

    expect(result.constraintViolations).toEqual([
      { id: 'c1', description: 'Slot 2 must be win', index: 1 },
      { id: 'c2', description: 'Slot 3 must be scissor', index: 2 },
    ])
    expect(result.constraintsSatisfied).toBe(false)
    expect(result.isWin).toBe(false)
    expect(result.slotResults[1].highlight).toBe('red')
    expect(result.slotResults[2].highlight).toBe('red')
  })

  it('allows replacing constraints when requested', () => {
    controller.addConstraint(
      {
        id: 'legacy',
        kind: 'slot_move',
        index: 0,
        move: 'paper',
      },
      { replaceId: 'legacy' },
    )
    controller.addConstraint(
      {
        id: 'new-one',
        kind: 'slot_move',
        index: 0,
        move: 'paper',
      },
      { replaceId: 'legacy' },
    )

    const constraintIds = controller.getConstraints().map((c) => c.id)

    expect(constraintIds).toEqual(['new-one'])
  })

  it('expands the row when an append_box constraint is introduced', () => {
    controller.addConstraint({
      id: 'extra-box',
      kind: 'structural',
      effect: 'append_box',
      count: 1,
    })

    expect(controller.getRowLength()).toBe(4)

    expect(() => controller.submitAttempt(['paper', 'paper', 'rock'])).toThrow(
      /requires 4 moves/,
    )

    const result = controller.submitAttempt(['paper', 'paper', 'paper', 'scissor'])
    expect(result.score).toEqual({ win: 1, tie: 1, loss: 2 })
  })

  it('shrinks row length when a structural constraint is replaced', () => {
    controller.addConstraint({
      id: 'extra-box',
      kind: 'structural',
      effect: 'append_box',
      count: 1,
    })
    expect(controller.getRowLength()).toBe(4)

    controller.addConstraint(
      {
        id: 'replacement',
        kind: 'slot_move',
        index: 0,
        move: 'rock',
      },
      { replaceId: 'extra-box' },
    )

    expect(controller.getRowLength()).toBe(3)
  })

  it('reports constraint violations when a slot index exceeds current row length', () => {
    controller.addConstraint({
      id: 'slot-four-win',
      kind: 'slot_outcome',
      index: 3,
      outcome: 'win',
    })

    const result = controller.submitAttempt(['paper', 'paper', 'paper'])

    expect(result.constraintViolations).toEqual([
      {
        id: 'slot-four-win',
        description: 'Slot 4 must be win',
        index: 3,
      },
    ])
    expect(result.constraintsSatisfied).toBe(false)
  })
})
