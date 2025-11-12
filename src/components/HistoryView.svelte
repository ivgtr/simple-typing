<script>
  import { HistoryManager } from '../lib/history.js';
  import { formatTime } from '../lib/result-utils.js';
  import { formatDate, getInputMethodLabel } from '../lib/formatters.js';
  import { historyStore } from '../lib/stores/history-store.js';

  let history = [];
  let filterInputMethod = 'all';
  let sortBy = 'timestamp'; // 'timestamp', 'score', 'accuracy', 'wpm'
  let showComparison = false;
  let comparisonStats = null;

  // ストアから履歴を取得してフィルタリング・ソート
  $: {
    const allRecords = $historyStore.records;

    // フィルタリング
    let filtered = allRecords;
    if (filterInputMethod !== 'all') {
      filtered = allRecords.filter(record => record.inputMethod === filterInputMethod);
    }

    // ソート
    const sorted = [...filtered];
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

    history = sorted;
  }

  // 比較表示トグル
  function toggleComparison() {
    showComparison = !showComparison;
    if (showComparison) {
      comparisonStats = HistoryManager.getComparisonStats();
    }
  }

  // レコード削除
  function deleteRecord(id) {
    if (confirm('この記録を削除しますか？')) {
      historyStore.delete(id); // Storeが自動的に更新を通知
    }
  }

  // 全削除
  function clearAllHistory() {
    if (confirm('全ての履歴を削除しますか？この操作は取り消せません。')) {
      historyStore.clear(); // Storeが自動的に更新を通知
    }
  }
</script>

