<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { calculateTextDiff, getEvaluationComment, getIconType, formatTime } from '../lib/result-utils.js';
  import { HistoryManager } from '../lib/history.js';
  import ComparisonModal from './ComparisonModal.svelte';

  const dispatch = createEventDispatcher();

  /**
   * 結果表示コンポーネント（複数問題対応）
   * @prop {Object} result - 総合結果オブジェクト {totalElapsedTime, averageAccuracy, totalWpm, totalCpm, totalScore, questionCount, results}
   * @prop {Object} rankEvaluation - ランク評価 {rank, title, color, bgColor, borderColor}
   * @prop {string} mode - ゲームモード ('count' または 'time')
   * @prop {number} modeValue - 問題数または秒数
   * @prop {string} difficulty - 難易度
   */
  export let result = null;
  export let rankEvaluation = null;
  export let mode = 'count';
  export let modeValue = 5;
  export let difficulty = 'all';

  const INPUT_METHOD_STORAGE_KEY = 'simple-typing-last-input-method';

  let inputMethod = 'keyboard'; // デフォルトはキーボード
  let saveStatus = ''; // '', 'saving', 'success', 'error'
  let saveMessage = '';
  let isComparisonModalOpen = false;

  // コンポーネント初期化時に前回の入力方法を復元
  onMount(() => {
    try {
      const lastMethod = localStorage.getItem(INPUT_METHOD_STORAGE_KEY);
      if (lastMethod && ['keyboard', 'voice', 'other'].includes(lastMethod)) {
        inputMethod = lastMethod;
      }
    } catch (error) {
      console.error('Failed to load last input method:', error);
    }
  });

  // 入力方法が変更されたら保存
  $: if (inputMethod) {
    try {
      localStorage.setItem(INPUT_METHOD_STORAGE_KEY, inputMethod);
    } catch (error) {
      console.error('Failed to save input method:', error);
    }
  }

  /**
   * 結果を保存
   */
  function saveResult() {
    saveStatus = 'saving';
    saveMessage = '保存中...';

    const success = HistoryManager.save({
      inputMethod,
      mode,
      modeValue,
      difficulty,
      result,
      rankEvaluation
    });

    if (success) {
      saveStatus = 'success';
      saveMessage = '✓ 記録を保存しました';

      // 親コンポーネントに保存成功を通知（履歴の自動更新用）
      dispatch('historySaved');

      // 3秒後にメッセージを消す
      setTimeout(() => {
        saveStatus = '';
        saveMessage = '';
      }, 3000);
    } else {
      saveStatus = 'error';
      saveMessage = '✗ 保存に失敗しました';

      setTimeout(() => {
        saveStatus = '';
        saveMessage = '';
      }, 3000);
    }
  }

  /**
   * 比較モーダルを開く
   * 未保存の場合は自動的に保存してから開く
   */
  function openComparisonModal() {
    // まだ保存していない場合は自動保存
    if (saveStatus !== 'success') {
      saveResult();
    }

    // モーダルを開く
    isComparisonModalOpen = true;
  }
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

    <!-- 記録の保存 -->
    <div class="mt-6 pt-6 border-t-2 border-gray-300">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">この記録を保存</h3>

      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <!-- 入力方法選択 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            入力方法を選択してください
          </label>
          <div class="flex flex-wrap gap-3">
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                bind:group={inputMethod}
                value="keyboard"
                class="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">⌨️ キーボード</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                bind:group={inputMethod}
                value="voice"
                class="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">🎤 音声入力</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                type="radio"
                bind:group={inputMethod}
                value="other"
                class="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">🔧 その他</span>
            </label>
          </div>
        </div>

        <!-- 保存ボタン -->
        <div class="flex items-center gap-3">
          <button
            on:click={saveResult}
            disabled={saveStatus === 'saving'}
            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saveStatus === 'saving' ? '保存中...' : '記録を保存'}
          </button>

          {#if saveMessage}
            <span
              class="text-sm font-medium {saveStatus === 'success' ? 'text-green-600' : saveStatus === 'error' ? 'text-red-600' : 'text-gray-600'}"
            >
              {saveMessage}
            </span>
          {/if}
        </div>
      </div>

      <!-- 比較ボタン -->
      <div class="mt-4">
        <button
          on:click={openComparisonModal}
          class="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          過去の記録と比較
        </button>
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

  <!-- 比較モーダル -->
  <ComparisonModal
    bind:isOpen={isComparisonModalOpen}
    currentResult={result}
    currentRank={rankEvaluation}
    {inputMethod}
    {mode}
    {modeValue}
    {difficulty}
  />
{/if}
