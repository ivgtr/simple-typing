<script>
  import { onMount } from 'svelte';
  import { calculateTextDiff, getEvaluationComment, getIconType, formatTime } from '../lib/result-utils.js';
  import { InputMethodDetector } from '../lib/input-detection.js';
  import { historyStore } from '../lib/stores/history-store.js';
  import { HistoryManager } from '../lib/history.js';
  import { formatDate, getInputMethodLabel } from '../lib/formatters.js';
  import { isBetter, getDifference } from '../lib/comparison-utils.js';

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

  let inputMethod = 'keyboard'; // デフォルトはキーボード
  let isDetected = false; // 入力方法が自動検出されたかどうか
  let showComparison = false; // 比較モードかどうか
  let selectedPastRecord = null; // 選択された過去の記録
  let pastRecords = []; // 過去の記録一覧

  // Storeから保存状態を取得
  $: saveStatus = $historyStore.saveStatus;
  $: saveMessage = saveStatus === 'saving' ? '保存中...' :
                   saveStatus === 'success' ? '✓ 記録を保存しました' :
                   saveStatus === 'error' ? '✗ 保存に失敗しました' : '';

  // コンポーネント初期化時に入力方法を自動検出
  onMount(() => {
    if (result) {
      const detected = InputMethodDetector.detect(
        result.totalInputEvents,
        result.totalChars
      );
      inputMethod = detected;
      isDetected = true;
    }
  });

  /**
   * 結果を保存
   */
  function saveResult() {
    historyStore.save({
      inputMethod,
      mode,
      modeValue,
      difficulty,
      result,
      rankEvaluation
    });
  }

  /**
   * 比較モードを開く
   */
  function openComparison() {
    pastRecords = HistoryManager.getAll().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    showComparison = true;
    selectedPastRecord = null;
  }

  /**
   * 比較モードを閉じる
   */
  function closeComparison() {
    showComparison = false;
    selectedPastRecord = null;
  }

  /**
   * 過去の記録を選択
   */
  function selectRecord(record) {
    selectedPastRecord = record;
  }
</script>

