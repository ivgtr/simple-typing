/**
 * 入力方法検出サービス
 * 入力統計から入力方法を推測する
 */

// 検出閾値を定数化
const DETECTION_THRESHOLDS = {
  HIGH_FREQUENCY: 0.5,    // キーボード（ほぼ1文字1イベント）
  MEDIUM_FREQUENCY: 0.15, // キーボード（修正含む）
  LOW_FREQUENCY: 0.05     // 音声入力
};

export class InputMethodDetector {
  /**
   * 入力統計から入力方法を検出
   * @param {number} totalInputEvents - 総入力イベント数
   * @param {number} totalChars - 総文字数
   * @returns {string} 検出された入力方法 ('keyboard', 'voice', 'other')
   */
  static detect(totalInputEvents, totalChars) {
    if (!totalInputEvents || !totalChars || totalChars === 0) {
      return 'keyboard'; // デフォルト
    }

    const ratio = totalInputEvents / totalChars;

    if (ratio >= DETECTION_THRESHOLDS.HIGH_FREQUENCY) {
      return 'keyboard';
    } else if (ratio >= DETECTION_THRESHOLDS.MEDIUM_FREQUENCY) {
      return 'keyboard';
    } else if (ratio >= DETECTION_THRESHOLDS.LOW_FREQUENCY) {
      return 'voice';
    } else {
      return 'other';
    }
  }

  /**
   * 検出結果の信頼度を取得（将来的な拡張用）
   * @param {number} totalInputEvents - 総入力イベント数
   * @param {number} totalChars - 総文字数
   * @returns {number} 信頼度 (0-1)
   */
  static getConfidence(totalInputEvents, totalChars) {
    // サンプル数が多いほど信頼度が高い
    const sampleCount = Math.min(totalInputEvents, totalChars);
    if (sampleCount < 10) return 0.5;
    if (sampleCount < 50) return 0.7;
    return 0.9;
  }
}
