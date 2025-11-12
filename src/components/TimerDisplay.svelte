<script>
  /**
   * タイマー表示コンポーネント
   * @prop {number} elapsedTime - 経過時間（ミリ秒）
   */
  export let elapsedTime = 0;

  $: totalSeconds = elapsedTime / 1000;
  $: minutes = Math.floor(totalSeconds / 60);
  $: remainingSeconds = totalSeconds % 60;
  $: formattedTime = `${minutes}:${remainingSeconds.toFixed(3).padStart(6, '0')}`;
</script>

<div class="flex items-center justify-center gap-2 text-lg font-semibold text-gray-700">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <span>{formattedTime}</span>
</div>
