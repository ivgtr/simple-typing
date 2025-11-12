/**
 * フォーマッター関数群
 * 日付、ラベル、数値などの表示形式を統一
 */

/**
 * ISO日付文字列を日本語形式にフォーマット
 * @param {string} isoString - ISO 8601形式の日付文字列
 * @returns {string} 'YYYY/MM/DD HH:MM'形式の文字列
 */
export function formatDate(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * 入力方法のラベルを取得
 * @param {string} method - 入力方法 ('keyboard', 'voice', 'other')
 * @returns {string} 表示用ラベル
 */
export function getInputMethodLabel(method) {
  const labels = {
    'keyboard': '⌨️ キーボード',
    'voice': '🎤 音声入力',
    'other': '🔧 その他'
  };
  return labels[method] || method;
}

/**
 * 難易度のラベルを取得
 * @param {string} difficulty - 難易度 ('easy', 'medium', 'hard', 'all')
 * @returns {string} 表示用ラベル
 */
export function getDifficultyLabel(difficulty) {
  const labels = {
    'all': 'すべて',
    'easy': '初級',
    'medium': '中級',
    'hard': '上級'
  };
  return labels[difficulty] || difficulty;
}

/**
 * モードのラベルを取得
 * @param {string} mode - モード ('count', 'time')
 * @param {number} value - モード値
 * @returns {string} 表示用ラベル
 */
export function getModeLabel(mode, value) {
  if (mode === 'count') {
    return `${value}問`;
  } else if (mode === 'time') {
    return `${value}秒`;
  }
  return mode;
}
