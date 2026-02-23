/**
 * 紫微斗数星曜数据
 * 包含十四主星、六吉六煞、十二宫、五行局、安星规则等核心数据
 */

import type { YinYang, Wuxing } from './types.js';

// ─── 星曜定义 ──────────────────────────────────────────

/** 主星属性 */
export interface MainStarInfo {
  name: string;
  yinyang: YinYang;
  wuxing: Wuxing;
}

/** 十四主星及阴阳五行属性 */
export const MAIN_STARS: readonly MainStarInfo[] = [
  { name: '紫微', yinyang: '阴', wuxing: '土' },
  { name: '天机', yinyang: '阴', wuxing: '木' },
  { name: '太阳', yinyang: '阳', wuxing: '火' },
  { name: '武曲', yinyang: '阴', wuxing: '金' },
  { name: '天同', yinyang: '阳', wuxing: '水' },
  { name: '廉贞', yinyang: '阴', wuxing: '火' },
  { name: '天府', yinyang: '阳', wuxing: '土' },
  { name: '太阴', yinyang: '阴', wuxing: '水' },
  { name: '贪狼', yinyang: '阳', wuxing: '木' },
  { name: '巨门', yinyang: '阴', wuxing: '土' },
  { name: '天相', yinyang: '阳', wuxing: '水' },
  { name: '天梁', yinyang: '阳', wuxing: '土' },
  { name: '七杀', yinyang: '阴', wuxing: '金' },
  { name: '破军', yinyang: '阳', wuxing: '水' },
] as const;

/** 六吉星 */
export const LUCKY_STARS = ['左辅', '右弼', '天魁', '天钺', '文昌', '文曲'] as const;

/** 六煞星 */
export const EVIL_STARS = ['火星', '铃星', '擎羊', '陀罗', '地空', '地劫'] as const;

// ─── 十二宫 ────────────────────────────────────────────

/** 十二宫名称（从命宫起逆时针排列） */
export const PALACE_NAMES = [
  '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
  '迁移', '交友', '事业', '田宅', '福德', '父母',
] as const;

// ─── 五行局 ────────────────────────────────────────────

/** 纳音五行 → 局数 */
export const WUXING_JU: Record<string, number> = {
  水: 2, 木: 3, 金: 4, 土: 5, 火: 6,
};

/** 局数 → 名称 */
export const WUXING_JU_NAMES: Record<number, string> = {
  2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局',
};

// ─── 紫微星安星法 ──────────────────────────────────────

/**
 * 计算紫微星所在宫位（地支索引 0=子 ~ 11=亥）
 *
 * 正统起法：
 * 1. day ÷ ju = 商Q 余R
 * 2. R=0：紫微在寅宫起数第Q宫
 * 3. R≠0：进一到第(Q+1)宫，补数 = ju - R
 *    偶数局逆回补数步，奇数局顺行补数步
 */
export function calcZiweiPos(ju: number, day: number): number {
  const q = Math.floor(day / ju);
  const r = day % ju;
  if (r === 0) {
    // 整除：寅(2)起数第Q宫
    return (2 + q - 1) % 12;
  }
  // 不整除：进一位
  const base = (2 + q) % 12;
  const bu = ju - r;
  return ju % 2 === 0
    ? (base - bu + 12) % 12  // 偶数局逆数
    : (base + bu) % 12;       // 奇数局顺数
}

// ─── 紫微系星（逆行） ──────────────────────────────────

/**
 * 紫微系六星相对紫微的宫位偏移（逆行布星）
 * 紫微(0) → 天机(-1) → [空] → 太阳(-3) → 武曲(-4) → 天同(-5) → [空×3] → 廉贞(-8)
 */
export const ZIWEI_SERIES: Record<string, number> = {
  紫微: 0,
  天机: -1,
  太阳: -3,
  武曲: -4,
  天同: -5,
  廉贞: -8,
};

