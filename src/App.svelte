<script lang="ts">
  import Game from './routes/Game.svelte'
</script>

<main class="bg-surface min-h-screen px-4 py-8 text-slate-50 sm:px-8">
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <header class="space-y-3 text-center sm:text-left">
      <p class="text-sm uppercase tracking-[0.3em] text-slate-400">
        Constraint puzzle prototype
      </p>
      <h1 class="font-display text-3xl font-semibold sm:text-4xl">
        Shifumi · wordle-style deduction with stacking constraints
      </h1>
      <p class="text-base text-slate-300">
        Early build focused on domain + state. Visual grid, constraint ticker, and touch
        input land in upcoming iterations.
      </p>
    </header>

    <Game />
  </div>
</main>
