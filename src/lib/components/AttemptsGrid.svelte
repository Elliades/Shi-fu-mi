<script lang="ts">
  import type {
    AttemptResult,
    HighlightColor,
    Move,
  } from '../../domain/controller'

  export type AttemptRow = {
    id: string
    moves: Move[]
    result: AttemptResult
  }

  export let attempts: AttemptRow[] = []

  const moveSymbols: Record<Move, string> = {
    rock: 'R',
    paper: 'P',
    scissor: 'S',
  }

  const highlightClasses: Record<HighlightColor, string> = {
    green:
      'border-win/70 bg-win/15 text-win shadow-[0_0_20px_rgba(74,222,128,0.25)]',
    yellow:
      'border-tie/70 bg-tie/15 text-tie shadow-[0_0_20px_rgba(250,204,21,0.25)]',
    red: 'border-loss/70 bg-loss/15 text-loss shadow-[0_0_20px_rgba(248,113,113,0.25)]',
  }

  const formatScore = (result: AttemptResult) =>
    `Wins: ${result.score.win} · Ties: ${result.score.tie} · Losses: ${result.score.loss}`
</script>

{#if attempts.length === 0}
  <p class="text-sm text-slate-400">No attempts yet. Enter a combination to begin.</p>
{:else}
  <ol class="space-y-4" aria-label="Previous attempts">
    {#each attempts as attempt, index}
      <li
        aria-label={`Attempt ${index + 1}`}
        class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 transition"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <span class="text-sm font-semibold text-slate-200">
            Attempt {index + 1}
          </span>
          <span class="text-xs uppercase tracking-[0.3em] text-slate-500">
            {attempt.result.isWin ? 'Win' : 'In progress'}
          </span>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          {#each attempt.result.slotResults as slot}
            <div
              data-testid="attempt-slot"
              data-highlight={slot.highlight}
              class={`flex h-11 w-11 items-center justify-center rounded-2xl border text-lg font-semibold ${highlightClasses[slot.highlight]}`}
            >
              {moveSymbols[slot.playerMove]}
            </div>
          {/each}
        </div>

        <p class="mt-3 text-sm text-slate-300">{formatScore(attempt.result)}</p>
      </li>
    {/each}
  </ol>
{/if}
