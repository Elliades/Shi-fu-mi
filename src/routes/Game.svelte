<script lang="ts">
  const upcomingMilestones = [
    'Deterministic level fixtures feeding the controller',
    'Attempt/constraint stores with timers',
    'Touch-first grid input + feedback animations',
  ]
</script>

<section class="rounded-3xl bg-surface-muted p-6 shadow-hud">
  <div class="flex items-center justify-between gap-4">
    <h2 class="font-display text-2xl font-semibold tracking-tight">Game Sandbox</h2>
    <span class="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-widest text-slate-300">
      WIP
    </span>
  </div>
  <p class="mt-2 text-sm text-slate-400">
    Implementation kicks off with Tailwind integration & domain scaffolding. Each feature
    will arrive via TDD to honor the Cursor rules.
  </p>

  <ul class="mt-6 space-y-3 text-sm text-slate-200">
    {#each upcomingMilestones as milestone}
      <li class="flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-900/30 px-3 py-2">
        <span class="h-2 w-2 rounded-full bg-slate-500" aria-hidden="true"></span>
        {milestone}
      </li>
    {/each}
  </ul>
</section>
