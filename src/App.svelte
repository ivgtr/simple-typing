<script>
  let targetText = "これはシンプルなタイピングゲームです。この文章を入力してください。";
  let userInput = "";
  let isStarted = false;
  let isFinished = false;
  let startTime = null;
  let endTime = null;
  let elapsedTime = 0;
  let accuracy = 0;
  let wpm = 0;
  let cpm = 0;

  function startTyping() {
    isStarted = true;
    startTime = Date.now();
  }

  function handleInput() {
    if (!isStarted && userInput.length > 0) {
      startTyping();
    }

    if (userInput.length >= targetText.length) {
      finishTyping();
    }
  }

  function finishTyping() {
    if (isFinished) return;

    isFinished = true;
    endTime = Date.now();
    elapsedTime = (endTime - startTime) / 1000; // 秒単位

    // 正確性の計算
    let correctChars = 0;
    for (let i = 0; i < targetText.length; i++) {
      if (userInput[i] === targetText[i]) {
        correctChars++;
      }
    }
    accuracy = (correctChars / targetText.length) * 100;

    // WPM (Words Per Minute) の計算 - 日本語の場合は文字数ベース
    const minutes = elapsedTime / 60;
    wpm = Math.round((userInput.length / 5) / minutes);

    // CPM (Characters Per Minute) の計算
    cpm = Math.round(userInput.length / minutes);
  }

  function reset() {
    userInput = "";
    isStarted = false;
    isFinished = false;
    startTime = null;
    endTime = null;
    elapsedTime = 0;
    accuracy = 0;
    wpm = 0;
    cpm = 0;
  }
</script>

<main class="min-h-screen flex items-center justify-center p-4">
  <div class="max-w-3xl w-full">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <!-- ヘッダー -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Simple Typing</h1>
        <p class="text-gray-600">入力の経過は確認しないシンプルなタイピングゲーム</p>
      </div>

      <!-- 対象テキスト -->
      <div class="mb-6">
        <h2 class="text-sm font-semibold text-gray-600 mb-2">入力する文章:</h2>
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p class="text-lg leading-relaxed">{targetText}</p>
        </div>
      </div>

      <!-- 入力エリア -->
      <div class="mb-6">
        <label for="input" class="block text-sm font-semibold text-gray-600 mb-2">
          あなたの入力:
        </label>
        <textarea
          id="input"
          bind:value={userInput}
          on:input={handleInput}
          disabled={isFinished}
          class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
          rows="4"
          placeholder="ここに入力してください（キーボードまたは音声入力）"
        ></textarea>
      </div>

      <!-- 結果表示 -->
      {#if isFinished}
        <div class="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 class="text-xl font-bold text-blue-900 mb-4">結果</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-sm text-gray-600">時間</div>
              <div class="text-2xl font-bold text-blue-900">{elapsedTime.toFixed(2)}秒</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600">正確性</div>
              <div class="text-2xl font-bold text-blue-900">{accuracy.toFixed(1)}%</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600">WPM</div>
              <div class="text-2xl font-bold text-blue-900">{wpm}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-600">CPM</div>
              <div class="text-2xl font-bold text-blue-900">{cpm}</div>
            </div>
          </div>
        </div>
      {/if}

      <!-- リセットボタン -->
      {#if isFinished}
        <button
          on:click={reset}
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          もう一度挑戦する
        </button>
      {/if}

      <!-- 説明 -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <h3 class="text-sm font-semibold text-gray-600 mb-2">使い方:</h3>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• 上に表示された文章を、下のテキストエリアに入力してください</li>
          <li>• キーボード入力でも音声入力でもOKです</li>
          <li>• 入力途中の正誤判定はありません</li>
          <li>• 文章の長さ以上を入力すると自動的に結果が表示されます</li>
        </ul>
      </div>
    </div>
  </div>
</main>

<style>
  /* グローバルスタイルはapp.cssで定義 */
</style>
