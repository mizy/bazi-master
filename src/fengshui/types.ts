/** 命卦信息 */
export interface MingGua {
  number: number; // 卦数 1-9
  name: string; // 卦名：坎、坤、震、巽、乾、兑、艮、离
  wuxing: string; // 五行
  group: '东四命' | '西四命';
}

/** 方位吉凶信息 */
export interface DirectionInfo {
  direction: string; // 方位名（东、南、西、北、东南、东北、西南、西北）
  type: '吉' | '凶';
  name: string; // 吉凶星名（生气、天医、延年、伏位、五鬼、六煞、绝命、祸害）
  description: string; // 简要含义
}

/** 九宫飞星单格信息 */
export interface FlyingStarInfo {
  palace: string; // 宫位名（如"离"、"坎"等）
  direction: string; // 对应方位
  star: number; // 飞星数字 1-9
  starName: string; // 星名（一白贪狼等）
  luck: '大吉' | '吉' | '凶' | '大凶';
}

/** 九宫飞星图 */
export type FlyingStarGrid = FlyingStarInfo[];

/** 风水分析结果 */
export interface FengshuiResult {
  mingGua: MingGua;
  directions: DirectionInfo[]; // 八宅吉凶方位（8个）
  flyingStars: FlyingStarGrid; // 流年九宫飞星（9个）
  year: number; // 流年
}
