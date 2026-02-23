/** 风水分析结果 (placeholder) */
export interface FengshuiResult {
  direction: string; // 坐向
  element: string; // 五行属性
  stars: FlyingStarInfo[]; // 九宫飞星
}

export interface FlyingStarInfo {
  palace: string; // 宫位
  star: number; // 飞星数字
  meaning: string; // 含义
}
