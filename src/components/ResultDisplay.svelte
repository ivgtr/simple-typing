<script>
  /**
   * 結果表示コンポーネント
   * @prop {Object} result - 結果オブジェクト {elapsedTime, accuracy, wpm, cpm, score}
   * @prop {string} rank - スコアランク (S/A/B/C/D)
   */
  export let result = null;
  export let rank = '';
</script>

{#if result}
  <div class="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-blue-900">結果</h2>
      <div class="text-3xl font-bold text-blue-600">
        ランク: {rank}
      </div>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div class="text-center">
        <div class="text-sm text-gray-600">時間</div>
        <div class="text-2xl font-bold text-blue-900">{result.elapsedTime}秒</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">正確性</div>
        <div class="text-2xl font-bold text-blue-900">{result.accuracy}%</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">WPM</div>
        <div class="text-2xl font-bold text-blue-900">{result.wpm}</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">CPM</div>
        <div class="text-2xl font-bold text-blue-900">{result.cpm}</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">スコア</div>
        <div class="text-2xl font-bold text-blue-900">{result.score}</div>
      </div>
    </div>
  </div>
{/if}
