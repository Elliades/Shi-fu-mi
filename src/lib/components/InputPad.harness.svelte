<script lang="ts">
  import InputPad from './InputPad.svelte'
  import type { Move } from '../../domain/controller'

  export let onMove: (move: Move) => void = () => {}
  export let onErase: () => void = () => {}
  export let onSubmit: () => void = () => {}
  export let canErase = false
  export let canSubmit = false
  export let disablePad = false

  const handleMove = (event: CustomEvent<{ move: Move }>) => {
    onMove(event.detail.move)
  }
</script>

<InputPad
  {canErase}
  {canSubmit}
  {disablePad}
  on:move={handleMove}
  on:erase={() => onErase()}
  on:submit={() => onSubmit()}
/>
