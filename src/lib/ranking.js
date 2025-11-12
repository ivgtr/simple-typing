/**
 * ランク評価と称号生成システム
 */

/**
 * ランク区分の定義（D～SSS）
 */
export const RANK_TIERS = [
  { rank: 'SSS', minScore: 3000, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
  { rank: 'SS', minScore: 2500, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-300' },
  { rank: 'S', minScore: 2000, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' },
  { rank: 'A+', minScore: 1700, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
  { rank: 'A', minScore: 1400, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
  { rank: 'A-', minScore: 1200, color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
  { rank: 'B+', minScore: 1000, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { rank: 'B', minScore: 800, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { rank: 'B-', minScore: 600, color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { rank: 'C+', minScore: 450, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
  { rank: 'C', minScore: 300, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
  { rank: 'C-', minScore: 150, color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
  { rank: 'D', minScore: 0, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-300' }
];

/**
 * スコアに基づいてランクを判定
 * @param {number} score - スコア
 * @returns {Object} ランク情報 {rank, color, bgColor, borderColor}
 */
export function getRankInfo(score) {
  for (const tier of RANK_TIERS) {
    if (score >= tier.minScore) {
      return tier;
    }
  }
  return RANK_TIERS[RANK_TIERS.length - 1]; // 最低ランク
}

/**
 * ランクに基づく基本称号を取得
 * @param {string} rank - ランク (SSS, SS, S, A+, etc.)
 * @returns {string} 基本称号
 */
function getRankTitle(rank) {
  const titles = {
    'SSS': '伝説の',
    'SS': '超絶',
    'S': '卓越した',
    'A+': '優秀な',
    'A': '熟練の',
    'A-': '上級',
    'B+': '中級の',
    'B': '標準的な',
    'B-': '一般的な',
    'C+': '見習い',
    'C': '初級',
    'C-': '駆け出し',
    'D': '入門'
  };
  return titles[rank] || '未知の';
}

/**
 * 正確度に基づく称号要素を取得
 * @param {number} accuracy - 正確度 (0-100)
 * @returns {string} 正確度に関する称号要素
 */
function getAccuracyTitle(accuracy) {
  if (accuracy === 100) {
    return '完璧主義者';
  } else if (accuracy >= 98) {
    return '精密';
  } else if (accuracy >= 95) {
    return '正確';
  } else if (accuracy >= 90) {
    return '注意深い';
  } else if (accuracy >= 80) {
    return '慎重な';
  } else if (accuracy >= 70) {
    return '落ち着いた';
  } else if (accuracy >= 60) {
    return '粗削りな';
  } else {
    return '大胆不敵な';
  }
}

/**
 * スピードに基づく称号要素を取得
 * @param {number} wpm - WPM (Words Per Minute)
 * @returns {string} スピードに関する称号要素
 */
function getSpeedTitle(wpm) {
  if (wpm >= 100) {
    return '神速の';
  } else if (wpm >= 80) {
    return '高速';
  } else if (wpm >= 60) {
    return '快速';
  } else if (wpm >= 40) {
    return '安定した';
  } else if (wpm >= 20) {
    return 'マイペースな';
  } else {
    return 'のんびりした';
  }
}

/**
 * 総合的な称号タイプを決定
 * @param {number} accuracy - 正確度 (0-100)
 * @param {number} wpm - WPM
 * @param {string} rank - ランク
 * @returns {string} 称号タイプ
 */
function getTitleType(accuracy, wpm, rank) {
  // 完璧な入力
  if (accuracy === 100) {
    if (wpm >= 80) {
      return 'perfect_fast';
    } else if (wpm >= 40) {
      return 'perfect_normal';
    } else {
      return 'perfect_slow';
    }
  }

  // 高正確度
  if (accuracy >= 95) {
    if (wpm >= 60) {
      return 'accurate_fast';
    } else if (wpm >= 30) {
      return 'accurate_normal';
    } else {
      return 'accurate_slow';
    }
  }

  // 中正確度
  if (accuracy >= 80) {
    if (wpm >= 60) {
      return 'balanced_fast';
    } else {
      return 'balanced_normal';
    }
  }

  // 低正確度
  if (wpm >= 60) {
    return 'speed_focused';
  } else if (wpm >= 30) {
    return 'developing';
  } else {
    return 'beginner';
  }
}

/**
 * 称号を生成
 * @param {number} accuracy - 平均正確度 (0-100)
 * @param {number} wpm - WPM
 * @param {string} rank - ランク
 * @returns {string} 称号
 */
export function generateTitle(accuracy, wpm, rank) {
  const titleType = getTitleType(accuracy, wpm, rank);
  const rankTitle = getRankTitle(rank);

  const titles = {
    'perfect_fast': `${rankTitle}完璧主義の神速タイピスト`,
    'perfect_normal': `${rankTitle}完璧主義のタイピスト`,
    'perfect_slow': `${rankTitle}完璧主義の慎重なタイピスト`,
    'accurate_fast': `${getSpeedTitle(wpm)}${getAccuracyTitle(accuracy)}タイピスト`,
    'accurate_normal': `${rankTitle}${getAccuracyTitle(accuracy)}タイピスト`,
    'accurate_slow': `${getAccuracyTitle(accuracy)}${rankTitle}タイピスト`,
    'balanced_fast': `${rankTitle}${getSpeedTitle(wpm)}タイピスト`,
    'balanced_normal': `${rankTitle}タイピスト`,
    'speed_focused': `${getSpeedTitle(wpm)}荒削りタイピスト`,
    'developing': `成長中の${rankTitle}タイピスト`,
    'beginner': `${rankTitle}タイピング初心者`
  };

  return titles[titleType] || `${rankTitle}タイピスト`;
}

/**
 * ランクと称号を含む総合評価を取得
 * @param {number} score - スコア
 * @param {number} accuracy - 平均正確度 (0-100)
 * @param {number} wpm - WPM
 * @returns {Object} {rank, title, color, bgColor, borderColor}
 */
export function getRankingEvaluation(score, accuracy, wpm) {
  const rankInfo = getRankInfo(score);
  const title = generateTitle(accuracy, wpm, rankInfo.rank);

  return {
    rank: rankInfo.rank,
    title,
    color: rankInfo.color,
    bgColor: rankInfo.bgColor,
    borderColor: rankInfo.borderColor
  };
}
