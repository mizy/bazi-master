export interface ParsedDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

/**
 * 解析日期字符串
 * 支持格式: '1990-05-15 08:30', '1990-05-15', '1990/05/15 08:30'
 */
export function parseDate(input: string): ParsedDate {
  const normalized = input.trim().replace(/\//g, '-');
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?$/);

  if (!match) {
    throw new Error(`无法解析日期: "${input}"，请使用 YYYY-MM-DD HH:mm 格式`);
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  const hour = match[4] ? parseInt(match[4], 10) : 0;
  const minute = match[5] ? parseInt(match[5], 10) : 0;

  if (month < 1 || month > 12) throw new Error(`月份无效: ${month}`);
  if (day < 1 || day > 31) throw new Error(`日期无效: ${day}`);
  if (hour < 0 || hour > 23) throw new Error(`小时无效: ${hour}`);
  if (minute < 0 || minute > 59) throw new Error(`分钟无效: ${minute}`);

  return { year, month, day, hour, minute };
}

/**
 * 将小时转为时辰索引 (0-11)
 * 子时(23-1) 丑时(1-3) 寅时(3-5) ... 亥时(21-23)
 * 注意: 23:00-00:59 为子时(次日), 这里简化为索引0
 */
export function getShichen(hour: number): number {
  // 23点和0点都算子时
  if (hour === 23) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}
