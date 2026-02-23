/**
 * 六爻起卦核心算法
 * 铜钱摇卦法：三枚铜钱投掷6次
 */

import type { LiuyaoResult, Yao, HexagramInfo } from './types.js';
import { TRIGRAMS, findHexagram, trigramIndex } from './hexagrams.js';

/**
 * 模拟投掷三枚铜钱
 * 字(背)=0, 花(面)=1
 * 三枚之和+6: 6=老阴, 7=少阳, 8=少阴, 9=老阳
 */
function throwCoins(): number {
  const coins = [
    Math.random() < 0.5 ? 0 : 1,
    Math.random() < 0.5 ? 0 : 1,
    Math.random() < 0.5 ? 0 : 1,
  ];
  return coins[0] + coins[1] + coins[2] + 6;
}

/** 爻值是否为阴 (6=老阴, 8=少阴) */
function isYin(value: number): boolean {
  return value === 6 || value === 8;
}

/** 爻值是否为动爻 (6=老阴变阳, 9=老阳变阴) */
function isChanging(value: number): boolean {
  return value === 6 || value === 9;
}

/** 将爻值转为阴阳 (1=阳, 0=阴) */
function yaoLine(value: number): number {
  return isYin(value) ? 0 : 1;
}

/** 动爻变化后的阴阳 */
function changedLine(value: number): number {
  if (value === 6) return 1; // 老阴变阳
  if (value === 9) return 0; // 老阳变阴
  return yaoLine(value);
}

/** 构建卦信息 */
function buildHexagramInfo(lines: number[]): HexagramInfo {
  const lowerLines = lines.slice(0, 3);
  const upperLines = lines.slice(3, 6);
  const lowerIdx = trigramIndex(lowerLines);
  const upperIdx = trigramIndex(upperLines);
  const hex = findHexagram(upperIdx, lowerIdx);

  return {
    name: hex.name,
    symbol: TRIGRAMS[upperIdx].symbol + TRIGRAMS[lowerIdx].symbol,
    gua: lines,
    upperTrigram: TRIGRAMS[upperIdx].name,
    lowerTrigram: TRIGRAMS[lowerIdx].name,
  };
}

/**
 * 六爻起卦
 * @param question 可选的占问问题
 */
export function calcLiuyao(question?: string): LiuyaoResult & { question?: string; guaci: string; meaning: string; changedGuaci?: string; changedMeaning?: string } {
  // 投掷6次，从初爻到上爻
  const values: number[] = [];
  for (let i = 0; i < 6; i++) {
    values.push(throwCoins());
  }

  // 构建六爻
  const yaos: Yao[] = values.map((v, i) => ({
    position: i + 1,
    value: v,
    yin: isYin(v),
    changing: isChanging(v),
    dizhi: '', // 简化版不配地支
    wuxing: '',
    liuqin: '',
  }));

  // 本卦爻线
  const mainLines = values.map(yaoLine);
  const mainHexagram = buildHexagramInfo(mainLines);

  // 变卦（有动爻时才有）
  const hasChanging = values.some(isChanging);
  let changedHexagram: HexagramInfo | null = null;
  let changedGuaci: string | undefined;
  let changedMeaning: string | undefined;

  if (hasChanging) {
    const changedLines = values.map(changedLine);
    changedHexagram = buildHexagramInfo(changedLines);
    const upperIdx = trigramIndex(changedLines.slice(3, 6));
    const lowerIdx = trigramIndex(changedLines.slice(0, 3));
    const hex = findHexagram(upperIdx, lowerIdx);
    changedGuaci = hex.guaci;
    changedMeaning = hex.meaning;
  }

  // 本卦卦辞
  const upperIdx = trigramIndex(mainLines.slice(3, 6));
  const lowerIdx = trigramIndex(mainLines.slice(0, 3));
  const mainHex = findHexagram(upperIdx, lowerIdx);

  return {
    mainHexagram,
    changedHexagram,
    yaos,
    shiYao: 0, // 简化版暂不计算世应
    yingYao: 0,
    date: { year: '', month: '', day: '' },
    question,
    guaci: mainHex.guaci,
    meaning: mainHex.meaning,
    changedGuaci,
    changedMeaning,
  };
}
