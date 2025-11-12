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

  // モード選択の状態
  let selectedMode = 'count';
  let selectedValue = 5;

  // ゲームセッションのインスタンスを作成
  let game = new GameSession(selectedMode, selectedValue);
  let timerInterval = null;
  let currentTime = 0;

  // リアクティブな状態
  $: gameState = game.getState();
  $: state = gameState.state;
  $: currentQuestion = gameState.currentQuestion;
  $: targetText = currentQuestion ? currentQuestion.text : '';
  $: userInput = gameState.userInput;
  $: currentQuestionIndex = gameState.currentQuestionIndex;
  $: totalQuestions = gameState.totalQuestions;
  $: totalResult = gameState.totalResult;
  $: rank = totalResult ? getScoreRank(totalResult.totalScore) : '';
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
   * ゲーム開始ハンドラ
   */
  function handleStart() {
    // 新しいゲームセッションを作成
    game = new GameSession(selectedMode, selectedValue);
    game.start();

    // タイマー開始
    startTimer();
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
    }
  }

  /**
   * リセット処理
   */
  function reset() {
    stopTimer();
    game = new GameSession(selectedMode, selectedValue);
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

      {#if state === 'ready'}
        <!-- ゲーム開始前 -->
        <GameModeSelector
          {selectedMode}
          {selectedValue}
          on:select={handleModeSelect}
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
        <div class="mb-6 flex items-center justify-between">
          <ProgressIndicator
            {mode}
            current={currentQuestionIndex}
            total={totalQuestions}
            remainingTime={remainingTime}
            totalTime={selectedValue * 1000}
          />
          {#if mode === 'count'}
            <TimerDisplay elapsedTime={currentTime} />
          {/if}
        </div>

        <!-- 対象テキスト -->
        <QuestionDisplay text={targetText} />

        <!-- 入力エリア -->
        <InputArea
          value={userInput}
          disabled={false}
          on:input={handleInput}
          on:submit={handleSubmit}
        />

      {:else if state === 'finished'}
        <!-- ゲーム終了 -->
        <!-- 結果表示 -->
        <ResultDisplay result={totalResult} {rank} />

        <!-- リセットボタン -->
        <button
          on:click={reset}
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          もう一度挑戦する
        </button>
      {/if}

      <!-- 説明 -->
      <InstructionsCard />
    </div>
  </div>
</main>
