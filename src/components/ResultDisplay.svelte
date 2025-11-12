<script>
  /**
   * 結果表示コンポーネント（複数問題対応）
   * @prop {Object} result - 総合結果オブジェクト {totalElapsedTime, averageAccuracy, totalWpm, totalCpm, totalScore, questionCount, results}
   * @prop {Object} rankEvaluation - ランク評価 {rank, title, color, bgColor, borderColor}
   */
  export let result = null;
  export let rankEvaluation = null;
</script>

{#if result && rankEvaluation}
  <div class="mb-6 p-6 {rankEvaluation.bgColor} rounded-lg border-2 {rankEvaluation.borderColor}">
    <div class="mb-6 text-center">
      <div class="text-5xl font-bold mb-3 {rankEvaluation.color}">
        {rankEvaluation.rank}
      </div>
      <div class="text-xl font-semibold text-gray-800 mb-2">
        {rankEvaluation.title}
      </div>
      <div class="text-sm text-gray-600">
        スコア: <strong class="text-lg {rankEvaluation.color}">{result.totalScore}</strong>
      </div>
    </div>

    <!-- 総合結果 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="text-center">
        <div class="text-sm text-gray-600">総時間</div>
        <div class="text-2xl font-bold text-gray-800">{result.totalElapsedTime}秒</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">平均正確性</div>
        <div class="text-2xl font-bold text-gray-800">{result.averageAccuracy}%</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">WPM</div>
        <div class="text-2xl font-bold text-gray-800">{result.totalWpm}</div>
      </div>
      <div class="text-center">
        <div class="text-sm text-gray-600">CPM</div>
        <div class="text-2xl font-bold text-gray-800">{result.totalCpm}</div>
      </div>
    </div>

    <!-- 各問題の詳細 -->
    {#if result.results && result.results.length > 0}
      <div class="mt-6 pt-6 border-t-2 border-gray-300">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">各問題の結果</h3>
        <div class="space-y-4">
          {#each result.results as questionResult, index}
            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-3">
                <span class="font-semibold text-gray-800">問題 {index + 1}</span>
                <div class="flex gap-3 items-center">
                  {#if questionResult.accuracy === 100}
                    <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">正解</span>
                  {:else}
                    <span class="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">誤り</span>
                  {/if}
                  <span class="text-sm text-gray-600">正確性: <strong>{questionResult.accuracy}%</strong></span>
                  <span class="text-sm text-gray-600">時間: <strong>{questionResult.elapsedTime}秒</strong></span>
                  <span class="text-sm text-gray-600">スコア: <strong>{questionResult.score}</strong></span>
                </div>
              </div>
              <div class="space-y-2">
                <div>
                  <div class="text-xs font-semibold text-gray-500 mb-1">問題文:</div>
                  <div class="text-sm text-gray-800 bg-gray-50 p-2 rounded">{questionResult.targetText}</div>
                </div>
                <div>
                  <div class="text-xs font-semibold text-gray-500 mb-1">あなたの入力:</div>
                  <div class="text-sm text-gray-800 bg-gray-50 p-2 rounded {questionResult.accuracy === 100 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}">{questionResult.userInput || '(入力なし)'}</div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
