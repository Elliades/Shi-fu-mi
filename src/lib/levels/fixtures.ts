import type {
  Constraint,
  LevelConfig,
  Move,
  ScoreBreakdown,
} from '../../domain/controller'

export interface ConstraintTimelineEvent {
  id: string
  atSecond: number
  constraint: Constraint
  replaceConstraintId?: string
}

export interface LevelScript extends LevelConfig {
  id: string
  name: string
  description: string
  durationSeconds: number
  baseRowLength: number
  constraintTimeline: ConstraintTimelineEvent[]
}

const tutorialTargetScore: ScoreBreakdown = { win: 2, tie: 1, loss: 1 }
const tutorialComputerMoves: Move[] = ['rock', 'paper', 'scissor', 'rock', 'paper']

export const tutorialLevel: LevelScript = {
  id: 'tutorial-001',
  name: 'Calibration Row',
  description:
    'Learn how to hit a target score while new constraints drip in over time.',
  durationSeconds: 60,
  baseRowLength: 3,
  targetScore: tutorialTargetScore,
  computerMoves: tutorialComputerMoves,
  constraintTimeline: [
    {
      id: 'tutorial-slot-2-win',
      atSecond: 10,
      constraint: {
        id: 'slot-2-win',
        kind: 'slot_outcome',
        index: 1,
        outcome: 'win',
      },
    },
    {
      id: 'tutorial-append-box',
      atSecond: 25,
      constraint: {
        id: 'append-fourth-box',
        kind: 'structural',
        effect: 'append_box',
        count: 1,
      },
    },
    {
      id: 'tutorial-final-rock',
      atSecond: 40,
      constraint: {
        id: 'final-rock',
        kind: 'slot_move',
        index: 3,
        move: 'rock',
      },
    },
  ],
}

export const levelCatalog: LevelScript[] = [tutorialLevel]
