<script lang="ts">
  import type { Move } from '../../domain/controller'
  import { createEventDispatcher } from 'svelte'

  type PadEventDetail = {
    move: Move
  }

  export let moves: Move[] = ['rock', 'paper', 'scissor']
  export let disablePad = false
  export let canErase = false
  export let canSubmit = false

  const moveLabels: Record<Move, string> = {
    rock: 'Rock',
    paper: 'Paper',
    scissor: 'Scissor',
  }

  const dispatch = createEventDispatcher<{
    move: PadEventDetail
    erase: void
    submit: void
  }>()

  const handleMove = (move: Move) => {
    if (disablePad) return
    dispatch('move', { move })
  }

  const handleErase = () => {
    if (!canErase || disablePad) return
    dispatch('erase')
  }

  const handleSubmit = () => {
    if (!canSubmit || disablePad) return
    dispatch('submit')
  }
</script>

<section
  aria-label="Input pad"
  class="flex h-full w-full flex-col rounded-3xl border border-slate-800/70 bg-slate-950/60 p-4 text-slate-100 shadow-hud sm:p-6"
>
  <div class="flex items-baseline justify-between gap-3">
    <p class="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Moves</p>
    {#if disablePad}
      <span class="text-xs uppercase tracking-[0.25em] text-slate-600">Locked</span>
    {/if}
  </div>

  <div class="mt-4 flex flex-1 flex-col justify-center gap-4">
    <div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
      {#each moves as move (move)}
        <button
          type="button"
          class="key-tile h-16 w-full rounded-2xl border border-slate-700 bg-slate-900/70 text-lg font-semibold uppercase tracking-[0.3em] text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={moveLabels[move]}
          on:click={() => handleMove(move)}
          disabled={disablePad}
        >
          {moveLabels[move]}
        </button>
      {/each}
    </div>

    <div class="flex flex-col gap-3 text-base font-semibold uppercase tracking-[0.2em] sm:flex-row">
      <button
        type="button"
        class="flex-1 rounded-2xl border border-slate-700 bg-slate-900/70 py-4 text-slate-50 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Erase last move"
        on:click={handleErase}
        disabled={!canErase || disablePad}
      >
        Erase
      </button>
      <button
        type="button"
        class="flex-1 rounded-2xl bg-accent py-4 text-slate-950 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Submit attempt"
        on:click={handleSubmit}
        disabled={!canSubmit || disablePad}
      >
        Submit
      </button>
    </div>
  </div>
</section>
