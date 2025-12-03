<script lang="ts">
  import { onMount } from 'svelte'
  import { tutorialLevel } from '../lib/levels/fixtures'
  import AttemptsGrid, { type AttemptRow } from '../lib/components/AttemptsGrid.svelte'
  import InputPad from '../lib/components/InputPad.svelte'
  import {
    createGameController,
    type AttemptResult,
    type Move,
    type Constraint,
    type ScoreBreakdown,
  } from '../domain/controller'
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
  let lastResult: AttemptResult | null = null
  let activeConstraints = scheduler.getActiveConstraints()
  let elapsedSeconds = 0
  let remainingSeconds = level.durationSeconds
  let timerId: ReturnType<typeof setInterval> | null = null

  const updateRowLength = () => {
    rowLength = controller.getRowLength()
  }

  const refreshConstraints = () => {
    activeConstraints = scheduler.getActiveConstraints()
  }

  const processConstraintDrops = (elapsed: number) => {
    const events = scheduler.advance(elapsed)
    events.forEach((event) => {
      controller.addConstraint(event.constraint, event.options)
      updateRowLength()
    })
    refreshConstraints()
  }

  processConstraintDrops(0)

  const slotDisplay = (index: number) =>
    activeRow[index] ? moveSymbols[activeRow[index]] : '·'

  const stopTimer = () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  const startTimer = () => {
    if (timerId) return
    timerId = setInterval(() => {
      if (isWin || elapsedSeconds >= level.durationSeconds) {
        stopTimer()
        return
      }

      elapsedSeconds = Math.min(level.durationSeconds, elapsedSeconds + 1)
      remainingSeconds = Math.max(level.durationSeconds - elapsedSeconds, 0)
      processConstraintDrops(elapsedSeconds)

      if (elapsedSeconds >= level.durationSeconds) {
        stopTimer()
      }
    }, 1000)
  }

  onMount(() => {
    startTimer()
    return () => stopTimer()
  })

  const formatTime = (seconds: number) => {
    const clamped = Math.max(0, seconds)
    const minutes = Math.floor(clamped / 60)
    const secs = clamped % 60
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  const formatScore = (score?: ScoreBreakdown | null) =>
    score ? `${score.win}·${score.tie}·${score.loss}` : '--·--·--'

  const headerStatus = () => {
    if (isWin) return 'Solved'
    if (!lastResult) return 'Awaiting attempt'
    if (!lastResult.constraintsSatisfied) return 'Fix constraints'
    if (!lastResult.isTargetScoreMet) return 'Match target'
    return 'Score matched'
  }

  const describeConstraint = (constraint: Constraint) => {
    if (constraint.kind === 'slot_outcome') {
      return `Slot ${constraint.index + 1} must result in a ${constraint.outcome}`
    }
    if (constraint.kind === 'slot_move') {
      return `Slot ${constraint.index + 1} must play ${constraint.move}`
    }
    return `Adds ${constraint.count} extra box${constraint.count > 1 ? 'es' : ''}`
  }

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
    lastResult = result
    isWin = result.isWin
    if (isWin) {
      stopTimer()
    }
  }
</script>

<section class="game-shell flex flex-1 flex-col gap-6">
  <header
    class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/70 bg-slate-950/60 px-5 py-4 shadow-hud"
  >
    <div class="flex items-center gap-3">
      <p class="font-display text-xl tracking-[0.4em] text-slate-100">SHIFUMI</p>
      <span
        class="rounded-full bg-slate-900/80 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-slate-400"
      >
        {level.id}
      </span>
    </div>
    <div class="flex items-center gap-6 text-right">
      <div>
        <p class="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Time left</p>
        <p class={`text-xl font-semibold ${remainingSeconds <= 10 ? 'text-accent' : 'text-slate-50'}`}>
          {formatTime(remainingSeconds)}
        </p>
      </div>
      <div>
        <p class="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Score result</p>
        <p class="text-xl font-semibold text-slate-50">
          {formatScore(lastResult?.score)} / {formatScore(level.targetScore)}
        </p>
      </div>
    </div>
  </header>

  <div class="grid flex-1 grid-cols-1 gap-5 md:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
    <section class="flex flex-col gap-5 rounded-3xl border border-slate-800/70 bg-slate-950/40 p-5 shadow-hud">
      <section aria-label="Target score" class="flex flex-wrap items-center gap-3">
        <div>
          <p class="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Target score</p>
          <p class="mt-1 font-display text-2xl text-slate-50">
            {level.targetScore.win} · {level.targetScore.tie} · {level.targetScore.loss}
          </p>
        </div>
        <span
          class="ml-auto rounded-full border border-slate-800/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200"
        >
          {headerStatus()}
        </span>
      </section>

      <section aria-label="Active row" class="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
        <p class="text-sm font-medium text-slate-400">Enter your combination</p>
        <div
          class="mt-4 grid gap-3"
          style={`grid-template-columns: repeat(${rowLength}, minmax(64px, 1fr));`}
        >
          {#each Array(rowLength) as _, index (index)}
            <div
              data-testid="slot"
              class="flex aspect-square items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-2xl font-semibold text-slate-100"
            >
              {slotDisplay(index)}
            </div>
          {/each}
        </div>
      </section>

      <section aria-label="Attempts" class="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-slate-400">Attempts: {attempts.length}</p>
          {#if isWin}
            <span class="text-sm font-semibold text-win">Puzzle solved!</span>
          {:else if lastResult}
            <span class="text-xs uppercase tracking-[0.35em] text-slate-500">
              {lastResult.isTargetScoreMet ? 'Score matched' : 'Adjust moves'}
            </span>
          {/if}
        </div>
        <div class="mt-4">
          <AttemptsGrid attempts={attempts} />
        </div>
      </section>
    </section>

    <aside class="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/30 p-5 shadow-hud">
      <div>
        <p class="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Level briefing</p>
        <h2 class="mt-2 font-display text-2xl text-slate-50">{level.name}</h2>
        <p class="mt-2 text-sm text-slate-400">{level.description}</p>
      </div>

      <div class="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4">
        <p class="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">Active constraints</p>
        {#if activeConstraints.length === 0}
          <p class="mt-3 text-sm text-slate-400">Constraints unlock as the timer ticks down.</p>
        {:else}
          <ul class="mt-3 space-y-3 text-sm text-slate-200">
            {#each activeConstraints as constraint (constraint.id)}
              <li class="rounded-xl border border-slate-800/60 bg-slate-900/60 px-3 py-2">
                {describeConstraint(constraint)}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </aside>
  </div>

  <section aria-label="Input area" class="mt-auto flex min-h-[26vh] w-full">
    <InputPad
      disablePad={isWin}
      canErase={activeRow.length > 0}
      canSubmit={activeRow.length === rowLength && !isWin}
      on:move={(event) => handleMove(event.detail.move)}
      on:erase={handleErase}
      on:submit={handleSubmit}
    />
  </section>
</section>
