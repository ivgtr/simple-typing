<script>
  import { createEventDispatcher, onMount } from 'svelte';

  /**
   * 入力エリアコンポーネント
   * @prop {string} value - 入力値
   * @prop {boolean} disabled - 無効化フラグ
   * @event input - 入力イベント
   * @event submit - 送信イベント
   */
  export let value = '';
  export let disabled = false;

  const dispatch = createEventDispatcher();
  let inputElement;

  // 入力が空かどうかを判定
  $: isEmpty = value.trim().length === 0;

  /**
   * 入力エリアにフォーカスを当てる
   */
  export function focus() {
    if (inputElement) {
      inputElement.focus();
    }
  }

  function handleInput(event) {
    dispatch('input', event);
  }

  function handlePaste(event) {
    // ペースト時に改行と余分な空白を除去
    event.preventDefault();

    // クリップボードからテキストを取得（最大10000文字まで）
    const MAX_PASTE_LENGTH = 10000;
    const rawText = event.clipboardData.getData('text');
    const pastedText = rawText.length > MAX_PASTE_LENGTH
      ? rawText.slice(0, MAX_PASTE_LENGTH)
      : rawText;

    if (rawText.length > MAX_PASTE_LENGTH) {
      console.warn(`Clipboard data truncated from ${rawText.length} to ${MAX_PASTE_LENGTH} characters`);
    }

    // 改行とタブを除去し、連続した半角空白のみを統一、前後の空白を削除
    const cleanedText = pastedText
      .replace(/[\r\n\t]+/g, '') // 改行とタブを除去
      .replace(/ {2,}/g, ' ')     // 連続した半角空白のみを1つに（全角は保持）
      .trim();                    // 前後の空白を除去

    // 入力要素の値を更新
    if (inputElement) {
      inputElement.value = cleanedText;

      // inputイベントを手動で発火
      const inputEvent = new Event('input', { bubbles: true });
      inputElement.dispatchEvent(inputEvent);
    }
  }

  function handleKeyDown(event) {
    // Enterで送信（空でない場合のみ）
    if (event.key === 'Enter' && !isEmpty) {
      event.preventDefault();
      dispatch('submit');
    }
  }

  function handleSubmit() {
    if (!isEmpty) {
      dispatch('submit');
    }
  }

  onMount(() => {
    // コンポーネントマウント時にフォーカス
    focus();
  });
</script>

<div class="mb-6">
  <div class="flex items-center justify-between mb-2">
    <label for="input" class="block text-sm font-semibold text-gray-600">
      あなたの入力:
    </label>
    <span class="text-xs text-gray-500">Enter で送信</span>
  </div>
  <input
    bind:this={inputElement}
    type="text"
    id="input"
    {value}
    on:input={handleInput}
    on:paste={handlePaste}
    on:keydown={handleKeyDown}
    {disabled}
    class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
    placeholder="ここに入力してください（キーボードまたは音声入力）"
  />
  <div class="mt-3 flex justify-end">
    <button
      on:click={handleSubmit}
      disabled={disabled || isEmpty}
      class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      送信 (Enter)
    </button>
  </div>
</div>
