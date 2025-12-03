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

<section aria-label="Input pad" class="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4">
  <p class="text-sm font-medium text-slate-400">Moves</p>
  <div class="mt-3 flex flex-wrap gap-3">
    {#each moves as move (move)}
      <button
        type="button"
        class="btn flex-1 min-w-[120px]"
        aria-label={moveLabels[move]}
        on:click={() => handleMove(move)}
        disabled={disablePad}
      >
        {moveLabels[move]}
      </button>
    {/each}
  </div>
  <div class="mt-4 flex gap-3">
    <button
      type="button"
      class="btn flex-1"
      aria-label="Erase last move"
      on:click={handleErase}
      disabled={!canErase || disablePad}
    >
      Erase
    </button>
    <button
      type="button"
      class="btn flex-1 bg-accent text-black hover:bg-orange-500"
      aria-label="Submit attempt"
      on:click={handleSubmit}
      disabled={!canSubmit || disablePad}
    >
      Submit attempt
    </button>
  </div>
</section>
