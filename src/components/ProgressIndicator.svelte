<script>
  /**
   * 進捗インジケーターコンポーネント
   * @prop {string} mode - モード ('count' または 'time')
   * @prop {number} current - 現在の問題番号（0始まり）
   * @prop {number} total - 総問題数（問題数ベースの場合）
   * @prop {number} remainingTime - 残り時間（ミリ秒、時間ベースの場合）
   * @prop {number} totalTime - 総時間（ミリ秒、時間ベースの場合）
   */
  export let mode = 'count';
  export let current = 0;
  export let total = 0;
  export let remainingTime = 0;
  export let totalTime = 0;

  $: if (mode === 'count') {
    progress = total > 0 ? ((current + 1) / total) * 100 : 0;
  } else {
    progress = totalTime > 0 ? ((totalTime - remainingTime) / totalTime) * 100 : 0;
  }

  $: remainingSeconds = Math.ceil(remainingTime / 1000);
</script>

{#if mode === 'count'}
  <div class="flex-1">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-semibold text-gray-600">
        問題 {current + 1} / {total}
      </span>
      <span class="text-sm text-gray-500">{progress.toFixed(0)}%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div
        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style="width: {progress}%"
      ></div>
    </div>
  </div>
{:else}
  <div class="flex-1">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm font-semibold text-gray-600">
        問題 {current + 1} 回答
      </span>
      <span class="text-sm {remainingSeconds <= 10 ? 'text-red-600 font-bold' : 'text-gray-600'}">
        残り {remainingSeconds} 秒
      </span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div
        class="h-2 rounded-full transition-all duration-300 {remainingSeconds <= 10 ? 'bg-red-600' : 'bg-blue-600'}"
        style="width: {progress}%"
      ></div>
    </div>
  </div>
{/if}
