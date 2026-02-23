/** 天干或地支的一柱 */
export interface Pillar {
  gan: string; // 天干
  zhi: string; // 地支
}

/** 五行统计 */
export interface WuxingCount {
  金: number;
  木: number;
  水: number;
  火: number;
  土: number;
}

/** 五行分析结果 */
export interface WuxingAnalysis {
  count: WuxingCount;
  dominant: string; // 最旺的五行
  weak: string; // 最弱的五行
  missing: string[]; // 缺失的五行
  dayMasterWuxing: string; // 日主五行
  isStrong: boolean; // 日主是否身强
  xiShen: string; // 喜神五行
  yongShen: string; // 用神五行
}

/** 八字排盘结果 */
export interface BaziResult {
  year: Pillar; // 年柱
  month: Pillar; // 月柱
  day: Pillar; // 日柱
  hour: Pillar; // 时柱
  wuxing: WuxingAnalysis;
  dayMaster: string; // 日主（日干）
  napieces: string[]; // 四柱纳音
}
