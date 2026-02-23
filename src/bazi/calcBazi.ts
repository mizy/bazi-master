/**
 * 八字排盘核心算法
 * calcBazi(year, month, day, hour) → BaziResult
 */

import type { BaziResult, Pillar } from './types.js';
import { TIAN_GAN, DI_ZHI, NAYIN_TABLE, ganZhiOrder } from './ganzhi.js';
import { calcJDN, getBaziMonthAndYear, isAfterLichun } from './solarTerms.js';
import { calcWuxing } from './calcWuxing.js';

/** 计算年柱：以立春为界，(year-4)%60 对应六十甲子 */
function calcYearPillar(baziYear: number): Pillar {
  // 甲子年=4, so (year-4)%60 gives the 60-cycle index
  const idx = ((baziYear - 4) % 60 + 60) % 60;
  return {
    gan: TIAN_GAN[idx % 10],
    zhi: DI_ZHI[idx % 12],
  };
}

/**
 * 计算月柱
 * 月支固定：寅月(M1)=寅(2), 卯月(M2)=卯(3) ... 丑月(M12)=丑(1)
 * 月干由年干推算：甲己之年丙作首
 */
function calcMonthPillar(yearGanIdx: number, baziMonth: number): Pillar {
  // 月支: 寅月=2, 卯月=3, ..., 子月=0, 丑月=1
  const zhiIdx = (baziMonth + 1) % 12;

  // 月干: 寅月起始干 = (yearGanIdx%5)*2 + 2
  // 甲己(0,5)→丙(2), 乙庚(1,6)→戊(4), 丙辛(2,7)→庚(6), 丁壬(3,8)→壬(8), 戊癸(4,9)→甲(0)
  const startGan = ((yearGanIdx % 5) * 2 + 2) % 10;
  const ganIdx = (startGan + (baziMonth - 1)) % 10;

  return {
    gan: TIAN_GAN[ganIdx],
    zhi: DI_ZHI[zhiIdx],
  };
}

/**
 * 计算日柱：基于 Julian Day Number
 * dayOrder60 = (JDN + 49) % 60
 */
function calcDayPillar(year: number, month: number, day: number): Pillar {
  const jdn = calcJDN(year, month, day);
  const order = ((jdn + 49) % 60 + 60) % 60;
  return {
    gan: TIAN_GAN[order % 10],
    zhi: DI_ZHI[order % 12],
  };
}

/**
 * 计算时柱
 * 时支由时辰决定（子丑寅...）
 * 时干由日干推算：甲己还加甲
 */
function calcHourPillar(dayGanIdx: number, shichenIdx: number): Pillar {
  // 时干起始: (dayGanIdx%5)*2
  // 甲己(0,5)→甲(0), 乙庚(1,6)→丙(2), 丙辛(2,7)→戊(4), 丁壬(3,8)→庚(6), 戊癸(4,9)→壬(8)
  const startGan = (dayGanIdx % 5) * 2;
  const ganIdx = (startGan + shichenIdx) % 10;

  return {
    gan: TIAN_GAN[ganIdx],
    zhi: DI_ZHI[shichenIdx],
  };
}

/** 获取一柱的纳音 */
function getPillarNayin(pillar: Pillar): string {
  const ganIdx = TIAN_GAN.indexOf(pillar.gan as typeof TIAN_GAN[number]);
  const zhiIdx = DI_ZHI.indexOf(pillar.zhi as typeof DI_ZHI[number]);
  const order = ganZhiOrder(ganIdx, zhiIdx);
  return NAYIN_TABLE[order];
}

/**
 * 将小时转为时辰索引 (0=子, 1=丑, ..., 11=亥)
 * 23:00-00:59 = 子时(0)
 */
function hourToShichen(hour: number): number {
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}

/**
 * 八字排盘主函数
 * @param year  公历年
 * @param month 公历月 (1-12)
 * @param day   公历日 (1-31)
 * @param hour  小时 (0-23)
 */
export function calcBazi(year: number, month: number, day: number, hour: number): BaziResult {
  // 23:00 后算次日（夜子时归次日）
  let adjYear = year;
  let adjMonth = month;
  let adjDay = day;
  if (hour >= 23) {
    const d = new Date(year, month - 1, day + 1);
    adjYear = d.getFullYear();
    adjMonth = d.getMonth() + 1;
    adjDay = d.getDate();
  }

  // 确定八字年和月
  const { baziMonth, baziYear } = getBaziMonthAndYear(adjYear, adjMonth, adjDay);

  // 四柱计算
  const yearPillar = calcYearPillar(baziYear);
  const yearGanIdx = TIAN_GAN.indexOf(yearPillar.gan as typeof TIAN_GAN[number]);
  const monthPillar = calcMonthPillar(yearGanIdx, baziMonth);

  const dayPillar = calcDayPillar(adjYear, adjMonth, adjDay);
  const dayGanIdx = TIAN_GAN.indexOf(dayPillar.gan as typeof TIAN_GAN[number]);
  const shichenIdx = hourToShichen(hour);
  const hourPillar = calcHourPillar(dayGanIdx, shichenIdx);

  // 纳音
  const napieces = [yearPillar, monthPillar, dayPillar, hourPillar].map(getPillarNayin);

  // 日主
  const dayMaster = dayPillar.gan;

  // 五行分析
  const bazi: BaziResult = {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    dayMaster,
    napieces,
    wuxing: null as any, // placeholder, filled below
  };

  bazi.wuxing = calcWuxing(bazi);
  return bazi;
}
