<script>
  /**
   * 結果表示コンポーネント（複数問題対応）
   * @prop {Object} result - 総合結果オブジェクト {totalElapsedTime, averageAccuracy, totalWpm, totalCpm, totalScore, questionCount, results}
   * @prop {string} rank - スコアランク (S/A/B/C/D)
   */
  export let result = null;
  export let rank = '';
</script>

{#if result}
  <div class="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-blue-900">ゲーム結果</h2>
      <div class="text-3xl font-bold text-blue-600">
        ランク: {rank}
      </div>
    </div>

    <!-- 総合結果 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div class="text-center">
        <div class="text-sm text-gray-600">総時間</div>
        <div class="text-2xl font-bold text-blue-900">{result.totalElapsedTime}秒</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">平均正確性</div>
        <div class="text-2xl font-bold text-blue-900">{result.averageAccuracy}%</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">WPM</div>
        <div class="text-2xl font-bold text-blue-900">{result.totalWpm}</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">CPM</div>
        <div class="text-2xl font-bold text-blue-900">{result.totalCpm}</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">総合スコア</div>
        <div class="text-2xl font-bold text-blue-900">{result.totalScore}</div>
      </div>
    </div>

    <!-- 各問題の詳細 -->
    {#if result.results && result.results.length > 0}
      <div class="mt-6 pt-6 border-t border-blue-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">各問題の結果</h3>
        <div class="space-y-2">
          {#each result.results as questionResult, index}
            <div class="flex items-center justify-between text-sm bg-white p-3 rounded">
              <span class="font-medium text-gray-700">問題 {index + 1}</span>
              <div class="flex gap-4">
                <span class="text-gray-600">正確性: <strong>{questionResult.accuracy}%</strong></span>
                <span class="text-gray-600">時間: <strong>{questionResult.elapsedTime}秒</strong></span>
                <span class="text-gray-600">スコア: <strong>{questionResult.score}</strong></span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