/** 由紫微位置计算紫微系各星的宫位 */
export function placeZiweiSeries(ziweiPos: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [star, offset] of Object.entries(ZIWEI_SERIES)) {
    result[star] = (ziweiPos + offset + 12) % 12;
  }
  return result;
}

// ─── 天府系星（顺行） ──────────────────────────────────

/**
 * 天府星位置由紫微星位置推算
 * 紫微与天府关于寅申轴对称：天府 = (16 - 紫微) % 12
 *
 * 对照表：
 * 紫微 子丑寅卯辰巳午未申酉戌亥
 * 天府 辰卯寅丑子亥戌酉申未午巳
 */
export function calcTianfuPos(ziweiPos: number): number {
  return (16 - ziweiPos) % 12;
}

/**
 * 天府系八星相对天府的宫位偏移（顺行布星）
 * 天府(0) → 太阴(+1) → 贪狼(+2) → 巨门(+3) → 天相(+4) → 天梁(+5) → 七杀(+6) → [空×3] → 破军(+10)
 */
export const TIANFU_SERIES: Record<string, number> = {
  天府: 0,
  太阴: 1,
  贪狼: 2,
  巨门: 3,
  天相: 4,
  天梁: 5,
  七杀: 6,
  破军: 10,
};

/** 由天府位置计算天府系各星的宫位 */
export function placeTianfuSeries(tianfuPos: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [star, offset] of Object.entries(TIANFU_SERIES)) {
    result[star] = (tianfuPos + offset) % 12;
  }
  return result;
}

// ─── 六吉星安星规则 ────────────────────────────────────

/**
 * 文昌依出生时辰（辰宫起子时逆行）
 * @param hourIndex 时辰索引 0=子 ~ 11=亥
 * @returns 地支索引
 */
export function calcWenchangPos(hourIndex: number): number {
  return (4 - hourIndex + 12) % 12;
}

/**
 * 文曲依出生时辰（戌宫起子时顺行）
 * @param hourIndex 时辰索引 0=子 ~ 11=亥
 * @returns 地支索引
 */
export function calcWenquPos(hourIndex: number): number {
  return (10 + hourIndex) % 12;
}

/**
 * 左辅依生月（辰宫起正月顺行）
 * @param month 农历月 1-12
 */
export function calcZuofuPos(month: number): number {
  return (3 + month) % 12;
}

/**
 * 右弼依生月（戌宫起正月逆行）
 * @param month 农历月 1-12
 */
export function calcYoubiPos(month: number): number {
  return (23 - month) % 12;
}

/** 天魁依年干 */
export const TIANKUI_BY_GAN: Record<string, string> = {
  甲: '丑', 乙: '子', 丙: '亥', 丁: '亥',
  戊: '丑', 己: '子', 庚: '丑', 辛: '午',
  壬: '卯', 癸: '卯',
};

/** 天钺依年干 */
export const TIANYUE_BY_GAN: Record<string, string> = {
  甲: '未', 乙: '申', 丙: '酉', 丁: '酉',
  戊: '未', 己: '申', 庚: '未', 辛: '寅',
  壬: '巳', 癸: '巳',
};

// ─── 命主・身主 ────────────────────────────────────────

/** 命主星（依命宫地支） */
export const MING_ZHU: Record<string, string> = {
  子: '贪狼', 丑: '巨门', 寅: '禄存', 卯: '文曲',
  辰: '廉贞', 巳: '武曲', 午: '破军', 未: '武曲',
  申: '廉贞', 酉: '文曲', 戌: '禄存', 亥: '巨门',
};

/** 身主星（依年支，六对） */
export const SHEN_ZHU: Record<string, string> = {
  子: '火星', 丑: '天相', 寅: '天梁', 卯: '天同',
  辰: '文昌', 巳: '天机', 午: '火星', 未: '天相',
  申: '天梁', 酉: '天同', 戌: '文昌', 亥: '天机',
};
