<script>
  import { createEventDispatcher } from 'svelte';

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

  function handleInput(event) {
    dispatch('input', event);
  }

  function handleKeyDown(event) {
    // Ctrl+Enterで送信
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      dispatch('submit');
    }
  }

  function handleSubmit() {
    dispatch('submit');
  }
</script>

<div class="mb-6">
  <div class="flex items-center justify-between mb-2">
    <label for="input" class="block text-sm font-semibold text-gray-600">
      あなたの入力:
    </label>
    <span class="text-xs text-gray-500">Ctrl+Enter で送信</span>
  </div>
  <textarea
    id="input"
    {value}
    on:input={handleInput}
    on:keydown={handleKeyDown}
    {disabled}
    class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
    rows="4"
    placeholder="ここに入力してください（キーボードまたは音声入力）"
  ></textarea>
  <div class="mt-3 flex justify-end">
    <button
      on:click={handleSubmit}
      {disabled}
      class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      送信 (Ctrl+Enter)
    </button>
  </div>
</div>
