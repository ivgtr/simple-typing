/**
 * タイピングゲームのロジックを管理するユーティリティ関数群
 */

import questionsData from '../data/questions.json';

/**
 * 問題文の一覧を取得
 * @returns {Array} 問題文の配列
 */
export function getQuestions() {
  return questionsData.questions;
}

/**
 * ランダムな問題文を1つ取得
 * @returns {Object} 問題文オブジェクト {id, text, difficulty}
 */
export function getRandomQuestion() {
  const questions = getQuestions();
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

/**
 * ランダムな問題文を複数取得
 * @param {number} count - 取得する問題数
 * @returns {Array} 問題文の配列
 */
export function getRandomQuestions(count) {
  const questions = getQuestions();
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, questions.length));
}

/**
 * 難易度を指定して問題文を取得
 * @param {string} difficulty - 難易度 ('easy', 'medium', 'hard')
 * @returns {Array} 指定した難易度の問題文の配列
 */
export function getQuestionsByDifficulty(difficulty) {
  const questions = getQuestions();
  return questions.filter(q => q.difficulty === difficulty);
}

/**
 * IDを指定して問題文を取得
 * @param {number} id - 問題ID
 * @returns {Object|null} 問題文オブジェクト、見つからない場合はnull
 */
export function getQuestionById(id) {
  const questions = getQuestions();
  return questions.find(q => q.id === id) || null;
}

/**
 * 入力の正確性を計算
 * @param {string} targetText - 対象の文章
 * @param {string} userInput - ユーザーの入力
 * @returns {Object} {accuracy: number, correctChars: number, totalChars: number}
 */
export function calculateAccuracy(targetText, userInput) {
  const totalChars = targetText.length;
  let correctChars = 0;

  // 文字単位で比較
  for (let i = 0; i < totalChars; i++) {
    if (userInput[i] === targetText[i]) {
      correctChars++;
    }
  }

  const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;

  return {
    accuracy: parseFloat(accuracy.toFixed(2)),
    correctChars,
    totalChars
  };
}

/**
 * WPM (Words Per Minute) を計算
 * @param {number} charCount - 入力文字数
 * @param {number} elapsedTimeMs - 経過時間（ミリ秒）
 * @returns {number} WPM
 */
export function calculateWPM(charCount, elapsedTimeMs) {
  if (elapsedTimeMs <= 0) return 0;
  const minutes = elapsedTimeMs / 1000 / 60;
  const words = charCount / 5; // 日本語では5文字を1単語として換算
  return Math.round(words / minutes);
}

/**
 * CPM (Characters Per Minute) を計算
 * @param {number} charCount - 入力文字数
 * @param {number} elapsedTimeMs - 経過時間（ミリ秒）
 * @returns {number} CPM
 */
export function calculateCPM(charCount, elapsedTimeMs) {
  if (elapsedTimeMs <= 0) return 0;
  const minutes = elapsedTimeMs / 1000 / 60;
  return Math.round(charCount / minutes);
}

/**
 * 総合スコアを計算
 * @param {number} accuracy - 正確性 (0-100)
 * @param {number} wpm - WPM
 * @param {number} cpm - CPM
 * @returns {number} 総合スコア
 */
export function calculateScore(accuracy, wpm, cpm) {
  // スコア計算式: (正確性 × 速度係数) + ボーナス
  // 速度係数: WPMとCPMの平均を使用
  const speedFactor = (wpm + cpm / 5) / 2;

  // 基本スコア: 正確性 × 速度係数
  let score = (accuracy / 100) * speedFactor * 100;

  // ボーナス: 高精度（90%以上）の場合
  if (accuracy >= 90) {
    score *= 1.2; // 20%ボーナス
  }

  // ボーナス: 完璧な入力（100%）の場合
  if (accuracy === 100) {
    score *= 1.5; // さらに50%ボーナス
  }

  return Math.round(score);
}

/**
 * ゲーム結果を計算
 * @param {string} targetText - 対象の文章
 * @param {string} userInput - ユーザーの入力
 * @param {number} startTime - 開始時刻（タイムスタンプ）
 * @param {number} endTime - 終了時刻（タイムスタンプ）
 * @returns {Object} ゲーム結果 {accuracy, wpm, cpm, score, elapsedTime}
 */
export function calculateResult(targetText, userInput, startTime, endTime) {
  const elapsedTimeMs = endTime - startTime;
  const elapsedTimeSec = elapsedTimeMs / 1000;

  const { accuracy } = calculateAccuracy(targetText, userInput);
  const wpm = calculateWPM(userInput.length, elapsedTimeMs);
  const cpm = calculateCPM(userInput.length, elapsedTimeMs);
  const score = calculateScore(accuracy, wpm, cpm);

  return {
    accuracy,
    wpm,
    cpm,
    score,
    elapsedTime: parseFloat(elapsedTimeSec.toFixed(2))
  };
}

/**
 * 複数の結果から総合結果を計算
 * @param {Array} results - 各問題の結果の配列
 * @param {number} totalElapsedTimeMs - 総経過時間（ミリ秒）
 * @returns {Object} 総合結果
 */
