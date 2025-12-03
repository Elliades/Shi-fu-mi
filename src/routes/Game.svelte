<script lang="ts">
  import { tutorialLevel } from '../lib/levels/fixtures'
  import AttemptsGrid, { type AttemptRow } from '../lib/components/AttemptsGrid.svelte'
  import InputPad from '../lib/components/InputPad.svelte'
  import { createGameController, type AttemptResult, type Move } from '../domain/controller'
  import { createConstraintScheduler } from '../domain/constraintScheduler'

  const level = tutorialLevel
  const controller = createGameController({
    targetScore: level.targetScore,
    computerMoves: level.computerMoves,
    rowLength: level.baseRowLength,
  })
  const scheduler = createConstraintScheduler(level.constraintTimeline)

  type AttemptRecord = AttemptRow

  const moveSymbols: Record<Move, string> = {
    rock: 'R',
    paper: 'P',
    scissor: 'S',
  }

  let rowLength = level.baseRowLength
  let activeRow: Move[] = []
  let attempts: AttemptRecord[] = []
  let isWin = false

  const updateRowLength = () => {
    rowLength = controller.getRowLength()
  }

  const processConstraintDrops = (elapsed: number) => {
    const events = scheduler.advance(elapsed)
    events.forEach((event) => {
      controller.addConstraint(event.constraint, event.options)
      updateRowLength()
    })
  }

  processConstraintDrops(0)

  const slotDisplay = (index: number) =>
    activeRow[index] ? moveSymbols[activeRow[index]] : '·'

  const handleMove = (move: Move) => {
    if (isWin || activeRow.length >= rowLength) return
    activeRow = [...activeRow, move]
  }

  const handleErase = () => {
    if (isWin || activeRow.length === 0) return
    activeRow = activeRow.slice(0, -1)
  }

  const handleSubmit = () => {
    if (isWin || activeRow.length !== rowLength) return
    const result = controller.submitAttempt(activeRow)
    const attemptId = `attempt-${attempts.length + 1}`
    attempts = [...attempts, { id: attemptId, moves: activeRow, result }]
    activeRow = []
    isWin = result.isWin
  }
</script>

<section class="rounded-3xl bg-surface-muted p-6 shadow-hud">
  <div class="flex flex-col gap-8">
    <header class="space-y-1">
      <p class="text-xs uppercase tracking-[0.4em] text-slate-500">Level briefing</p>
      <h2 class="font-display text-2xl text-slate-50">{level.name}</h2>
      <p class="text-sm text-slate-400">{level.description}</p>
    </header>

    <section aria-label="Target score" class="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4">
      <p class="text-sm font-medium uppercase tracking-widest text-slate-400">Target score</p>
      <p class="mt-1 font-display text-lg text-slate-50">
        Wins: {level.targetScore.win} · Ties: {level.targetScore.tie} · Losses: {level.targetScore.loss}
      </p>
    </section>

    <section aria-label="Active row" class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
      <p class="text-sm font-medium text-slate-400">Enter your combination</p>
      <div class="mt-4 flex gap-3">
        {#each Array(rowLength) as _, index (index)}
          <div
            data-testid="slot"
            class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 text-2xl font-semibold text-slate-200"
          >
            {slotDisplay(index)}
          </div>
        {/each}
      </div>
    </section>

    <InputPad
      disablePad={isWin}
      canErase={activeRow.length > 0}
      canSubmit={activeRow.length === rowLength && !isWin}
      on:move={(event) => handleMove(event.detail.move)}
      on:erase={handleErase}
      on:submit={handleSubmit}
    />

    <section aria-label="Attempts" class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-slate-400">Attempts: {attempts.length}</p>
        {#if isWin}
          <span class="text-sm font-semibold text-win">Puzzle solved!</span>
        {/if}
      </div>
      <div class="mt-4">
        <AttemptsGrid attempts={attempts} />
      </div>
    </section>
  </div>
</section>
