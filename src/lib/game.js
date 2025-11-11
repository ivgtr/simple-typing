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
 * ゲーム状態を管理するクラス
 */
export class GameSession {
  constructor(question = null) {
    this.question = question || getRandomQuestion();
    this.userInput = '';
    this.startTime = null;
    this.endTime = null;
    this.isStarted = false;
    this.isFinished = false;
    this.result = null;
  }

  /**
   * ゲームを開始
   */
  start() {
    if (!this.isStarted) {
      this.isStarted = true;
      this.startTime = Date.now();
    }
  }

  /**
   * 入力を更新
   * @param {string} input - ユーザーの入力
   */
  updateInput(input) {
    this.userInput = input;

    // 初回入力時に自動的に開始
    if (!this.isStarted && input.length > 0) {
      this.start();
    }

    // 対象文字数以上入力されたら終了
    if (input.length >= this.question.text.length) {
      this.finish();
    }
  }

  /**
   * ゲームを終了
   */
  finish() {
    if (this.isFinished || !this.isStarted) return;

    this.isFinished = true;
    this.endTime = Date.now();
    this.result = calculateResult(
      this.question.text,
      this.userInput,
      this.startTime,
      this.endTime
    );
  }

  /**
   * ゲームをリセット
   * @param {Object} newQuestion - 新しい問題（省略時はランダム）
   */
  reset(newQuestion = null) {
    this.question = newQuestion || getRandomQuestion();
    this.userInput = '';
    this.startTime = null;
    this.endTime = null;
    this.isStarted = false;
    this.isFinished = false;
    this.result = null;
  }

  /**
   * 現在の状態を取得
   * @returns {Object} ゲームの状態
   */
  getState() {
    return {
      question: this.question,
      userInput: this.userInput,
      isStarted: this.isStarted,
      isFinished: this.isFinished,
      result: this.result
    };
  }
}