<div class="space-y-6">
  <!-- ヘッダー -->
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold text-gray-800">📊 プレイ履歴</h2>
    <div class="flex gap-2">
      <button
        on:click={toggleComparison}
        class="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
      >
        {showComparison ? '履歴を表示' : '比較を表示'}
      </button>
      {#if history.length > 0}
        <button
          on:click={clearAllHistory}
          class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
        >
          全削除
        </button>
      {/if}
    </div>
  </div>

  {#if !showComparison}
    <!-- フィルターとソート -->
    <div class="bg-white rounded-lg border border-gray-200 p-4">
      <div class="flex flex-wrap gap-4">
        <!-- 入力方法フィルター -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            入力方法でフィルター
          </label>
          <select
            bind:value={filterInputMethod}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="keyboard">⌨️ キーボード</option>
            <option value="voice">🎤 音声</option>
            <option value="other">🔧 その他</option>
          </select>
        </div>

        <!-- ソート -->
        <div class="flex-1 min-w-[200px]">
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

    <!-- 履歴リスト -->
    {#if history.length === 0}
      <div class="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <p class="text-gray-600">まだ記録がありません。</p>
        <p class="text-sm text-gray-500 mt-2">ゲーム終了後に記録を保存してください。</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each history as record (record.id)}
          <div class="bg-white rounded-lg border-2 {record.rankEvaluation.borderColor} p-4 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between gap-4">
              <!-- 左側：メイン情報 -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <!-- ランク -->
                  <span class="text-2xl font-bold {record.rankEvaluation.color}">
                    {record.rankEvaluation.rank}
                  </span>

                  <!-- 入力方法 -->
                  <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {getInputMethodLabel(record.inputMethod)}
                  </span>

                  <!-- モード情報 -->
                  <span class="text-sm text-gray-600">
                    {#if record.mode === 'count'}
                      {record.modeValue}問
                    {:else}
                      {record.modeValue}秒
                    {/if}
                  </span>

                  <!-- 難易度 -->
                  {#if record.difficulty !== 'all'}
                    <span class="text-sm text-gray-600">
                      {record.difficulty === 'easy' ? '初級' : record.difficulty === 'medium' ? '中級' : '上級'}
                    </span>
                  {/if}
                </div>

                <!-- 統計情報 -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span class="text-gray-600">スコア:</span>
                    <strong class="ml-1 text-gray-800">{record.result.totalScore}</strong>
                  </div>
                  <div>
                    <span class="text-gray-600">正確性:</span>
                    <strong class="ml-1 text-gray-800">{record.result.averageAccuracy}%</strong>
                  </div>
                  <div>
                    <span class="text-gray-600">WPM:</span>
                    <strong class="ml-1 text-gray-800">{record.result.totalWpm}</strong>
                  </div>
                  <div>
                    <span class="text-gray-600">時間:</span>
                    <strong class="ml-1 text-gray-800">{record.result.totalElapsedTime}秒</strong>
                  </div>
                </div>

                <!-- 日時 -->
                <div class="text-xs text-gray-500 mt-2">
                  {formatDate(record.timestamp)}
                </div>
              </div>

              <!-- 右側：削除ボタン -->
              <button
                on:click={() => deleteRecord(record.id)}
                class="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors p-2"
                title="削除"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>

      <!-- 統計サマリー -->
      {@const stats = HistoryManager.getStatistics(filterInputMethod)}
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">
          {filterInputMethod === 'all' ? '全体の統計' : `${getInputMethodLabel(filterInputMethod)} の統計`}
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div class="text-center">
            <div class="text-gray-600">プレイ回数</div>
            <div class="text-xl font-bold text-gray-800">{stats.count}</div>
          </div>
          <div class="text-center">
            <div class="text-gray-600">平均スコア</div>
            <div class="text-xl font-bold text-gray-800">{stats.averageScore}</div>
          </div>
          <div class="text-center">
            <div class="text-gray-600">平均正確性</div>
            <div class="text-xl font-bold text-gray-800">{stats.averageAccuracy}%</div>
          </div>
          <div class="text-center">
            <div class="text-gray-600">平均WPM</div>
            <div class="text-xl font-bold text-gray-800">{stats.averageWpm}</div>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <!-- 比較ビュー -->
    {#if comparisonStats}
      <div class="space-y-6">
        <h3 class="text-xl font-semibold text-gray-800">🎤 音声 vs ⌨️ キーボード 比較</h3>

        <!-- 比較カード -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- 音声入力 -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 p-6">
            <h4 class="text-lg font-bold text-purple-700 mb-4 flex items-center gap-2">
              🎤 音声入力
              <span class="text-sm font-normal text-purple-600">({comparisonStats.voice.count}回)</span>
            </h4>

            {#if comparisonStats.voice.count === 0}
              <p class="text-gray-600 text-sm">まだ記録がありません</p>
            {:else}
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-700">平均スコア</span>
                  <span class="text-xl font-bold text-purple-700">{comparisonStats.voice.averageScore}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-700">平均正確性</span>
                  <span class="text-xl font-bold text-purple-700">{comparisonStats.voice.averageAccuracy}%</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-700">平均WPM</span>
                  <span class="text-xl font-bold text-purple-700">{comparisonStats.voice.averageWpm}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-700">平均CPM</span>
                  <span class="text-xl font-bold text-purple-700">{comparisonStats.voice.averageCpm}</span>
                </div>
                <div class="pt-3 border-t border-purple-200">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">最高スコア</span>
                    <span class="text-lg font-bold text-purple-800">{comparisonStats.voice.bestScore}</span>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- キーボード入力 -->
          <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 p-6">
            <h4 class="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
              ⌨️ キーボード
              <span class="text-sm font-normal text-blue-600">({comparisonStats.keyboard.count}回)</span>
            </h4>

            {#if comparisonStats.keyboard.count === 0}
              <p class="text-gray-600 text-sm">まだ記録がありません</p>
            {:else}
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-700">平均スコア</span>
                  <span class="text-xl font-bold text-blue-700">{comparisonStats.keyboard.averageScore}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-700">平均正確性</span>
                  <span class="text-xl font-bold text-blue-700">{comparisonStats.keyboard.averageAccuracy}%</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-700">平均WPM</span>
                  <span class="text-xl font-bold text-blue-700">{comparisonStats.keyboard.averageWpm}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-700">平均CPM</span>
                  <span class="text-xl font-bold text-blue-700">{comparisonStats.keyboard.averageCpm}</span>
                </div>
                <div class="pt-3 border-t border-blue-200">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-700">最高スコア</span>
                    <span class="text-lg font-bold text-blue-800">{comparisonStats.keyboard.bestScore}</span>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- 勝敗判定 -->
        {#if comparisonStats.voice.count > 0 && comparisonStats.keyboard.count > 0}
          <div class="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-300 p-6">
            <h4 class="text-lg font-bold text-yellow-800 mb-4">🏆 総合評価</h4>

            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-700">スコアが高いのは:</span>
                <span class="font-bold {comparisonStats.voice.averageScore > comparisonStats.keyboard.averageScore ? 'text-purple-700' : comparisonStats.voice.averageScore < comparisonStats.keyboard.averageScore ? 'text-blue-700' : 'text-gray-700'}">
                  {comparisonStats.voice.averageScore > comparisonStats.keyboard.averageScore ? '🎤 音声' : comparisonStats.voice.averageScore < comparisonStats.keyboard.averageScore ? '⌨️ キーボード' : '引き分け'}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-700">正確なのは:</span>
                <span class="font-bold {comparisonStats.voice.averageAccuracy > comparisonStats.keyboard.averageAccuracy ? 'text-purple-700' : comparisonStats.voice.averageAccuracy < comparisonStats.keyboard.averageAccuracy ? 'text-blue-700' : 'text-gray-700'}">
                  {comparisonStats.voice.averageAccuracy > comparisonStats.keyboard.averageAccuracy ? '🎤 音声' : comparisonStats.voice.averageAccuracy < comparisonStats.keyboard.averageAccuracy ? '⌨️ キーボード' : '引き分け'}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-gray-700">速いのは:</span>
                <span class="font-bold {comparisonStats.voice.averageWpm > comparisonStats.keyboard.averageWpm ? 'text-purple-700' : comparisonStats.voice.averageWpm < comparisonStats.keyboard.averageWpm ? 'text-blue-700' : 'text-gray-700'}">
                  {comparisonStats.voice.averageWpm > comparisonStats.keyboard.averageWpm ? '🎤 音声' : comparisonStats.voice.averageWpm < comparisonStats.keyboard.averageWpm ? '⌨️ キーボード' : '引き分け'}
                </span>
              </div>
            </div>
          </div>
        {/if}

        <!-- 全体統計 -->
        <div class="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">📈 全体の統計</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div class="text-center">
              <div class="text-gray-600">総プレイ回数</div>
              <div class="text-xl font-bold text-gray-800">{comparisonStats.all.count}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-600">総プレイ時間</div>
              <div class="text-xl font-bold text-gray-800">{comparisonStats.all.totalPlayTime.toFixed(1)}秒</div>
            </div>
            <div class="text-center">
              <div class="text-gray-600">最高スコア</div>
              <div class="text-xl font-bold text-gray-800">{comparisonStats.all.bestScore}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-600">最高WPM</div>
              <div class="text-xl font-bold text-gray-800">{comparisonStats.all.bestWpm}</div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>
