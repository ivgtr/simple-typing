/**
 * タイピング履歴を管理するクラス
 * LocalStorageを使用してブラウザにデータを保存
 */

const STORAGE_KEY = 'simple-typing-history';
const MAX_HISTORY_SIZE = 1000; // 最大保存件数

/**
 * 履歴データの型定義
 * @typedef {Object} HistoryRecord
 * @property {string} id - ユニークID（タイムスタンプベース）
 * @property {string} inputMethod - 入力方法 ('voice', 'keyboard', 'other')
 * @property {string} timestamp - ISO 8601形式のタイムスタンプ
 * @property {string} mode - ゲームモード ('count' または 'time')
 * @property {number} modeValue - 問題数または秒数
 * @property {string} difficulty - 難易度 ('all', 'easy', 'medium', 'hard')
 * @property {Object} result - ゲーム結果（calculateTotalResultの結果）
 * @property {Object} rankEvaluation - ランク評価
 */

/**
 * 履歴管理クラス
 */
export class HistoryManager {
  /**
   * 全ての履歴を取得
   * @returns {Array<HistoryRecord>} 履歴の配列（新しい順）
   */
  static getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const history = JSON.parse(data);

      // バリデーション
      if (!Array.isArray(history)) return [];

      // 新しい順にソート
      return history.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  /**
   * 履歴を保存
   * @param {Object} record - 保存するレコード
   * @param {string} record.inputMethod - 入力方法
   * @param {string} record.mode - ゲームモード
   * @param {number} record.modeValue - 問題数または秒数
   * @param {string} record.difficulty - 難易度
   * @param {Object} record.result - ゲーム結果
   * @param {Object} record.rankEvaluation - ランク評価
   * @returns {boolean} 保存成功したかどうか
   */
  static save(record) {
    try {
      const history = this.getAll();

      // 新しいレコードを作成
      const newRecord = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...record
      };

      // 履歴に追加
      history.unshift(newRecord);

      // 最大件数を超えたら古いものを削除
      if (history.length > MAX_HISTORY_SIZE) {
        history.splice(MAX_HISTORY_SIZE);
      }

      // LocalStorageに保存
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

      return true;
    } catch (error) {
      console.error('Failed to save history:', error);
      return false;
    }
  }

  /**
   * 特定のIDの履歴を削除
   * @param {string} id - 削除する履歴のID
   * @returns {boolean} 削除成功したかどうか
   */
  static delete(id) {
    try {
      const history = this.getAll();
      const filtered = history.filter(record => record.id !== id);

      if (filtered.length === history.length) {
        // 削除対象が見つからなかった
        return false;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete history:', error);
      return false;
    }
  }

  /**
   * 全ての履歴を削除
   * @returns {boolean} 削除成功したかどうか
   */
  static clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear history:', error);
      return false;
    }
  }

  /**
   * 入力方法でフィルタリング
   * @param {string} inputMethod - 'voice', 'keyboard', 'other', 'all'
   * @returns {Array<HistoryRecord>} フィルタリングされた履歴
   */
  static filterByInputMethod(inputMethod) {
    const history = this.getAll();

    if (inputMethod === 'all') {
      return history;
    }

    return history.filter(record => record.inputMethod === inputMethod);
  }

  /**
   * 難易度でフィルタリング
   * @param {string} difficulty - 'easy', 'medium', 'hard', 'all'
   * @returns {Array<HistoryRecord>} フィルタリングされた履歴
   */
  static filterByDifficulty(difficulty) {
    const history = this.getAll();

    if (difficulty === 'all') {
      return history;
    }

    return history.filter(record => record.difficulty === difficulty);
  }

  /**
   * 統計情報を取得
   * @param {string} inputMethod - 'voice', 'keyboard', 'other', 'all'
   * @returns {Object} 統計情報
   */
  static getStatistics(inputMethod = 'all') {
    const history = this.filterByInputMethod(inputMethod);

    if (history.length === 0) {
      return {
        count: 0,
        averageScore: 0,
        averageAccuracy: 0,
        averageWpm: 0,
        averageCpm: 0,
        bestScore: 0,
        bestAccuracy: 0,
        bestWpm: 0,
        bestCpm: 0,
        totalPlayTime: 0
      };
    }

    const scores = history.map(r => r.result.totalScore);
    const accuracies = history.map(r => r.result.averageAccuracy);
    const wpms = history.map(r => r.result.totalWpm);
    const cpms = history.map(r => r.result.totalCpm);
    const playTimes = history.map(r => r.result.totalElapsedTime);

    return {
      count: history.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      averageAccuracy: parseFloat((accuracies.reduce((a, b) => a + b, 0) / accuracies.length).toFixed(2)),
      averageWpm: Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length),
      averageCpm: Math.round(cpms.reduce((a, b) => a + b, 0) / cpms.length),
      bestScore: Math.max(...scores),
      bestAccuracy: Math.max(...accuracies),
      bestWpm: Math.max(...wpms),
      bestCpm: Math.max(...cpms),
      totalPlayTime: parseFloat(playTimes.reduce((a, b) => a + b, 0).toFixed(2))
    };
  }

  /**
   * 音声とキーボードの比較統計を取得
   * @returns {Object} 比較統計
   */
  static getComparisonStats() {
    return {
      voice: this.getStatistics('voice'),
      keyboard: this.getStatistics('keyboard'),
      other: this.getStatistics('other'),
      all: this.getStatistics('all')
    };
  }

  /**
   * 履歴データをエクスポート（JSON形式）
   * @returns {string} JSON文字列
   */
  static export() {
    const history = this.getAll();
    return JSON.stringify(history, null, 2);
  }

  /**
   * 履歴データをインポート
   * @param {string} jsonString - JSON文字列
   * @returns {boolean} インポート成功したかどうか
   */
  static import(jsonString) {
    try {
      const importedHistory = JSON.parse(jsonString);

      if (!Array.isArray(importedHistory)) {
        throw new Error('Invalid format: expected an array');
      }

      const currentHistory = this.getAll();

      // マージ（重複排除）
      const merged = [...currentHistory];

      for (const record of importedHistory) {
        // 同じIDが既に存在しないかチェック
        if (!merged.some(r => r.id === record.id)) {
          merged.push(record);
        }
      }

      // 新しい順にソート
      merged.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      // 最大件数を超えたら古いものを削除
      if (merged.length > MAX_HISTORY_SIZE) {
        merged.splice(MAX_HISTORY_SIZE);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  /**
   * 最高記録を取得
   * @param {string} sortBy - ソート基準 ('score', 'accuracy', 'wpm', 'cpm')
   * @param {string} inputMethod - 'voice', 'keyboard', 'other', 'all'
   * @returns {HistoryRecord|null} 最高記録
   */
  static getBestRecord(sortBy = 'score', inputMethod = 'all') {
    const history = this.filterByInputMethod(inputMethod);

    if (history.length === 0) return null;

    const sortFunctions = {
      score: (a, b) => b.result.totalScore - a.result.totalScore,
      accuracy: (a, b) => b.result.averageAccuracy - a.result.averageAccuracy,
      wpm: (a, b) => b.result.totalWpm - a.result.totalWpm,
      cpm: (a, b) => b.result.totalCpm - a.result.totalCpm
    };

    const sortFn = sortFunctions[sortBy] || sortFunctions.score;

    return [...history].sort(sortFn)[0];
  }

  /**
   * 比較用の記録リストを取得
   * @param {string} inputMethod - 入力方法でフィルタ
   * @param {string} mode - モードでフィルタ (optional)
   * @param {string} difficulty - 難易度でフィルタ (optional)
   * @returns {Array<HistoryRecord>} フィルタされた履歴
   */
  static getRecordsForComparison(inputMethod = 'all', mode = null, difficulty = null) {
    let history = this.filterByInputMethod(inputMethod);

    // モードでフィルタ
    if (mode) {
      history = history.filter(record => record.mode === mode);
    }

    // 難易度でフィルタ
    if (difficulty && difficulty !== 'all') {
      history = history.filter(record => record.difficulty === difficulty);
    }

    return history;
  }

  /**
   * IDで特定の記録を取得
   * @param {string} id - 記録のID
   * @returns {HistoryRecord|null} 見つかった記録、なければnull
   */
  static getById(id) {
    const history = this.getAll();
    return history.find(record => record.id === id) || null;
  }
}
