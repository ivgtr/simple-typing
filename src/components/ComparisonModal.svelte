<script>
  import { HistoryManager } from '../lib/history.js';
  import { formatDate, getInputMethodLabel } from '../lib/formatters.js';
  import { isBetter, getDifference, getPercentageChange } from '../lib/comparison-utils.js';

  /**
   * 比較モーダルコンポーネント
   * @prop {Object} currentResult - 現在の結果
   * @prop {Object} currentRank - 現在のランク評価
   * @prop {string} inputMethod - 入力方法
   * @prop {string} mode - ゲームモード
   * @prop {number} modeValue - モード値（外部参照用、内部では未使用）
   * @prop {string} difficulty - 難易度
   * @prop {boolean} isOpen - モーダルが開いているか
   */
  export let currentResult = null;
  export let currentRank = null;
  export let inputMethod = 'keyboard';
  export let mode = 'count';
  export const modeValue = 5; // 外部参照用プロパティ
  export let difficulty = 'all';
  export let isOpen = false;

  let selectedRecord = null;
  let filterMode = 'all'; // デフォルトを 'all' に変更して全ての記録を表示
  let sortBy = 'timestamp';
  let comparisonRecords = [];

  function getComparisonRecords() {
    if (!isOpen) return [];

    let records = [];

    switch (filterMode) {
      case 'same':
        // 同じ入力方法、モード、難易度
        records = HistoryManager.getRecordsForComparison(inputMethod, mode, difficulty);
        break;
      case 'input':
        // 同じ入力方法のみ
        records = HistoryManager.getRecordsForComparison(inputMethod, null, null);
        break;
      case 'all':
        // すべて
        records = HistoryManager.getAll();
        break;
    }

    // 現在の未保存の結果を一時的な記録として先頭に追加
    if (currentResult && currentRank) {
      const tempRecord = {
        id: 'temp-current',
        timestamp: new Date().toISOString(),
        inputMethod,
        mode,
        modeValue,
        difficulty,
        result: currentResult,
        rankEvaluation: currentRank,
        isTemp: true // 未保存の一時記録であることを示すフラグ
      };
      records = [tempRecord, ...records];
    }

    // ソート（未保存の記録は常に先頭に配置されるため、sortは保存済み記録のみに適用）
    const sortedRecords = sortRecords(records.filter(r => !r.isTemp));
    const tempRecords = records.filter(r => r.isTemp);
    return [...tempRecords, ...sortedRecords];
  }

  function sortRecords(records) {
    const sorted = [...records];

    switch (sortBy) {
      case 'score':
        sorted.sort((a, b) => b.result.totalScore - a.result.totalScore);
        break;
      case 'accuracy':
        sorted.sort((a, b) => b.result.averageAccuracy - a.result.averageAccuracy);
        break;
      case 'wpm':
        sorted.sort((a, b) => b.result.totalWpm - a.result.totalWpm);
        break;
      case 'timestamp':
      default:
        sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
    }

    return sorted;
  }

  function selectRecord(record) {
    selectedRecord = record;
  }

  function closeModal() {
    isOpen = false;
    selectedRecord = null;
  }

  // モーダルを開いた時にリセット
  $: if (isOpen) {
    selectedRecord = null;
    comparisonRecords = getComparisonRecords();
  }

  // フィルター・ソート変更時に再取得
  $: if (isOpen && (filterMode || sortBy)) {
    selectedRecord = null;
    comparisonRecords = getComparisonRecords();
  }
</script>

