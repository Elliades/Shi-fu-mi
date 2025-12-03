export type Move = 'rock' | 'paper' | 'scissor'
export type Outcome = 'win' | 'tie' | 'loss'
export type HighlightColor = 'green' | 'yellow' | 'red'

export interface ScoreBreakdown {
  win: number
  tie: number
  loss: number
}

export interface LevelConfig {
  targetScore: ScoreBreakdown
  computerMoves: Move[]
  rowLength?: number
}

export interface SlotOutcomeConstraint {
  id: string
  kind: 'slot_outcome'
  index: number
  outcome: Outcome
}

export interface SlotMoveConstraint {
  id: string
  kind: 'slot_move'
  index: number
  move: Move
}

export interface AppendBoxConstraint {
  id: string
  kind: 'structural'
  effect: 'append_box'
  count: number
}

export type Constraint =
  | SlotOutcomeConstraint
  | SlotMoveConstraint
  | AppendBoxConstraint

export interface ConstraintViolation {
  id: string
  description: string
  index?: number
}

export interface SlotResult {
  playerMove: Move
  computerMove: Move
  outcome: Outcome
  highlight: HighlightColor
  violatedConstraintIds: string[]
}

export interface AttemptResult {
  slotResults: SlotResult[]
  score: ScoreBreakdown
  constraintViolations: ConstraintViolation[]
  isTargetScoreMet: boolean
  constraintsSatisfied: boolean
  isWin: boolean
}

export interface GameController {
  submitAttempt(moves: Move[]): AttemptResult
  addConstraint(constraint: Constraint, options?: { replaceId?: string }): void
  getConstraints(): Constraint[]
  getRowLength(): number
}

const outcomeColors: Record<Outcome, HighlightColor> = {
  win: 'green',
  tie: 'yellow',
  loss: 'red',
}

const beats: Record<Move, Move> = {
  rock: 'scissor',
  paper: 'rock',
  scissor: 'paper',
}

export function createGameController(config: LevelConfig): GameController {
  const maxRowLength = config.computerMoves.length
  if (maxRowLength === 0) {
    throw new Error('Level must provide at least one computer move')
  }

  let currentRowLength = config.rowLength ?? maxRowLength
  if (currentRowLength > maxRowLength) {
    throw new Error('Row length cannot exceed available computer moves')
  }

  const baseRowLength = currentRowLength
  const structuralExtensions = new Map<string, number>()
  let constraints: Constraint[] = []

  const structuralExtensionTotal = () =>
    Array.from(structuralExtensions.values()).reduce((sum, count) => sum + count, 0)

  const recomputeRowLength = () => {
    currentRowLength = Math.min(baseRowLength + structuralExtensionTotal(), maxRowLength)
  }

  const removeConstraint = (constraintId?: string) => {
    if (!constraintId) return
    const target = constraints.find((constraint) => constraint.id === constraintId)
    if (!target) {
      constraints = constraints.filter((constraint) => constraint.id !== constraintId)
      return
    }

    constraints = constraints.filter((constraint) => constraint.id !== constraintId)
    if (target.kind === 'structural' && target.effect === 'append_box') {
      structuralExtensions.delete(target.id)
      recomputeRowLength()
    }
  }

  const addConstraint = (
    constraint: Constraint,
    options?: { replaceId?: string },
  ) => {
    if (options?.replaceId) {
      removeConstraint(options.replaceId)
    }
    removeConstraint(constraint.id)

    if (constraint.kind === 'structural' && constraint.effect === 'append_box') {
      const proposedExtension = structuralExtensionTotal() + constraint.count
      const requestedLength = baseRowLength + proposedExtension
      if (requestedLength > maxRowLength) {
        throw new Error(
          `Cannot append ${constraint.count} boxes beyond itinerary length of ${maxRowLength}`,
        )
      }
      structuralExtensions.set(constraint.id, constraint.count)
      recomputeRowLength()
    }

    constraints = [...constraints, constraint]

    if (constraint.kind !== 'structural') {
      recomputeRowLength()
    }
  }

  const getConstraints = () => [...constraints]
  const getRowLength = () => currentRowLength

  const submitAttempt = (moves: Move[]): AttemptResult => {
    if (moves.length !== currentRowLength) {
      throw new Error(`Attempt requires ${currentRowLength} moves`)
    }

    const slotResults: SlotResult[] = moves.map((playerMove, index) => {
      const computerMove = config.computerMoves[index]
      if (!computerMove) {
        throw new Error(`Missing computer move for slot ${index + 1}`)
      }

      const outcome = determineOutcome(playerMove, computerMove)
      const violatedConstraintIds = evaluateSlotConstraints(
        constraints,
        index,
        playerMove,
        outcome,
      )
      const highlight =
        violatedConstraintIds.length > 0 ? 'red' : outcomeColors[outcome]

      return {
        playerMove,
        computerMove,
        outcome,
        highlight,
        violatedConstraintIds,
      }
    })

    const constraintViolations = collectViolations(
      constraints,
      slotResults,
      currentRowLength,
    )
    const score = scoreAttempt(slotResults)
    const isTargetScoreMet = compareScore(score, config.targetScore)
    const constraintsSatisfied = constraintViolations.length === 0
    const isWin = isTargetScoreMet && constraintsSatisfied

    return {
      slotResults,
      score,
      constraintViolations,
      isTargetScoreMet,
      constraintsSatisfied,
      isWin,
    }
  }

  return {
    submitAttempt,
    addConstraint,
    getConstraints,
    getRowLength,
  }
}

