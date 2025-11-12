<script>
  /**
   * 進捗インジケーターコンポーネント
   * @prop {number} current - 現在の問題番号（0始まり）
   * @prop {number} total - 総問題数
   */
  export let current = 0;
  export let total = 0;

  $: progress = total > 0 ? ((current + 1) / total) * 100 : 0;
</script>

<div class="mb-6">
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
