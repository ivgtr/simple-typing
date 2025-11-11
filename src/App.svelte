<script>
  import { GameSession, getScoreRank } from './lib/game.js';
  import Header from './components/Header.svelte';
  import QuestionDisplay from './components/QuestionDisplay.svelte';
  import InputArea from './components/InputArea.svelte';
  import ResultDisplay from './components/ResultDisplay.svelte';
  import InstructionsCard from './components/InstructionsCard.svelte';

  // ゲームセッションのインスタンスを作成
  let game = new GameSession();

  // リアクティブな状態
  $: state = game.getState();
  $: targetText = state.question.text;
  $: userInput = state.userInput;
  $: isFinished = state.isFinished;
  $: result = state.result;
  $: rank = result ? getScoreRank(result.score) : '';

  /**
   * 入力変更時のハンドラ
   */
  function handleInput(event) {
    game.updateInput(event.detail.target.value);
    // 強制的に再レンダリングを促す
    game = game;
  }

  /**
   * リセット処理
   */
  function reset() {
    game.reset();
    game = game; // 強制的に再レンダリング
  }
</script>

<main class="min-h-screen flex items-center justify-center p-4">
  <div class="max-w-3xl w-full">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <!-- ヘッダー -->
      <Header />

      <!-- 対象テキスト -->
      <QuestionDisplay text={targetText} />

      <!-- 入力エリア -->
      <InputArea
        value={userInput}
        disabled={isFinished}
        on:input={handleInput}
      />

      <!-- 結果表示 -->
      <ResultDisplay {result} {rank} />

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
      <InstructionsCard />
    </div>
  </div>
</main>
