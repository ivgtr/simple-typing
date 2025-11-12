/**
 * 結果表示用のユーティリティ関数
 */

/**
 * 正確度に基づく評価コメントを取得
 * @param {number} accuracy - 正確度 (0-100)
 * @returns {string} 評価コメント
 */
export function getEvaluationComment(accuracy) {
  if (accuracy === 100) return 'Perfect!';
  if (accuracy >= 95) return 'Excellent!';
  if (accuracy >= 90) return 'Great!';
  if (accuracy >= 80) return 'Good!';
  if (accuracy >= 70) return 'Not bad!';
  if (accuracy >= 60) return 'Keep trying!';
  return 'Try again!';
}

/**
 * 正確度に基づくアイコンの種類を取得
 * @param {number} accuracy - 正確度 (0-100)
 * @returns {string} アイコンの種類 ('perfect', 'good', 'warning', 'error')
 */
export function getIconType(accuracy) {
  if (accuracy === 100) return 'perfect';
  if (accuracy >= 90) return 'good';
  if (accuracy >= 70) return 'warning';
  return 'error';
}

/**
 * テキストの差分を計算（文字単位）
 * @param {string} targetText - 正解テキスト
 * @param {string} userInput - ユーザー入力テキスト
 * @returns {Array} 差分情報の配列 [{char, type: 'correct'|'incorrect'|'missing'}]
 */
export function calculateTextDiff(targetText, userInput) {
  // 入力方法に関わらず公平な評価のため、両方を正規化
  const normalizeText = (text) => {
    return text
      .trim()
      .replace(/ {2,}/g, ' ');
  };

  const normalizedTarget = normalizeText(targetText);
  const normalizedInput = normalizeText(userInput);

  const result = [];
  const maxLength = Math.max(normalizedTarget.length, normalizedInput.length);

  for (let i = 0; i < maxLength; i++) {
    const targetChar = normalizedTarget[i];
    const inputChar = normalizedInput[i];

    if (i < normalizedTarget.length && i < normalizedInput.length) {
      // 両方に文字が存在
      if (targetChar === inputChar) {
        result.push({ char: inputChar, type: 'correct', position: i });
      } else {
        result.push({ char: inputChar, type: 'incorrect', position: i, expected: targetChar });
      }
    } else if (i >= normalizedInput.length) {
      // 入力が短い（不足している文字）
      result.push({ char: targetChar, type: 'missing', position: i });
    } else {
      // 入力が長い（余分な文字）
      result.push({ char: inputChar, type: 'extra', position: i });
    }
  }

  return result;
}

/**
 * 差分情報から統計を計算
 * @param {Array} diff - calculateTextDiffの結果
 * @returns {Object} {correct, incorrect, missing, extra, total}
 */
export function calculateDiffStats(diff) {
  const stats = {
    correct: 0,
    incorrect: 0,
    missing: 0,
    extra: 0,
    total: diff.length
  };

  diff.forEach(item => {
    if (item.type === 'correct') stats.correct++;
    else if (item.type === 'incorrect') stats.incorrect++;
    else if (item.type === 'missing') stats.missing++;
    else if (item.type === 'extra') stats.extra++;
  });

  return stats;
}

/**
 * 時間を読みやすい形式にフォーマット
 * @param {number} seconds - 秒数
 * @returns {string} フォーマットされた時間
 */
export function formatTime(seconds) {
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(0)}ms`;
  }
  return `${seconds.toFixed(2)}s`;
}
