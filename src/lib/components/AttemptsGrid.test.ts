import { render, screen } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import AttemptsGrid, {
  type AttemptRow,
} from './AttemptsGrid.svelte'
import type { AttemptResult, Move, SlotResult } from '../../domain/controller'

const makeSlot = (
  playerMove: Move,
  computerMove: Move,
  highlight: 'green' | 'yellow' | 'red',
): SlotResult => ({
  playerMove,
  computerMove,
  outcome:
    highlight === 'green'
      ? 'win'
      : highlight === 'yellow'
        ? 'tie'
        : 'loss',
  highlight,
  violatedConstraintIds: [],
})

const makeResult = (slots: SlotResult[]): AttemptResult => ({
  slotResults: slots,
  score: slots.reduce(
    (acc, slot) => {
      acc[slot.outcome] += 1
      return acc
    },
    { win: 0, tie: 0, loss: 0 },
  ),
  constraintViolations: [],
  isTargetScoreMet: false,
  constraintsSatisfied: true,
  isWin: false,
})

describe('AttemptsGrid', () => {
  it('shows placeholder when there are no attempts', () => {
    render(AttemptsGrid, { attempts: [] })

    expect(
      screen.getByText(/no attempts yet/i),
    ).toBeInTheDocument()
  })

  it('renders attempt rows with slot highlights and scores', () => {
    const attempts: AttemptRow[] = [
      {
        id: 'a1',
        moves: ['rock', 'paper', 'scissor'],
        result: makeResult([
          makeSlot('rock', 'scissor', 'green'),
          makeSlot('paper', 'paper', 'yellow'),
          makeSlot('scissor', 'rock', 'red'),
        ]),
      },
      {
        id: 'a2',
        moves: ['paper', 'paper', 'paper'],
        result: makeResult([
          makeSlot('paper', 'rock', 'green'),
          makeSlot('paper', 'scissor', 'green'),
          makeSlot('paper', 'paper', 'red'),
        ]),
      },
    ]

    render(AttemptsGrid, { attempts })

    const rows = screen.getAllByRole('listitem', {
      name: /attempt/i,
    })
    expect(rows).toHaveLength(2)

    const firstRowSlots = screen
      .getAllByTestId('attempt-slot')
      .slice(0, 3)
    expect(
      firstRowSlots.map((slot) => slot.dataset.highlight),
    ).toEqual(['green', 'yellow', 'red'])

    const summaries = screen
      .getAllByText(/wins:/i)
      .map((node) => node.textContent)

    expect(summaries).toContain('Wins: 1 · Ties: 1 · Losses: 1')
    expect(summaries).toContain('Wins: 2 · Ties: 0 · Losses: 1')
  })
})
