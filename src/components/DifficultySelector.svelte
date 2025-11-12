<script>
  import { createEventDispatcher } from 'svelte';

  /**
   * 難易度選択コンポーネント
   * @event select - 難易度選択イベント {difficulty: 'easy'|'medium'|'hard'|'all'}
   */
  export let selectedDifficulty = 'all';

  const dispatch = createEventDispatcher();

  const difficulties = [
    { value: 'all', label: 'すべて' },
    { value: 'easy', label: '初級' },
    { value: 'medium', label: '中級' },
    { value: 'hard', label: '上級' },
  ];

  function selectDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    dispatch('select', { difficulty });
  }
</script>

<div class="mb-6">
  <h3 class="text-sm font-semibold text-gray-600 mb-3">難易度を選択:</h3>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    {#each difficulties as difficultyOption}
      <button
        on:click={() => selectDifficulty(difficultyOption.value)}
        class="p-4 rounded-lg border-2 transition-all {
          selectedDifficulty === difficultyOption.value
            ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
            : 'border-gray-300 hover:border-blue-400 text-gray-700'
        }"
      >
        {difficultyOption.label}
      </button>
    {/each}
  </div>
</div>
