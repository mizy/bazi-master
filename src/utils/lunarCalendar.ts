/**
 * 公历↔农历转换（自实现，不依赖外部库）
 * 数据表基于寿星万年历算法，覆盖 1900-2100 年
 *
 * 数据编码规则（每年一个十六进制数）：
 * - Bit[0-3]: 闰月月份（0=无闰月）
 * - Bit[4-15]: 1-12月大小月标志（1=大月30天，0=小月29天），高位在前
 * - Bit[16]: 闰月大小（1=大月30天，0=小月29天）
 */

export interface LunarDate {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeap: boolean;
}

// 1900-2100 年农历数据表（压缩十六进制）
// prettier-ignore
const LUNAR_INFO: number[] = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2, // 1900-1909
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977, // 1910-1919
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970, // 1920-1929
  0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950, // 1930-1939
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557, // 1940-1949
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0, // 1950-1959
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0, // 1960-1969
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6, // 1970-1979
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570, // 1980-1989
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0, // 1990-1999
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5, // 2000-2009
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930, // 2010-2019
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530, // 2020-2029
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45, // 2030-2039
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0, // 2040-2049
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06aa0, 0x1a6c4, 0x0aae0, // 2050-2059
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4, // 2060-2069
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0, // 2070-2079
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160, // 2080-2089
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252, // 2090-2099
  0x0d520, // 2100
];

// 每月天数前缀和的基准：公历每月累计天数
const SOLAR_MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** 获取农历year年闰月月份（0=无闰月） */
export function getLeapMonth(year: number): number {
  return LUNAR_INFO[year - 1900] & 0xf;
}

/** 获取农历year年闰月天数（0=无闰月） */
function getLeapMonthDays(year: number): number {
  if (getLeapMonth(year) === 0) return 0;
  return LUNAR_INFO[year - 1900] & 0x10000 ? 30 : 29;
}

/** 获取农历year年month月天数（非闰月） */
export function getLunarMonthDays(year: number, month: number): number {
  return LUNAR_INFO[year - 1900] & (0x10000 >> month) ? 30 : 29;
}

/** 获取农历year年总天数 */
function getLunarYearDays(year: number): number {
  let sum = 0;
  for (let i = 1; i <= 12; i++) {
    sum += getLunarMonthDays(year, i);
  }
  sum += getLeapMonthDays(year);
  return sum;
}

/** 判断公历是否闰年 */
function isSolarLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** 计算公历日期距 1900-01-31 的天数差 */
function solarDaysSince19000131(year: number, month: number, day: number): number {
  let days = 0;
  // 累加整年天数
  for (let y = 1900; y < year; y++) {
    days += isSolarLeapYear(y) ? 366 : 365;
  }
  // 累加整月天数
  for (let m = 1; m < month; m++) {
    days += SOLAR_MONTH_DAYS[m - 1];
    if (m === 2 && isSolarLeapYear(year)) days += 1;
  }
  days += day;
  // 1900-01-31 是基准日（农历正月初一），offset=0
  return days - 31;
}

/**
 * 公历转农历
 * @param year 公历年 1900-2100
 * @param month 公历月 1-12
 * @param day 公历日 1-31
 */
export function solarToLunar(year: number, month: number, day: number): LunarDate {
  if (year < 1900 || year > 2100) {
    throw new Error(`年份 ${year} 超出支持范围 (1900-2100)`);
  }

  // 1900-01-31 是农历 1900年正月初一
  let offset = solarDaysSince19000131(year, month, day);

  // 计算农历年
  let lunarYear = 1900;
  let yearDays: number;
  for (lunarYear = 1900; lunarYear <= 2100; lunarYear++) {
    yearDays = getLunarYearDays(lunarYear);
    if (offset < yearDays) break;
    offset -= yearDays;
  }

  // 计算农历月
  const leapMonth = getLeapMonth(lunarYear);
  let isLeap = false;
  let lunarMonth = 1;

  for (let i = 1; i <= 12; i++) {
    // 非闰月
    const monthDays = getLunarMonthDays(lunarYear, i);
    if (offset < monthDays) {
      lunarMonth = i;
      break;
    }
    offset -= monthDays;

    // 闰月
    if (i === leapMonth) {
      const leapDays = getLeapMonthDays(lunarYear);
      if (offset < leapDays) {
        lunarMonth = i;
        isLeap = true;
        break;
      }
      offset -= leapDays;
    }

    if (i === 12) lunarMonth = 12;
  }

  const lunarDay = offset + 1;

  return { lunarYear, lunarMonth, lunarDay, isLeap };
}
