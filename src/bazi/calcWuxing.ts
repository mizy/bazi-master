/**
 * 五行分析
 * 统计四柱八字中金木水火土各有多少，判断旺衰，给出喜用神建议
 */

import type { BaziResult, WuxingAnalysis, WuxingCount } from './types.js';
import { WUXING_OF_GAN, WUXING_OF_ZHI, ZHI_CANG_GAN } from './ganzhi.js';

type WuxingKey = keyof WuxingCount;
const WUXING_KEYS: WuxingKey[] = ['金', '木', '水', '火', '土'];

/** 统计四柱八字中的五行数量（天干+地支+藏干） */
function countWuxing(bazi: BaziResult): WuxingCount {
  const count: WuxingCount = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };

  const pillars = [bazi.year, bazi.month, bazi.day, bazi.hour];
  for (const p of pillars) {
    // 天干五行
    const ganWx = WUXING_OF_GAN[p.gan] as WuxingKey;
    count[ganWx] += 1;

    // 地支五行
    const zhiWx = WUXING_OF_ZHI[p.zhi] as WuxingKey;
    count[zhiWx] += 1;

    // 藏干五行（权重较低，每个藏干算 0.5）
    const cangGan = ZHI_CANG_GAN[p.zhi] || [];
    for (const cg of cangGan) {
      const cgWx = WUXING_OF_GAN[cg] as WuxingKey;
      count[cgWx] += 0.5;
    }
  }

  return count;
}

/**
 * 判断日主强弱
 * 简化规则：统计生扶日主的力量（同类+印星）vs 克泄耗的力量
 */
function isDayMasterStrong(dayMasterWx: string, count: WuxingCount): boolean {
  // 五行相生关系：木→火→土→金→水→木
  const shengMap: Record<string, string> = {
    木: '水', // 水生木
    火: '木', // 木生火
    土: '火', // 火生土
    金: '土', // 土生金
    水: '金', // 金生水
  };

  const selfWx = dayMasterWx as WuxingKey;
  const yinWx = shengMap[dayMasterWx] as WuxingKey; // 印星（生我者）

  const supportForce = count[selfWx] + count[yinWx];
  const totalForce = WUXING_KEYS.reduce((sum, k) => sum + count[k], 0);

  return supportForce > totalForce / 2;
}

/**
 * 简单喜用神推算
 * 身弱：喜印星（生我）、比劫（同我）
 * 身强：喜食伤（我生）、财星（我克）、官杀（克我）
 */
function calcXiyong(dayMasterWx: string, strong: boolean): { xi: string; yong: string } {
  // 五行相生序: 木火土金水
  const cycle = ['木', '火', '土', '金', '水'];
  const idx = cycle.indexOf(dayMasterWx);

  const yinWx = cycle[(idx + 4) % 5]; // 生我 (印)
  const biWx = dayMasterWx; // 同我 (比劫)
  const shiWx = cycle[(idx + 1) % 5]; // 我生 (食伤)
  const caiWx = cycle[(idx + 2) % 5]; // 我克 (财)

  if (strong) {
    return { xi: shiWx, yong: caiWx };
  } else {
    return { xi: yinWx, yong: biWx };
  }
}

/** 五行分析主函数 */
export function calcWuxing(bazi: BaziResult): WuxingAnalysis {
  const count = countWuxing(bazi);

  // 找最旺和最弱
  let dominant = WUXING_KEYS[0];
  let weak = WUXING_KEYS[0];
  for (const k of WUXING_KEYS) {
    if (count[k] > count[dominant]) dominant = k;
    if (count[k] < count[weak]) weak = k;
  }

  // 缺失的五行
  const missing = WUXING_KEYS.filter((k) => count[k] === 0);

  // 日主五行
  const dayMasterWx = WUXING_OF_GAN[bazi.dayMaster];

  // 强弱判断
  const strong = isDayMasterStrong(dayMasterWx, count);

  // 喜用神
  const { xi, yong } = calcXiyong(dayMasterWx, strong);

  return {
    count,
    dominant,
    weak,
    missing,
    dayMasterWuxing: dayMasterWx,
    isStrong: strong,
    xiShen: xi,
    yongShen: yong,
  };
}
