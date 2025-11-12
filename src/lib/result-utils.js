/**
 * 結果表示用のユーティリティ関数
 */

/**
 * テキストを正規化（評価に使用）
 * @param {string} text - 正規化するテキスト
 * @returns {string} 正規化されたテキスト
 */
export function normalizeText(text) {
  return text
    .trim()                    // 前後の空白を除去
    .replace(/ {2,}/g, ' ');   // 連続した半角空白を1つに
}

/**
 * 編集距離のDPテーブルを計算
 * @param {string} target - 正解テキスト（正規化済み）
 * @param {string} input - 入力テキスト（正規化済み）
 * @returns {Array<Array<number>>} DPテーブル
 */
export function calculateEditDistanceTable(target, input) {
  const m = target.length;
  const n = input.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  // 初期化
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  // DPテーブルを埋める
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (target[i - 1] === input[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // マッチ
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 削除（targetの文字が欠けている）
          dp[i][j - 1] + 1,     // 挿入（inputに余分な文字がある）
          dp[i - 1][j - 1] + 1  // 置換
        );
      }
    }
  }

  return dp;
}

/**
 * 編集距離ベースで正確度を計算
 * @param {string} targetText - 正解テキスト
 * @param {string} userInput - ユーザー入力テキスト
 * @returns {Object} {accuracy: number, correctChars: number, totalChars: number, editDistance: number}
 */
export function calculateEditDistanceAccuracy(targetText, userInput) {
  const target = normalizeText(targetText);
  const input = normalizeText(userInput);

  const totalChars = target.length;

  if (totalChars === 0) {
    return {
      accuracy: 0,
      correctChars: 0,
      totalChars: 0,
      editDistance: input.length
    };
  }

  // 編集距離を計算
  const dp = calculateEditDistanceTable(target, input);
  const editDistance = dp[target.length][input.length];

  // 正確度を計算：編集距離が小さいほど高い正確度
  // accuracy = (1 - editDistance / totalChars) * 100
  // ただし、0%未満にはならない
  const correctChars = Math.max(0, totalChars - editDistance);
  const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;

  return {
    accuracy: parseFloat(accuracy.toFixed(2)),
    correctChars,
    totalChars,
    editDistance
  };
}

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
 * テキストの差分を計算（編集距離アルゴリズムを使用）
 * @param {string} targetText - 正解テキスト
 * @param {string} userInput - ユーザー入力テキスト
 * @returns {Array} 差分情報の配列 [{char, type: 'correct'|'incorrect'|'missing'|'extra'}]
 */
export function calculateTextDiff(targetText, userInput) {
  const target = normalizeText(targetText);
  const input = normalizeText(userInput);

  // 共通化された編集距離計算を使用
  const dp = calculateEditDistanceTable(target, input);

  // バックトラックして差分を取得
  const result = [];
  let i = target.length;
  let j = input.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && target[i - 1] === input[j - 1]) {
      // マッチ
      result.unshift({
        char: input[j - 1],
        type: 'correct',
        targetChar: target[i - 1]
      });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      // 置換
      result.unshift({
        char: input[j - 1],
        type: 'incorrect',
        expected: target[i - 1]
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j] === dp[i][j - 1] + 1)) {
      // 挿入（余分な文字）
      result.unshift({
        char: input[j - 1],
        type: 'extra'
      });
      j--;
    } else if (i > 0) {
      // 削除（不足している文字）
      result.unshift({
        char: target[i - 1],
        type: 'missing',
        expected: target[i - 1]
      });
      i--;
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
