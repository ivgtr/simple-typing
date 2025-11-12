/**
 * 比較計算ユーティリティ
 * 2つの値の比較、差分計算、パーセンテージ変化を計算
 */

/**
 * 現在の値が過去の値より良いかを判定
 * @param {number} currentValue - 現在の値
 * @param {number} pastValue - 過去の値
 * @param {boolean} higherIsBetter - 値が大きい方が良いか（デフォルト: true）
 * @returns {boolean} 現在の値が良いか
 */
export function isBetter(currentValue, pastValue, higherIsBetter = true) {
  if (higherIsBetter) {
    return currentValue > pastValue;
  } else {
    return currentValue < pastValue;
  }
}

/**
 * 2つの値の差分を取得
 * @param {number} currentValue - 現在の値
 * @param {number} pastValue - 過去の値
 * @param {boolean} isPercentage - パーセンテージ値か
 * @returns {string} フォーマットされた差分文字列
 */
export function getDifference(currentValue, pastValue, isPercentage = false) {
  const diff = currentValue - pastValue;
  const sign = diff > 0 ? '+' : '';
  const unit = isPercentage ? '%' : '';

  if (isPercentage) {
    return `${sign}${diff.toFixed(1)}${unit}`;
  } else {
    return `${sign}${Math.round(diff)}${unit}`;
  }
}

/**
 * パーセンテージ変化を計算
 * @param {number} currentValue - 現在の値
 * @param {number} pastValue - 過去の値
 * @returns {string} パーセンテージ変化の文字列
 */
export function getPercentageChange(currentValue, pastValue) {
  if (pastValue === 0) {
    return '+∞%';
  }
  const change = ((currentValue - pastValue) / pastValue) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * 2つの結果を包括的に比較
 * @param {Object} currentResult - 現在の結果
 * @param {Object} pastResult - 過去の結果
 * @returns {Object} 各メトリクスの比較結果
 */
export function compareResults(currentResult, pastResult) {
  return {
    score: {
      current: currentResult.totalScore,
      past: pastResult.totalScore,
      diff: getDifference(currentResult.totalScore, pastResult.totalScore),
      change: getPercentageChange(currentResult.totalScore, pastResult.totalScore),
      isBetter: isBetter(currentResult.totalScore, pastResult.totalScore)
    },
    accuracy: {
      current: currentResult.averageAccuracy,
      past: pastResult.averageAccuracy,
      diff: getDifference(currentResult.averageAccuracy, pastResult.averageAccuracy, true),
      isBetter: isBetter(currentResult.averageAccuracy, pastResult.averageAccuracy)
    },
    wpm: {
      current: currentResult.totalWpm,
      past: pastResult.totalWpm,
      diff: getDifference(currentResult.totalWpm, pastResult.totalWpm),
      change: getPercentageChange(currentResult.totalWpm, pastResult.totalWpm),
      isBetter: isBetter(currentResult.totalWpm, pastResult.totalWpm)
    },
    cpm: {
      current: currentResult.totalCpm,
      past: pastResult.totalCpm,
      diff: getDifference(currentResult.totalCpm, pastResult.totalCpm),
      change: getPercentageChange(currentResult.totalCpm, pastResult.totalCpm),
      isBetter: isBetter(currentResult.totalCpm, pastResult.totalCpm)
    },
    time: {
      current: currentResult.totalElapsedTime,
      past: pastResult.totalElapsedTime,
      diff: getDifference(currentResult.totalElapsedTime, pastResult.totalElapsedTime),
      isBetter: isBetter(currentResult.totalElapsedTime, pastResult.totalElapsedTime, false) // 時間は短い方が良い
    }
  };
}