export function calculateTotalResult(results, totalElapsedTimeMs) {
  if (results.length === 0) {
    return {
      averageAccuracy: 0,
      totalWpm: 0,
      totalCpm: 0,
      totalScore: 0,
      totalElapsedTime: 0,
      questionCount: 0
    };
  }

  const totalElapsedTimeSec = totalElapsedTimeMs / 1000;

  // 平均正確性を計算
  const averageAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / results.length;

  // 全問題の総文字数を計算
  const totalChars = results.reduce((sum, r) => sum + r.charCount, 0);

  // 総経過時間で WPM/CPM を計算
  const totalWpm = calculateWPM(totalChars, totalElapsedTimeMs);
  const totalCpm = calculateCPM(totalChars, totalElapsedTimeMs);

  // 総合スコアを計算
  const totalScore = calculateScore(averageAccuracy, totalWpm, totalCpm);

  return {
    averageAccuracy: parseFloat(averageAccuracy.toFixed(2)),
    totalWpm,
    totalCpm,
    totalScore,
    totalElapsedTime: parseFloat(totalElapsedTimeSec.toFixed(2)),
    questionCount: results.length,
    results // 各問題の詳細結果も含める
  };
}

/**
 * スコアのランクを判定
 * @param {number} score - スコア
 * @returns {string} ランク ('S', 'A', 'B', 'C', 'D')
 */
export function getScoreRank(score) {
  if (score >= 1000) return 'S';
  if (score >= 800) return 'A';
  if (score >= 600) return 'B';
  if (score >= 400) return 'C';
  return 'D';
}

/**
 * ゲーム状態を管理するクラス（複数問題対応）
 */
export class GameSession {
  constructor(questionCount = 5) {
    this.state = 'ready'; // 'ready', 'playing', 'finished'
    this.questions = getRandomQuestions(questionCount);
    this.currentQuestionIndex = 0;
    this.questionResults = [];
    this.userInput = '';
    this.gameStartTime = null;
    this.questionStartTime = null;
    this.totalResult = null;
  }

  /**
   * ゲームを開始
   */
  start() {
    if (this.state !== 'ready') return;

    this.state = 'playing';
    this.gameStartTime = Date.now();
    this.questionStartTime = Date.now();
    this.currentQuestionIndex = 0;
    this.questionResults = [];
    this.userInput = '';
  }

  /**
   * 入力を更新
   * @param {string} input - ユーザーの入力
   */
  updateInput(input) {
    if (this.state !== 'playing') return;

    this.userInput = input;

    // 対象文字数以上入力されたら次の問題へ
    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (input.length >= currentQuestion.text.length) {
      this.finishQuestion();
    }
  }

  /**
   * 現在の問題を終了
   */
  finishQuestion() {
    if (this.state !== 'playing') return;

    const currentQuestion = this.questions[this.currentQuestionIndex];
    const questionEndTime = Date.now();

    // 現在の問題の結果を計算
    const result = calculateResult(
      currentQuestion.text,
      this.userInput,
      this.questionStartTime,
      questionEndTime
    );

    // 文字数も保存（総合スコア計算に使用）
    result.charCount = currentQuestion.text.length;

    this.questionResults.push(result);

    // 次の問題へ
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.questions.length) {
      // すべての問題が終了
      this.finishGame();
    } else {
      // 次の問題の準備
      this.userInput = '';
      this.questionStartTime = Date.now();
    }
  }

  /**
   * ゲームを終了
   */
  finishGame() {
    if (this.state !== 'playing') return;

    this.state = 'finished';
    const gameEndTime = Date.now();
    const totalElapsedTimeMs = gameEndTime - this.gameStartTime;

    // 総合結果を計算
    this.totalResult = calculateTotalResult(this.questionResults, totalElapsedTimeMs);
  }

  /**
   * ゲームをリセット
   * @param {number} questionCount - 問題数
   */
  reset(questionCount = 5) {
    this.state = 'ready';
    this.questions = getRandomQuestions(questionCount);
    this.currentQuestionIndex = 0;
    this.questionResults = [];
    this.userInput = '';
    this.gameStartTime = null;
    this.questionStartTime = null;
    this.totalResult = null;
  }

  /**
   * 現在の経過時間を取得（ミリ秒）
   * @returns {number} 経過時間
   */
  getElapsedTime() {
    if (this.state === 'ready') return 0;
    if (this.state === 'finished') {
      return this.totalResult ? this.totalResult.totalElapsedTime * 1000 : 0;
    }
    return Date.now() - this.gameStartTime;
  }

  /**
   * 現在の状態を取得
   * @returns {Object} ゲームの状態
   */
  getState() {
    const currentQuestion = this.questions[this.currentQuestionIndex] || null;

    return {
      state: this.state,
      currentQuestion,
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestions: this.questions.length,
      userInput: this.userInput,
      questionResults: this.questionResults,
      totalResult: this.totalResult,
      elapsedTime: this.getElapsedTime()
    };
  }
}