function determineOutcome(player: Move, computer: Move): Outcome {
  if (player === computer) return 'tie'
  if (beats[player] === computer) return 'win'
  return 'loss'
}

function evaluateSlotConstraints(
  constraints: Constraint[],
  index: number,
  playerMove: Move,
  outcome: Outcome,
): string[] {
  return constraints
    .filter((constraint): constraint is SlotOutcomeConstraint | SlotMoveConstraint =>
      constraint.kind === 'slot_outcome' || constraint.kind === 'slot_move',
    )
    .filter((constraint) => constraint.index === index)
    .reduce<string[]>((acc, constraint) => {
      if (
        constraint.kind === 'slot_outcome' &&
        constraint.outcome !== outcome
      ) {
        acc.push(constraint.id)
      }

      if (constraint.kind === 'slot_move' && constraint.move !== playerMove) {
        acc.push(constraint.id)
      }

      return acc
    }, [])
}

function collectViolations(
  constraints: Constraint[],
  slotResults: SlotResult[],
  rowLength: number,
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = []

  for (const constraint of constraints) {
    if (constraint.kind === 'slot_outcome' || constraint.kind === 'slot_move') {
      if (constraint.index >= rowLength) {
        violations.push({
          id: constraint.id,
          description:
            constraint.kind === 'slot_outcome'
              ? `Slot ${constraint.index + 1} must be ${constraint.outcome}`
              : `Slot ${constraint.index + 1} must be ${constraint.move}`,
          index: constraint.index,
        })
        continue
      }

      const slot = slotResults[constraint.index]
      if (slot?.violatedConstraintIds.includes(constraint.id)) {
        violations.push({
          id: constraint.id,
          description:
            constraint.kind === 'slot_outcome'
              ? `Slot ${constraint.index + 1} must be ${constraint.outcome}`
              : `Slot ${constraint.index + 1} must be ${constraint.move}`,
          index: constraint.index,
        })
      }
    }
  }

  return violations
}

function scoreAttempt(slotResults: SlotResult[]): ScoreBreakdown {
  return slotResults.reduce<ScoreBreakdown>(
    (tally, slot) => {
      tally[slot.outcome] += 1
      return tally
    },
    { win: 0, tie: 0, loss: 0 },
  )
}

function compareScore(a: ScoreBreakdown, b: ScoreBreakdown): boolean {
  return a.win === b.win && a.tie === b.tie && a.loss === b.loss
}
