/**
 * タイピングゲームのロジックを管理するユーティリティ関数群
 */

import questionsData from '../data/questions.json';
import { getRankingEvaluation } from './ranking.js';
import { calculateEditDistanceAccuracy } from './result-utils.js';

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
 * @param {string} difficulty - 難易度 ('all', 'easy', 'medium', 'hard')
 * @returns {Array} 問題文の配列
 */
export function getRandomQuestions(count, difficulty = 'all') {
  let questions = getQuestions();

  // 難易度でフィルタリング
  if (difficulty !== 'all') {
    questions = questions.filter(q => q.difficulty === difficulty);
  }

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
 * 入力の正確性を計算（編集距離ベース）
 * @param {string} targetText - 対象の文章
 * @param {string} userInput - ユーザーの入力
 * @returns {Object} {accuracy: number, correctChars: number, totalChars: number}
 */
export function calculateAccuracy(targetText, userInput) {
  // 編集距離ベースの正確度計算を使用
  // これにより、句読点の欠落や助詞の間違いなどが正確に評価される
  return calculateEditDistanceAccuracy(targetText, userInput);
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
 * @param {string} difficulty - 難易度 ('easy', 'medium', 'hard')
 * @returns {number} 総合スコア
 */
export function calculateScore(accuracy, wpm, cpm, difficulty = 'medium') {
  // 正確性を指数的に評価（0-100を0-1に正規化）
  const normalizedAccuracy = accuracy / 100;

  // 速度スコア: WPMとCPMの組み合わせ
  const speedScore = wpm * 2 + cpm / 5;

  // 正確性スコア: 指数関数的に評価（2.5乗で急激に増加）
  // 高い正確性ほど大きくスコアが伸びる
  const accuracyScore = Math.pow(normalizedAccuracy, 2.5) * 1000;

  // 基本スコア = 正確性スコア × 速度係数
  // 速度が速いほど最大20%のボーナス
  let score = accuracyScore * (1 + Math.min(speedScore / 100, 0.2));

  // 完璧な入力（100%）の場合、特別ボーナス
  if (accuracy === 100) {
    score *= 1.8; // 80%ボーナス
  }

  // 難易度係数を適用
  const difficultyMultiplier = {
    'easy': 1.0,
    'medium': 1.3,
    'hard': 1.7
  };

  score *= (difficultyMultiplier[difficulty] || 1.0);

  return Math.round(score);
}

/**
 * ゲーム結果を計算
 * @param {string} targetText - 対象の文章
 * @param {string} userInput - ユーザーの入力
 * @param {number} startTime - 開始時刻（タイムスタンプ）
 * @param {number} endTime - 終了時刻（タイムスタンプ）
 * @param {string} difficulty - 難易度 ('easy', 'medium', 'hard')
 * @returns {Object} ゲーム結果 {targetText, userInput, difficulty, accuracy, wpm, cpm, score, elapsedTime}
 */
export function calculateResult(targetText, userInput, startTime, endTime, difficulty = 'medium') {
  const elapsedTimeMs = endTime - startTime;
  const elapsedTimeSec = elapsedTimeMs / 1000;

  const { accuracy } = calculateAccuracy(targetText, userInput);
  const wpm = calculateWPM(userInput.length, elapsedTimeMs);
  const cpm = calculateCPM(userInput.length, elapsedTimeMs);
  const score = calculateScore(accuracy, wpm, cpm, difficulty);

  return {
    targetText,
    userInput,
    difficulty,
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
      averageScore: 0,
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

  // 各問題のスコアの合計を計算
  const sumScore = results.reduce((sum, r) => sum + r.score, 0);

  // 問題あたりの平均スコアを計算（問題数に依存しない公平な評価）
  const averageScore = Math.round(sumScore / results.length);

  // 総合スコアは平均スコアを使用（ランク判定用）
  const totalScore = averageScore;

  return {
    averageAccuracy: parseFloat(averageAccuracy.toFixed(2)),
    totalWpm,
    totalCpm,
    totalScore,
    averageScore,
    totalElapsedTime: parseFloat(totalElapsedTimeSec.toFixed(2)),
    questionCount: results.length,
    results // 各問題の詳細結果も含める
  };
}

/**
 * ランク評価を取得（ranking.jsから取得）
 * @param {number} score - スコア
 * @param {number} accuracy - 平均正確度
 * @param {number} wpm - WPM
 * @returns {Object} ランク評価 {rank, title, color, bgColor, borderColor}
 */
export function getScoreRank(score, accuracy = 0, wpm = 0) {
  return getRankingEvaluation(score, accuracy, wpm);
}

/**
 * ゲーム状態を管理するクラス（複数問題対応・時間ベース対応）
 */
export class GameSession {
  constructor(mode = 'count', value = 5, difficulty = 'all') {
    this.mode = mode; // 'count' または 'time'
    this.modeValue = value; // 問題数または秒数
    this.difficulty = difficulty; // 難易度 ('all', 'easy', 'medium', 'hard')
    this.state = 'ready'; // 'ready', 'playing', 'finished'

    // 問題数ベースの場合は指定数、時間ベースの場合は多めに用意
    const questionCount = mode === 'time' ? 50 : value;
    this.questions = getRandomQuestions(questionCount, difficulty);

    this.currentQuestionIndex = 0;
    this.questionResults = [];
    this.userInput = '';
    this.gameStartTime = null;
    this.questionStartTime = null;
    this.totalResult = null;
    this.timeLimitMs = mode === 'time' ? value * 1000 : null;
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
  }

  /**
   * 回答を送信して次の問題へ
   */
  submitAnswer() {
    if (this.state !== 'playing') return;
    if (this.userInput.trim().length === 0) return; // 空の入力は無視

    this.finishQuestion();
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
      questionEndTime,
      currentQuestion.difficulty || 'medium'
    );

    // 文字数も保存（総合スコア計算に使用）
    result.charCount = currentQuestion.text.length;

    this.questionResults.push(result);

    // 時間ベースの場合、制限時間をチェック
    if (this.mode === 'time') {
      const elapsedTime = Date.now() - this.gameStartTime;
      if (elapsedTime >= this.timeLimitMs) {
        // 時間切れ
        this.finishGame();
        return;
      }
    }

    // 次の問題へ
    this.currentQuestionIndex++;

    // 問題数ベースの場合、全問題終了をチェック
    if (this.mode === 'count' && this.currentQuestionIndex >= this.questions.length) {
      this.finishGame();
    } else if (this.currentQuestionIndex >= this.questions.length) {
      // 時間ベースで問題が足りなくなった場合（通常起こらないが念のため）
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
   * @param {string} mode - モード ('count' または 'time')
   * @param {number} value - 問題数または秒数
   */
  reset(mode = 'count', value = 5, difficulty = 'all') {
    this.mode = mode;
    this.modeValue = value;
    this.difficulty = difficulty;
    this.state = 'ready';

    const questionCount = mode === 'time' ? 50 : value;
    this.questions = getRandomQuestions(questionCount, difficulty);

    this.currentQuestionIndex = 0;
    this.questionResults = [];
    this.userInput = '';
    this.gameStartTime = null;
    this.questionStartTime = null;
    this.totalResult = null;
    this.timeLimitMs = mode === 'time' ? value * 1000 : null;
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
   * 残り時間を取得（時間ベースの場合のみ、ミリ秒）
   * @returns {number|null} 残り時間
   */
  getRemainingTime() {
    if (this.mode !== 'time' || this.state !== 'playing') return null;

    const elapsed = this.getElapsedTime();
    const remaining = this.timeLimitMs - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * 現在の状態を取得
   * @returns {Object} ゲームの状態
   */
  getState() {
    const currentQuestion = this.questions[this.currentQuestionIndex] || null;

    return {
      state: this.state,
      mode: this.mode,
      modeValue: this.modeValue,
      difficulty: this.difficulty,
      currentQuestion,
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestions: this.mode === 'count' ? this.questions.length : null,
      userInput: this.userInput,
      questionResults: this.questionResults,
      totalResult: this.totalResult,
      elapsedTime: this.getElapsedTime(),
      remainingTime: this.getRemainingTime()
    };
  }
}
