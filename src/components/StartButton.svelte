<script>
  import { createEventDispatcher } from 'svelte';

  /**
   * スタートボタンコンポーネント
   * @event start - スタートボタンがクリックされた
   */
  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('start');
  }
</script>

<div class="text-center py-8">
  <button
    on:click={handleClick}
    class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg shadow-lg transition-all hover:scale-105"
  >
    ゲームスタート
  </button>
</div>
