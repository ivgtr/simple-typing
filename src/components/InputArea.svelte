<script>
  import { createEventDispatcher } from 'svelte';

  /**
   * 入力エリアコンポーネント
   * @prop {string} value - 入力値
   * @prop {boolean} disabled - 無効化フラグ
   * @event input - 入力イベント
   */
  export let value = '';
  export let disabled = false;

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    dispatch('input', event);
  }
</script>

<div class="mb-6">
  <label for="input" class="block text-sm font-semibold text-gray-600 mb-2">
    あなたの入力:
  </label>
  <textarea
    id="input"
    {value}
    on:input={handleInput}
    {disabled}
    class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
    rows="4"
    placeholder="ここに入力してください（キーボードまたは音声入力）"
  ></textarea>
</div>
