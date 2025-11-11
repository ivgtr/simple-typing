<script>
  /**
   * 問題文表示コンポーネント
   * @prop {string} text - 表示する問題文
   */
  export let text = '';
</script>

<div class="mb-6">
  <h2 class="text-sm font-semibold text-gray-600 mb-2">入力する文章:</h2>
  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <p class="text-lg leading-relaxed">{text}</p>
  </div>
</div>
