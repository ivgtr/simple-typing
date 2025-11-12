<script>
  import { createEventDispatcher } from 'svelte';

  /**
   * ゲームモード選択コンポーネント
   * @event select - モード選択イベント {mode: 'count'|'time', value: number}
   */
  export let selectedMode = 'count';
  export let selectedValue = 5;

  const dispatch = createEventDispatcher();

  const modes = [
    { mode: 'count', value: 5, label: '5問' },
    { mode: 'count', value: 10, label: '10問' },
    { mode: 'count', value: 15, label: '15問' },
    { mode: 'time', value: 60, label: '時間 (60秒)' },
  ];

  function selectMode(mode, value) {
    selectedMode = mode;
    selectedValue = value;
    dispatch('select', { mode, value });
  }
</script>

<div class="mb-6">
  <h3 class="text-sm font-semibold text-gray-600 mb-3">問題数を選択:</h3>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
    {#each modes as modeOption}
      <button
        on:click={() => selectMode(modeOption.mode, modeOption.value)}
        class="p-4 rounded-lg border-2 transition-all {
          selectedMode === modeOption.mode && selectedValue === modeOption.value
            ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
            : 'border-gray-300 hover:border-blue-400 text-gray-700'
        }"
      >
        {modeOption.label}
      </button>
    {/each}
  </div>
</div>
