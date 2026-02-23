/**
 * 紫微斗数排盘核心算法
 * 按正统紫微斗数标准实现：定命宫→定身宫→安十二宫→定五行局→安主星→安吉星
 */

import type { Star, ZiweiPalace, ZiweiResult, WuxingJu } from './types.js';
import { solarToLunar } from '../utils/lunarCalendar.js';
import { TIAN_GAN, DI_ZHI, NAYIN_TABLE, ganZhiOrder } from '../bazi/ganzhi.js';
import {
  MAIN_STARS, PALACE_NAMES, WUXING_JU,
  calcZiweiPos, placeZiweiSeries,
  calcTianfuPos, placeTianfuSeries,
  calcWenchangPos, calcWenquPos,
  calcZuofuPos, calcYoubiPos,
  TIANKUI_BY_GAN, TIANYUE_BY_GAN,
  MING_ZHU, SHEN_ZHU,
} from './stars.js';

/** 小时(0-23) → 时辰索引 (0=子 ~ 11=亥) */
function hourToShichen(hour: number): number {
  return Math.floor((hour + 1) / 2) % 12;
}

/**
 * 五虎遁：由年干确定寅宫天干索引
 * 甲己→丙(2), 乙庚→戊(4), 丙辛→庚(6), 丁壬→壬(8), 戊癸→甲(0)
 */
function yinGanStart(yearGanIdx: number): number {
  return ((yearGanIdx % 5) * 2 + 2) % 10;
}

/** 获取某地支宫位的天干（五虎遁推算） */
function palaceGan(yearGanIdx: number, zhiIdx: number): string {
  const start = yinGanStart(yearGanIdx);
  const distance = (zhiIdx - 2 + 12) % 12;
  return TIAN_GAN[(start + distance) % 10];
}

/** 地支名 → 索引 */
function zhiToIndex(zhi: string): number {
  return DI_ZHI.indexOf(zhi as (typeof DI_ZHI)[number]);
}

/** @entry 紫微斗数排盘 */
export function calcZiwei(
  year: number,
  month: number,
  day: number,
  hour: number,
): ZiweiResult {
  // 1. 阳历转农历
  const lunar = solarToLunar(year, month, day);
  const lunarYear = lunar.lunarYear;
  const lunarMonth = lunar.lunarMonth; // 闰月按本月处理（简化方案）
  const lunarDay = lunar.lunarDay;
  const hourIdx = hourToShichen(hour);

  // 年干支索引（基于农历年，春节前出生属上一年）
  const yearGanIdx = (lunarYear - 4) % 10;
  const yearZhiIdx = (lunarYear - 4) % 12;
  const yearGan = TIAN_GAN[yearGanIdx];
  const yearZhi = DI_ZHI[yearZhiIdx];

  // 2. 定命宫：月从寅起顺数至生月，再从该宫起子时逆数至生时
  const monthPos = (lunarMonth + 1) % 12; // 正月=寅(2), 二月=卯(3), ..., 十二月=丑(1)
  const mingGongPos = (monthPos - hourIdx + 12) % 12;

  // 3. 定身宫：月从寅起顺数至生月，再从该宫起子时顺数至生时
  const shenGongPos = (monthPos + hourIdx) % 12;

  // 4. 安十二宫：从命宫起逆数（逆时针）
  const palaceNameByPos: string[] = new Array(12).fill('');
  for (let i = 0; i < 12; i++) {
    const pos = (mingGongPos - i + 12) % 12;
    palaceNameByPos[pos] = PALACE_NAMES[i];
  }

  // 5. 定五行局：命宫天干地支纳音五行 → 局数
  const mingGan = palaceGan(yearGanIdx, mingGongPos);
  const mingGanIdx = TIAN_GAN.indexOf(mingGan as (typeof TIAN_GAN)[number]);
  const order = ganZhiOrder(mingGanIdx, mingGongPos);
  const nayin = NAYIN_TABLE[order];
  const wuxing = nayin[nayin.length - 1]; // 纳音末字即五行
  const wuxingJu = WUXING_JU[wuxing] as WuxingJu;

  // 6-7. 安紫微系星
  const ziweiPos = calcZiweiPos(wuxingJu, lunarDay);
  const ziweiStars = placeZiweiSeries(ziweiPos);

  // 8. 安天府系星
  const tianfuPos = calcTianfuPos(ziweiPos);
  const tianfuStars = placeTianfuSeries(tianfuPos);

  // 9. 安六吉星
  const luckyStarPos: Record<string, number> = {
    文昌: calcWenchangPos(hourIdx),
    文曲: calcWenquPos(hourIdx),
    左辅: calcZuofuPos(lunarMonth),
    右弼: calcYoubiPos(lunarMonth),
    天魁: zhiToIndex(TIANKUI_BY_GAN[yearGan]),
    天钺: zhiToIndex(TIANYUE_BY_GAN[yearGan]),
  };

  // 主星属性查找表
  const mainStarInfo = new Map(MAIN_STARS.map(s => [s.name, s]));

  // 组装十二宫（按地支顺序 子0~亥11）
  const palaces: ZiweiPalace[] = [];
  for (let zhiIdx = 0; zhiIdx < 12; zhiIdx++) {
    const mainStars: Star[] = [];
    // 紫微系
    for (const [name, pos] of Object.entries(ziweiStars)) {
      if (pos === zhiIdx) {
        const info = mainStarInfo.get(name);
        mainStars.push({ name, type: 'main', yinyang: info?.yinyang, wuxing: info?.wuxing });
      }
    }
    // 天府系
    for (const [name, pos] of Object.entries(tianfuStars)) {
      if (pos === zhiIdx) {
        const info = mainStarInfo.get(name);
        mainStars.push({ name, type: 'main', yinyang: info?.yinyang, wuxing: info?.wuxing });
      }
    }
    // 吉星
    const luckyStars: Star[] = [];
    for (const [name, pos] of Object.entries(luckyStarPos)) {
      if (pos === zhiIdx) {
        luckyStars.push({ name, type: 'lucky' });
      }
    }

    palaces.push({
      name: palaceNameByPos[zhiIdx],
      gan: palaceGan(yearGanIdx, zhiIdx),
      zhi: DI_ZHI[zhiIdx],
      mainStars,
      luckyStars,
      evilStars: [],
    });
  }

  // 命主（依命宫地支）、身主（依年支）
  const mingZhu = MING_ZHU[DI_ZHI[mingGongPos]];
  const shenZhu = SHEN_ZHU[yearZhi];

  return {
    palaces,
    mingGongIndex: mingGongPos,
    shenGongIndex: shenGongPos,
    wuxingJu,
    mingZhu,
    shenZhu,
  };
}