{#if result && rankEvaluation}
  {#if !showComparison}
    <!-- 通常の結果表示 -->
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
              {#if isDetected}
                <span class="text-xs text-green-600 font-normal ml-2">
                  ✓ 入力統計から自動検出しました
                </span>
              {/if}
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
            on:click={openComparison}
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

  {:else if !selectedPastRecord}
    <!-- 過去の記録リスト -->
    <div class="mb-6">
      <button
        on:click={closeComparison}
        class="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        結果表示に戻る
      </button>

      <h3 class="text-lg font-bold text-gray-800 mb-4">比較する過去の記録を選択</h3>

      {#if pastRecords.length === 0}
        <div class="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <p class="text-gray-600">過去の記録がありません</p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each pastRecords as record (record.id)}
            <button
              on:click={() => selectRecord(record)}
              class="w-full text-left bg-white rounded-lg border-2 {record.rankEvaluation.borderColor} p-4 hover:shadow-md transition-all hover:scale-[1.02]"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <span class="text-xl font-bold {record.rankEvaluation.color}">
                    {record.rankEvaluation.rank}
                  </span>
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-gray-700">
                        {getInputMethodLabel(record.inputMethod)}
                      </span>
                      <span class="text-xs text-gray-500">
                        {formatDate(record.timestamp)}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-gray-600">
                      <span>スコア: <strong>{record.result.totalScore}</strong></span>
                      <span>正確性: <strong>{record.result.averageAccuracy}%</strong></span>
                      <span>WPM: <strong>{record.result.totalWpm}</strong></span>
                    </div>
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

  {:else}
    <!-- VS比較画面 -->
    <div class="mb-6">
      <button
        on:click={() => selectedPastRecord = null}
        class="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        記録リストに戻る
      </button>

      <h3 class="text-lg font-bold text-gray-800 mb-4">比較結果</h3>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- 左：今回の記録 -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 p-6">
          <div class="text-center mb-4">
            <div class="text-sm font-semibold text-green-700 mb-2">今回の記録</div>
            <div class="text-4xl font-bold {rankEvaluation.color} mb-2">
              {rankEvaluation.rank}
            </div>
            <div class="text-sm text-gray-700">
              {getInputMethodLabel(inputMethod)}
            </div>
          </div>

          <div class="space-y-3">
            <!-- スコア -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">スコア</div>
              <div class="flex items-end justify-between">
                <div class="text-2xl font-bold {isBetter(result.totalScore, selectedPastRecord.result.totalScore) ? 'text-green-600' : 'text-gray-800'}">
                  {result.totalScore}
                </div>
                <div class="text-sm {isBetter(result.totalScore, selectedPastRecord.result.totalScore) ? 'text-green-600' : 'text-red-600'} font-medium">
                  {getDifference(result.totalScore, selectedPastRecord.result.totalScore)}
                </div>
              </div>
            </div>

            <!-- 正確性 -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">正確性</div>
              <div class="flex items-end justify-between">
                <div class="text-2xl font-bold {isBetter(result.averageAccuracy, selectedPastRecord.result.averageAccuracy) ? 'text-green-600' : 'text-gray-800'}">
                  {result.averageAccuracy}%
                </div>
                <div class="text-sm {isBetter(result.averageAccuracy, selectedPastRecord.result.averageAccuracy) ? 'text-green-600' : 'text-red-600'} font-medium">
                  {getDifference(result.averageAccuracy, selectedPastRecord.result.averageAccuracy, true)}
                </div>
              </div>
            </div>

            <!-- WPM -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">WPM</div>
              <div class="flex items-end justify-between">
                <div class="text-2xl font-bold {isBetter(result.totalWpm, selectedPastRecord.result.totalWpm) ? 'text-green-600' : 'text-gray-800'}">
                  {result.totalWpm}
                </div>
                <div class="text-sm {isBetter(result.totalWpm, selectedPastRecord.result.totalWpm) ? 'text-green-600' : 'text-red-600'} font-medium">
                  {getDifference(result.totalWpm, selectedPastRecord.result.totalWpm)}
                </div>
              </div>
            </div>

            <!-- CPM -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">CPM</div>
              <div class="flex items-end justify-between">
                <div class="text-2xl font-bold {isBetter(result.totalCpm, selectedPastRecord.result.totalCpm) ? 'text-green-600' : 'text-gray-800'}">
                  {result.totalCpm}
                </div>
                <div class="text-sm {isBetter(result.totalCpm, selectedPastRecord.result.totalCpm) ? 'text-green-600' : 'text-red-600'} font-medium">
                  {getDifference(result.totalCpm, selectedPastRecord.result.totalCpm)}
                </div>
              </div>
            </div>

            <!-- 時間 -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">総時間</div>
              <div class="flex items-end justify-between">
                <div class="text-2xl font-bold {isBetter(result.totalElapsedTime, selectedPastRecord.result.totalElapsedTime, false) ? 'text-green-600' : 'text-gray-800'}">
                  {result.totalElapsedTime}秒
                </div>
                <div class="text-sm {isBetter(result.totalElapsedTime, selectedPastRecord.result.totalElapsedTime, false) ? 'text-green-600' : 'text-red-600'} font-medium">
                  {getDifference(result.totalElapsedTime, selectedPastRecord.result.totalElapsedTime)}秒
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右：過去の記録 -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-6">
          <div class="text-center mb-4">
            <div class="text-sm font-semibold text-blue-700 mb-2">過去の記録</div>
            <div class="text-4xl font-bold {selectedPastRecord.rankEvaluation.color} mb-2">
              {selectedPastRecord.rankEvaluation.rank}
            </div>
            <div class="text-sm text-gray-700 mb-1">
              {getInputMethodLabel(selectedPastRecord.inputMethod)}
            </div>
            <div class="text-xs text-gray-500">
              {formatDate(selectedPastRecord.timestamp)}
            </div>
          </div>

          <div class="space-y-3">
            <!-- スコア -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">スコア</div>
              <div class="text-2xl font-bold text-gray-800">
                {selectedPastRecord.result.totalScore}
              </div>
            </div>

            <!-- 正確性 -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">正確性</div>
              <div class="text-2xl font-bold text-gray-800">
                {selectedPastRecord.result.averageAccuracy}%
              </div>
            </div>

            <!-- WPM -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">WPM</div>
              <div class="text-2xl font-bold text-gray-800">
                {selectedPastRecord.result.totalWpm}
              </div>
            </div>

            <!-- CPM -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">CPM</div>
              <div class="text-2xl font-bold text-gray-800">
                {selectedPastRecord.result.totalCpm}
              </div>
            </div>

            <!-- 時間 -->
            <div class="bg-white rounded-lg p-3">
              <div class="text-xs text-gray-600 mb-1">総時間</div>
              <div class="text-2xl font-bold text-gray-800">
                {selectedPastRecord.result.totalElapsedTime}秒
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- サマリー -->
      {@const betterCount = [
        isBetter(result.totalScore, selectedPastRecord.result.totalScore),
        isBetter(result.averageAccuracy, selectedPastRecord.result.averageAccuracy),
        isBetter(result.totalWpm, selectedPastRecord.result.totalWpm),
        isBetter(result.totalCpm, selectedPastRecord.result.totalCpm),
        isBetter(result.totalElapsedTime, selectedPastRecord.result.totalElapsedTime, false)
      ].filter(Boolean).length}

      <div class="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-300 p-6 text-center">
        <div class="text-lg font-bold text-gray-800 mb-2">
          {#if betterCount >= 4}
            🎉 大きく成長しています！
          {:else if betterCount >= 3}
            📈 着実に上達しています！
          {:else if betterCount >= 2}
            💪 いい調子です！
          {:else}
            🔥 次回はもっと良くなるはず！
          {/if}
        </div>
        <div class="text-sm text-gray-600">
          5項目中 <strong class="text-green-600">{betterCount}項目</strong> で過去の記録を上回りました
        </div>
      </div>
    </div>
  {/if}
{/if}
