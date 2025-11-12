import { writable } from 'svelte/store';
import { HistoryManager } from '../history.js';

/**
 * 履歴管理用のSvelteストア
 * LocalStorageとの同期、保存状態の管理を行う
 */
function createHistoryStore() {
  // 初期状態
  const initialState = {
    records: HistoryManager.getAll(),
    saveStatus: 'idle', // 'idle', 'saving', 'success', 'error'
    error: null
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,

    /**
     * 記録を保存
     * @param {Object} record - 保存する記録
     * @returns {boolean} 成功したかどうか
     */
    save(record) {
      // 保存中状態に
      update(state => ({ ...state, saveStatus: 'saving' }));

      try {
        const success = HistoryManager.save(record);

        if (success) {
          // 成功: 記録を再読み込みして保存成功状態に
          update(state => ({
            records: HistoryManager.getAll(),
            saveStatus: 'success',
            error: null
          }));

          // 3秒後にアイドル状態に戻す
          setTimeout(() => {
            update(state => ({ ...state, saveStatus: 'idle' }));
          }, 3000);

          return true;
        } else {
          // 失敗
          update(state => ({
            ...state,
            saveStatus: 'error',
            error: 'Failed to save record'
          }));
          return false;
        }
      } catch (error) {
        update(state => ({
          ...state,
          saveStatus: 'error',
          error: error.message
        }));
        return false;
      }
    },

    /**
     * 記録を削除
     * @param {string} id - 削除する記録のID
     * @returns {boolean} 成功したかどうか
     */
    delete(id) {
      const success = HistoryManager.delete(id);
      if (success) {
        update(state => ({
          ...state,
          records: HistoryManager.getAll()
        }));
      }
      return success;
    },

    /**
     * すべての記録をクリア
     */
    clear() {
      HistoryManager.clear();
      update(state => ({
        ...state,
        records: []
      }));
    },

    /**
     * LocalStorageから記録を再読み込み
     */
    refresh() {
      update(state => ({
        ...state,
        records: HistoryManager.getAll()
      }));
    }
  };
}

// シングルトンインスタンスをエクスポート
export const historyStore = createHistoryStore();
