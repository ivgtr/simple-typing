<script>
  import { onDestroy } from 'svelte';
  import { GameSession, getScoreRank } from './lib/game.js';
  import Header from './components/Header.svelte';
  import QuestionDisplay from './components/QuestionDisplay.svelte';
  import InputArea from './components/InputArea.svelte';
  import ResultDisplay from './components/ResultDisplay.svelte';
  import InstructionsCard from './components/InstructionsCard.svelte';
  import StartButton from './components/StartButton.svelte';
  import TimerDisplay from './components/TimerDisplay.svelte';
  import ProgressIndicator from './components/ProgressIndicator.svelte';
  import GameModeSelector from './components/GameModeSelector.svelte';
  import DifficultySelector from './components/DifficultySelector.svelte';
  import HistoryView from './components/HistoryView.svelte';

  // ビューモード ('game' または 'history')
  let viewMode = 'game';

  // モード選択の状態
  let selectedMode = 'count';
  let selectedValue = 5;
  let selectedDifficulty = 'all';

  // ゲームセッションのインスタンスを作成
  let game = new GameSession(selectedMode, selectedValue, selectedDifficulty);
  let timerInterval = null;
  let currentTime = 0;
  let inputAreaComponent;

  // リアクティブな状態
  $: gameState = game.getState();
  $: state = gameState.state;
  $: currentQuestion = gameState.currentQuestion;
  $: targetText = currentQuestion ? currentQuestion.text : '';
  $: userInput = gameState.userInput;
  $: currentQuestionIndex = gameState.currentQuestionIndex;
  $: totalQuestions = gameState.totalQuestions;
  $: totalResult = gameState.totalResult;
  $: rankEvaluation = totalResult ? getScoreRank(totalResult.totalScore, totalResult.averageAccuracy, totalResult.totalWpm) : null;
  $: elapsedTime = gameState.elapsedTime;
  $: remainingTime = gameState.remainingTime;
  $: mode = gameState.mode;

  /**
   * モード選択ハンドラ
   */
  function handleModeSelect(event) {
    selectedMode = event.detail.mode;
    selectedValue = event.detail.value;
  }

  /**
   * 難易度選択ハンドラ
   */
  function handleDifficultySelect(event) {
    selectedDifficulty = event.detail.difficulty;
  }

  /**
   * ゲーム開始ハンドラ
   */
  function handleStart() {
    // 新しいゲームセッションを作成
    game = new GameSession(selectedMode, selectedValue, selectedDifficulty);
    game.start();

    // タイマー開始
    startTimer();

    // 入力欄にフォーカス
    setTimeout(() => {
      if (inputAreaComponent) {
        inputAreaComponent.focus();
      }
    }, 0);
  }

  /**
   * 入力変更時のハンドラ
   */
  function handleInput(event) {
    game.updateInput(event.detail.target.value);
    game = game; // 再レンダリング
  }

  /**
   * 送信ハンドラ
   */
  function handleSubmit() {
    game.submitAnswer();
    game = game; // 再レンダリング

    // ゲームが終了したらタイマー停止
    if (game.getState().state === 'finished') {
      stopTimer();
    } else {
      // 次の問題に移った場合、入力欄にフォーカス
      setTimeout(() => {
        if (inputAreaComponent) {
          inputAreaComponent.focus();
        }
      }, 0);
    }
  }

  /**
   * リセット処理
   */
  function reset() {
    stopTimer();
    game = new GameSession(selectedMode, selectedValue, selectedDifficulty);
    currentTime = 0;
  }

  /**
   * タイマー開始
   */
  function startTimer() {
    stopTimer(); // 既存のタイマーをクリア
    timerInterval = setInterval(() => {
      currentTime = game.getElapsedTime();

      // 時間ベースモードの場合、時間切れをチェック
      if (mode === 'time' && remainingTime !== null && remainingTime <= 0) {
        game.finishGame();
        game = game; // 再レンダリング
        stopTimer();
      }
    }, 100); // 100msごとに更新
  }

  /**
   * タイマー停止
   */
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // コンポーネント破棄時にタイマーをクリア
  onDestroy(() => {
    stopTimer();
  });
</script>

<main class="min-h-screen flex items-center justify-center p-4">
  <div class="max-w-3xl w-full">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <!-- ヘッダー -->
      <Header />

      <!-- タブナビゲーション -->
      <div class="mb-6 flex gap-2 border-b border-gray-200">
        <button
          on:click={() => viewMode = 'game'}
          class="px-4 py-2 font-semibold transition-colors border-b-2 {viewMode === 'game' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent hover:text-gray-800'}"
        >
          🎮 ゲーム
        </button>
        <button
          on:click={() => viewMode = 'history'}
          class="px-4 py-2 font-semibold transition-colors border-b-2 {viewMode === 'history' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent hover:text-gray-800'}"
        >
          📊 履歴
        </button>
      </div>

      {#if viewMode === 'history'}
        <!-- 履歴ビュー -->
        <HistoryView />

      {:else if state === 'ready'}
        <!-- ゲーム開始前 -->
        <GameModeSelector
          {selectedMode}
          {selectedValue}
          on:select={handleModeSelect}
        />
        <DifficultySelector
          {selectedDifficulty}
          on:select={handleDifficultySelect}
        />
        <div class="mb-6 text-center">
          <p class="text-gray-600 mb-4">
            {#if mode === 'count'}
              {totalQuestions}つの問題に挑戦します。
            {:else}
              {selectedValue}秒間でできるだけ多くの問題に挑戦します。
            {/if}
            <br />
            準備ができたら、スタートボタンを押してください。
          </p>
        </div>
        <StartButton on:start={handleStart} />

      {:else if state === 'playing'}
        <!-- ゲームプレイ中 -->
        <!-- タイマーと進捗 -->
        <div class="mb-6 flex items-center gap-4">
          <ProgressIndicator
            {mode}
            current={currentQuestionIndex}
            total={totalQuestions}
            remainingTime={remainingTime}
            totalTime={selectedValue * 1000}
          />
          {#if mode === 'count'}
            <div class="flex-shrink-0">
              <TimerDisplay elapsedTime={currentTime} />
            </div>
          {/if}
        </div>

        <!-- 対象テキスト -->
        <QuestionDisplay text={targetText} />

        <!-- 入力エリア -->
        <InputArea
          bind:this={inputAreaComponent}
          value={userInput}
          disabled={false}
          on:input={handleInput}
          on:submit={handleSubmit}
        />

      {:else if state === 'finished'}
        <!-- ゲーム終了 -->
        <!-- 結果表示 -->
        <ResultDisplay
          result={totalResult}
          rankEvaluation={rankEvaluation}
          mode={selectedMode}
          modeValue={selectedValue}
          difficulty={selectedDifficulty}
        />

        <!-- リセットボタン -->
        <button
          on:click={reset}
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          もう一度挑戦する
        </button>
      {/if}

      {#if viewMode === 'game'}
        <!-- 説明 -->
        <InstructionsCard />
      {/if}
    </div>
  </div>
</main>