{#if isOpen}
  <!-- モーダルオーバーレイ -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    on:click={closeModal}
    role="dialog"
    aria-modal="true"
  >
    <div
      class="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      on:click|stopPropagation
    >
      <!-- ヘッダー -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">📊 記録を比較</h2>
          <button
            on:click={closeModal}
            class="text-white hover:text-gray-200 transition-colors"
            aria-label="閉じる"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {#if !selectedRecord}
        <!-- 記録選択画面 -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
          <p class="text-gray-700 mb-2">今回の結果と比較したい過去の記録を選択してください</p>
          <p class="text-sm text-gray-500 mb-4">💡 記録を保存しなくても、過去の記録と比較できます</p>

          <!-- フィルターとソート -->
          <div class="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
            <div class="grid md:grid-cols-2 gap-4">
              <!-- フィルター -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  フィルター
                </label>
                <select
                  bind:value={filterMode}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="same">同じ条件のみ（入力方法・モード・難易度）</option>
                  <option value="input">同じ入力方法のみ</option>
                  <option value="all">すべての記録</option>
                </select>
              </div>

              <!-- ソート -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  並び順
                </label>
                <select
                  bind:value={sortBy}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="timestamp">日時（新しい順）</option>
                  <option value="score">スコア（高い順）</option>
                  <option value="accuracy">正確性（高い順）</option>
                  <option value="wpm">WPM（速い順）</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 記録リスト -->
          {#if comparisonRecords.length === 0}
            <div class="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
              <p class="text-gray-600">比較できる記録がありません</p>
              <p class="text-sm text-gray-500 mt-2">フィルター条件を変更してみてください</p>
            </div>
          {:else}
            <div class="space-y-2">
              {#each comparisonRecords as record (record.id)}
                <button
                  on:click={() => selectRecord(record)}
                  class="w-full text-left {record.isTemp ? 'bg-gradient-to-r from-yellow-50 to-amber-50 cursor-default' : 'bg-white cursor-pointer hover:shadow-md hover:scale-[1.02]'} rounded-lg border-2 {record.rankEvaluation.borderColor} p-4 transition-all {record.isTemp ? 'ring-2 ring-yellow-300' : ''}"
                  disabled={record.isTemp}
                >
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <!-- ランク -->
                      <span class="text-xl font-bold {record.rankEvaluation.color}">
                        {record.rankEvaluation.rank}
                      </span>

                      <!-- 情報 -->
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          {#if record.isTemp}
                            <span class="text-xs font-bold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded">
                              📝 今回の結果（未保存）
                            </span>
                          {/if}
                          <span class="text-sm font-medium text-gray-700">
                            {getInputMethodLabel(record.inputMethod)}
                          </span>
                          {#if !record.isTemp}
                            <span class="text-xs text-gray-500">
                              {formatDate(record.timestamp)}
                            </span>
                          {/if}
                        </div>
                        <div class="flex items-center gap-3 text-xs text-gray-600">
                          <span>スコア: <strong>{record.result.totalScore}</strong></span>
                          <span>正確性: <strong>{record.result.averageAccuracy}%</strong></span>
                          <span>WPM: <strong>{record.result.totalWpm}</strong></span>
                        </div>
                      </div>
                    </div>

                    <!-- 選択アイコン -->
                    {#if !record.isTemp}
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <!-- VS比較画面 -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
          <button
            on:click={() => selectedRecord = null}
            class="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            別の記録を選択
          </button>

          <!-- VS表示 -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- 左：今回の記録 -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 p-6">
              <div class="text-center mb-4">
                <div class="text-sm font-semibold text-green-700 mb-2">今回の記録</div>
                <div class="text-4xl font-bold {currentRank.color} mb-2">
                  {currentRank.rank}
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
                    <div class="text-2xl font-bold {isBetter(currentResult.totalScore, selectedRecord.result.totalScore) ? 'text-green-600' : 'text-gray-800'}">
                      {currentResult.totalScore}
                    </div>
                    <div class="text-sm {isBetter(currentResult.totalScore, selectedRecord.result.totalScore) ? 'text-green-600' : 'text-red-600'} font-medium">
                      {getDifference(currentResult.totalScore, selectedRecord.result.totalScore)}
                    </div>
                  </div>
                </div>

                <!-- 正確性 -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">正確性</div>
                  <div class="flex items-end justify-between">
                    <div class="text-2xl font-bold {isBetter(currentResult.averageAccuracy, selectedRecord.result.averageAccuracy) ? 'text-green-600' : 'text-gray-800'}">
                      {currentResult.averageAccuracy}%
                    </div>
                    <div class="text-sm {isBetter(currentResult.averageAccuracy, selectedRecord.result.averageAccuracy) ? 'text-green-600' : 'text-red-600'} font-medium">
                      {getDifference(currentResult.averageAccuracy, selectedRecord.result.averageAccuracy, true)}
                    </div>
                  </div>
                </div>

                <!-- WPM -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">WPM</div>
                  <div class="flex items-end justify-between">
                    <div class="text-2xl font-bold {isBetter(currentResult.totalWpm, selectedRecord.result.totalWpm) ? 'text-green-600' : 'text-gray-800'}">
                      {currentResult.totalWpm}
                    </div>
                    <div class="text-sm {isBetter(currentResult.totalWpm, selectedRecord.result.totalWpm) ? 'text-green-600' : 'text-red-600'} font-medium">
                      {getDifference(currentResult.totalWpm, selectedRecord.result.totalWpm)}
                    </div>
                  </div>
                </div>

                <!-- CPM -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">CPM</div>
                  <div class="flex items-end justify-between">
                    <div class="text-2xl font-bold {isBetter(currentResult.totalCpm, selectedRecord.result.totalCpm) ? 'text-green-600' : 'text-gray-800'}">
                      {currentResult.totalCpm}
                    </div>
                    <div class="text-sm {isBetter(currentResult.totalCpm, selectedRecord.result.totalCpm) ? 'text-green-600' : 'text-red-600'} font-medium">
                      {getDifference(currentResult.totalCpm, selectedRecord.result.totalCpm)}
                    </div>
                  </div>
                </div>

                <!-- 時間 -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">総時間</div>
                  <div class="flex items-end justify-between">
                    <div class="text-2xl font-bold {isBetter(currentResult.totalElapsedTime, selectedRecord.result.totalElapsedTime, false) ? 'text-green-600' : 'text-gray-800'}">
                      {currentResult.totalElapsedTime}秒
                    </div>
                    <div class="text-sm {isBetter(currentResult.totalElapsedTime, selectedRecord.result.totalElapsedTime, false) ? 'text-green-600' : 'text-red-600'} font-medium">
                      {getDifference(currentResult.totalElapsedTime, selectedRecord.result.totalElapsedTime)}秒
                    </div>
                  </div>
                </div>

                <!-- 問題数 -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">完了問題数</div>
                  <div class="text-2xl font-bold text-gray-800">
                    {currentResult.questionCount}問
                  </div>
                </div>
              </div>
            </div>

            <!-- 右：選択した過去の記録 -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-6">
              <div class="text-center mb-4">
                <div class="text-sm font-semibold text-blue-700 mb-2">過去の記録</div>
                <div class="text-4xl font-bold {selectedRecord.rankEvaluation.color} mb-2">
                  {selectedRecord.rankEvaluation.rank}
                </div>
                <div class="text-sm text-gray-700 mb-1">
                  {getInputMethodLabel(selectedRecord.inputMethod)}
                </div>
                <div class="text-xs text-gray-500">
                  {formatDate(selectedRecord.timestamp)}
                </div>
              </div>

              <div class="space-y-3">
                <!-- スコア -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">スコア</div>
                  <div class="flex items-end justify-between">
                    <div class="text-2xl font-bold {isBetter(selectedRecord.result.totalScore, currentResult.totalScore) ? 'text-blue-600' : 'text-gray-800'}">
                      {selectedRecord.result.totalScore}
                    </div>
                    <div class="text-sm {isBetter(selectedRecord.result.totalScore, currentResult.totalScore) ? 'text-blue-600' : 'text-gray-600'} font-medium">
                      {getPercentageChange(currentResult.totalScore, selectedRecord.result.totalScore)}
                    </div>
                  </div>
                </div>

                <!-- 正確性 -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">正確性</div>
                  <div class="flex items-end justify-between">
                    <div class="text-2xl font-bold {isBetter(selectedRecord.result.averageAccuracy, currentResult.averageAccuracy) ? 'text-blue-600' : 'text-gray-800'}">
                      {selectedRecord.result.averageAccuracy}%
                    </div>
                    <div class="text-sm {isBetter(selectedRecord.result.averageAccuracy, currentResult.averageAccuracy) ? 'text-blue-600' : 'text-gray-600'} font-medium">
                      {getPercentageChange(currentResult.averageAccuracy, selectedRecord.result.averageAccuracy)}
                    </div>
                  </div>
                </div>

                <!-- WPM -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">WPM</div>
                  <div class="flex items-end justify-between">
                    <div class="text-2xl font-bold {isBetter(selectedRecord.result.totalWpm, currentResult.totalWpm) ? 'text-blue-600' : 'text-gray-800'}">
                      {selectedRecord.result.totalWpm}
                    </div>
                    <div class="text-sm {isBetter(selectedRecord.result.totalWpm, currentResult.totalWpm) ? 'text-blue-600' : 'text-gray-600'} font-medium">
                      {getPercentageChange(currentResult.totalWpm, selectedRecord.result.totalWpm)}
                    </div>
                  </div>
                </div>

                <!-- CPM -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">CPM</div>
                  <div class="flex items-end justify-between">
                    <div class="text-2xl font-bold {isBetter(selectedRecord.result.totalCpm, currentResult.totalCpm) ? 'text-blue-600' : 'text-gray-800'}">
                      {selectedRecord.result.totalCpm}
                    </div>
                    <div class="text-sm {isBetter(selectedRecord.result.totalCpm, currentResult.totalCpm) ? 'text-blue-600' : 'text-gray-600'} font-medium">
                      {getPercentageChange(currentResult.totalCpm, selectedRecord.result.totalCpm)}
                    </div>
                  </div>
                </div>

                <!-- 時間 -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">総時間</div>
                  <div class="flex items-end justify-between">
                    <div class="text-2xl font-bold {isBetter(selectedRecord.result.totalElapsedTime, currentResult.totalElapsedTime, false) ? 'text-blue-600' : 'text-gray-800'}">
                      {selectedRecord.result.totalElapsedTime}秒
                    </div>
                    <div class="text-sm {isBetter(selectedRecord.result.totalElapsedTime, currentResult.totalElapsedTime, false) ? 'text-blue-600' : 'text-gray-600'} font-medium">
                      {getPercentageChange(selectedRecord.result.totalElapsedTime, currentResult.totalElapsedTime)}
                    </div>
                  </div>
                </div>

                <!-- 問題数 -->
                <div class="bg-white rounded-lg p-3">
                  <div class="text-xs text-gray-600 mb-1">完了問題数</div>
                  <div class="text-2xl font-bold text-gray-800">
                    {selectedRecord.result.questionCount}問
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- サマリー -->
          {#if selectedRecord}
            {@const betterCount = [
              isBetter(currentResult.totalScore, selectedRecord.result.totalScore),
              isBetter(currentResult.averageAccuracy, selectedRecord.result.averageAccuracy),
              isBetter(currentResult.totalWpm, selectedRecord.result.totalWpm),
              isBetter(currentResult.totalCpm, selectedRecord.result.totalCpm),
              isBetter(currentResult.totalElapsedTime, selectedRecord.result.totalElapsedTime, false)
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
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
