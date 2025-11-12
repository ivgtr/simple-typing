<script>
  import { calculateTextDiff, getEvaluationComment, getIconType, formatTime } from '../lib/result-utils.js';

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
        <h3 class="text-sm font-semibold text-gray-700 mb-4">各問題の結果</h3>
        <div class="space-y-6">
          {#each result.results as questionResult, index}
            {@const diff = calculateTextDiff(questionResult.targetText, questionResult.userInput)}
            {@const iconType = getIconType(questionResult.accuracy)}
            {@const comment = getEvaluationComment(questionResult.accuracy)}

            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <!-- ヘッダー行 -->
              <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <span class="text-sm font-semibold text-gray-700">問題 {index + 1}</span>
              </div>

              <!-- 問題文 -->
              <div class="px-4 py-3 border-b border-gray-100">
                <div class="text-xs font-semibold text-gray-500 mb-1">問題文</div>
                <div class="text-base text-gray-800">{questionResult.targetText}</div>
              </div>

              <!-- 結果カード -->
              <div class="px-4 py-3">
                <div class="flex gap-4">
                  <!-- 左側：チェックアイコン -->
                  <div class="flex-shrink-0 pt-1">
                    {#if iconType === 'perfect'}
                      <svg class="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    {:else if iconType === 'good'}
                      <svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    {:else if iconType === 'warning'}
                      <svg class="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                    {:else}
                      <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                      </svg>
                    {/if}
                  </div>

                  <!-- 右側：評価情報 -->
                  <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                      <span class="text-lg font-bold text-gray-800">{comment}</span>
                      <span class="text-sm text-gray-600">
                        <strong class="text-base {questionResult.accuracy === 100 ? 'text-green-600' : questionResult.accuracy >= 90 ? 'text-blue-600' : questionResult.accuracy >= 70 ? 'text-yellow-600' : 'text-red-600'}">{questionResult.accuracy}%</strong> match
                      </span>
                      <span class="text-sm text-gray-600">
                        ⏱️ {formatTime(questionResult.elapsedTime)}
                      </span>
                      <span class="text-sm text-gray-600">
                        📊 <strong>{questionResult.score}</strong> pts
                      </span>
                    </div>

                    <!-- 入力テキスト（差分ハイライト） -->
                    <div class="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <div class="text-xs font-semibold text-gray-500 mb-1">あなたの入力</div>
                      <div class="text-base leading-relaxed">
                        {#if questionResult.userInput && questionResult.userInput.trim().length > 0}
                          {#each diff as item}
                            {#if item.type === 'correct'}
                              <span class="text-gray-800">{item.char}</span>
                            {:else if item.type === 'incorrect'}
                              <span class="bg-red-100 text-red-700 font-medium rounded px-0.5">{item.char}</span>
                            {:else if item.type === 'missing'}
                              <span class="bg-green-100 text-green-600 font-medium rounded px-0.5">{item.char}</span>
                            {:else if item.type === 'extra'}
                              <span class="bg-orange-100 text-orange-700 font-medium rounded px-0.5">{item.char}</span>
                            {/if}
                          {/each}
                        {:else}
                          <span class="text-gray-400 italic">(入力なし)</span>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
